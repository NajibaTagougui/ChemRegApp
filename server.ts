import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// PubChem PUG REST Proxy (for searching compounds by name/SMILES/CAS)
app.get('/api/pubchem/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const cleanQuery = encodeURIComponent(query.trim());
    // 1. Resolve CID
    const cidRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${cleanQuery}/cids/JSON`);
    let cid: number | null = null;

    if (cidRes.ok) {
      const data = await cidRes.json();
      cid = data?.IdentifierList?.CID?.[0] || null;
    } else {
      // Try searching as SMILES directly
      const smilesRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${cleanQuery}/cids/JSON`);
      if (smilesRes.ok) {
        const data = await smilesRes.json();
        cid = data?.IdentifierList?.CID?.[0] || null;
      }
    }

    if (!cid) {
      return res.status(404).json({ error: `Compound '${query}' not found in PubChem` });
    }

    // 2. Fetch properties
    const propUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,InChI,InChIKey,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity,HeavyAtomCount,IUPACName,Title/JSON`;
    const propRes = await fetch(propUrl);
    const propData = propRes.ok ? await propRes.json() : null;

    // 3. Fetch 3D conformer SDF if available
    const sdf3dRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`);
    const sdf3d = sdf3dRes.ok ? await sdf3dRes.text() : null;

    res.json({
      cid,
      properties: propData?.PropertyTable?.Properties?.[0] || null,
      sdf3d
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error querying PubChem' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChemReg server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();

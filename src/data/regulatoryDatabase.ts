import { ChemicalRecord } from '../types/chemistry';
import { processChemicalSmiles } from '../utils/rdkitSimulator';

export const INITIAL_CHEMICAL_DATABASE: ChemicalRecord[] = [
  // 1. Paracetamol (Paper Benchmark: Strongest Agreement ρS = +0.94)
  {
    id: 'paracetamol',
    name: 'Paracetamol',
    commonName: 'Acetaminophen / APAP',
    iupacName: 'N-(4-hydroxyphenyl)acetamide',
    casNumber: '103-90-2',
    ecNumber: '203-157-5',
    smiles: 'CC(=O)NC1=CC=C(C=C1)O',
    formula: 'C8H9NO2',
    category: 'Pharmaceutical',
    description: 'Prototypical antipyretic and non-opioid analgesic. In the ChemRegNet paper (Table 4), Paracetamol is the clearest agreement case (ρS = +0.94, top-3 overlap = 1.00, top-5 overlap = 1.00). Both the graph branch and descriptor attention gate rank the phenolic oxygen and amide nitrogen highest, and the methyl carbon lowest.',
    ...processChemicalSmiles('CC(=O)NC1=CC=C(C=C1)O', 'Paracetamol'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Broadly approved worldwide as an Active Pharmaceutical Ingredient (API). Full REACH registration without Annex XIV/XVII restrictions. Permissible occupational dust exposure limits established.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: {
        oshaPel: '10 mg/m³ (total dust)',
        acgihTlv: '10 mg/m³ (inhalable)',
        euDnelWorker: '8.4 mg/m³ (inhalation)',
        pnecWater: '0.05 mg/L (freshwater)'
      },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Full registration dossier > 10,000 t/a. Safe for clinical therapeutic use.', referenceLaw: 'Regulation (EC) No 1907/2006' },
        { jurisdiction: 'US EPA TSCA', flag: '🇺🇸', status: 'Compliant', details: 'Active commercial inventory status. No SNUR restrictions.', referenceLaw: '15 U.S.C. § 2601' },
        { jurisdiction: 'UK REACH', flag: '🇬🇧', status: 'Compliant', details: 'Grandfathered into UK chemical database.', referenceLaw: 'UK SI 2019/758' },
        { jurisdiction: 'Japan ENCS', flag: '🇯🇵', status: 'Compliant', details: 'Classified Existing Chemical Substance.', referenceLaw: 'CSCL Law 117' }
      ]
    },
    ghs: {
      signalWord: 'WARNING',
      pictograms: ['exclamation'],
      hazardStatements: [
        { code: 'H302', text: 'Harmful if swallowed' },
        { code: 'H315', text: 'Causes skin irritation' },
        { code: 'H319', text: 'Causes serious eye irritation' },
        { code: 'H412', text: 'Harmful to aquatic life with long lasting effects' }
      ],
      precautionaryStatements: [
        { code: 'P264', text: 'Wash skin thoroughly after handling' },
        { code: 'P280', text: 'Wear protective gloves/eye protection' },
        { code: 'P301+P312', text: 'IF SWALLOWED: Call a POISON CENTER or doctor if unwell' },
        { code: 'P305+P351+P338', text: 'IF IN EYES: Rinse cautiously with water for several minutes' }
      ],
      nfpa: { health: 2, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'Not regulated', properShippingName: 'NON-HAZARDOUS PHARMACEUTICAL', class: 'N/A', packingGroup: 'N/A' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Paracetamol (Acetaminophen)', 'CAS': '103-90-2', 'EC': '203-157-5' } },
      { sectionNumber: 2, title: 'Hazard Identification', content: { 'Signal Word': 'WARNING', 'Classification': 'Acute Tox. 4 (H302), Eye Irrit. 2 (H319)' } }
    ]
  },

  // 2. Aspirin (Paper Benchmark: Strongest Divergence ρS = -0.62)
  {
    id: 'aspirin',
    name: 'Aspirin',
    commonName: 'Acetylsalicylic Acid',
    iupacName: '2-acetyloxybenzoic acid',
    casNumber: '50-78-2',
    ecNumber: '200-064-1',
    unNumber: 'UN 3249',
    smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    formula: 'C9H8O4',
    category: 'Pharmaceutical',
    description: 'Prototypical NSAID and platelet inhibitor. In the ChemRegNet paper (Figure 6 & Table 4), Aspirin is the clearest divergence case (ρS = -0.62). Activation attribution places the three oxygen atoms (carbonyl, hydroxyl, ester) near 0.95, while task saliency is carbon-dominant (aromatic carbons ~0.55, methyl ~0.35).',
    ...processChemicalSmiles('CC(=O)OC1=CC=CC=C1C(=O)O', 'Aspirin'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Fully approved Active Pharmaceutical Ingredient (API). Subject to standard workplace dust exposure controls. Active on US TSCA and UK REACH.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: true, // Developmental toxicity warning in pregnancy
      exposureLimits: {
        oshaPel: '5 mg/m³ (8-hr TWA)',
        acgihTlv: '5 mg/m³ (TWA)',
        euDnelWorker: '10.5 mg/m³',
        pnecWater: '0.14 mg/L'
      },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Full registration dossier > 1,000 t/a.', referenceLaw: 'Regulation (EC) No 1907/2006' },
        { jurisdiction: 'US EPA TSCA', flag: '🇺🇸', status: 'Compliant', details: 'Active Commercial Inventory listing.', referenceLaw: '15 U.S.C. § 2601' },
        { jurisdiction: 'US OSHA HazCom', flag: '🇺🇸', status: 'Listed', details: 'PEL established for industrial dust handling.', referenceLaw: '29 CFR 1910.1000' }
      ]
    },
    ghs: {
      signalWord: 'WARNING',
      pictograms: ['exclamation', 'health-hazard'],
      hazardStatements: [
        { code: 'H302', text: 'Harmful if swallowed' },
        { code: 'H315', text: 'Causes skin irritation' },
        { code: 'H319', text: 'Causes serious eye irritation' },
        { code: 'H361d', text: 'Suspected of damaging the unborn child' }
      ],
      precautionaryStatements: [
        { code: 'P201', text: 'Obtain special instructions before use' },
        { code: 'P280', text: 'Wear protective gloves/eye protection' },
        { code: 'P305+P351+P338', text: 'IF IN EYES: Rinse cautiously with water for several minutes' }
      ],
      nfpa: { health: 2, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'UN 3249', properShippingName: 'MEDICINE, SOLID, TOXIC, N.O.S. (Aspirin)', class: '6.1', packingGroup: 'III' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Aspirin (Acetylsalicylic Acid)', 'CAS': '50-78-2', 'EC': '200-064-1' } },
      { sectionNumber: 2, title: 'Hazard Identification', content: { 'Signal Word': 'WARNING', 'Classification': 'Acute Tox. 4 (H302), Eye Irrit. 2 (H319), Repr. 2 (H361d)' } }
    ]
  },

  // 3. Morphine (Paper Benchmark: Agreement ρS = +0.83)
  {
    id: 'morphine',
    name: 'Morphine',
    commonName: 'Morphine / MS Contin',
    iupacName: '(4R,4aR,7S,7aR,12bS)-3-methyl-2,4,4a,7,7a,13-hexahydro-1H-4,12-methano[1]benzofuro[3,2-e]isoquinoline-7,9-diol',
    casNumber: '57-27-2',
    ecNumber: '200-320-2',
    unNumber: 'UN 1544',
    smiles: 'CN1CCC23C4=C5C=CC(O)=C4OC2C(O)C=CC3C1C5',
    formula: 'C17H19NO3',
    category: 'Pharmaceutical',
    description: 'Prototypical opioid analgesic. In ChemRegNet Table 4, Morphine is in the strong agreement regime (ρS = +0.83, top-3 overlap = 0.67, top-5 overlap = 0.80), where task saliency and descriptor attention gate exhibit high concordance on the phenolic oxygen and tertiary amine core.',
    ...processChemicalSmiles('CN1CCC23C4=C5C=CC(O)=C4OC2C(O)C=CC3C1C5', 'Morphine'),
    regulatory: {
      verdict: 'Restricted',
      summary: 'Controlled Substance (Single Convention on Narcotic Drugs Schedule I / US DEA Schedule II). Production, export, and distribution strictly quota-regulated.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: true, // Reproductive harm
      exposureLimits: { oshaPel: 'Not established', euDnelWorker: '0.01 mg/m³ (inhalation worker)' },
      jurisdictions: [
        { jurisdiction: 'UN Single Convention 1961', flag: '🌐', status: 'Restricted', details: 'Schedule I International Controlled Substance.', referenceLaw: '1961 UN Convention' },
        { jurisdiction: 'US DEA', flag: '🇺🇸', status: 'Restricted', details: 'Schedule II Controlled Substance (Quota system).', referenceLaw: '21 U.S.C. § 812' }
      ]
    },
    ghs: {
      signalWord: 'DANGER',
      pictograms: ['skull', 'health-hazard'],
      hazardStatements: [
        { code: 'H301', text: 'Toxic if swallowed' },
        { code: 'H334', text: 'May cause allergy or asthma symptoms or breathing difficulties if inhaled' },
        { code: 'H361', text: 'Suspected of damaging fertility or the unborn child' }
      ],
      precautionaryStatements: [
        { code: 'P201', text: 'Obtain special instructions before use' },
        { code: 'P280', text: 'Wear protective gloves/clothing/respiratory protection' },
        { code: 'P301+P310', text: 'IF SWALLOWED: Immediately call a POISON CENTER or doctor' }
      ],
      nfpa: { health: 3, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'UN 1544', properShippingName: 'ALKALOIDS, SOLID, N.O.S. (Morphine)', class: '6.1', packingGroup: 'III' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Morphine', 'CAS': '57-27-2', 'UN': 'UN 1544' } }
    ]
  },

  // 4. Ibuprofen (Paper Benchmark: Agreement ρS = +0.72)
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    commonName: 'Ibuprofen / Advil',
    iupacName: '2-[4-(2-methylpropyl)phenyl]propanoic acid',
    casNumber: '15687-27-1',
    ecNumber: '239-784-6',
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    formula: 'C13H18O2',
    category: 'Pharmaceutical',
    description: 'Propionic acid derivative NSAID. In ChemRegNet Table 4, Ibuprofen exhibits strong agreement (ρS = +0.72) driven by a single dominant polar carboxylic acid functional group anchor.',
    ...processChemicalSmiles('CC(C)CC1=CC=C(C=C1)C(C)C(=O)O', 'Ibuprofen'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Broad global approval for OTC and prescription formulations. Active on TSCA and REACH.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: { oshaPel: '5 mg/m³', euDnelWorker: '0.12 mg/m³' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Full registration dossier.', referenceLaw: 'Regulation (EC) No 1907/2006' },
        { jurisdiction: 'US EPA TSCA', flag: '🇺🇸', status: 'Compliant', details: 'Active commercial inventory.', referenceLaw: '15 U.S.C. § 2601' }
      ]
    },
    ghs: {
      signalWord: 'WARNING',
      pictograms: ['exclamation'],
      hazardStatements: [
        { code: 'H302', text: 'Harmful if swallowed' },
        { code: 'H315', text: 'Causes skin irritation' },
        { code: 'H319', text: 'Causes serious eye irritation' }
      ],
      precautionaryStatements: [
        { code: 'P280', text: 'Wear protective gloves/eye protection' },
        { code: 'P305+P351+P338', text: 'IF IN EYES: Rinse cautiously with water for several minutes' }
      ],
      nfpa: { health: 2, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'Not regulated', properShippingName: 'NON-HAZARDOUS PHARMACEUTICAL', class: 'N/A', packingGroup: 'N/A' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Ibuprofen', 'CAS': '15687-27-1' } }
    ]
  },

  // 5. Caffeine (Paper Benchmark: Agreement ρS = +0.69)
  {
    id: 'caffeine',
    name: 'Caffeine',
    commonName: '1,3,7-Trimethylxanthine',
    iupacName: '1,3,7-trimethylpurine-2,6-dione',
    casNumber: '58-08-2',
    ecNumber: '200-362-1',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    formula: 'C8H10N4O2',
    category: 'Pharmaceutical',
    description: 'Methylxanthine purine alkaloid. In ChemRegNet Table 4, Caffeine exhibits agreement (ρS = +0.69, top-3 overlap = 0.67, top-5 overlap = 0.60) where both channels focus on the bicyclic purine heteroatoms and carbonyl oxygens.',
    ...processChemicalSmiles('CN1C=NC2=C1C(=O)N(C(=O)N2C)C', 'Caffeine'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Broad approval for food, cosmetic, and drug applications. Active on US TSCA and EU REACH.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: { oshaPel: 'Not established', euDnelWorker: '44.3 mg/m³' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Full REACH registration.', referenceLaw: 'Regulation (EC) No 1907/2006' }
      ]
    },
    ghs: {
      signalWord: 'WARNING',
      pictograms: ['exclamation'],
      hazardStatements: [{ code: 'H302', text: 'Harmful if swallowed' }],
      precautionaryStatements: [{ code: 'P264', text: 'Wash hands thoroughly after handling' }],
      nfpa: { health: 2, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'Not regulated', properShippingName: 'NON-REGULATED', class: 'N/A', packingGroup: 'N/A' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Caffeine Anhydrous', 'CAS': '58-08-2' } }
    ]
  },

  // 6. Penicillin G (Paper Benchmark: Partial Agreement ρS = +0.42)
  {
    id: 'penicillin-g',
    name: 'Penicillin G',
    commonName: 'Benzylpenicillin',
    iupacName: '(2S,5R,6R)-3,3-dimethyl-7-oxo-6-[(2-phenylacetyl)amino]-4-thia-1-azabicyclo[3.2.0]heptane-2-carboxylic acid',
    casNumber: '61-33-6',
    ecNumber: '200-506-3',
    smiles: 'CC1(C(N2C(S1)C(C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C',
    formula: 'C16H18N2O4S',
    category: 'Pharmaceutical',
    description: 'Gold-standard narrow spectrum beta-lactam antibiotic. In ChemRegNet Table 4, Penicillin G exhibits partial agreement (ρS = +0.42, top-3 overlap = 0.67, top-5 overlap = 0.60) due to distributed polar functional groups across the beta-lactam, thiazolidine sulfur, and benzylamide.',
    ...processChemicalSmiles('CC1(C(N2C(S1)C(C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C', 'Penicillin G'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Essential antibiotic on WHO Model List. Subject to workplace allergen handling protocols (skin/respiratory sensitization).',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: { oshaPel: 'Not established', euDnelWorker: '0.5 mg/m³' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Registered antibiotic active ingredient.', referenceLaw: 'Regulation (EC) No 1907/2006' }
      ]
    },
    ghs: {
      signalWord: 'DANGER',
      pictograms: ['health-hazard', 'exclamation'],
      hazardStatements: [
        { code: 'H317', text: 'May cause an allergic skin reaction' },
        { code: 'H334', text: 'May cause allergy or asthma symptoms or breathing difficulties if inhaled' }
      ],
      precautionaryStatements: [
        { code: 'P261', text: 'Avoid breathing dust/fume/gas/mist' },
        { code: 'P280', text: 'Wear protective gloves/clothing/respiratory protection' }
      ],
      nfpa: { health: 2, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'Not regulated', properShippingName: 'NON-HAZARDOUS ANTIBIOTIC', class: 'N/A', packingGroup: 'N/A' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Penicillin G (Benzylpenicillin)', 'CAS': '61-33-6' } }
    ]
  },

  // 7. Cholesterol (Paper Benchmark: Partial Agreement ρS = +0.34)
  {
    id: 'cholesterol',
    name: 'Cholesterol',
    commonName: 'Cholesterol / Cholest-5-en-3-ol',
    iupacName: '(3S,8S,9S,10R,13R,14S,17R)-10,13-dimethyl-17-[(2R)-6-methylheptan-2-yl]-2,3,4,7,8,9,11,12,14,15,16,17-dodecahydro-1H-cyclopenta[a]phenanthren-3-ol',
    casNumber: '57-88-5',
    ecNumber: '200-353-2',
    smiles: 'CC(C)CCCC(C)C1CCC2C3CCC4CC(O)CCC4(C)C3CCC12C',
    formula: 'C27H46O',
    category: 'Pharmaceutical',
    description: 'Prototypical nonpolar large lipid sterol. In ChemRegNet Table 4, Cholesterol exhibits partial agreement (ρS = +0.34) as the hydrophobic tetracyclic cyclopentanoperhydrophenanthrene skeleton dominates structural graph representations, while the single hydroxyl group anchors descriptor activations.',
    ...processChemicalSmiles('CC(C)CCCC(C)C1CCC2C3CCC4CC(O)CCC4(C)C3CCC12C', 'Cholesterol'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Biological endogenous sterol widely used in pharmaceutical liposomes and cosmetics. Fully compliant.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: { oshaPel: 'Not established' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Full registration.', referenceLaw: 'Regulation (EC) No 1907/2006' }
      ]
    },
    ghs: {
      signalWord: 'NONE',
      pictograms: [],
      hazardStatements: [],
      precautionaryStatements: [],
      nfpa: { health: 0, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'Not regulated', properShippingName: 'NON-HAZARDOUS', class: 'N/A', packingGroup: 'N/A' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Cholesterol', 'CAS': '57-88-5' } }
    ]
  },

  // 8. Dopamine (Paper Benchmark: Divergence ρS = +0.07)
  {
    id: 'dopamine',
    name: 'Dopamine',
    commonName: 'Dopamine / 4-(2-aminoethyl)benzene-1,2-diol',
    iupacName: '4-(2-aminoethyl)benzene-1,2-diol',
    casNumber: '51-61-6',
    ecNumber: '200-115-8',
    smiles: 'NCCC1=CC(=C(C=C1)O)O',
    formula: 'C8H11NO2',
    category: 'Pharmaceutical',
    description: 'Endogenous catecholamine neurotransmitter. In ChemRegNet Table 4, Dopamine is in the near-zero / divergent regime (ρS = +0.07), where the graph branch tracks the catechol benzene ring while the descriptor branch gate modulates around the protonatable ethylamine tail.',
    ...processChemicalSmiles('NCCC1=CC(=C(C=C1)O)O', 'Dopamine'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Emergency cardiac therapeutic and neurochemical. Regulated pharmaceutical ingredient.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: { oshaPel: 'Not established', euDnelWorker: '0.05 mg/m³' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Registered therapeutic API.', referenceLaw: 'Regulation (EC) No 1907/2006' }
      ]
    },
    ghs: {
      signalWord: 'WARNING',
      pictograms: ['exclamation'],
      hazardStatements: [{ code: 'H302', text: 'Harmful if swallowed' }],
      precautionaryStatements: [{ code: 'P264', text: 'Wash hands thoroughly after handling' }],
      nfpa: { health: 2, flammability: 1, instability: 1, special: 'NONE' },
      transport: { unNumber: 'Not regulated', properShippingName: 'NON-HAZARDOUS', class: 'N/A', packingGroup: 'N/A' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Dopamine', 'CAS': '51-61-6' } }
    ]
  },

  // 9. Naproxen (Paper Benchmark: Divergence ρS = -0.38)
  {
    id: 'naproxen',
    name: 'Naproxen',
    commonName: 'Naproxen / Aleve',
    iupacName: '(2S)-2-(6-methoxynaphthalen-2-yl)propanoic acid',
    casNumber: '22204-53-1',
    ecNumber: '244-838-7',
    smiles: 'COC1=CC2=C(C=C1)C(C(C(=O)O)C)C=C2',
    formula: 'C14H14O3',
    category: 'Pharmaceutical',
    description: 'Naphthalene-derived NSAID. In ChemRegNet Table 4, Naproxen exhibits negative correlation (ρS = -0.38, top-3 overlap = 0.00). Saliency is carbon-dominant along the bulky bicyclic naphthalene skeleton, while the descriptor branch gate focuses on the polar propionic acid carboxyl group.',
    ...processChemicalSmiles('COC1=CC2=C(C=C1)C(C(C(=O)O)C)C=C2', 'Naproxen'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Broad global approval as an oral analgesic and anti-inflammatory. Active on REACH and TSCA.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: { oshaPel: 'Not established', euDnelWorker: '0.15 mg/m³' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Full registration dossier.', referenceLaw: 'Regulation (EC) No 1907/2006' }
      ]
    },
    ghs: {
      signalWord: 'DANGER',
      pictograms: ['skull', 'exclamation'],
      hazardStatements: [
        { code: 'H301', text: 'Toxic if swallowed' },
        { code: 'H315', text: 'Causes skin irritation' },
        { code: 'H319', text: 'Causes serious eye irritation' }
      ],
      precautionaryStatements: [
        { code: 'P301+P310', text: 'IF SWALLOWED: Immediately call a POISON CENTER or doctor' }
      ],
      nfpa: { health: 2, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'UN 2811', properShippingName: 'TOXIC SOLID, ORGANIC, N.O.S. (Naproxen)', class: '6.1', packingGroup: 'III' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Naproxen', 'CAS': '22204-53-1' } }
    ]
  },

  // 10. Serotonin (Paper Benchmark: Divergence ρS = -0.54)
  {
    id: 'serotonin',
    name: 'Serotonin',
    commonName: '5-Hydroxytryptamine / 5-HT',
    iupacName: '3-(2-aminoethyl)-1H-indol-5-ol',
    casNumber: '50-67-9',
    ecNumber: '200-059-4',
    smiles: 'C1=CC2=C(C=C1O)NC=C2CCN',
    formula: 'C10H12N2O',
    category: 'Pharmaceutical',
    description: 'Monoamine neurotransmitter derived from tryptophan. In ChemRegNet Table 4, Serotonin exhibits channel divergence (ρS = -0.54, top-3 overlap = 0.00), where task saliency concentrates on the bicyclic indole core while the activation gate isolates the 5-hydroxyl and ethylamine substituents.',
    ...processChemicalSmiles('C1=CC2=C(C=C1O)NC=C2CCN', 'Serotonin'),
    regulatory: {
      verdict: 'Compliant',
      summary: 'Endogenous biogenic amine and key research biochemical. Active on global chemical databases.',
      svhcCandidate: false,
      reachAnnexXIV: false,
      reachAnnexXVII: false,
      tscaActive: true,
      tscaSection5: false,
      tscaSection6: false,
      rohsCompliant: true,
      calProp65: false,
      exposureLimits: { oshaPel: 'Not established' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Compliant', details: 'Research chemical notification.', referenceLaw: 'Regulation (EC) No 1907/2006' }
      ]
    },
    ghs: {
      signalWord: 'WARNING',
      pictograms: ['exclamation'],
      hazardStatements: [{ code: 'H302', text: 'Harmful if swallowed' }],
      precautionaryStatements: [{ code: 'P264', text: 'Wash hands thoroughly after handling' }],
      nfpa: { health: 2, flammability: 1, instability: 1, special: 'NONE' },
      transport: { unNumber: 'Not regulated', properShippingName: 'NON-HAZARDOUS BIOCHEMICAL', class: 'N/A', packingGroup: 'N/A' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Serotonin (5-HT)', 'CAS': '50-67-9' } }
    ]
  },

  // 11. Bisphenol A (BPA) (High Priority Regulatory Surveillance - REACH SVHC)
  {
    id: 'bisphenol-a',
    name: 'Bisphenol A (BPA)',
    commonName: 'BPA / 4,4\'-(propane-2,2-diyl)diphenol',
    iupacName: '4-[2-(4-hydroxyphenyl)propan-2-yl]phenol',
    casNumber: '80-05-7',
    ecNumber: '201-245-8',
    unNumber: 'UN 3077',
    smiles: 'CC(C)(C1=CC=C(C=C1)O)C2=CC=C(C=C2)O',
    formula: 'C15H16O2',
    category: 'Endocrine Disruptor / SVHC',
    description: 'High-volume industrial plasticizer and monomer. Primary focus of European Chemicals Agency (ECHA) SVHC Candidate List: toxic for reproduction (Category 1B) and endocrine disruptor. Severe restrictions under REACH Annex XVII Entry 66 in thermal paper (< 0.02% w/w).',
    ...processChemicalSmiles('CC(C)(C1=CC=C(C=C1)O)C2=CC=C(C=C2)O', 'Bisphenol A'),
    regulatory: {
      verdict: 'Authorisation Required',
      summary: 'HIGH REGULATORY SCRUTINY: REACH SVHC Candidate List (Article 57c & 57f). Endocrine disruptor. Annex XVII Entry 66 restriction in thermal paper and food contact ban. Prioritized for Annex XIV Authorisation.',
      svhcCandidate: true,
      reachAnnexXIV: true,
      reachAnnexXVII: true,
      tscaActive: true,
      tscaSection5: true,
      tscaSection6: true,
      rohsCompliant: false,
      calProp65: true, // Female reproductive toxicity
      exposureLimits: { oshaPel: 'Not established', acgihTlv: '2 mg/m³', euDnelWorker: '2 mg/m³', pnecWater: '0.018 mg/L' },
      jurisdictions: [
        { jurisdiction: 'EU REACH (ECHA)', flag: '🇪🇺', status: 'Requires Authorisation', details: 'SVHC Candidate List. Annex XVII Entry 66 restriction.', referenceLaw: 'Regulation (EC) No 1907/2006' },
        { jurisdiction: 'US EPA TSCA', flag: '🇺🇸', status: 'Restricted', details: 'Designated High-Priority Substance under Section 6 risk evaluation.', referenceLaw: 'TSCA Section 6(b)' }
      ]
    },
    ghs: {
      signalWord: 'DANGER',
      pictograms: ['corrosive', 'health-hazard', 'environment', 'exclamation'],
      hazardStatements: [
        { code: 'H317', text: 'May cause an allergic skin reaction' },
        { code: 'H318', text: 'Causes serious eye damage' },
        { code: 'H360F', text: 'May damage fertility (Repro. 1B)' },
        { code: 'H411', text: 'Toxic to aquatic life with long lasting effects' }
      ],
      precautionaryStatements: [
        { code: 'P201', text: 'Obtain special instructions before use' },
        { code: 'P280', text: 'Wear protective gloves/clothing/eye protection' },
        { code: 'P305+P351+P338', text: 'IF IN EYES: Rinse cautiously with water for several minutes' }
      ],
      nfpa: { health: 3, flammability: 1, instability: 0, special: 'NONE' },
      transport: { unNumber: 'UN 3077', properShippingName: 'ENVIRONMENTALLY HAZARDOUS SUBSTANCE, SOLID, N.O.S. (BPA)', class: '9', packingGroup: 'III' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Bisphenol A (BPA)', 'CAS': '80-05-7' } }
    ]
  },

  // 12. PFOA (High Priority Regulatory Surveillance - Stockholm POPs)
  {
    id: 'pfoa',
    name: 'PFOA (C8)',
    commonName: 'Perfluorooctanoic Acid',
    iupacName: '2,2,3,3,4,4,5,5,6,6,7,7,8,8,8-pentadecafluorooctanoic acid',
    casNumber: '335-67-1',
    ecNumber: '206-397-9',
    unNumber: 'UN 3261',
    smiles: 'C(=O)(C(C(C(C(C(C(C(F)(F)F)(F)F)(F)F)(F)F)(F)F)(F)F)(F)F)O',
    formula: 'C8HF15O2',
    category: 'Endocrine Disruptor / SVHC',
    description: 'Persistent perfluorinated surfactant (PFAS). Global phase-out under the Stockholm Convention on POPs Annex A (Elimination) and EU POPs Regulation (EU) 2019/1021 (< 25 ppb). High-priority regulatory target under US EPA TSCA and Safe Drinking Water Act.',
    ...processChemicalSmiles('C(=O)(C(C(C(C(C(C(C(F)(F)F)(F)F)(F)F)(F)F)(F)F)(F)F)(F)F)O', 'PFOA'),
    regulatory: {
      verdict: 'Prohibited / Phase-Out',
      summary: 'BANNED SUBSTANCE: Stockholm Convention on POPs Annex A. EU POPs Regulation (EU) 2019/1021 sets 25 ppb limit in mixtures and articles. US CERCLA Hazardous Substance.',
      svhcCandidate: true,
      reachAnnexXIV: true,
      reachAnnexXVII: true,
      tscaActive: true,
      tscaSection5: true,
      tscaSection6: true,
      rohsCompliant: false,
      calProp65: true,
      exposureLimits: { oshaPel: 'Not established', acgihTlv: '0.01 mg/m³', euDnelWorker: '0.005 mg/m³' },
      jurisdictions: [
        { jurisdiction: 'Stockholm Convention on POPs', flag: '🌐', status: 'Restricted', details: 'Annex A (Elimination).', referenceLaw: 'UNEP Stockholm POPs' },
        { jurisdiction: 'EU POPs Regulation', flag: '🇪🇺', status: 'Restricted', details: 'Strict ban with 25 ppb trace limit.', referenceLaw: 'Regulation (EU) 2019/1021' }
      ]
    },
    ghs: {
      signalWord: 'DANGER',
      pictograms: ['corrosive', 'health-hazard', 'skull'],
      hazardStatements: [
        { code: 'H301', text: 'Toxic if swallowed' },
        { code: 'H314', text: 'Causes severe skin burns and eye damage' },
        { code: 'H351', text: 'Suspected of causing cancer (Carc. 2)' },
        { code: 'H360D', text: 'May damage the unborn child (Repr. 1B)' }
      ],
      precautionaryStatements: [
        { code: 'P201', text: 'Obtain special instructions before use' },
        { code: 'P280', text: 'Wear protective gloves/clothing/eye protection' }
      ],
      nfpa: { health: 3, flammability: 0, instability: 1, special: 'COR' },
      transport: { unNumber: 'UN 3261', properShippingName: 'CORROSIVE SOLID, ACIDIC, ORGANIC, N.O.S. (PFOA)', class: '8', packingGroup: 'II' }
    },
    sdsSections: [
      { sectionNumber: 1, title: 'Identification', content: { 'Product': 'Perfluorooctanoic Acid (PFOA)', 'CAS': '335-67-1' } }
    ]
  }
];

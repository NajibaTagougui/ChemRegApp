import React, { useState } from 'react';
import { ChemicalRecord } from '../types/chemistry';
import { 
  FileText, 
  Printer, 
  Download, 
  AlertTriangle, 
  Flame, 
  Skull, 
  Activity, 
  Droplet, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  Share2
} from 'lucide-react';

interface SafetyDataSheetViewProps {
  chemical: ChemicalRecord;
}

export const SafetyDataSheetView: React.FC<SafetyDataSheetViewProps> = ({ chemical }) => {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    8: true,
    9: true,
    15: true
  });

  const toggleSection = (num: number) => {
    setExpandedSections(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    for (let i = 1; i <= 16; i++) all[i] = true;
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    let sdsDoc = `SAFETY DATA SHEET (GHS REV 9 COMPLIANT)\n`;
    sdsDoc += `======================================================\n`;
    sdsDoc += `Product: ${chemical.name} (${chemical.casNumber})\n`;
    sdsDoc += `Formula: ${chemical.formula} | MW: ${chemical.descriptors.mw} g/mol\n`;
    sdsDoc += `Signal Word: ${chemical.ghs.signalWord}\n`;
    sdsDoc += `======================================================\n\n`;

    chemical.ghs.hazardStatements.forEach(h => {
      sdsDoc += `Hazard Statement: ${h.code} - ${h.text}\n`;
    });
    chemical.ghs.precautionaryStatements.forEach(p => {
      sdsDoc += `Precautionary Statement: ${p.code} - ${p.text}\n`;
    });
    sdsDoc += `\n`;

    all16Sections.forEach(s => {
      sdsDoc += `\n--- SECTION ${s.num}: ${s.title.toUpperCase()} ---\n`;
      Object.entries(s.content).forEach(([k, v]) => {
        sdsDoc += `${k}: ${Array.isArray(v) ? v.join(', ') : v}\n`;
      });
    });

    const blob = new Blob([sdsDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SDS_${chemical.name.replace(/\s+/g, '_')}_${chemical.casNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compile full 16 standard GHS sections
  const all16Sections = [
    {
      num: 1,
      title: 'Identification of Substance/Mixture & Supplier',
      content: {
        'Product Identifier': `${chemical.name} (CAS ${chemical.casNumber})`,
        'Chemical IUPAC Name': chemical.iupacName,
        'EC Number / EINECS': chemical.ecNumber,
        'REACH Registration': chemical.regulatory.verdict === 'Authorisation Required' ? 'Subject to Authorisation (Annex XIV)' : '01-2119488219-XXXX',
        'Recommended Use': `Industrial, laboratory research, and chemical manufacturing. Category: ${chemical.category}`,
        'Emergency Phone': '+1-800-424-9300 (24h CHEMTREC)'
      }
    },
    {
      num: 2,
      title: 'Hazard(s) Identification',
      content: {
        'GHS Classification': chemical.ghs.signalWord === 'DANGER' 
          ? 'Serious Eye Damage (Cat 1), Skin Sensitization (Cat 1), Reproductive Toxicity (Cat 1B), Aquatic Toxicity' 
          : 'Acute Toxicity (Cat 4), Eye Irritation (Cat 2A), Skin Irritation (Cat 2)',
        'Signal Word': chemical.ghs.signalWord,
        'Hazard Statements': chemical.ghs.hazardStatements.map(h => `${h.code}: ${h.text}`).join('; '),
        'Precautionary Statements': chemical.ghs.precautionaryStatements.map(p => `${p.code}: ${p.text}`).join('; ')
      }
    },
    {
      num: 3,
      title: 'Composition & Information on Ingredients',
      content: {
        'Chemical Characterization': `Pure organic substance (Purity >= 99.0%)`,
        'CAS Registry Number': chemical.casNumber,
        'SMILES Representation': chemical.smiles,
        'Molecular Formula': chemical.formula,
        'Molecular Weight': `${chemical.descriptors.mw} g/mol`
      }
    },
    {
      num: 4,
      title: 'First-Aid Measures',
      content: {
        'Inhalation': 'Remove victim to fresh air. If breathing ceases, apply artificial respiration immediately.',
        'Skin Contact': 'Immediately wash thoroughly with water and mild soap for at least 15 minutes. Discard contaminated footwear.',
        'Eye Contact': 'Rinse cautiously with water for at least 15 minutes holding eyelids apart. Seek immediate ophthalmic attention.',
        'Ingestion': 'Never induce vomiting unless directed by medical personnel. Rinse mouth with water. Seek emergency medical care.'
      }
    },
    {
      num: 5,
      title: 'Fire-Fighting Measures',
      content: {
        'Extinguishing Media': 'Water spray, alcohol-resistant foam, dry chemical powder or carbon dioxide (CO2).',
        'Specific Hazards': 'Thermal decomposition can lead to release of irritating carbon monoxide, carbon dioxide, or toxic halogenated vapors.',
        'Protective Equipment': 'Wear self-contained positive-pressure breathing apparatus (SCBA) and full protective bunker gear.'
      }
    },
    {
      num: 6,
      title: 'Accidental Release Measures',
      content: {
        'Personal Precautions': 'Evacuate unnecessary personnel. Ensure adequate mechanical ventilation. Avoid dust/vapor inhalation.',
        'Environmental Precautions': 'Prevent entry into waterways, sewers, basements, or confined areas. High aquatic hazard risk.',
        'Clean-Up Methods': 'Sweep up or absorb with inert liquid-binding material (vermiculite, sand) and transfer into closed waste containers.'
      }
    },
    {
      num: 7,
      title: 'Handling & Storage',
      content: {
        'Handling Precautions': 'Use only under chemical fume hood. Avoid contact with skin and eyes. Prevent dust cloud ignition.',
        'Storage Conditions': 'Keep container tightly closed in a dry, cool (15-25°C), and well-ventilated location. Store away from strong oxidizers.'
      }
    },
    {
      num: 8,
      title: 'Exposure Controls & Personal Protection',
      content: {
        'Occupational Exposure Limits': `OSHA PEL: ${chemical.regulatory.exposureLimits.oshaPel || 'None'}; ACGIH TLV: ${chemical.regulatory.exposureLimits.acgihTlv || 'None'}; EU DNEL: ${chemical.regulatory.exposureLimits.euDnelWorker || 'Assessed'}`,
        'Respiratory Protection': 'NIOSH/CEN certified organic vapor respirator with particulate P3 filter cartridge.',
        'Hand Protection': 'Nitrile or Viton chemical-resistant gloves (thickness >= 0.11 mm, breakthrough time > 480 min).',
        'Eye/Face Protection': 'Tight-fitting chemical safety goggles with anti-fog coating conforming to ANSI Z87.1 / EN 166.'
      }
    },
    {
      num: 9,
      title: 'Physical & Chemical Properties',
      content: {
        'Appearance & State': 'Solid / Crystalline Powder or Clear Liquid',
        'Molecular Weight': `${chemical.descriptors.mw} g/mol`,
        'Calculated LogP': `${chemical.descriptors.logP}`,
        'TPSA': `${chemical.descriptors.tpsa} Å²`,
        'Rotatable Bonds': `${chemical.descriptors.rotatableBonds}`,
        'ESOL Water Solubility': `${chemical.chemRegNet.esolSolubilityLogS} log mol/L`
      }
    },
    {
      num: 10,
      title: 'Stability & Reactivity',
      content: {
        'Chemical Stability': 'Stable under recommended storage conditions.',
        'Incompatible Materials': 'Strong oxidizing agents, strong bases, active mineral acids.',
        'Hazardous Decomposition': 'Carbon oxides (CO, CO2), halogenated acid gases under combustion.'
      }
    },
    {
      num: 11,
      title: 'Toxicological Information',
      content: {
        'Acute Toxicity': `Oral LD50: Estimated based on chemical family. Harmonized Classification: ${chemical.ghs.signalWord}`,
        'Skin Corrosion/Irritation': 'Moderate skin irritant; prolonged contact can lead to localized dermatitis.',
        'Carcinogenicity': chemical.regulatory.calProp65 ? 'Listed on California Prop 65 / IARC Warning' : 'Not classified as human carcinogen',
        'Reproductive Toxicity': chemical.regulatory.svhcCandidate ? 'SVHC Reproductive Toxin Category 1B' : 'No confirmed reproductive toxicity at standard limits.'
      }
    },
    {
      num: 12,
      title: 'Ecological Information',
      content: {
        'Ecotoxicity': `PNEC Freshwater: ${chemical.regulatory.exposureLimits.pnecWater || '0.05 mg/L'}. Toxic to aquatic invertebrates.`,
        'Persistence & Degradability': chemical.category === 'Endocrine Disruptor / SVHC' ? 'High persistence / Low biodegradation rate' : 'Moderate aerobic biodegradation in soil.',
        'Bioaccumulative Potential': chemical.descriptors.logP > 3.0 ? 'High bioaccumulation potential (Log Kow > 3)' : 'Low bioaccumulation tendency.'
      }
    },
    {
      num: 13,
      title: 'Disposal Considerations',
      content: {
        'Waste Treatment': 'Dispose of in compliance with local, state, and federal hazardous waste regulations (RCRA).',
        'Packaging Disposal': 'Empty containers retain chemical residue; handle as hazardous contaminated packaging.'
      }
    },
    {
      num: 14,
      title: 'Transport Information (DOT / ADR / IMDG / IATA)',
      content: {
        'UN Number': chemical.ghs.transport.unNumber,
        'Proper Shipping Name': chemical.ghs.transport.properShippingName,
        'Hazard Class': chemical.ghs.transport.class,
        'Packing Group': chemical.ghs.transport.packingGroup,
        'Marine Pollutant': chemical.ghs.pictograms.includes('environment') ? 'YES' : 'NO'
      }
    },
    {
      num: 15,
      title: 'Regulatory Information',
      content: {
        'EU REACH Compliance': `SVHC Candidate: ${chemical.regulatory.svhcCandidate ? 'YES' : 'NO'} | Annex XIV: ${chemical.regulatory.reachAnnexXIV ? 'YES' : 'NO'} | Annex XVII: ${chemical.regulatory.reachAnnexXVII ? 'YES' : 'NO'}`,
        'US TSCA Status': `Active Inventory: ${chemical.regulatory.tscaActive ? 'YES' : 'NO'} | Section 6 Risk Management: ${chemical.regulatory.tscaSection6 ? 'YES' : 'NO'}`,
        'RoHS Status': chemical.regulatory.rohsCompliant ? 'Compliant with Directive 2011/65/EU' : 'Restricted',
        'California Proposition 65': chemical.regulatory.calProp65 ? 'WARNING: Known to cause cancer or reproductive harm' : 'Not listed'
      }
    },
    {
      num: 16,
      title: 'Other Information',
      content: {
        'Document Revision': 'Rev 4.2 (GHS Rev. 9 & OSHA HazCom 2012 / REACH 2026)',
        'Legal Disclaimer': 'The information provided in this Safety Data Sheet is correct to the best of our knowledge, information and belief at the date of its publication. It does not constitute a warranty of specific properties.'
      }
    }
  ];

  const renderPictogram = (type: string) => {
    switch (type) {
      case 'flame':
        return (
          <div key={type} className="w-14 h-14 rotate-45 border-2 border-red-600 bg-white flex items-center justify-center p-1.5 shadow-sm">
            <Flame className="-rotate-45 w-7 h-7 text-red-600 fill-red-100" />
          </div>
        );
      case 'corrosive':
        return (
          <div key={type} className="w-14 h-14 rotate-45 border-2 border-red-600 bg-white flex items-center justify-center p-1.5 shadow-sm">
            <Droplet className="-rotate-45 w-7 h-7 text-red-600" />
          </div>
        );
      case 'skull':
        return (
          <div key={type} className="w-14 h-14 rotate-45 border-2 border-red-600 bg-white flex items-center justify-center p-1.5 shadow-sm">
            <Skull className="-rotate-45 w-7 h-7 text-black" />
          </div>
        );
      case 'health-hazard':
        return (
          <div key={type} className="w-14 h-14 rotate-45 border-2 border-red-600 bg-white flex items-center justify-center p-1.5 shadow-sm">
            <Activity className="-rotate-45 w-7 h-7 text-black" />
          </div>
        );
      case 'environment':
        return (
          <div key={type} className="w-14 h-14 rotate-45 border-2 border-red-600 bg-white flex items-center justify-center p-1.5 shadow-sm">
            <Droplet className="-rotate-45 w-7 h-7 text-black" />
          </div>
        );
      default:
        return (
          <div key={type} className="w-14 h-14 rotate-45 border-2 border-red-600 bg-white flex items-center justify-center p-1.5 shadow-sm">
            <AlertTriangle className="-rotate-45 w-7 h-7 text-black" />
          </div>
        );
    }
  };

  const nfpa = chemical.ghs.nfpa;

  return (
    <div className="flex flex-col gap-6">
      {/* Top SDS Header & Quick Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <FileText className="w-4 h-4" />
            <span>GHS FORMAT · 16-SECTION SAFETY DATA SHEET</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Safety Data Sheet (SDS) for {chemical.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            CAS: {chemical.casNumber} · EC: {chemical.ecNumber} · UN: {chemical.ghs.transport.unNumber}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            Collapse All
          </button>
          <button
            onClick={handleExportText}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Text</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official SDS</span>
          </button>
        </div>
      </div>

      {/* Hazard Identification Showcase: GHS Pictograms + NFPA 704 Diamond */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        {/* Col 1 & 2: GHS Pictograms & Statements */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Section 2 Hazard Placard & Signal Word
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <span
                className={`text-lg font-black tracking-wider px-3 py-1 rounded-md ${
                  chemical.ghs.signalWord === 'DANGER'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {chemical.ghs.signalWord}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {chemical.ghs.hazardStatements.length} Hazard Codes Defined
              </span>
            </div>

            {/* Pictograms */}
            <div className="flex flex-wrap items-center gap-5 py-3 pl-2">
              {chemical.ghs.pictograms.map(p => renderPictogram(p))}
            </div>

            {/* Statements List */}
            <div className="mt-4 space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">Hazard Statements:</div>
              {chemical.ghs.hazardStatements.map((h, i) => (
                <div key={i} className="text-xs text-rose-300 font-mono flex items-start gap-2">
                  <span className="font-bold shrink-0">{h.code}:</span>
                  <span className="font-sans text-slate-300">{h.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: NFPA 704 Fire Diamond */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 text-center">
            NFPA 704 Hazard Identification Diamond
          </div>

          <div className="relative w-36 h-36">
            {/* Red Quadrant: Flammability (Top) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-600 rotate-45 border-2 border-slate-950 flex items-center justify-center shadow-md">
              <span className="-rotate-45 text-2xl font-black text-white">{nfpa.flammability}</span>
            </div>

            {/* Blue Quadrant: Health (Left) */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-16 h-16 bg-blue-600 rotate-45 border-2 border-slate-950 flex items-center justify-center shadow-md">
              <span className="-rotate-45 text-2xl font-black text-white">{nfpa.health}</span>
            </div>

            {/* Yellow Quadrant: Instability (Right) */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-16 h-16 bg-amber-400 rotate-45 border-2 border-slate-950 flex items-center justify-center shadow-md">
              <span className="-rotate-45 text-2xl font-black text-black">{nfpa.instability}</span>
            </div>

            {/* White Quadrant: Special (Bottom) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-100 rotate-45 border-2 border-slate-950 flex items-center justify-center shadow-md">
              <span className="-rotate-45 text-xs font-black text-black">{nfpa.special === 'NONE' ? '' : nfpa.special}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 text-center">
            <div><span className="text-blue-400 font-bold">Health:</span> {nfpa.health}/4</div>
            <div><span className="text-red-400 font-bold">Flammability:</span> {nfpa.flammability}/4</div>
            <div><span className="text-amber-400 font-bold">Instability:</span> {nfpa.instability}/4</div>
            <div><span className="text-slate-300 font-bold">Special:</span> {nfpa.special || 'None'}</div>
          </div>
        </div>
      </div>

      {/* The 16 Collapsible SDS Sections */}
      <div className="flex flex-col gap-3">
        {all16Sections.map((sec) => {
          const isExpanded = !!expandedSections[sec.num];
          return (
            <div
              key={sec.num}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggleSection(sec.num)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-slate-900 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {sec.num}
                  </span>
                  <span className="text-sm font-bold text-white tracking-wide">
                    {sec.title}
                  </span>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {Object.entries(sec.content).map(([k, v], idx) => (
                      <div key={idx} className="flex flex-col gap-0.5">
                        <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                          {k}
                        </span>
                        <span className="text-slate-100 font-medium leading-relaxed">
                          {Array.isArray(v) ? v.join(', ') : v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

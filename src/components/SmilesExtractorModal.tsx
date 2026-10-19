import React, { useState } from 'react';
import { extractChemicalsFromText, ExtractedChemicalItem } from '../utils/smilesExtractor';
import { 
  FileSearch, 
  Sparkles, 
  Copy, 
  ArrowRight, 
  X, 
  Check, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface SmilesExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSmiles: (smiles: string, name?: string) => void;
}

const SAMPLE_TEXTS = [
  {
    title: 'ECHA REACH Dossier Excerpt (SVHC & PFAS)',
    text: `Substance Evaluation Report under Regulation (EC) No 1907/2006 (REACH).
Substance: Perfluorooctanoic acid (CAS 335-67-1, EC 206-397-9).
Molecular Formula: C8HF15O2.
Canonical SMILES: C(=O)(C(C(C(C(C(C(C(F)(F)F)(F)F)(F)F)(F)F)(F)F)(F)F)(F)F)O
The substance is identified as a Substance of Very High Concern (SVHC) meeting criteria of Article 57(c) as toxic for reproduction and Article 57(d) as PBT.
Also monitored in industrial effluents with traces of Bisphenol A (CAS 80-05-7, SMILES: CC(C)(C1=CC=C(C=C1)O)C2=CC=C(C=C2)O).`
  },
  {
    title: 'Pharmaceutical Patent Specification (Analgesic API)',
    text: `United States Patent Application 2024/0182944.
The present disclosure relates to therapeutic compositions containing acetylsalicylic acid (CAS 50-78-2, SMILES: CC(=O)OC1=CC=CC=C1C(=O)O, formula C9H8O4) in combination with acetaminophen (CAS 103-90-2, SMILES: CC(=O)NC1=CC=C(C=C1)O) and caffeine (CAS 58-08-2, SMILES: CN1C=NC2=C1C(=O)N(C(=O)N2C)C) for enhanced central nervous system relief.`
  },
  {
    title: 'OSHA Industrial Degreaser Safety Audit',
    text: `Facility Chemical Inventory Compliance Log - OSHA 29 CFR 1910.1200.
Degreaser tank #4 charges Trichloroethylene (CAS 79-01-6, SMILES: C(=C(Cl)Cl)Cl).
Solvent recovery contains benzene contamination (CAS 71-43-2, SMILES: C1=CC=CC=C1) with formula C6H6.
Action required: Verify local exhaust ventilation to ensure employee exposures remain strictly below 1 ppm 8-hour TWA.`
  }
];

export const SmilesExtractorModal: React.FC<SmilesExtractorModalProps> = ({
  isOpen,
  onClose,
  onSelectSmiles
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [extracted, setExtracted] = useState(() => extractChemicalsFromText(SAMPLE_TEXTS[0].text));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExtract = () => {
    const results = extractChemicalsFromText(inputText);
    setExtracted(results);
  };

  const handleCopy = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleApplySmiles = (item: ExtractedChemicalItem) => {
    onSelectSmiles(item.value, item.probableName);
    onClose();
  };

  const loadSample = (sampleText: string) => {
    setInputText(sampleText);
    setExtracted(extractChemicalsFromText(sampleText));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Dynamic SMILES & Chemical Entity Extractor
              </h2>
              <p className="text-xs text-slate-400">
                Extract chemical structures, CAS numbers, and formulas from unstructured technical text
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Quick-Load Sample Chips */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 mb-2">
              Quick Try: Pre-loaded Regulatory & Patent Excerpts
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSample(sample.text)}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/80 transition-colors text-left"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Area */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Paste Technical Text, Document Excerpt, or Patent Claim:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste SDS text, journal abstract, or patent claims containing SMILES strings or CAS numbers..."
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleExtract}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract Chemicals</span>
              </button>
            </div>
          </div>

          {/* Extracted Results Section */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Extracted Entities ({extracted.smiles.length} SMILES · {extracted.casNumbers.length} CAS · {extracted.formulas.length} Formulas)
              </h3>
            </div>

            {/* SMILES Results List */}
            {extracted.smiles.length > 0 ? (
              <div className="space-y-2.5">
                {extracted.smiles.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-cyan-800/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 text-[10px] font-mono font-bold">
                          SMILES
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="font-mono text-xs text-white font-bold truncate">
                        {item.value}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Context: "...{item.contextSnippet}..."
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(item.value, item.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Copy SMILES"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleApplySmiles(item)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>Load in 3D</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800/80 text-center text-xs text-slate-500">
                No chemical SMILES detected in the provided text. Try loading one of the sample texts above.
              </div>
            )}

            {/* CAS Numbers Extracted */}
            {extracted.casNumbers.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-semibold text-slate-400 mb-2">Detected CAS Registry Numbers:</div>
                <div className="flex flex-wrap gap-2">
                  {extracted.casNumbers.map((cas) => (
                    <span
                      key={cas.id}
                      className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-medium"
                    >
                      CAS {cas.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ChemicalRecord } from '../types/chemistry';
import { 
  GitBranch, 
  Cpu, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  FileCode2,
  Info
} from 'lucide-react';

interface ChemRegNetExplainabilityProps {
  chemical: ChemicalRecord;
}

export const ChemRegNetExplainability: React.FC<ChemRegNetExplainabilityProps> = ({ chemical }) => {
  const [activeTab, setActiveTab] = useState<'attribution' | 'benchmarks' | 'ablations'>('attribution');

  const { chemRegNet, attribution, structure3D, descriptors, scaffold } = chemical;
  const atoms = structure3D.atoms;

  // 5 MoleculeNet benchmarks from paper Table 1 & Table 2
  const benchmarkRows = [
    { dataset: 'ESOL (Solubility)', task: 'Regression (RMSE ↓)', scaffold: '1.060 ± 0.037', random: '0.835 ± 0.062', gap: '21.2%', metricName: 'log mol/L' },
    { dataset: 'Lipophilicity', task: 'Regression (RMSE ↓)', scaffold: '0.744 ± 0.003', random: '0.668 ± 0.004', gap: '11.4%', metricName: 'logD' },
    { dataset: 'FreeSolv', task: 'Regression (RMSE ↓)', scaffold: '1.502 ± 0.008', random: '1.219 ± 0.007', gap: '23.2%', metricName: 'kcal/mol' },
    { dataset: 'BACE (β-secretase)', task: 'Classification (AUROC ↑)', scaffold: '0.833 ± 0.002', random: '0.890 ± 0.002', gap: '6.4%', metricName: 'AUROC' },
    { dataset: 'BBBP (Blood-Brain)', task: 'Classification (AUROC ↑)', scaffold: '0.742 ± 0.002', random: '0.800 ± 0.002', gap: '7.2%', metricName: 'AUROC' },
  ];

  // Ablation study from Table 3 in the paper
  const ablationRows = [
    { model: 'RF-200 (Random Forest 200 desc)', r2: '0.720', rmse: '1.079', mae: '0.807', note: 'Descriptor baseline' },
    { model: 'XGB-200 (XGBoost 200 desc)', r2: '0.765', rmse: '0.991', mae: '0.765', note: 'Strong tree baseline' },
    { model: 'GCN Only (3-layer GCN, no desc)', r2: '0.684', rmse: '1.150', mae: '0.911', note: 'Chemically blind topology' },
    { model: 'GCN + concat (Static Concatenation)', r2: '0.717', rmse: '1.086', mae: '0.861', note: 'PotentialNet / Mol-SGGI style' },
    { model: 'ChemRegNet w/o attention gate', r2: '0.717', rmse: '1.086', mae: '0.861', note: 'Ablation: No gating' },
    { model: 'ChemRegNet w/o contrastive loss', r2: '0.721', rmse: '1.079', mae: '0.857', note: 'Ablation: No scaffold regularizer' },
    { model: 'ChemRegNet (Full Model)', r2: '0.729', rmse: '1.060', mae: '0.834', note: 'Best GNN-based under scaffold split (120 epochs)' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Model Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Peer-Reviewed Architecture · ISIMS & Univ. of Sfax
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                ChemRegNet: Cross-Modal Graph–Descriptor Fusion & Scaffold Regularization
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('attribution')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'attribution'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual-Channel Attribution
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'benchmarks'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Evaluation Optimism Gap
            </button>
            <button
              onClick={() => setActiveTab('ablations')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'ablations'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ablation Study (Table 3)
            </button>
          </div>
        </div>

        {/* ChemRegNet Predictions Cards Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <span className="text-slate-400 text-[11px] block">ESOL Aqueous LogS</span>
            <span className="text-lg font-bold text-cyan-400">
              {chemRegNet.esolSolubilityLogS} <span className="text-[10px] text-slate-400">log mol/L</span>
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <span className="text-slate-400 text-[11px] block">Lipophilicity LogD</span>
            <span className="text-lg font-bold text-emerald-400">
              {chemRegNet.lipophilicityLogD}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <span className="text-slate-400 text-[11px] block">FreeSolv ΔG_hyd</span>
            <span className="text-lg font-bold text-amber-400">
              {chemRegNet.freeSolvHydrationEnergy} <span className="text-[10px] text-slate-400">kcal/mol</span>
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <span className="text-slate-400 text-[11px] block">BACE-1 Inhibitor</span>
            <span className="text-lg font-bold text-purple-400">
              {(chemRegNet.baceInhibitorScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
            <span className="text-slate-400 text-[11px] block">BBBP Penetration</span>
            <span className="text-lg font-bold text-rose-400">
              {(chemRegNet.bbbpPenetrationScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tab 1: Dual-Channel Explainability Attribution */}
      {activeTab === 'attribution' && (
        <div className="flex flex-col gap-5">
          {/* Diagnostic Agreement Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Attribution Channel Agreement Analysis (Table 4)
                </h3>
                <p className="text-xs text-slate-400">
                  Spearman rank correlation (ρS) between Task Saliency (Sv) and Descriptor Activation (Av)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold ${
                    attribution.regime === 'Agreement'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : attribution.regime === 'Partial Agreement'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  Regime: {attribution.regime} (ρS = {attribution.spearmanRho > 0 ? `+${attribution.spearmanRho}` : attribution.spearmanRho})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-400">Interpretability Diagnostic: </span>
              {attribution.explanation}
            </p>

            {/* Agreement Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Spearman Rank Corr. (ρS)</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {attribution.spearmanRho > 0 ? `+${attribution.spearmanRho}` : attribution.spearmanRho}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Top-3 Atom Overlap</span>
                <span className="text-lg font-bold text-cyan-400 tabular-nums">
                  {(attribution.top3Overlap * 100).toFixed(0)}%
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Carbon Mean Saliency</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">
                  {attribution.carbonMeanSaliency}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Heteroatom Mean Activation</span>
                <span className="text-lg font-bold text-purple-400 tabular-nums">
                  {attribution.heteroatomMeanActivation}
                </span>
              </div>
            </div>
          </div>

          {/* Per-Atom Side-by-Side Saliency vs Activation Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Per-Atom Attribution Channels Comparison ({chemical.name})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Comparing Output Saliency Sv (carbon skeleton dominant) vs Attention Activation Av (heteroatom polar group dominant)
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-2">
              {atoms.map((atom) => (
                <div key={atom.id} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-12 font-bold text-slate-200 shrink-0">
                    {atom.symbol}{atom.id}
                  </span>

                  {/* Saliency Bar (Emerald) */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 relative">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(atom.saliency * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-emerald-400 text-[11px] font-bold">
                      {atom.saliency.toFixed(2)}
                    </span>
                  </div>

                  {/* Activation Bar (Purple) */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 relative">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(atom.activation * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-purple-400 text-[11px] font-bold">
                      {atom.activation.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 mt-4 pt-3 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span>Task Saliency (Sv) Output Pathway</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
                <span>Descriptor-Gated Activation (Av) Pathway</span>
              </div>
            </div>
          </div>

          {/* Bemis-Murcko Core Framework Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>Bemis-Murcko Scaffold Decomposition</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                Core Ratio: {(scaffold.scaffoldRatio * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              ChemRegNet enforces structural dissimilarity during training via a scaffold-aware contrastive regularizer Lc. The Bemis-Murcko framework extracts ring assemblies and linkers while removing terminal acyclic appendages.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Scaffold Framework:</span>
                <span className="text-white font-bold">{scaffold.scaffoldName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Scaffold SMILES:</span>
                <span className="text-cyan-300 font-bold">{scaffold.scaffoldSmiles}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ring Systems:</span>
                <span className="text-emerald-400 font-bold">{scaffold.ringCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Evaluation Optimism Gap */}
      {activeTab === 'benchmarks' && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Evaluation Optimism Across Five MoleculeNet Benchmarks (Table 2 & Figure 3)
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Random train/test data splitting inflates apparent performance relative to scaffold splitting by <strong>6.4% to 23.2%</strong>. When test molecules share Bemis-Murcko scaffolds with the training set, the model is tested on chemistry it has already seen. ChemRegNet was evaluated under scaffold split (70/10/20) across five independent seeds.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Dataset</th>
                    <th className="py-2.5 px-3">Task & Metric</th>
                    <th className="py-2.5 px-3">Scaffold Split (Honest)</th>
                    <th className="py-2.5 px-3">Random Split (Optimistic)</th>
                    <th className="py-2.5 px-3">Optimism Gap (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {benchmarkRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-white font-sans">{r.dataset}</td>
                      <td className="py-3 px-3 text-slate-400">{r.task}</td>
                      <td className="py-3 px-3 text-cyan-400 font-bold">{r.scaffold}</td>
                      <td className="py-3 px-3 text-slate-300">{r.random}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 font-bold">
                          +{r.gap}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                On ESOL (1,128 molecules), ChemRegNet reaches <strong>RMSE = 1.060</strong> under scaffold split, but drops to <strong>0.835</strong> under random split—a 21.2% gap that dwarfs the difference between model architectures.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Component Ablation Study */}
      {activeTab === 'ablations' && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Component Ablation on ESOL Under Scaffold Split (Table 3)
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Validation of the cross-modal attention gate and scaffold-aware contrastive regularizer. The two components address distinct failure modes: chemical grounding and scaffold-level generalization.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Configuration</th>
                    <th className="py-2.5 px-3">R² Score</th>
                    <th className="py-2.5 px-3">RMSE ↓</th>
                    <th className="py-2.5 px-3">MAE ↓</th>
                    <th className="py-2.5 px-3">Architectural Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {ablationRows.map((r, i) => (
                    <tr
                      key={i}
                      className={`${
                        r.model.includes('Full Model')
                          ? 'bg-cyan-950/30 text-white font-bold'
                          : 'hover:bg-slate-800/30 text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-3 font-sans font-semibold text-white">{r.model}</td>
                      <td className="py-3 px-3 text-emerald-400">{r.r2}</td>
                      <td className="py-3 px-3 text-cyan-400">{r.rmse}</td>
                      <td className="py-3 px-3 text-slate-400">{r.mae}</td>
                      <td className="py-3 px-3 text-slate-400 font-sans">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="font-semibold text-cyan-400">Key Scientific Takeaways:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>
                  <strong>Attention Gate Benefit:</strong> Removing the attention gate (GCN + concat) increases RMSE from 1.060 to 1.086 (2.4% error reduction attributed to per-molecule descriptor weighting).
                </li>
                <li>
                  <strong>Contrastive Loss Benefit:</strong> Removing the scaffold contrastive regularizer increases RMSE to 1.079 (1.8% error reduction from representation alignment).
                </li>
                <li>
                  <strong>Independent & Additive:</strong> Both components act on distinct parts of the pipeline and their gains compound.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

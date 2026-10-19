import React, { useState } from 'react';
import { ChemicalRecord, RegulatoryVerdict } from '../types/chemistry';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  FileText, 
  Download, 
  ExternalLink,
  Clock
} from 'lucide-react';

interface RegulatoryCompliancePanelProps {
  chemical: ChemicalRecord;
}

export const RegulatoryCompliancePanel: React.FC<RegulatoryCompliancePanelProps> = ({ chemical }) => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');

  const reg = chemical.regulatory;

  const getVerdictBadge = (verdict: RegulatoryVerdict) => {
    switch (verdict) {
      case 'Compliant':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            COMPLIANT / MARKET CLEARED
          </span>
        );
      case 'Restricted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            RESTRICTED SUBSTANCE (ANNEX XVII / SNUR)
          </span>
        );
      case 'Authorisation Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-purple-950/80 text-purple-400 border border-purple-800">
            <AlertOctagon className="w-3.5 h-3.5 text-purple-400" />
            AUTHORISATION REQUIRED (SVHC ANNEX XIV)
          </span>
        );
      case 'Prohibited / Phase-Out':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            PROHIBITED / POPs PHASE-OUT (BANNED)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300">
            REVIEW PENDING
          </span>
        );
    }
  };

  const handleExportDossier = () => {
    const report = {
      chemical: chemical.name,
      casNumber: chemical.casNumber,
      ecNumber: chemical.ecNumber,
      smiles: chemical.smiles,
      formula: chemical.formula,
      molecularWeight: chemical.descriptors.mw,
      complianceVerdict: chemical.regulatory.verdict,
      svhcCandidate: chemical.regulatory.svhcCandidate,
      reachAnnexXIV: chemical.regulatory.reachAnnexXIV,
      reachAnnexXVII: chemical.regulatory.reachAnnexXVII,
      tscaActive: chemical.regulatory.tscaActive,
      tscaSection6: chemical.regulatory.tscaSection6,
      rohsCompliant: chemical.regulatory.rohsCompliant,
      calProp65: chemical.regulatory.calProp65,
      exposureLimits: chemical.regulatory.exposureLimits,
      jurisdictions: chemical.regulatory.jurisdictions,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChemReg_Compliance_Dossier_${chemical.casNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredJurisdictions = selectedJurisdiction === 'all'
    ? reg.jurisdictions
    : reg.jurisdictions.filter(j => j.jurisdiction.toLowerCase().includes(selectedJurisdiction.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Global Compliance Verdict Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Global Compliance Status · CAS {chemical.casNumber}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{chemical.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getVerdictBadge(reg.verdict)}
            <button
              onClick={handleExportDossier}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Download Compliance Dossier JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
          {reg.summary}
        </p>

        {/* Rapid Regulatory Status Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">EU REACH SVHC</span>
            <span className={`font-bold ${reg.svhcCandidate ? 'text-purple-400' : 'text-slate-200'}`}>
              {reg.svhcCandidate ? '● Candidate List' : 'Not Listed'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">REACH Annex XVII</span>
            <span className={`font-bold ${reg.reachAnnexXVII ? 'text-amber-400' : 'text-slate-200'}`}>
              {reg.reachAnnexXVII ? '● Restricted' : 'No Restrictions'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">US TSCA Inventory</span>
            <span className={`font-bold ${reg.tscaActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {reg.tscaActive ? 'Active Commercial' : 'Inactive / PMN'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">TSCA Section 6</span>
            <span className={`font-bold ${reg.tscaSection6 ? 'text-rose-400' : 'text-slate-200'}`}>
              {reg.tscaSection6 ? 'High Priority Rule' : 'Not Regulated'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">RoHS 2011/65/EU</span>
            <span className={`font-bold ${reg.rohsCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
              {reg.rohsCompliant ? 'Compliant (<0.1%)' : 'Restricted'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 block text-[11px]">California Prop 65</span>
            <span className={`font-bold ${reg.calProp65 ? 'text-amber-400' : 'text-slate-200'}`}>
              {reg.calProp65 ? 'Warning Required' : 'Not Listed'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Global Jurisdictions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              International Regulatory Jurisdiction Audits
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated across statutory authorities and government inventories
            </p>
          </div>

          {/* Jurisdiction Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['all', 'reach', 'tsca', 'osha', 'japan', 'china'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedJurisdiction(tab)}
                className={`px-3 py-1 rounded-md capitalize transition-colors font-medium ${
                  selectedJurisdiction === tab
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Authorities' : tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Statutory Details</th>
                <th className="py-2.5 px-3">Governing Law</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredJurisdictions.map((j, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2 whitespace-nowrap">
                    <span>{j.flag}</span>
                    <span>{j.jurisdiction}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        j.status === 'Compliant'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                          : j.status === 'Restricted'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                          : j.status === 'Requires Authorisation'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/80'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 leading-normal max-w-md">
                    {j.details}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-cyan-400 whitespace-nowrap">
                    {j.referenceLaw}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Occupational Exposure Limits (OEL) & Toxicological Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Workplace Exposure Limits (OELs)</span>
          </h3>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">US OSHA PEL (8-hr TWA)</span>
              <span className="font-bold text-white">{reg.exposureLimits.oshaPel || 'Not established'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">ACGIH TLV-TWA</span>
              <span className="font-bold text-white">{reg.exposureLimits.acgihTlv || 'Not established'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">EU REACH DNEL (Worker Inhalation)</span>
              <span className="font-bold text-cyan-400">{reg.exposureLimits.euDnelWorker || 'Under assessment'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">PNEC (Freshwater Aquatic)</span>
              <span className="font-bold text-emerald-400">{reg.exposureLimits.pnecWater || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 4. Statutory Compliance & Article Directives */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Statutory Compliance Guidance</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">ECHA / EPA Protocol</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Mandatory supply chain communication, SVHC threshold notifications, and safety documentation.
            </p>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-0.5">REACH Article 33 Duty:</span>
                <span className="text-slate-400 font-sans">
                  {reg.svhcCandidate 
                    ? 'Substance is an SVHC Candidate. Obligation to notify downstream recipients if article content exceeds 0.1% w/w.'
                    : 'Article 33 duty not triggered (Substance is not on the SVHC Candidate List).'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-0.5">TSCA Section 5 / 6 Verification:</span>
                <span className="text-slate-400 font-sans">
                  {reg.tscaSection6
                    ? 'Subject to Section 6 Comprehensive Risk Evaluation / Prohibitory Rules. Strict commercial distribution controls apply.'
                    : 'Active commercial inventory status. Standard reporting thresholds apply.'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] font-mono text-slate-500 text-right">
            Governing standard: Regulation (EC) No 1907/2006 & 15 U.S.C. § 2601
          </div>
        </div>
      </div>
    </div>
  );
};

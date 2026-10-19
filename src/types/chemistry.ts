export interface AtomData {
  id: number;
  symbol: string;
  x: number;
  y: number;
  z: number;
  formalCharge: number;
  hybridization?: string;
  saliency: number; // Sv: gradient saliency [0, 1]
  activation: number; // Av: activation attribution [0, 1]
  atomicNum: number;
}

export interface BondData {
  atom1: number;
  atom2: number;
  order: 1 | 2 | 3 | 1.5;
  isAromatic?: boolean;
}

export interface Molecule3DStructure {
  atoms: AtomData[];
  bonds: BondData[];
}

export interface DescriptorsData {
  mw: number;
  logP: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rotatableBonds: number;
  aromaticRings: number;
  aliphaticRings: number;
  heavyAtoms: number;
  fractionCsp3: number;
  bertzComplexity: number;
  formalCharge: number;
}

export interface LipinskiStatus {
  passes: boolean;
  violationsCount: number;
  violations: string[];
  mwPass: boolean;
  logPPass: boolean;
  hbdPass: boolean;
  hbaPass: boolean;
}

export interface VeberStatus {
  passes: boolean;
  rotatableBondsPass: boolean;
  tpsaPass: boolean;
}

export interface MurckoScaffoldInfo {
  scaffoldSmiles: string;
  scaffoldName: string;
  ringCount: number;
  atomCount: number;
  scaffoldRatio: number; // scaffold MW / total MW
}

export interface ChemRegNetPredictions {
  esolSolubilityLogS: number; // log mol/L
  lipophilicityLogD: number;
  freeSolvHydrationEnergy: number; // kcal/mol
  baceInhibitorScore: number; // probability [0, 1]
  bbbpPenetrationScore: number; // probability [0, 1]
  scaffoldOptimismGapPercent: number; // e.g. 21.2%
}

export interface AttributionAgreementMetrics {
  spearmanRho: number; // -1 to +1
  top3Overlap: number; // 0.0 to 1.0
  top5Overlap: number; // 0.0 to 1.0
  carbonMeanSaliency: number;
  heteroatomMeanSaliency: number;
  carbonMeanActivation: number;
  heteroatomMeanActivation: number;
  regime: 'Agreement' | 'Partial Agreement' | 'Divergence';
  explanation: string;
}

export type RegulatoryVerdict = 
  | 'Compliant'
  | 'Restricted'
  | 'Authorisation Required'
  | 'High Regulatory Risk'
  | 'Prohibited / Phase-Out';

export interface RegulatoryJurisdictionStatus {
  jurisdiction: string; // 'EU REACH', 'US TSCA', 'OSHA', 'UK REACH', 'China IECSC', 'Japan ENCS'
  flag: string;
  status: 'Compliant' | 'Restricted' | 'Requires Authorisation' | 'Listed' | 'Exempt';
  details: string;
  referenceLaw: string;
}

export interface SafetyDataSheetSection {
  sectionNumber: number;
  title: string;
  content: Record<string, string | string[]>;
}

export interface NFPA704Rating {
  health: number; // 0-4
  flammability: number; // 0-4
  instability: number; // 0-4
  special?: 'W' | 'OX' | 'SA' | 'COR' | 'BIO' | 'NONE';
}

export interface ChemicalRecord {
  id: string;
  name: string;
  commonName: string;
  iupacName: string;
  casNumber: string;
  ecNumber: string;
  unNumber?: string;
  smiles: string;
  formula: string;
  category: 'Pharmaceutical' | 'Industrial Chemical' | 'Agrochemical' | 'Endocrine Disruptor / SVHC' | 'Consumer Chemical';
  description: string;
  
  descriptors: DescriptorsData;
  lipinski: LipinskiStatus;
  veber: VeberStatus;
  scaffold: MurckoScaffoldInfo;
  
  chemRegNet: ChemRegNetPredictions;
  attribution: AttributionAgreementMetrics;
  
  structure3D: Molecule3DStructure;
  
  regulatory: {
    verdict: RegulatoryVerdict;
    summary: string;
    svhcCandidate: boolean;
    reachAnnexXIV: boolean;
    reachAnnexXVII: boolean;
    tscaActive: boolean;
    tscaSection5: boolean;
    tscaSection6: boolean;
    rohsCompliant: boolean;
    calProp65: boolean;
    exposureLimits: {
      oshaPel?: string;
      acgihTlv?: string;
      euDnelWorker?: string;
      pnecWater?: string;
    };
    jurisdictions: RegulatoryJurisdictionStatus[];
  };
  
  ghs: {
    signalWord: 'DANGER' | 'WARNING' | 'NONE';
    pictograms: Array<'flame' | 'corrosive' | 'skull' | 'health-hazard' | 'exclamation' | 'environment' | 'bomb' | 'gas'>;
    hazardStatements: Array<{ code: string; text: string }>;
    precautionaryStatements: Array<{ code: string; text: string }>;
    nfpa: NFPA704Rating;
    transport: {
      unNumber: string;
      properShippingName: string;
      class: string;
      packingGroup: 'I' | 'II' | 'III' | 'N/A';
    };
  };
  
  sdsSections: SafetyDataSheetSection[];
}

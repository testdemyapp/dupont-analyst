
export interface Company {
  symbol: string;
  name: string;
  sector: string;
}

export interface MetricYearData {
  year: number;
  revenue: number;
  netProfit: number;
  totalAssets: number;
  totalEquity: number;
  // Computed
  roe: number;
  roa: number;
  margin: number;
  turnover: number;
  leverage: number;
}

export interface NLPMeasures {
  sentiment: number;
  fli: number; // Forward Looking Info
  specificity: number;
  sentenceLength: number;
  depth: number;
  unfamiliarity: number;
}

export interface PeerRiskMetric {
  metric: string;
  companyValue: string;
  peerMedian: string;
  topQuartile: string;
  evidence: string;
}

export interface RiskAnalysis {
  financial: string;
  solvencyIndex: number;
  business: {
    legal: number;
    tax: number;
    macro: number;
    firmSpecific: number;
  };
  summary: string;
  peerComparison: PeerRiskMetric[];
}

export interface AccuracyAudit {
  metric: string;
  year: number;
  identifiedValue: number;
  verifiedValue: number;
  variance: number;
  status: 'Verified' | 'Adjusted';
}

export interface DuPontAnalysis {
  company: Company;
  anchorYear: number;
  timeSeries: MetricYearData[];
  nlpData: Record<number, NLPMeasures>;
  risk: RiskAnalysis;
  sources: { title: string; uri: string }[];
  accuracyAudit: AccuracyAudit[];
  accuracySummary: string;
  narrative: {
    section1: string;
    section2: string;
    section3: string;
    section4: string;
    qAndA: Record<string, string>;
  };
  forecasts: Record<string, { base: number; upside: number; downside: number }>;
}

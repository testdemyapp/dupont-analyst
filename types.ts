
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
  totalDebt: number;
  // Computed
  roe: number;
  roa: number;
  margin: number;
  turnover: number;
  leverage: number;
  reportUrl?: string;
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

export interface PeerROI {
  peerName: string;
  peerSymbol: string;
  roa: number;
  roe: number;
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
  annualReportValue: number;
  verifiedValue: number;
  variance: number;
  status: 'Verified' | 'Adjusted';
  currency: string;
}

export interface DiagnosticNarrative {
  roe: string;
  roa: string;
  margin: string;
  turnover: string;
  overall: string;
}

export interface DuPontAnalysis {
  company: Company;
  anchorYear: number;
  timeSeries: MetricYearData[];
  nlpData: Record<number, NLPMeasures>;
  risk: RiskAnalysis;
  peerROI: PeerROI;
  sources: { title: string; uri: string }[];
  accuracyAudit: AccuracyAudit[];
  accuracySummary: string;
  forecastAssumptions: string;
  diagnostic?: DiagnosticNarrative;
  narrative: {
    section1: string;
    section2: string;
    section3: string;
    section4: string;
    qAndA: {
      roe_trend: string;
      roe_peer: string;
      margin_trend: string;
      margin_peer: string;
      turnover_trend: string;
      turnover_peer: string;
      driver_dominance: string;
      risk_trend: string;
      risk_peer: string;
      nlp_sentiment: string;
      nlp_specificity: string;
      nlp_complexity: string;
      nlp_peer: string;
    };
  };
  forecasts: Record<string, { base: number; upside: number; downside: number }>;
}

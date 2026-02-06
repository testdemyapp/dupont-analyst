
import { Company } from './types';

export interface ExtendedCompany extends Company {
  domain?: string;
}

export const FTSE100_CONSTITUENTS: ExtendedCompany[] = [
  { symbol: "AAL", name: "Anglo American", sector: "Mining", domain: "angloamerican.com" },
  { symbol: "ABF", name: "Associated British Foods", sector: "Food Producers", domain: "abf.co.uk" },
  { symbol: "ADM", name: "Admiral Group", sector: "Non-life Insurance", domain: "admiralgroup.co.uk" },
  { symbol: "AHT", name: "Ashtead Group", sector: "Support Services", domain: "ashtead-group.com" },
  { symbol: "ANTO", name: "Antofagasta", sector: "Mining", domain: "antofagasta.co.uk" },
  { symbol: "AZN", name: "AstraZeneca", sector: "Pharmaceuticals & Biotechnology", domain: "astrazeneca.com" },
  { symbol: "BA", name: "BAE Systems", sector: "Aerospace & Defence", domain: "baesystems.com" },
  { symbol: "BARC", name: "Barclays", sector: "Banks", domain: "barclays.co.uk" },
  { symbol: "BATS", name: "British American Tobacco", sector: "Tobacco", domain: "bat.com" },
  { symbol: "BP", name: "BP", sector: "Oil & Gas Producers", domain: "bp.com" },
  { symbol: "DGE", name: "Diageo", sector: "Beverages", domain: "diageo.com" },
  { symbol: "GSK", name: "GSK", sector: "Pharmaceuticals & Biotechnology", domain: "gsk.com" },
  { symbol: "HSBA", name: "HSBC Holdings", sector: "Banks", domain: "hsbc.com" },
  { symbol: "LLOY", name: "Lloyds Banking Group", sector: "Banks", domain: "lloydsbankinggroup.com" },
  { symbol: "NG", name: "National Grid", sector: "Gas, Water & Multiutilities", domain: "nationalgrid.com" },
  { symbol: "RIO", name: "Rio Tinto", sector: "Mining", domain: "riotinto.com" },
  { symbol: "SHEL", name: "Shell", sector: "Oil & Gas Producers", domain: "shell.com" },
  { symbol: "TSCO", name: "Tesco", sector: "Food & Drug Retailers", domain: "tescoplc.com" },
  { symbol: "ULVR", name: "Unilever", sector: "Personal Goods", domain: "unilever.com" },
  { symbol: "VOD", name: "Vodafone Group", sector: "Mobile Telecommunications", domain: "vodafone.com" }
];

export const YEARS = [2024, 2023, 2022, 2021, 2020];

export interface MetricDefinition {
  label: string;
  formula: string;
  explanation: string;
  source?: string;
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  roe: {
    label: "Return on Equity (ROE)",
    formula: "Net Profit / Average Shareholder Equity",
    explanation: "ROE measures a corporation's profitability by revealing how much profit a company generates with the money shareholders have invested. It is the 'ultimate' measure of shareholder value creation.",
    source: "Annual Report, Equity Attributable to Owners"
  },
  roa: {
    label: "Return on Assets (ROA)",
    formula: "Net Profit / Average Total Assets",
    explanation: "ROA indicates how profitable a company is relative to its total assets. It gives an idea as to how efficient management is at using its assets to generate earnings.",
    source: "Annual Report, Total Assets & Net Income"
  },
  margin: {
    label: "Net Profit Margin",
    formula: "Net Profit / Total Revenue",
    explanation: "The percentage of revenue left after all operating expenses, interest, taxes, and preferred stock dividends have been deducted from a company's total revenue.",
    source: "Income Statement"
  },
  turnover: {
    label: "Asset Turnover",
    formula: "Total Revenue / Average Total Assets",
    explanation: "Measures the efficiency of a company's use of its assets in generating sales revenue. Higher turnover implies better utilization of the capital base.",
    source: "Balance Sheet & Income Statement"
  },
  leverage: {
    label: "Financial Leverage (Equity Multiplier)",
    formula: "Average Total Assets / Average Shareholder Equity",
    explanation: "A measure of how much of a company's assets are financed by its shareholders. A higher ratio indicates more debt financing relative to equity.",
    source: "Balance Sheet"
  },
  solvencyIndex: {
    label: "Solvency Index",
    formula: "Composite of Quick, Current, and Cash Ratios",
    explanation: "An internal index measuring the company's ability to meet long-term obligations and short-term liquidity needs. High values suggest a robust liquidity buffer.",
    source: "Notes to Financial Statements (Liquidity Risk)"
  },
  sentiment: {
    label: "NLP Sentiment Tone",
    formula: "Dictionary-based Finance Net Tone Score",
    explanation: "Uses a finance-specific NLP dictionary to calculate the ratio of positive vs negative language in the annual report. Higher scores correlate with management optimism.",
    source: "Strategic Report / CEO Statement"
  },
  fli: {
    label: "Forward Looking Information (FLI)",
    formula: "Frequency of Future-Oriented Markers",
    explanation: "Measures the density of words like 'expect', 'will', 'guidance', and 'outlook'. High FLI intensity suggests management is providing more visibility into future periods.",
    source: "Outlook & Principal Risks Sections"
  },
  specificity: {
    label: "Information Specificity",
    formula: "Entity Density & Numeric Intensity Index",
    explanation: "Measures how concrete the report is by tracking the frequency of numbers, specific dates, and named entities. High specificity typically indicates higher reporting quality.",
    source: "Operating Review / Segment Analysis"
  },
  sentenceLength: {
    label: "Sentence Length (Readability)",
    formula: "Average Words Per Sentence",
    explanation: "A proxy for reporting clarity. Extremely long sentences can sometimes be used to obfuscate poor performance or complex risks.",
    source: "Full Text Narrative"
  },
  depth: {
    label: "Syntactic Depth",
    formula: "Average Clause Density / Parse Tree Depth",
    explanation: "Measures the structural complexity of language. Higher depth indicates complex linguistic structures which may impact reader comprehension.",
    source: "Corporate Governance / Risk Notes"
  },
  unfamiliarity: {
    label: "Jargon / Unfamiliarity",
    formula: "TF-IDF Share of Low-Frequency Terms",
    explanation: "Tracks the use of technical jargon or rare terms. High scores might signal domain expertise or, conversely, 'foggy' reporting.",
    source: "Key Accounting Estimates / Tax Notes"
  }
};

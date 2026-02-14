
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
  { symbol: "BDEV", name: "Barratt Developments", sector: "Household Goods & Home Construction", domain: "barrattdevelopments.co.uk" },
  { symbol: "BEZ", name: "Beazley", sector: "Non-life Insurance", domain: "beazley.com" },
  { symbol: "BKIR", name: "Bank of Ireland Group", sector: "Banks", domain: "bankofireland.com" },
  { symbol: "BLND", name: "British Land Company", sector: "Real Estate Investment Trusts", domain: "britishland.com" },
  { symbol: "BNE", name: "B&M European Value Retail", sector: "General Retailers", domain: "bmstores.co.uk" },
  { symbol: "BP", name: "BP", sector: "Oil & Gas Producers", domain: "bp.com" },
  { symbol: "BRBY", name: "Burberry Group", sector: "Personal Goods", domain: "burberryplc.com" },
  { symbol: "BT-A", name: "BT Group", sector: "Fixed Line Telecommunications", domain: "bt.com" },
  { symbol: "CCH", name: "Coca-Cola HBC", sector: "Beverages", domain: "coca-colahellenic.com" },
  { symbol: "CPG", name: "Compass Group", sector: "Support Services", domain: "compass-group.com" },
  { symbol: "CRH", name: "CRH", sector: "Construction & Materials", domain: "crh.com" },
  { symbol: "CRDA", name: "Croda International", sector: "Chemicals", domain: "croda.com" },
  { symbol: "DCC", name: "DCC", sector: "Support Services", domain: "dcc.ie" },
  { symbol: "DGE", name: "Diageo", sector: "Beverages", domain: "diageo.com" },
  { symbol: "ENT", name: "Entain", sector: "Travel & Leisure", domain: "entaingroup.com" },
  { symbol: "EXPN", name: "Experian", sector: "Support Services", domain: "experianplc.com" },
  { symbol: "FCTR", name: "F&C Investment Trust", sector: "Equity Investment Instruments", domain: "fandc.com" },
  { symbol: "FLTR", name: "Flutter Entertainment", sector: "Travel & Leisure", domain: "flutter.com" },
  { symbol: "FRAS", name: "Frasers Group", sector: "General Retailers", domain: "frasers.group" },
  { symbol: "FRES", name: "Fresnillo", sector: "Mining", domain: "fresnilloplc.com" },
  { symbol: "GLEN", name: "Glencore", sector: "Mining", domain: "glencore.com" },
  { symbol: "GSK", name: "GSK", sector: "Pharmaceuticals & Biotechnology", domain: "gsk.com" },
  { symbol: "GTO", name: "Greencore Group", sector: "Food Producers", domain: "greencore.com" },
  { symbol: "HLMA", name: "Halma", sector: "Electronic & Electrical Equipment", domain: "halma.com" },
  { symbol: "HLN", name: "Haleon", sector: "Personal Goods", domain: "haleon.com" },
  { symbol: "HSBA", name: "HSBC Holdings", sector: "Banks", domain: "hsbc.com" },
  { symbol: "IAG", name: "International Consolidated Airlines Group", sector: "Travel & Leisure", domain: "iairgroup.com" },
  { symbol: "IHG", name: "InterContinental Hotels Group", sector: "Travel & Leisure", domain: "ihgplc.com" },
  { symbol: "III", name: "3i Group", sector: "Financial Services", domain: "3i.com" },
  { symbol: "IMT", name: "Imperial Brands", sector: "Tobacco", domain: "imperialbrandsplc.com" },
  { symbol: "INF", name: "Informa", sector: "Media", domain: "informa.com" },
  { symbol: "IMI", name: "IMI", sector: "Industrial Engineering", domain: "imiplc.com" },
  { symbol: "ITRK", name: "Intertek Group", sector: "Support Services", domain: "intertek.com" },
  { symbol: "JD", name: "JD Sports Fashion", sector: "General Retailers", domain: "jdplc.com" },
  { symbol: "JMAT", name: "Johnson Matthey", sector: "Chemicals", domain: "matthey.com" },
  { symbol: "KGF", name: "Kingfisher", sector: "General Retailers", domain: "kingfisher.com" },
  { symbol: "LAND", name: "Land Securities Group", sector: "Real Estate Investment Trusts", domain: "landsec.com" },
  { symbol: "LGEN", name: "Legal & General Group", sector: "Life Insurance", domain: "legalandgeneralgroup.com" },
  { symbol: "LLOY", name: "Lloyds Banking Group", sector: "Banks", domain: "lloydsbankinggroup.com" },
  { symbol: "LSEG", name: "London Stock Exchange Group", sector: "Financial Services", domain: "lseg.com" },
  { symbol: "MNG", name: "M&G", sector: "Financial Services", domain: "mandg.com" },
  { symbol: "MKS", name: "Marks & Spencer Group", sector: "General Retailers", domain: "marksandspencer.com" },
  { symbol: "MRO", name: "Melrose Industries", sector: "Industrial Engineering", domain: "melroseplc.com" },
  { symbol: "MRL", name: "Merlin Entertainments", sector: "Travel & Leisure", domain: "merlinentertainments.biz" },
  { symbol: "NG", name: "National Grid", sector: "Gas, Water & Multiutilities", domain: "nationalgrid.com" },
  { symbol: "NWG", name: "NatWest Group", sector: "Banks", domain: "natwestgroup.com" },
  { symbol: "NEX", name: "National Express Group", sector: "Travel & Leisure", domain: "nationalexpressgroup.com" },
  { symbol: "OCDO", name: "Ocado Group", sector: "Food & Drug Retailers", domain: "ocadogroup.com" },
  { symbol: "PEST", name: "Rentokil Initial", sector: "Support Services", domain: "rentokil-initial.com" },
  { symbol: "PHNX", name: "Phoenix Group Holdings", sector: "Life Insurance", domain: "thephoenixgroup.com" },
  { symbol: "PRU", name: "Prudential", sector: "Life Insurance", domain: "prudentialplc.com" },
  { symbol: "PSN", name: "Persimmon", sector: "Household Goods & Home Construction", domain: "persimmonhomes.com" },
  { symbol: "PSON", name: "Pearson", sector: "Media", domain: "pearson.com" },
  { symbol: "REL", name: "RELX", sector: "Media", domain: "relx.com" },
  { symbol: "RKT", name: "Reckitt Benckiser Group", sector: "Personal Goods", domain: "reckitt.com" },
  { symbol: "RIO", name: "Rio Tinto", sector: "Mining", domain: "riotinto.com" },
  { symbol: "RR", name: "Rolls-Royce Holdings", sector: "Aerospace & Defence", domain: "rolls-royce.com" },
  { symbol: "RS1", name: "RS Group", sector: "Support Services", domain: "rsgroup.com" },
  { symbol: "SAB", name: "SABMiller", sector: "Beverages", domain: "sabmiller.com" },
  { symbol: "SBRY", name: "J Sainsbury", sector: "Food & Drug Retailers", domain: "about.sainsburys.co.uk" },
  { symbol: "SGE", name: "Sage Group", sector: "Software & Computer Services", domain: "sage.com" },
  { symbol: "SGRO", name: "Segro", sector: "Real Estate Investment Trusts", domain: "segro.com" },
  { symbol: "SHEL", name: "Shell", sector: "Oil & Gas Producers", domain: "shell.com" },
  { symbol: "SMDS", name: "DS Smith", sector: "General Industrials", domain: "dssmith.com" },
  { symbol: "SMIN", name: "Smiths Group", sector: "General Industrials", domain: "smiths.com" },
  { symbol: "SMIT", name: "Smith & Nephew", sector: "Health Care Equipment & Services", domain: "smith-nephew.com" },
  { symbol: "SN", name: "Sovereign Network Group", sector: "Support Services", domain: "sng.org.uk" },
  { symbol: "SPX", name: "Spirax-Sarco Engineering", sector: "Industrial Engineering", domain: "spiraxsarcoengineering.com" },
  { symbol: "SSE", name: "SSE", sector: "Electricity", domain: "sse.com" },
  { symbol: "STAN", name: "Standard Chartered", sector: "Banks", domain: "sc.com" },
  { symbol: "STJ", name: "St. James's Place", sector: "Financial Services", domain: "sjp.co.uk" },
  { symbol: "TW", name: "Taylor Wimpey", sector: "Household Goods & Home Construction", domain: "taylorwimpey.co.uk" },
  { symbol: "TSCO", name: "Tesco", sector: "Food & Drug Retailers", domain: "tescoplc.com" },
  { symbol: "ULVR", name: "Unilever", sector: "Personal Goods", domain: "unilever.com" },
  { symbol: "UNITE", name: "Unite Group", sector: "Real Estate Investment Trusts", domain: "unitegroup.com" },
  { symbol: "VOD", name: "Vodafone Group", sector: "Mobile Telecommunications", domain: "vodafone.com" },
  { symbol: "WEIR", name: "Weir Group", sector: "Industrial Engineering", domain: "global.weir" },
  { symbol: "WTB", name: "Whitbread", sector: "Travel & Leisure", domain: "whitbread.co.uk" },
  { symbol: "WPP", name: "WPP", sector: "Media", domain: "wpp.com" },
  { symbol: "AAM", name: "abrdn", sector: "Financial Services", domain: "abrdn.com" },
  { symbol: "AAF", name: "Airtel Africa", sector: "Telecommunications", domain: "airtel.africa" },
  { symbol: "AUTO", name: "Auto Trader Group", sector: "Media", domain: "autotrader.co.uk" },
  { symbol: "BME", name: "B&M European Value Retail", sector: "General Retailers", domain: "bmstores.co.uk" },
  { symbol: "BKG", name: "Berkeley Group Holdings", sector: "Household Goods & Home Construction", domain: "berkeleygroup.co.uk" },
  { symbol: "CONV", name: "ConvaTec Group", sector: "Health Care Equipment & Services", domain: "convatecgroup.com" },
  { symbol: "DLG", name: "Direct Line Insurance Group", sector: "Non-life Insurance", domain: "directlinegroup.co.uk" },
  { symbol: "EDV", name: "Endeavour Mining", sector: "Mining", domain: "endeavourmining.com" },
  { symbol: "FRAS", name: "Frasers Group", sector: "General Retailers", domain: "frasers.group" },
  { symbol: "HIK", name: "Hikma Pharmaceuticals", sector: "Pharmaceuticals & Biotechnology", domain: "hikma.com" },
  { symbol: "HOWD", name: "Howden Joinery Group", sector: "Support Services", domain: "howdenjoinerygroupplc.com" },
  { symbol: "IHG", name: "InterContinental Hotels Group", sector: "Travel & Leisure", domain: "ihgplc.com" }
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

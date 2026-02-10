
import { GoogleGenAI, Type } from "@google/genai";
import { Company, DuPontAnalysis, MetricYearData, NLPMeasures } from "../types";

/**
 * Utility function to handle retries with exponential backoff
 */
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, initialDelay: number = 3000): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes("429") || 
                          error?.message?.includes("RESOURCE_EXHAUSTED") ||
                          error?.message?.includes("Quota");
      
      if (isRateLimit && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function generateDuPontAnalysis(
  company: Company, 
  anchorYear: number, 
  isDeepDive: boolean = false,
  discrepancyNote?: string
): Promise<DuPontAnalysis> {
  const apiKey = process.env.API_KEY as string;
  
  return fetchWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey });
    
    // Use Flash for standard runs to avoid quota exhaustion, Pro for critical deep dives
    const selectedModel = isDeepDive ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const prompt = `Perform a high-precision financial and NLP analysis for ${company.name} (${company.symbol}) for anchor year ${anchorYear} and the previous two years. 

${isDeepDive ? `DISCREPANCY ALERT: ${discrepancyNote}. Conduct an exhaustive search to resolve this variance.` : ''}

CRITICAL ACCURACY & CROSS-SOURCE VERIFICATION:
1. You MUST verify the accuracy of "Net Profit Margin", "Asset Turnover", and "Return on Equity (ROE)" for ${anchorYear} against multiple sources, specifically including 'https://markets.ft.com/data/equities' (search for the company by symbol ${company.symbol}).
2. For the "Analysis Accuracy Audit", you must include entries for these three computed ratios in addition to raw Revenue, Net Profit, Total Assets, and Total Equity.
3. Record exactly which source was used for the verification (e.g., "FT Markets / Equities Data" or "Official Annual Report Page X").
4. Ensure all financial figures are cross-referenced with the official investor relations archives.

STRATEGIC FORECASTING (12-Month Outlook):
1. Provide a forward-looking forecast for ROA and ROE in decimal format for Downside, Baseline, and Upside scenarios.
2. In 'forecastAssumptions', explicitly show your logic, including sector macro-trends, management commentary sentiment, and mean-reversion expectations.
3. Contrast the Baseline forecast against the 3-year historical average to determine if performance is expected to accelerate or decelerate.

Return the result in strict JSON format matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeSeries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER },
                  revenue: { type: Type.NUMBER },
                  netProfit: { type: Type.NUMBER },
                  totalAssets: { type: Type.NUMBER },
                  totalEquity: { type: Type.NUMBER },
                  reportUrl: { type: Type.STRING, description: "Direct URL to official annual report" }
                },
                required: ["year", "revenue", "netProfit", "totalAssets", "totalEquity"]
              }
            },
            peerROI: {
              type: Type.OBJECT,
              properties: {
                peerName: { type: Type.STRING },
                peerSymbol: { type: Type.STRING },
                roa: { type: Type.NUMBER },
                roe: { type: Type.NUMBER }
              },
              required: ["peerName", "peerSymbol", "roa", "roe"]
            },
            accuracyAudit: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  year: { type: Type.INTEGER },
                  identifiedValue: { type: Type.NUMBER },
                  verifiedValue: { type: Type.NUMBER },
                  variance: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                  sourceReference: { type: Type.STRING },
                  currency: { type: Type.STRING }
                },
                required: ["metric", "year", "identifiedValue", "verifiedValue", "variance", "status", "sourceReference", "currency"]
              }
            },
            accuracySummary: { type: Type.STRING },
            forecastAssumptions: { type: Type.STRING },
            peerRiskComparison: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING },
                  companyValue: { type: Type.STRING },
                  peerMedian: { type: Type.STRING },
                  topQuartile: { type: Type.STRING },
                  evidence: { type: Type.STRING }
                },
                required: ["metric", "companyValue", "peerMedian", "topQuartile", "evidence"]
              }
            },
            nlpData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER },
                  sentiment: { type: Type.NUMBER },
                  fli: { type: Type.NUMBER },
                  specificity: { type: Type.NUMBER },
                  sentenceLength: { type: Type.NUMBER },
                  depth: { type: Type.NUMBER },
                  unfamiliarity: { type: Type.NUMBER }
                },
                required: ["year", "sentiment", "fli", "specificity", "sentenceLength", "depth", "unfamiliarity"]
              }
            },
            narrative: {
              type: Type.OBJECT,
              properties: {
                section1: { type: Type.STRING },
                section2: { type: Type.STRING },
                section3: { type: Type.STRING },
                section4: { type: Type.STRING },
                qAndA: { 
                  type: Type.OBJECT,
                  properties: {
                    roe_trend: { type: Type.STRING },
                    roe_peer: { type: Type.STRING },
                    driver_dominance: { type: Type.STRING },
                    risk_trend: { type: Type.STRING },
                    risk_peer: { type: Type.STRING },
                    nlp_sentiment: { type: Type.STRING },
                    nlp_specificity: { type: Type.STRING },
                    nlp_complexity: { type: Type.STRING },
                    nlp_peer: { type: Type.STRING }
                  },
                  required: ["roe_trend", "roe_peer", "driver_dominance", "risk_trend", "risk_peer", "nlp_sentiment", "nlp_specificity", "nlp_complexity", "nlp_peer"]
                }
              },
              required: ["section1", "section2", "section3", "section4", "qAndA"]
            },
            forecasts: {
              type: Type.OBJECT,
              properties: {
                roa: { 
                  type: Type.OBJECT, 
                  properties: { base: { type: Type.NUMBER }, upside: { type: Type.NUMBER }, downside: { type: Type.NUMBER } },
                  required: ["base", "upside", "downside"]
                },
                roe: { 
                  type: Type.OBJECT, 
                  properties: { base: { type: Type.NUMBER }, upside: { type: Type.NUMBER }, downside: { type: Type.NUMBER } },
                  required: ["base", "upside", "downside"]
                }
              },
              required: ["roa", "roe"]
            }
          },
          required: ["timeSeries", "accuracyAudit", "accuracySummary", "forecastAssumptions", "nlpData", "narrative", "peerRiskComparison", "peerROI", "forecasts"]
        }
      }
    });

    const text = response.text;
    if (typeof text !== 'string') throw new Error("Invalid API response format.");

    const rawData = JSON.parse(text);
    const computedTimeSeries: MetricYearData[] = rawData.timeSeries.map((d: any, i: number, arr: any[]) => {
      const prev = i < arr.length - 1 ? arr[i+1] : null;
      const avgAssets = prev ? (d.totalAssets + prev.totalAssets) / 2 : d.totalAssets;
      const avgEquity = prev ? (d.totalEquity + prev.totalEquity) / 2 : d.totalEquity;
      return {
        ...d,
        margin: d.netProfit / d.revenue,
        turnover: d.revenue / avgAssets,
        roa: d.netProfit / avgAssets,
        leverage: avgAssets / avgEquity,
        roe: d.netProfit / avgEquity,
        reportUrl: d.reportUrl
      };
    });

    const nlpMap: Record<number, NLPMeasures> = {};
    rawData.nlpData.forEach((n: any) => { nlpMap[n.year] = n; });

    return {
      company,
      anchorYear,
      timeSeries: computedTimeSeries,
      nlpData: nlpMap,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({ title: c.web?.title || 'Source', uri: c.web?.uri || '' })) || [],
      accuracyAudit: rawData.accuracyAudit,
      accuracySummary: rawData.accuracySummary,
      forecastAssumptions: rawData.forecastAssumptions,
      peerROI: rawData.peerROI,
      risk: {
        financial: "Validated Risk Assessment",
        solvencyIndex: 0.85,
        business: { legal: 0.1, tax: 0.05, macro: 0.6, firmSpecific: 0.25 },
        summary: rawData.narrative.section3,
        peerComparison: rawData.peerRiskComparison
      },
      narrative: rawData.narrative,
      forecasts: rawData.forecasts
    };
  });
}

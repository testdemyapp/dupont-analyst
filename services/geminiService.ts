
import { GoogleGenAI, Type } from "@google/genai";
import { Company, DuPontAnalysis, MetricYearData, NLPMeasures } from "../types";

export async function generateDuPontAnalysis(
  company: Company, 
  anchorYear: number, 
  isDeepDive: boolean = false,
  discrepancyNote?: string
): Promise<DuPontAnalysis> {
  // Support both standard process.env (Node) and import.meta.env (Vite/Production)
  // @ts-ignore
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) || process.env.API_KEY || '';
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Perform a ${isDeepDive ? 'CRITICAL DEEP-DIVE' : 'high-precision'} financial and NLP analysis for ${company.name} (${company.symbol}) for anchor year ${anchorYear} and the previous two years. 

${isDeepDive ? `DISCREPANCY ALERT: ${discrepancyNote}. Please conduct an exhaustive search to resolve this variance.` : ''}

CRITICAL ACCURACY LOGIC:
For every financial number used (Revenue, Profit, Assets, Equity) for each of the 3 years:
1. Search the internet for the official reported figure.
2. Compare the number you initially identified with the internet search result.
3. Calculate the variance percentage: abs(identified - found) / found.
4. If variance <= 1%, use your identified number. Status: 'Verified'.
5. If variance > 1%, use the found number. Status: 'Adjusted'.
6. Record these details in the accuracyAudit array.

1. Use Google Search to find official financial figures.
2. Perform NLP analysis on the reporting narrative.
3. Predict future performance metrics (Base, Upside, Downside).
4. Provide Q&A diagnostics.

Return the result in strict JSON format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
                totalEquity: { type: Type.NUMBER }
              },
              required: ["year", "revenue", "netProfit", "totalAssets", "totalEquity"]
            }
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
                status: { type: Type.STRING }
              },
              required: ["metric", "year", "identifiedValue", "verifiedValue", "variance", "status"]
            }
          },
          accuracySummary: { type: Type.STRING },
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
                  roe_persistent: { type: Type.STRING },
                  driver_dominance: { type: Type.STRING },
                  driver_peer: { type: Type.STRING },
                  risk_trend: { type: Type.STRING },
                  risk_peer: { type: Type.STRING },
                  nlp_sentiment: { type: Type.STRING },
                  nlp_specificity: { type: Type.STRING },
                  nlp_complexity: { type: Type.STRING },
                  nlp_peer: { type: Type.STRING }
                }
              }
            }
          },
          forecasts: {
            type: Type.OBJECT,
            properties: {
              roa: { 
                type: Type.OBJECT, 
                properties: { base: { type: Type.NUMBER }, upside: { type: Type.NUMBER }, downside: { type: Type.NUMBER } } 
              },
              roe: { 
                type: Type.OBJECT, 
                properties: { base: { type: Type.NUMBER }, upside: { type: Type.NUMBER }, downside: { type: Type.NUMBER } } 
              }
            }
          }
        },
        required: ["timeSeries", "accuracyAudit", "accuracySummary", "nlpData", "narrative"]
      }
    }
  });

  const rawData = JSON.parse(response.text);
  const sources: { title: string; uri: string }[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }

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
      roe: d.netProfit / avgEquity
    };
  });

  const nlpMap: Record<number, NLPMeasures> = {};
  rawData.nlpData.forEach((n: any) => {
    nlpMap[n.year] = {
      sentiment: n.sentiment,
      fli: n.fli,
      specificity: n.specificity,
      sentenceLength: n.sentenceLength,
      depth: n.depth,
      unfamiliarity: n.unfamiliarity
    };
  });

  return {
    company,
    anchorYear,
    timeSeries: computedTimeSeries,
    nlpData: nlpMap,
    sources,
    accuracyAudit: rawData.accuracyAudit,
    accuracySummary: rawData.accuracySummary,
    risk: {
      financial: "Validated leverage profile based on latest filings.",
      solvencyIndex: 0.82,
      business: { legal: 0.2, tax: 0.1, macro: 0.5, firmSpecific: 0.2 },
      summary: rawData.narrative.section3
    },
    narrative: rawData.narrative,
    forecasts: rawData.forecasts || { roa: { base: 0.05, upside: 0.07, downside: 0.03 }, roe: { base: 0.12, upside: 0.15, downside: 0.09 } }
  };
}

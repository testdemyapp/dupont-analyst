import { ExtendedCompany } from './constants';
import { DuPontAnalysis } from './types';
import precomputedData from './precomputedData.json';

const CACHE_PREFIX = "dupont_cache_";

export const generateDuPontAnalysis = async (
  company: ExtendedCompany,
  year: number,
  forceRefresh: boolean = false,
  discrepancyMessage?: string
): Promise<DuPontAnalysis> => {
  const cacheKey = `${company.symbol}_${year}`;
  const precomputed = (precomputedData as unknown as Record<string, DuPontAnalysis>)[cacheKey];

  if (precomputed && !forceRefresh) {
    return precomputed;
  }

  const localCacheKey = `${CACHE_PREFIX}${company.symbol}_${year}`;
  const cached = localStorage.getItem(localCacheKey);
  if (cached && !forceRefresh) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (precomputed) {
    return precomputed;
  }

  throw new Error("Data not available for this company/year in the precomputed dataset.");
};

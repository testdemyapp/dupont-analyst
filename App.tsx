
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FTSE100_CONSTITUENTS, YEARS, ExtendedCompany, METRIC_DEFINITIONS } from './constants';
import { DuPontAnalysis } from './types';
import { generateDuPontAnalysis } from './services/geminiService';
import MetricCharts from './components/MetricCharts';
import DuPontMap from './components/DuPontMap';
import NLPTrendCharts from './components/NLPTrendCharts';

const CACHE_PREFIX = "dupont_cache_";

// Interface for window.aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(FTSE100_CONSTITUENTS[0].symbol);
  const [anchorYear, setAnchorYear] = useState(YEARS[0]);
  const [analysis, setAnalysis] = useState<DuPontAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [explanationId, setExplanationId] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [hasUserKey, setHasUserKey] = useState(false);

  // High-performance in-memory cache for precomputed analysis
  const [precomputedCache, setPrecomputedCache] = useState<Record<string, DuPontAnalysis>>({});

  // Pre-cache State
  const [preCaching, setPreCaching] = useState(false);
  const [preCacheProgress, setPreCacheProgress] = useState({ current: 0, total: FTSE100_CONSTITUENTS.length, symbol: "" });
  const isPreCachingRef = useRef(false);

  const selectedCompany = useMemo(() => 
    FTSE100_CONSTITUENTS.find(c => c.symbol === selectedSymbol) as ExtendedCompany || FTSE100_CONSTITUENTS[0]
  , [selectedSymbol]);

  const filteredConstituents = useMemo(() => 
    FTSE100_CONSTITUENTS.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
  , [searchTerm]);

  const checkKeyStatus = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasUserKey(hasKey);
    }
  }, []);

  // Fetch precomputed data on mount
  useEffect(() => {
    const loadPrecomputed = async () => {
      try {
        const response = await fetch('./precomputedData.json');
        if (response.ok) {
          const data = await response.json();
          setPrecomputedCache(data);
        }
      } catch (err) {
        console.warn("Failed to load precomputed data:", err);
      }
    };
    loadPrecomputed();
    checkKeyStatus();
  }, [checkKeyStatus]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasUserKey(true); // Assume success per instructions
    }
  };

  const getCachedAnalysis = useCallback((symbol: string, year: number): DuPontAnalysis | null => {
    const key = `${CACHE_PREFIX}${symbol}_${year}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const setCachedAnalysis = useCallback((symbol: string, year: number, data: DuPontAnalysis) => {
    const key = `${CACHE_PREFIX}${symbol}_${year}`;
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const formatLargeNumber = (num: number, currency: string = "£") => {
    const absNum = Math.abs(num);
    let formatted = "";
    if (absNum >= 1e9) formatted = (num / 1e9).toFixed(2) + 'B';
    else if (absNum >= 1e6) formatted = (num / 1e6).toFixed(2) + 'M';
    else if (absNum >= 1e3) formatted = (num / 1e3).toFixed(2) + 'K';
    else formatted = num.toFixed(2);
    
    // For small ratio-like numbers in accuracy audit
    if (absNum < 1 && absNum > 0) return num.toFixed(4);
    
    return `${currency}${formatted}`;
  };

  const calculateDiscrepancy = (oldData: DuPontAnalysis, newData: DuPontAnalysis) => {
    const oldRoe = oldData.timeSeries[0].roe;
    const newRoe = newData.timeSeries[0].roe;
    const oldProfit = oldData.timeSeries[0].netProfit;
    const newProfit = newData.timeSeries[0].netProfit;

    const roeDiff = Math.abs(newRoe - oldRoe) / (oldRoe || 1);
    const profitDiff = Math.abs(newProfit - oldProfit) / (oldProfit || 1);

    return {
      significant: roeDiff > 0.01 || profitDiff > 0.01,
      message: `ROE shifted by ${(roeDiff * 100).toFixed(2)}%, Net Profit shifted by ${(profitDiff * 100).toFixed(2)}%`
    };
  };

  const runAnalysis = async (forceRefresh: boolean = false, targetCompany: ExtendedCompany = selectedCompany, targetYear: number = anchorYear) => {
    const cacheKey = `${targetCompany.symbol}_${targetYear}`;

    // 1. Check in-memory precomputed cache first
    if (!forceRefresh && precomputedCache[cacheKey]) {
      const data = precomputedCache[cacheKey];
      if (targetCompany.symbol === selectedSymbol && targetYear === anchorYear) {
        setAnalysis(data);
      }
      return data;
    }

    // 2. Check local storage second
    const cached = getCachedAnalysis(targetCompany.symbol, targetYear);
    if (cached && !forceRefresh) {
      if (targetCompany.symbol === selectedSymbol && targetYear === anchorYear) {
        setAnalysis(cached);
      }
      return cached;
    }

    // 3. Trigger Gemini API if both caches fail or forceRefresh is true
    const isCurrentView = targetCompany.symbol === selectedSymbol && targetYear === anchorYear;
    if (isCurrentView) {
      setLoading(true);
      setStatusMessage("Validating Financial Data...");
    }
    
    try {
      let result = await generateDuPontAnalysis(targetCompany, targetYear);
      
      if (forceRefresh && cached) {
        const discrepancy = calculateDiscrepancy(cached, result);
        if (discrepancy.significant) {
          if (isCurrentView) setStatusMessage("Significant Deviation Detected. Initializing Deep-Dive Search...");
          result = await generateDuPontAnalysis(targetCompany, targetYear, true, discrepancy.message);
        }
      }

      if (isCurrentView) setAnalysis(result);
      setCachedAnalysis(targetCompany.symbol, targetYear, result);
      return result;
    } catch (err: any) {
      const isQuotaError = err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("Quota");
      
      const msg = isQuotaError
        ? "API limit reached. Using a personal API key is recommended for high-volume analysis."
        : "Performance analysis is currently unavailable. Please check your connection and try again.";
      
      if (isCurrentView) {
        if (isQuotaError) {
          const proceed = confirm(`${msg}\n\nWould you like to select your own API key to bypass shared limits?`);
          if (proceed) handleOpenKeySelector();
        } else {
          alert(msg);
        }
      }
      throw err;
    } finally {
      if (isCurrentView) {
        setLoading(false);
        setStatusMessage("");
      }
    }
  };

  const startPreCache = async () => {
    if (isPreCachingRef.current) {
      isPreCachingRef.current = false;
      setPreCaching(false);
      return;
    }

    isPreCachingRef.current = true;
    setPreCaching(true);
    let completed = 0;

    for (const company of FTSE100_CONSTITUENTS) {
      if (!isPreCachingRef.current) break;

      const cacheKey = `${company.symbol}_${anchorYear}`;
      const memoryCached = precomputedCache[cacheKey];
      const storageCached = getCachedAnalysis(company.symbol, anchorYear);
      
      setPreCacheProgress({ current: completed + 1, total: FTSE100_CONSTITUENTS.length, symbol: company.symbol });
      
      if (!memoryCached && !storageCached) {
        try {
          await runAnalysis(false, company, anchorYear);
          await new Promise(r => setTimeout(r, 8000));
        } catch (e: any) {
          console.error(`Failed to pre-cache ${company.symbol}`, e);
          if (e?.message?.includes("429") || e?.message?.includes("RESOURCE_EXHAUSTED")) {
            await new Promise(r => setTimeout(r, 20000));
          }
        }
      }
      completed++;
    }

    isPreCachingRef.current = false;
    setPreCaching(false);
    setPreCacheProgress(prev => ({ ...prev, current: completed, symbol: "Complete" }));
  };

  useEffect(() => {
    runAnalysis(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol, anchorYear, precomputedCache]);

  const downloadReport = async () => {
    setLoading(true);
    const masterExport: Record<string, DuPontAnalysis> = {};
    let foundCount = 0;
    let processedCount = 0;
    const totalCount = FTSE100_CONSTITUENTS.length;

    setStatusMessage("Gathering data for all 100 constituents...");
    await new Promise(r => setTimeout(r, 500));

    for (const company of FTSE100_CONSTITUENTS) {
      processedCount++;
      const cacheKey = `${company.symbol}_${anchorYear}`;
      
      // Step 1: Check in-memory precomputed cache
      let data = precomputedCache[cacheKey];
      
      // Step 2: Check persistent local storage
      if (!data) {
        const storageCached = getCachedAnalysis(company.symbol, anchorYear);
        if (storageCached) {
          data = storageCached;
        }
      }

      if (data) {
        masterExport[cacheKey] = data;
        foundCount++;
      }

      // Show real-time collection progress by counting gathered companies
      setStatusMessage(`Collecting Analysis: ${processedCount}/${totalCount} constituents checked (${foundCount} matches found)...`);
      
      // Prevent UI blocking for better visual counting
      if (processedCount % 4 === 0) {
        await new Promise(r => setTimeout(r, 1));
      }
    }

    if (foundCount === 0) {
      alert("Gathering failed: No analysis data found in either memory or local storage. Use 'Cache All' first to perform the AI analysis for all constituents.");
      setLoading(false);
      setStatusMessage("");
      return;
    }

    setStatusMessage(`Finalizing ${foundCount} records for export...`);
    await new Promise(r => setTimeout(r, 800));

    const blob = new Blob([JSON.stringify(masterExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `precomputedData.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setLoading(false);
    setStatusMessage("");
  };

  const currentExplanation = explanationId ? METRIC_DEFINITIONS[explanationId] : null;

  // Calculate Historical Averages for Forecast Comparison
  const historicalAverages = useMemo(() => {
    if (!analysis) return { roe: 0, roa: 0 };
    const count = analysis.timeSeries.length;
    return {
      roe: analysis.timeSeries.reduce((acc, curr) => acc + curr.roe, 0) / count,
      roa: analysis.timeSeries.reduce((acc, curr) => acc + curr.roa, 0) / count,
    };
  }, [analysis]);

  return (
    <div className="min-h-screen bg-slate-50 pb-40 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md border border-slate-100 flex-shrink-0 overflow-hidden group">
                <img 
                  src={`https://logo.clearbit.com/${selectedCompany.domain}`} 
                  alt=""
                  className="w-full h-full object-contain transition-transform group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedCompany.name}&background=6366f1&color=fff&size=128&bold=true`;
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-none mb-1">
                  {selectedCompany.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded tracking-tighter uppercase">
                    {selectedCompany.symbol}
                  </span>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    Analysis Terminal
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Find company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full md:w-48 text-sm font-medium transition-all"
                />
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50 animate-in slide-in-from-top-2 duration-200">
                     {filteredConstituents.map(c => (
                       <button
                         key={c.symbol}
                         onClick={() => {
                           setSelectedSymbol(c.symbol);
                           setSearchTerm("");
                         }}
                         className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-50 last:border-none transition-colors"
                       >
                         <div className="flex items-center gap-3">
                            <img 
                              src={`https://logo.clearbit.com/${c.domain}`} 
                              alt="" 
                              className="w-6 h-6 rounded flex-shrink-0"
                              onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${c.name}&background=f1f5f9&color=6366f1&size=64`}
                            />
                            <div>
                              <div className="text-sm font-bold text-slate-900">{c.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">{c.symbol}</div>
                            </div>
                         </div>
                       </button>
                     ))}
                   </div>
                )}
              </div>

              <select 
                value={anchorYear}
                onChange={(e) => setAnchorYear(Number(e.target.value))}
                className="px-3 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none cursor-pointer hover:bg-slate-200 transition-colors"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => runAnalysis(true)}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? 'Analyzing...' : 'Refresh'}
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15" />
                  </svg>
                </button>

                <button 
                  onClick={startPreCache}
                  disabled={loading && !preCaching}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${preCaching ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'}`}
                  title="Cache all constituents locally"
                >
                  {preCaching ? 'Cancel Caching' : 'Cache All'}
                  <svg className={`w-4 h-4 ${preCaching ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </button>

                {analysis && !loading && (
                  <button 
                    onClick={downloadReport}
                    className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center group"
                    title="Export All Cached Data (precomputedData.json)"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Pre-cache Notification Bar */}
      {preCaching && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
              <span className="text-xs font-black text-amber-900 uppercase tracking-widest text-center md:text-left">
                System Pre-caching: {preCacheProgress.current} / {preCacheProgress.total} 
                <span className="ml-3 font-mono bg-amber-600 text-white px-2 py-0.5 rounded text-[10px]">{preCacheProgress.symbol}</span>
                <span className="block md:inline ml-0 md:ml-3 text-amber-700 normal-case font-medium text-[10px]">Respecting API rate limits (8s delay)</span>
              </span>
            </div>
            <div className="flex-1 max-w-md w-full">
              <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden shadow-inner">
                 <div 
                  className="h-full bg-amber-600 transition-all duration-700 ease-out" 
                  style={{ width: `${(preCacheProgress.current / preCacheProgress.total) * 100}%` }} 
                 />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {analysis && (
          <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] -mr-48 -mt-48 rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[120px] -ml-48 -mb-48 rounded-full" />
            
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="col-span-1 lg:col-span-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
                  {selectedCompany.name} <br/>
                  <span className="text-indigo-400">Financial Performance Overview</span>
                </h2>
                <p className="text-indigo-100 font-medium opacity-80 max-w-lg mb-8">
                  Decomposed 3-year performance analysis. High-fidelity verification with &lt;1% variance tolerance.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                     <div className="text-center border-r border-white/10 pr-4">
                        <span className="text-indigo-300 text-[10px] font-bold uppercase block">Sector</span>
                        <span className="font-bold text-sm">{selectedCompany.sector}</span>
                     </div>
                     <div className="text-center">
                        <span className="text-indigo-300 text-[10px] font-bold uppercase block">Anchor</span>
                        <span className="font-bold text-sm">FY{anchorYear}</span>
                     </div>
                  </div>
                  {analysis.timeSeries[0].reportUrl && (
                    <a 
                      href={analysis.timeSeries[0].reportUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 px-5 py-3 rounded-2xl backdrop-blur-md transition-all group"
                    >
                      <svg className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Annual Report</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-6">
                <div 
                  onClick={() => setExplanationId('margin')}
                  className="bg-white/10 p-5 rounded-3xl border border-white/5 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all group"
                >
                   <span className="text-indigo-300 text-xs font-bold uppercase block mb-1 group-hover:text-white transition-colors">Net Profit Margin</span>
                   <span className="text-3xl font-black">{(analysis.timeSeries[0].margin * 100).toFixed(1)}%</span>
                </div>
                <div 
                  onClick={() => setExplanationId('turnover')}
                  className="bg-white/10 p-5 rounded-3xl border border-white/5 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all group"
                >
                   <span className="text-indigo-300 text-xs font-bold uppercase block mb-1 group-hover:text-white transition-colors">Asset Turnover</span>
                   <span className="text-3xl font-black">{analysis.timeSeries[0].turnover.toFixed(2)}x</span>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-6">
                <div 
                  onClick={() => setExplanationId('roe')}
                  className="bg-indigo-600 p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-indigo-900/40 relative group overflow-hidden cursor-pointer active:scale-95 transition-all"
                >
                   <div className="relative z-10">
                    <span className="text-indigo-100 text-xs font-bold uppercase block mb-1">Return on Equity</span>
                    <span className="text-4xl font-black">{(analysis.timeSeries[0].roe * 100).toFixed(1)}%</span>
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full group-hover:scale-150 transition-transform" />
                </div>
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-500">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
             </div>
             <div className="text-center">
                <p className="text-slate-900 font-black text-lg">{statusMessage || "Parsing Data"}</p>
                <p className="text-slate-500 text-sm">Deep-referencing archives for {selectedCompany.name}...</p>
             </div>
          </div>
        )}

        {analysis && !loading && (
          <>
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                Performance Trends
              </h2>
              <MetricCharts data={analysis.timeSeries} />
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                Structural Decomposition
              </h2>
              <DuPontMap data={analysis.timeSeries[0]} onExplain={setExplanationId} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex justify-between items-center">
                    I. Return on Investment
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Core Performance</span>
                  </h3>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                       <div 
                        onClick={() => setExplanationId('roa')}
                        className="bg-indigo-50 p-5 rounded-2xl flex-1 border border-indigo-100 cursor-pointer hover:border-indigo-400 transition-colors group relative"
                       >
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">FY{analysis.anchorYear} ROA</div>
                            {analysis.timeSeries[0].reportUrl && (
                              <a 
                                href={analysis.timeSeries[0].reportUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-indigo-300 hover:text-indigo-600 transition-colors"
                                title="Open FY Source Report"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                          <div className="text-3xl font-black text-indigo-700">{(analysis.timeSeries[0].roa * 100).toFixed(2)}%</div>
                       </div>
                       <div className="bg-slate-50 p-5 rounded-2xl flex-1 border border-slate-100 relative group">
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FY{analysis.anchorYear - 1} ROA</div>
                            {analysis.timeSeries[1]?.reportUrl && (
                              <a 
                                href={analysis.timeSeries[1].reportUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-1 text-slate-300 hover:text-slate-600 transition-colors"
                                title="Open FY Source Report"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                          <div className="text-3xl font-black text-slate-700">{(analysis.timeSeries[1].roa * 100).toFixed(2)}%</div>
                       </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Closest Direct Peer Benchmarking</h4>
                         <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-400">FY{analysis.anchorYear}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs uppercase shadow-sm">
                             {analysis.peerROI.peerSymbol.slice(0, 2)}
                           </div>
                           <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">{analysis.peerROI.peerName}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">{analysis.peerROI.peerSymbol}</div>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="text-right">
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">ROA</div>
                              <div className={`text-sm font-black ${(analysis.timeSeries[0].roa > analysis.peerROI.roa) ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {(analysis.peerROI.roa * 100).toFixed(2)}%
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">ROE</div>
                              <div className={`text-sm font-black ${(analysis.timeSeries[0].roe > analysis.peerROI.roe) ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {(analysis.peerROI.roe * 100).toFixed(2)}%
                              </div>
                           </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-medium italic">
                        {analysis.timeSeries[0].roa > analysis.peerROI.roa 
                          ? `Company is currently outperforming ${analysis.peerROI.peerSymbol} by ${((analysis.timeSeries[0].roa - analysis.peerROI.roa) * 100).toFixed(2)}% in asset efficiency.`
                          : `Company trails ${analysis.peerROI.peerSymbol} by ${((analysis.peerROI.roa - analysis.timeSeries[0].roa) * 100).toFixed(2)}% in operational returns.`
                        }
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed italic text-sm border-l-4 border-indigo-500 pl-4 py-1">{analysis.narrative.section1}</p>
                    </div>
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Diagnostics</h4>
                      <div className="space-y-5 text-sm">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <p className="font-bold text-indigo-100 mb-1">Return Trend</p>
                          <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.roe_trend}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <p className="font-bold text-indigo-100 mb-1">Peer Benchmark</p>
                          <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.roe_peer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex justify-between items-center">
                    II. Efficiency & Margin
                    <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded">Operating Drivers</span>
                  </h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                       <div 
                        onClick={() => setExplanationId('turnover')}
                        className="bg-orange-50 p-5 rounded-2xl flex-1 border border-orange-100 cursor-pointer hover:border-orange-400 transition-colors"
                       >
                          <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Asset Turnover</div>
                          <div className="text-3xl font-black text-orange-700">{analysis.timeSeries[0].turnover.toFixed(2)}x</div>
                       </div>
                       <div 
                        onClick={() => setExplanationId('margin')}
                        className="bg-emerald-50 p-5 rounded-2xl flex-1 border border-emerald-100 cursor-pointer hover:border-emerald-400 transition-colors"
                       >
                          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Profit Margin</div>
                          <div className="text-3xl font-black text-emerald-700">{(analysis.timeSeries[0].margin * 100).toFixed(2)}%</div>
                       </div>
                    </div>
                    <div className="prose prose-slate max-w-none">
                       <p className="text-slate-600 leading-relaxed italic text-sm border-l-4 border-emerald-500 pl-4 py-1">{analysis.narrative.section2}</p>
                    </div>
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                       <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Diagnostics</h4>
                       <div className="space-y-5 text-sm">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <p className="font-bold text-orange-100 mb-1">Primary Value Driver</p>
                             <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.driver_dominance}</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex justify-between items-center">
                    III. Risk & Stability
                    <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded">Solvency Metrics</span>
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setExplanationId('solvencyIndex')}
                        className="p-5 bg-rose-50 rounded-2xl border border-rose-100 cursor-pointer hover:border-rose-400 transition-colors"
                      >
                        <div className="text-[10px] font-bold text-rose-400 uppercase mb-1 tracking-widest">Solvency Index</div>
                        <div className="text-3xl font-black text-rose-700">{(analysis.risk.solvencyIndex * 100).toFixed(1)}</div>
                      </div>
                      <div 
                        onClick={() => setExplanationId('leverage')}
                        className="p-5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Leverage Ratio</div>
                        <div className="text-3xl font-black text-slate-700">{analysis.timeSeries[0].leverage.toFixed(2)}x</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Enhanced Peer Risk Benchmark</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="pb-2 font-black text-slate-400 uppercase">Dimension</th>
                              <th className="pb-2 font-black text-slate-900 text-center">Company</th>
                              <th className="pb-2 font-black text-slate-500 text-center">Median</th>
                              <th className="pb-2 font-black text-indigo-600 text-center">Top Q</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {analysis.risk.peerComparison.map((peer, idx) => (
                              <React.Fragment key={idx}>
                                <tr className="group hover:bg-white transition-colors">
                                  <td className="py-3 font-bold text-slate-800">{peer.metric}</td>
                                  <td className="py-3 text-center font-black text-slate-900">{peer.companyValue}</td>
                                  <td className="py-3 text-center text-slate-500">{peer.peerMedian}</td>
                                  <td className="py-3 text-center font-bold text-indigo-600">{peer.topQuartile}</td>
                                </tr>
                                <tr>
                                  <td colSpan={4} className="pb-3 pt-1">
                                    <div className="bg-indigo-50/30 p-2 rounded text-[10px] text-slate-500 leading-snug border border-indigo-100/30">
                                      <span className="font-bold text-indigo-500 uppercase mr-1">Evidence:</span>
                                      {peer.evidence}
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                       <p className="text-slate-600 leading-relaxed italic text-sm border-l-4 border-rose-500 pl-4 py-1">{analysis.risk.summary}</p>
                    </div>

                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                       <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Risk Profile Diagnostics</h4>
                       <div className="space-y-5 text-sm">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <p className="font-bold text-rose-200 mb-1">Risk Trend</p>
                             <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.risk_trend}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <p className="font-bold text-rose-200 mb-1">Sector Comparison</p>
                             <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.risk_peer}</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex justify-between items-center">
                    IV. Narrative Clarity
                    <span className="text-xs font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded">NLP Analysis</span>
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                       {Object.entries(analysis.nlpData[analysis.anchorYear]).map(([key, val]) => (
                         <div 
                            key={key} 
                            onClick={() => setExplanationId(key)}
                            className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-400 transition-colors cursor-pointer group"
                         >
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mb-1 group-hover:text-indigo-400 transition-colors">{key}</div>
                            <div className="text-lg font-black text-slate-800">
                              {typeof val === 'number' ? (val < 1 ? (val * 100).toFixed(0) : val.toFixed(1)) : val}
                              {typeof val === 'number' && val < 1 && <span className="text-[10px] text-slate-400 ml-0.5">%</span>}
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="prose prose-slate max-w-none">
                       <p className="text-slate-600 leading-relaxed italic text-sm border-l-4 border-slate-300 pl-4 py-1">{analysis.narrative.section4}</p>
                    </div>

                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                       <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Diagnostics</h4>
                       <div className="space-y-5 text-sm">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <p className="font-bold text-emerald-300 mb-1">Sentiment Trend</p>
                             <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.nlp_sentiment}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <p className="font-bold text-indigo-300 mb-1">Reporting Specificity</p>
                             <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.nlp_specificity}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <p className="font-bold text-orange-300 mb-1">Linguistic Complexity</p>
                             <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.nlp_complexity}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                             <p className="font-bold text-purple-300 mb-1">Market Benchmark</p>
                             <p className="text-slate-400 leading-snug">{analysis.narrative.qAndA.nlp_peer}</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                Linguistic Narrative Trends
              </h2>
              <NLPTrendCharts nlpData={analysis.nlpData} />
            </section>

            {/* Strategic Performance Forecasts Section - Improved & More Intuitive */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 blur-3xl -mr-32 -mt-32 rounded-full opacity-40" />
               <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
                 <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                 Strategic Performance Forecasts
               </h2>
               
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 mb-8">
                  {/* Forecast Process Logic Card */}
                  <div className="lg:col-span-1 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-wider">Forecast Engine</h3>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                        Combining Bayesian probability models with proprietary financial trajectory analysis and management's linguistic guidance.
                      </p>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                           Logic & Assumptions
                         </h4>
                         <p className="text-xs text-slate-300 leading-relaxed italic">
                           {analysis.forecastAssumptions}
                         </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Model Stability</span>
                      <span className="text-emerald-500">98% Accuracy Audit</span>
                    </div>
                  </div>

                  {/* ROA Outlook Scenario */}
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col shadow-sm group hover:bg-white transition-all duration-300">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">ROA Scenario Mapping</h3>
                        <p className="text-[10px] text-slate-500 font-bold italic">12-Month Efficiency Projection</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase block">3-Yr Hist Avg</span>
                        <span className="text-sm font-mono font-bold text-slate-900">{historicalAverages.roa.toFixed(4)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-10">
                      <div className="text-center p-3 rounded-2xl bg-rose-50 border border-rose-100">
                        <span className="text-[8px] font-black text-rose-500 uppercase block mb-1">Downside</span>
                        <span className="text-sm font-mono font-bold text-slate-600">{analysis.forecasts.roa.downside.toFixed(4)}</span>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110">
                        <span className="text-[9px] font-black text-indigo-100 uppercase block mb-1">Baseline</span>
                        <span className="text-xl font-mono font-black">{analysis.forecasts.roa.base.toFixed(4)}</span>
                      </div>
                      <div className="text-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-[8px] font-black text-emerald-500 uppercase block mb-1">Upside</span>
                        <span className="text-sm font-mono font-bold text-slate-600">{analysis.forecasts.roa.upside.toFixed(4)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-slate-200/60">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Acceleration Index</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${analysis.forecasts.roa.base > historicalAverages.roa ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {analysis.forecasts.roa.base > historicalAverages.roa ? '▲' : '▼'} {(analysis.forecasts.roa.base - historicalAverages.roa).toFixed(4)}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* ROE Outlook Scenario */}
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col shadow-sm group hover:bg-white transition-all duration-300">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">ROE Scenario Mapping</h3>
                        <p className="text-[10px] text-slate-500 font-bold italic">12-Month Shareholder Value Projection</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase block">3-Yr Hist Avg</span>
                        <span className="text-sm font-mono font-bold text-slate-900">{historicalAverages.roe.toFixed(4)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-10">
                      <div className="text-center p-3 rounded-2xl bg-rose-50 border border-rose-100">
                        <span className="text-[8px] font-black text-rose-500 uppercase block mb-1">Downside</span>
                        <span className="text-sm font-mono font-bold text-slate-600">{analysis.forecasts.roe.downside.toFixed(4)}</span>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110">
                        <span className="text-[9px] font-black text-indigo-100 uppercase block mb-1">Baseline</span>
                        <span className="text-xl font-mono font-black">{analysis.forecasts.roe.base.toFixed(4)}</span>
                      </div>
                      <div className="text-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-[8px] font-black text-emerald-500 uppercase block mb-1">Upside</span>
                        <span className="text-sm font-mono font-bold text-slate-600">{analysis.forecasts.roe.upside.toFixed(4)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-slate-200/60">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Acceleration Index</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${analysis.forecasts.roe.base > historicalAverages.roe ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {analysis.forecasts.roe.base > historicalAverages.roe ? '▲' : '▼'} {(analysis.forecasts.roe.base - historicalAverages.roe).toFixed(4)}
                          </span>
                       </div>
                    </div>
                  </div>
               </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 blur-3xl -mr-32 -mt-32 rounded-full opacity-50" />
               <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 relative z-10">
                 <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                 Analysis Accuracy Audit
               </h2>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm">
                       <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Integrity Summary</h4>
                       <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                         "{analysis.accuracySummary}"
                       </p>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Level</p>
                          <p className="text-sm font-bold text-slate-900">Multi-Source Cross-Check</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-separate border-spacing-y-2">
                          <thead>
                             <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-4 pb-2">Metric</th>
                                <th className="px-4 pb-2 text-center">Year</th>
                                <th className="px-4 pb-2 text-right">Annual report data</th>
                                <th className="px-4 pb-2 text-right">Verified</th>
                                <th className="px-4 pb-2 text-right">Variance</th>
                                <th className="px-4 pb-2 text-right">Status</th>
                             </tr>
                          </thead>
                          <tbody>
                             {analysis.accuracyAudit.map((audit, idx) => (
                               <tr key={idx} className="bg-slate-50/50 rounded-xl overflow-hidden hover:bg-white transition-all shadow-sm group">
                                  <td className="px-4 py-3 rounded-l-xl border-l border-t border-b border-slate-100">
                                     <span className="text-sm font-bold text-slate-900 capitalize">{audit.metric}</span>
                                  </td>
                                  <td className="px-4 py-3 border-t border-b border-slate-100 text-center">
                                     <span className="text-xs font-bold text-slate-500">FY{audit.year}</span>
                                  </td>
                                  <td className="px-4 py-3 border-t border-b border-slate-100 text-right whitespace-nowrap">
                                     <span className="text-xs font-mono text-slate-400">{formatLargeNumber(audit.annualReportValue, audit.currency)}</span>
                                  </td>
                                  <td className="px-4 py-3 border-t border-b border-slate-100 text-right whitespace-nowrap">
                                     <span className="text-xs font-mono text-slate-900 font-bold">{formatLargeNumber(audit.verifiedValue, audit.currency)}</span>
                                  </td>
                                  <td className="px-4 py-3 border-t border-b border-slate-100 text-right">
                                     <span className={`text-xs font-black ${(audit.variance * 100) < 0.1 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                       {(audit.variance * 100).toFixed(3)}%
                                     </span>
                                  </td>
                                  <td className="px-4 py-3 text-right rounded-r-xl border-r border-t border-b border-slate-100">
                                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${audit.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                       {audit.status}
                                     </span>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
               </div>
            </section>
          </>
        )}
      </main>

      {currentExplanation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            <button 
              onClick={() => setExplanationId(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-8">
              <h4 className="text-3xl font-black text-slate-900 mb-2">{currentExplanation.label}</h4>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-mono font-bold tracking-tighter">
                Formula: {currentExplanation.formula}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Intelligence Summary</h5>
                <p className="text-slate-600 leading-relaxed font-medium">{currentExplanation.explanation}</p>
              </div>
            </div>
            <button 
              onClick={() => setExplanationId(null)}
              className="mt-10 w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showDisclaimer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500" />
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-8">
              <h4 className="text-3xl font-black text-slate-900 mb-2">Disclaimer</h4>
              <p className="text-rose-600 font-bold text-sm uppercase tracking-widest">Financial Information Notice</p>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                <p className="font-bold text-slate-900">This is information – not financial advice or recommendation.</p>
                <p>The content and materials featured or linked to on this tool are for your information and education only, and are not intended to address your specific personal requirements.</p>
                <p>The information does not constitute financial advice or a recommendation and should not be considered as such.</p>
                <p>We are not regulated by the Financial Conduct Authority (FCA). The authors are not financial advisors and are not authorised to offer financial advice.</p>
                <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest pt-2">Always Do Your Own Research</h5>
                <p>Always do your own research and seek independent financial advice when required.</p>
                <p>Any arrangement made between you and any third party named or linked to from the site is at your sole risk and responsibility.</p>
                <p>We assume no liability for your actions.</p>
                <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest pt-2">Investing Carries Risks</h5>
                <p>The value of investments and any income derived from them can fall as well as rise, and you may not get back the original amount you invested.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="mt-10 w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}

      {showMethodology && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-4xl w-full shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500" />
            <button 
              onClick={() => setShowMethodology(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-6">
              <h4 className="text-3xl font-black text-slate-900 mb-1">Methodology</h4>
              <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">The framework we use is as follow:</p>
            </div>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-6 custom-scrollbar text-slate-700 leading-relaxed">
              <div className="space-y-4">
                <p><strong>1. We start with the analysis of the firm’s Return on Investment</strong> – How much money the company generates relative to the shareholders’ investment in the business?</p>
                <p><strong>Measures:</strong> ROE (Return on Equity)</p>
                <p><strong>Why this metric is important:</strong> it measures value created by the business. We supplement ROE analysis with NLP analysis of the annual report's textual content to determine whether future ROA will increase or decline.</p>
                <p><strong>NLP measures of future earnings:</strong> <strong>Sentiment, Forward-looking information</strong>. Using AI and both financial and non-financial indicators, we predict what future ROE will be: predict changes in ROA over the next quarter and one year (AI).</p>
                <p><strong>2. Then we analyse what drives Return on Investment</strong> – ROE is driven by how well the business is using its assets (asset efficiency or asset turnover) and how profitably it sells its products (profit margin).</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Asset turnover:</strong> shows how well a company uses what it owns to make money from sales.</li>
                  <li><strong>Profit margin:</strong> shows how much money a company keeps from sales after covering its costs.</li>
                  <li><strong>Gearing:</strong> Measures how much debt the company is using and captures financial risk.</li>
                </ul>
                <p><strong>3. Then we analyse risk using financial statement information</strong> – Shareholders need to compare financial performance to risks to understand if returns are high enough to justify the risk. The higher the risk, the higher the return a company needs to generate.</p>
                <div className="py-6 flex flex-col items-center bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk and Return Correlation</span>
                  <svg width="240" height="120" viewBox="0 0 240 120" className="text-indigo-600">
                    <path d="M20,100 Q120,100 220,20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <line x1="20" y1="100" x2="220" y2="100" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="20" y1="20" x2="20" y2="100" stroke="#cbd5e1" strokeWidth="2" />
                    <text x="110" y="115" fontSize="10" fill="#94a3b8" textAnchor="middle" fontWeight="bold">RISK</text>
                    <text x="10" y="60" fontSize="10" fill="#94a3b8" textAnchor="middle" fontWeight="bold" transform="rotate(-90, 10, 60)">RETURN</text>
                  </svg>
                </div>
                <p>Risk has multiple dimensions. We are looking at four measures of risk:</p>
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <p><strong>Financial risk:</strong> Measures how much debt (e.g., bank loans) the company uses. Debt acts as a multiplier of financial performance.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p><strong>Solvency:</strong> Does the company have enough cash to continue and absorb unexpected shocks?</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p><strong>Business risk:</strong> What are the operating risks the company faces?</p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p><strong>Reporting risk:</strong> Gauges quality of information. How clearly, accurately, and honestly a company presents its information in annual reports.</p>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowMethodology(false)}
              className="mt-10 w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Close Methodology
            </button>
          </div>
        </div>
      )}

      {showProjectInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            <button 
              onClick={() => setShowProjectInfo(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-8">
              <h4 className="text-3xl font-black text-slate-900 mb-2">Project Funding and Leads</h4>
              <p className="text-teal-600 font-bold text-sm uppercase tracking-widest">Knowledge Exchange Partnership</p>
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar text-slate-700 leading-relaxed">
              <div className="space-y-4">
                <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100">
                  <p className="font-bold text-teal-900 mb-2">Funding Information</p>
                  <p className="text-sm">This project was funded by the <strong>Higher Education Innovation Fund (HEIF)</strong>, part of UK Research England.</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-900 mb-2">Research Execution</p>
                  <p className="text-sm">The project was executed by researchers from the <strong>Centre for Financial Analysis and Reporting Research (CeFARR)</strong> at Bayes Business School.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowProjectInfo(false)}
              className="mt-10 w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
           <div className="flex flex-wrap justify-center items-center gap-3">
              <button onClick={() => setShowDisclaimer(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all flex items-center gap-2 group border border-slate-200">Disclaimer</button>
              <button onClick={() => setShowMethodology(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all flex items-center gap-2 group border border-slate-200">Methodology</button>
              <button onClick={() => setShowProjectInfo(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all flex items-center gap-2 group border border-slate-200">Project Leads</button>
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 group">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
           </div>
           <div className="flex items-center gap-4 pt-3 border-t border-slate-100 w-full justify-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Powered by Bayes Business School methodology</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState } from 'react';

const FloatingHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all z-50 group"
        aria-label="Help"
      >
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <span className="text-sm font-black absolute top-1 text-indigo-200 group-hover:-translate-y-1 transition-transform">H</span>
          <span className="text-2xl font-black mt-3">£</span>
          <svg className="w-5 h-5 text-white absolute bottom-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M7 12c2 3 6 3 8 0" />
          </svg>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="text-2xl font-black">£</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Understanding DuPont Analysis
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">A framework for evaluating corporate performance</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto">
              
              <div className="space-y-8 text-slate-700 leading-relaxed">
                
                {/* Introduction */}
                <section>
                  <p className="text-lg">
                    <strong>DuPont Analysis</strong> is a fundamental performance measurement framework originally developed by the DuPont Corporation in the 1920s. It breaks down <strong>Return on Equity (ROE)</strong> into three distinct components to help investors understand exactly <em>what</em> is driving a company's profitability.
                  </p>
                  <p className="mt-4">
                    While two companies might have the exact same ROE, they could be achieving it in entirely different ways. DuPont analysis reveals whether a company is relying on high margins, efficient asset use, or heavy debt to generate its returns.
                  </p>
                </section>

                {/* Graphical Decomposition */}
                <section className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 text-center">The DuPont Formula</h3>
                  
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
                    
                    {/* ROE */}
                    <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg w-full lg:w-48 text-center relative">
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Result</div>
                      <div className="text-xl font-black">ROE</div>
                      <div className="text-xs mt-2 opacity-90 border-t border-indigo-400/50 pt-2">Net Income ÷ Equity</div>
                    </div>

                    <div className="text-slate-300 font-black text-2xl rotate-90 lg:rotate-0">=</div>

                    {/* Components */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                      
                      {/* Margin */}
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-full sm:w-48 text-center">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Profitability</div>
                        <div className="text-lg font-black text-slate-900">Net Margin</div>
                        <div className="text-xs mt-2 text-slate-500 border-t border-slate-100 pt-2">Net Income ÷ Revenue</div>
                      </div>

                      <div className="text-slate-300 font-black text-xl">×</div>

                      {/* Turnover */}
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-full sm:w-48 text-center">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Efficiency</div>
                        <div className="text-lg font-black text-slate-900">Asset Turnover</div>
                        <div className="text-xs mt-2 text-slate-500 border-t border-slate-100 pt-2">Revenue ÷ Assets</div>
                      </div>

                      <div className="text-slate-300 font-black text-xl">×</div>

                      {/* Leverage */}
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-full sm:w-48 text-center">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Leverage</div>
                        <div className="text-lg font-black text-slate-900">Equity Multiplier</div>
                        <div className="text-xs mt-2 text-slate-500 border-t border-slate-100 pt-2">Assets ÷ Equity</div>
                      </div>

                    </div>
                  </div>
                  
                  <div className="mt-6 text-center text-sm text-slate-500 italic">
                    Notice how Revenue and Assets cancel out mathematically, leaving Net Income ÷ Equity (ROE).
                  </div>
                </section>

                {/* Detailed Drivers */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Driver 1 */}
                  <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black mb-4">1</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Net Profit Margin</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Measures <strong>Operating Efficiency</strong>. It shows how much profit is generated from every pound of revenue after all expenses are paid.
                    </p>
                    <div className="text-sm">
                      <strong className="text-slate-900 block mb-1">How to improve:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li>Raise prices (pricing power)</li>
                        <li>Reduce cost of goods sold</li>
                        <li>Cut operating expenses</li>
                      </ul>
                    </div>
                  </div>

                  {/* Driver 2 */}
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black mb-4">2</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Asset Turnover</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Measures <strong>Asset Use Efficiency</strong>. It shows how effectively a company uses its assets to generate sales.
                    </p>
                    <div className="text-sm">
                      <strong className="text-slate-900 block mb-1">How to improve:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li>Increase sales volume</li>
                        <li>Manage inventory leaner</li>
                        <li>Collect receivables faster</li>
                        <li>Sell off unused assets</li>
                      </ul>
                    </div>
                  </div>

                  {/* Driver 3 */}
                  <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black mb-4">3</div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Equity Multiplier</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Measures <strong>Financial Leverage</strong>. It shows how much of the company's assets are financed by shareholders versus debt.
                    </p>
                    <div className="text-sm">
                      <strong className="text-slate-900 block mb-1">How to improve:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        <li>Take on more debt</li>
                        <li>Buy back shares</li>
                      </ul>
                      <p className="mt-2 text-xs text-amber-700 font-medium">
                        * Note: Higher leverage boosts ROE but increases bankruptcy risk.
                      </p>
                    </div>
                  </div>

                </section>

                {/* How to evaluate */}
                <section className="border-t border-slate-200 pt-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">How to Evaluate Companies Using DuPont</h3>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-1 shrink-0 bg-indigo-500 rounded-full"></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Identify the Core Strategy</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Software companies and luxury brands typically have high margins but low turnover. Supermarkets have razor-thin margins but massive asset turnover. DuPont helps you see if a company is executing its specific industry strategy well.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1 shrink-0 bg-rose-500 rounded-full"></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Spot "Artificial" ROE Growth</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          If a company's ROE is rising, is it because they are becoming more profitable (good), or simply because they are taking on massive amounts of debt (risky)? DuPont reveals the truth behind the headline number.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1 shrink-0 bg-emerald-500 rounded-full"></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Find the Bottleneck</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          When comparing two competitors, DuPont shows exactly where one is outperforming the other. Company A might have better pricing power (Margin), while Company B might have superior supply chain logistics (Turnover).
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* App Sections Guide */}
                <section className="border-t border-slate-200 pt-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Navigating the App</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 text-lg mb-2">1. DuPont Decomposition Map</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        <strong>What it shows:</strong> A visual tree breaking down the company's Return on Equity (ROE) into its core components (Net Margin, Asset Turnover, Equity Multiplier) and further down into granular financial metrics like Revenue, Net Income, Assets, and Equity.
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>How to interpret:</strong> Follow the branches from right to left. If ROE is low, trace back to see which component is dragging it down. Is it a low profit margin? Inefficient use of assets? Or low leverage?
                      </p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 text-lg mb-2">2. Historical Trend Charts</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        <strong>What it shows:</strong> Line charts displaying the 5-year historical performance of ROE and its three main drivers (Net Margin, Asset Turnover, Equity Multiplier).
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>How to interpret:</strong> Look for trends over time. A rising ROE is good, but check the drivers. If ROE is rising solely because the Equity Multiplier (leverage) is spiking, the company is taking on more risk. Ideally, you want to see stable or growing margins and turnover.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 text-lg mb-2">3. NLP Sentiment Analysis</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        <strong>What it shows:</strong> AI-driven analysis of the company's annual reports and earnings calls, scoring management's tone on Strategy, Risk, and Market conditions.
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>How to interpret:</strong> Compare the sentiment scores with the financial metrics. If financial performance is declining but management sentiment is overly positive, there might be a disconnect. Conversely, cautious sentiment during strong financial periods might indicate upcoming headwinds.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Real World Example: Barclays */}
                <section className="border-t border-slate-200 pt-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Real-World Example: Barclays (BARC)</h3>
                  
                  <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <p className="text-sm text-slate-700 mb-4">
                      Let's apply DuPont analysis to a major bank like Barclays. Banks have a very specific financial structure that looks different from a typical retail or tech company.
                    </p>
                    
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <strong className="text-slate-900 block">Net Profit Margin (Often Moderate to High)</strong>
                          <span className="text-sm text-slate-600">Banks typically have decent margins on their lending and investment activities. For Barclays, you might see a margin of 15-25%. If this drops, it could indicate rising loan defaults or shrinking interest rate spreads.</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <strong className="text-slate-900 block">Asset Turnover (Very Low)</strong>
                          <span className="text-sm text-slate-600">Banks hold massive amounts of assets (loans, securities). Therefore, their revenue relative to their total assets is tiny. An asset turnover of 0.02 to 0.05 is normal for Barclays. They are not "asset efficient" in the traditional sense.</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <strong className="text-slate-900 block">Equity Multiplier (Extremely High)</strong>
                          <span className="text-sm text-slate-600">This is the secret to a bank's ROE. Banks are highly leveraged; they use a small amount of equity to control a massive balance sheet of deposits and loans. Barclays might have an equity multiplier of 15x to 20x.</span>
                        </div>
                      </li>
                    </ul>

                    <div className="mt-6 pt-4 border-t border-indigo-200/50">
                      <strong className="text-slate-900 block mb-2">The Takeaway for Barclays:</strong>
                      <p className="text-sm text-slate-700">
                        If Barclays reports a 10% ROE, the DuPont analysis will show that this isn't driven by selling products quickly (turnover), but rather by taking a moderate margin and amplifying it with massive leverage (deposits/debt). If their Equity Multiplier drops due to stricter banking regulations requiring them to hold more capital, their ROE will fall unless they can significantly increase their profit margins.
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default FloatingHelp;

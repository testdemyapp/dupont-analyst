import React from 'react';
import { MetricYearData, DiagnosticNarrative } from '../types';

interface DiagnosticSectionProps {
  timeSeries: MetricYearData[];
  diagnostic?: DiagnosticNarrative;
}

const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({ timeSeries, diagnostic }) => {
  if (!timeSeries || timeSeries.length < 2) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-slate-500">Insufficient data to analyze trends. At least two years of data are required.</p>
      </div>
    );
  }

  const current = timeSeries[0];
  const previous = timeSeries[1];

  const analyzeTrend = (curr: number, prev: number, metricName: string, isPercentage: boolean = true) => {
    const diff = curr - prev;
    const percentChange = prev !== 0 ? (diff / Math.abs(prev)) * 100 : 0;
    const direction = diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'remained stable';
    
    let analysis = `The ${metricName} has ${direction} `;
    if (diff !== 0) {
      analysis += `by ${Math.abs(percentChange).toFixed(2)}% `;
    }
    
    analysis += `from ${isPercentage ? (prev * 100).toFixed(2) + '%' : prev.toFixed(2)} in FY${previous.year} to ${isPercentage ? (curr * 100).toFixed(2) + '%' : curr.toFixed(2)} in FY${current.year}.`;
    
    return {
      direction,
      text: analysis,
      isPositive: diff > 0
    };
  };

  const roeTrend = analyzeTrend(current.roe, previous.roe, 'Return on Equity (ROE)');
  const roaTrend = analyzeTrend(current.roa, previous.roa, 'Return on Assets (ROA)');
  const marginTrend = analyzeTrend(current.margin, previous.margin, 'Net Profit Margin');
  const turnoverTrend = analyzeTrend(current.turnover, previous.turnover, 'Asset Turnover', false);

  const renderCard = (title: string, trend: ReturnType<typeof analyzeTrend>, narrative?: string) => (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
      <h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{trend.text}</p>
      {narrative && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm text-slate-700 italic">
          "{narrative}"
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.direction === 'increased' ? 'bg-emerald-100 text-emerald-700' : trend.direction === 'decreased' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>
          {trend.direction.toUpperCase()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex justify-between items-center">
        Diagnostic Analysis
        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Trend Evaluation</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderCard('ROE Trend', roeTrend, diagnostic?.roe)}
        {renderCard('ROA Trend', roaTrend, diagnostic?.roa)}
        {renderCard('Net Profit Margin Trend', marginTrend, diagnostic?.margin)}
        {renderCard('Asset Turnover Trend', turnoverTrend, diagnostic?.turnover)}
      </div>
      <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <h4 className="text-sm font-bold text-indigo-900 mb-2">Overall Diagnostic Summary</h4>
        <p className="text-sm text-indigo-800 leading-relaxed">
          {diagnostic?.overall || (
            <>
              {roeTrend.direction === 'increased' ? 'The company is showing improved efficiency in generating returns for shareholders. ' : 'The company is facing challenges in maintaining shareholder returns. '}
              {marginTrend.direction === 'increased' ? 'Profitability margins have expanded, indicating better cost control or pricing power. ' : 'Profitability margins have contracted, suggesting cost pressures or pricing challenges. '}
              {turnoverTrend.direction === 'increased' ? 'Asset utilization has improved, meaning the company is generating more revenue per unit of asset. ' : 'Asset utilization has decreased, indicating potential inefficiencies in asset management. '}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default DiagnosticSection;

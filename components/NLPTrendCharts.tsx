
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NLPMeasures } from '../types';
import { METRIC_DEFINITIONS } from '../constants';

interface NLPTrendChartsProps {
  nlpData: Record<number, NLPMeasures>;
}

const NLPTrendCharts: React.FC<NLPTrendChartsProps> = ({ nlpData }) => {
  // Fix: Spread types may only be created from object types. 
  // We cast measures to NLPMeasures to ensure the compiler recognizes it as a valid object for spreading.
  const chartData = Object.entries(nlpData)
    .map(([year, measures]) => ({
      year: parseInt(year),
      ...(measures as NLPMeasures),
    }))
    .sort((a, b) => a.year - b.year);

  const colors = {
    sentiment: '#10b981', // emerald
    fli: '#6366f1',       // indigo
    specificity: '#f59e0b', // amber
    sentenceLength: '#64748b', // slate
    depth: '#8b5cf6',      // violet
    unfamiliarity: '#ec4899' // pink
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NLPChartCard 
        id="sentiment" 
        data={chartData} 
        dataKey="sentiment" 
        color={colors.sentiment} 
      />
      <NLPChartCard 
        id="fli" 
        data={chartData} 
        dataKey="fli" 
        color={colors.fli} 
      />
      <NLPChartCard 
        id="specificity" 
        data={chartData} 
        dataKey="specificity" 
        color={colors.specificity} 
      />
      <NLPChartCard 
        id="sentenceLength" 
        data={chartData} 
        dataKey="sentenceLength" 
        color={colors.sentenceLength} 
      />
      <NLPChartCard 
        id="depth" 
        data={chartData} 
        dataKey="depth" 
        color={colors.depth} 
      />
      <NLPChartCard 
        id="unfamiliarity" 
        data={chartData} 
        dataKey="unfamiliarity" 
        color={colors.unfamiliarity} 
      />
    </div>
  );
};

interface NLPChartCardProps {
  id: string;
  data: any[];
  dataKey: string;
  color: string;
}

const NLPChartCard: React.FC<NLPChartCardProps> = ({ id, data, dataKey, color }) => {
  const def = METRIC_DEFINITIONS[id];
  
  const formatValue = (val: number) => {
    if (id === 'sentenceLength') return val.toFixed(1);
    return (val < 1 && val > -1) ? (val * 100).toFixed(0) + "%" : val.toFixed(1);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{def.label.split(' (')[0]}</h4>
          <p className="text-[10px] text-slate-400 font-medium">3-Year Linguistic Trend</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 group-hover:text-indigo-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
              dy={5}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10}}
              tickFormatter={(val) => id === 'sentenceLength' ? val : (val * 100).toFixed(0) + '%'}
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px'}}
              formatter={(val: number) => [formatValue(val), def.label]}
              labelStyle={{fontWeight: 800, color: '#1e293b'}}
            />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? color : color + '80'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50">
        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
          {def.explanation}
        </p>
      </div>
    </div>
  );
};

export default NLPTrendCharts;


import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricYearData } from '../types';
import { METRIC_DEFINITIONS } from '../constants';

interface MetricChartsProps {
  data: MetricYearData[];
}

const MetricCharts: React.FC<MetricChartsProps> = ({ data }) => {
  // Sort data by year ascending for chart
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ChartCard title="ROE & ROA Trend" metricIds={['roe', 'roa']} unit="percent">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={formatPercent} />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              formatter={(val: number) => formatPercent(val)}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line name="ROE" type="monotone" dataKey="roe" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            <Line name="ROA" type="monotone" dataKey="roa" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Net Profit Margin" metricIds={['margin']} unit="percent">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={formatPercent} />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              formatter={(val: number) => formatPercent(val)}
            />
            <Line type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Asset Turnover" metricIds={['turnover']} unit="multiplier">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              formatter={(val: number) => val.toFixed(2) + "x"}
            />
            <Line type="monotone" dataKey="turnover" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

const ChartCard: React.FC<{title: string; children: React.ReactNode; unit: string; metricIds: string[]}> = ({title, children, metricIds}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group/card">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-tight">{title}</h4>
      <div className="relative group/info">
        <svg className="w-4 h-4 text-slate-300 hover:text-indigo-500 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        {/* Tooltip for the whole card metrics */}
        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-slate-900 text-white rounded-xl text-xs shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 pointer-events-none space-y-4">
          {metricIds.map(id => {
            const def = METRIC_DEFINITIONS[id];
            return (
              <div key={id} className="border-b border-slate-700 last:border-none pb-3 last:pb-0">
                <div className="font-black text-indigo-400 uppercase tracking-widest mb-1">{def.label}</div>
                <div className="text-slate-300 mb-2 italic">Formula: {def.formula}</div>
                <div className="text-slate-400 leading-relaxed">{def.explanation}</div>
              </div>
            );
          })}
          <div className="absolute bottom-full right-1 -mb-1.5 border-8 border-transparent border-b-slate-900" />
        </div>
      </div>
    </div>
    {children}
  </div>
);

export default MetricCharts;

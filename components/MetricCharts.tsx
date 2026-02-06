
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricYearData } from '../types';

interface MetricChartsProps {
  data: MetricYearData[];
}

const MetricCharts: React.FC<MetricChartsProps> = ({ data }) => {
  // Sort data by year ascending for chart
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ChartCard title="ROE & ROA Trend" unit="percent">
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

      <ChartCard title="Net Profit Margin" unit="percent">
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

      <ChartCard title="Asset Turnover" unit="multiplier">
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

const ChartCard: React.FC<{title: string; children: React.ReactNode; unit: string}> = ({title, children}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-4">{title}</h4>
    {children}
  </div>
);

export default MetricCharts;

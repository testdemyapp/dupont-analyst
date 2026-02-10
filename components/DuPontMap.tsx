
import React from 'react';
import { MetricYearData } from '../types';
import { METRIC_DEFINITIONS } from '../constants';

interface NodeProps {
  id: string;
  value: string;
  onClick: (id: string) => void;
  isMain?: boolean;
}

const Node: React.FC<NodeProps> = ({ id, value, onClick, isMain }) => {
  const def = METRIC_DEFINITIONS[id];
  return (
    <div className="group relative">
      <div 
        onClick={() => onClick(id)}
        className={`cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 shadow-sm
        ${isMain ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400'}`}
      >
        <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isMain ? 'text-indigo-100' : 'text-slate-500'}`}>
          {def.label.split(' (')[0]}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white rounded-xl text-xs shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
        <div className="font-black text-indigo-400 uppercase tracking-widest mb-1">{def.label}</div>
        <div className="text-slate-300 mb-2 italic">Formula: {def.formula}</div>
        <div className="text-slate-400 leading-relaxed">{def.explanation}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-8 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}

interface DuPontMapProps {
  data: MetricYearData;
  onExplain: (metricId: string) => void;
}

const DuPontMap: React.FC<DuPontMapProps> = ({ data, onExplain }) => {
  return (
    <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 shadow-inner relative overflow-hidden">
      <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        DuPont Decomposition Map
      </h3>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Level 1: ROE */}
        <div className="flex justify-center">
          <Node id="roe" value={(data.roe * 100).toFixed(2) + "%"} isMain onClick={onExplain} />
        </div>

        {/* Level 2: ROA & Leverage */}
        <div className="flex justify-around items-center relative">
          <div className="absolute top-[-3rem] left-1/2 w-px h-12 bg-slate-300" />
          <div className="absolute top-[-1rem] left-1/4 right-1/4 h-px bg-slate-300" />
          
          <Node id="roa" value={(data.roa * 100).toFixed(2) + "%"} onClick={onExplain} />
          <div className="text-2xl font-bold text-slate-400">×</div>
          <Node id="leverage" value={data.leverage.toFixed(2) + "x"} onClick={onExplain} />
        </div>

        {/* Level 3: Margin & Turnover */}
        <div className="flex justify-center items-center gap-8 pl-0 md:pr-[25%] relative">
           <div className="absolute top-[-3rem] left-[25%] w-px h-12 bg-slate-300" />
           <div className="absolute top-[-1rem] left-0 right-[50%] h-px bg-slate-300" />
           
           <Node id="margin" value={(data.margin * 100).toFixed(2) + "%"} onClick={onExplain} />
           <div className="text-2xl font-bold text-slate-400">×</div>
           <Node id="turnover" value={data.turnover.toFixed(2) + "x"} onClick={onExplain} />
        </div>
      </div>
    </div>
  );
};

export default DuPontMap;

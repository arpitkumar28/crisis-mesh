'use client';

import React from 'react';
import { 
  TrendingUp, Activity, AlertTriangle, Cloud, 
  MapPin, ChevronRight, Info, Shield, 
  CheckCircle2, RefreshCw, Filter, Search,
  BarChart3, PieChart, Database, Zap
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const rainfallForecast = [
  { time: '02 PM', value: 12 },
  { time: '04 PM', value: 45 },
  { time: '06 PM', value: 78 },
  { time: '08 PM', value: 60 },
  { time: '10 PM', value: 30 },
  { time: '12 AM', value: 10 },
];

const highRiskAreas = [
  { name: 'Malviya Nagar', risk: 92, status: 'Extreme' },
  { name: 'Mansarovar', risk: 85, status: 'High' },
  { name: 'Sanganer', risk: 78, status: 'High' },
  { name: 'Vaishali Nagar', risk: 45, status: 'Medium' },
  { name: 'Jhotwara', risk: 32, status: 'Low' },
];

export default function AIPredictionsPage() {
  return (
    <OperationsShell eyebrow="AI-driven situation intelligence and risk forecasting" title="AI Predictions & Risk Insights">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="Model: Flood-Predict-V2" />
          <FilterSelect label="Region: Jaipur District" />
          <FilterSelect label="Horizon: Next 24 Hours" />
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
          <RefreshCw size={14} /> Run Prediction
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Flood Risk Prediction */}
        <div className="col-span-12 lg:col-span-4">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col items-center text-center">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-10 w-full text-left">Flood Risk Probability</h3>
              
              <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="112" cy="112" r="100" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                    <circle cx="112" cy="112" r="100" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray="628" strokeDashoffset="138" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2">High Risk</span>
                    <span className="text-5xl font-black text-[#0f172a]">78%</span>
                 </div>
              </div>
              
              <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest mb-8">
                High probability of flooding in low-lying areas of Jaipur South due to predicted precipitation intensity.
              </p>
              
              <div className="w-full space-y-4 pt-8 border-t border-gray-50">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Confidence Score</span>
                    <span className="text-green-600">92.4%</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[92%]"></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Forecast & Trends */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Rainfall Forecast Trend <span className="text-gray-400 font-bold ml-2">(AI Projected)</span></h3>
                 <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase">
                    <Activity size={14} /> Neural-Net Model
                 </div>
              </div>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfallForecast}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} />
                       <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {rainfallForecast.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.value > 50 ? '#3b82f6' : '#93c5fd'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Most At-Risk Areas</h3>
                 <div className="space-y-5">
                    {highRiskAreas.map(area => (
                       <div key={area.name}>
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                             <span className="text-[#0f172a]">{area.name}</span>
                             <span className={area.risk > 80 ? 'text-red-600' : 'text-orange-500'}>{area.risk}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${area.risk > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${area.risk}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                          <Zap size={20} />
                       </div>
                       <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">AI Recommendation</h3>
                    </div>
                    <ul className="space-y-4">
                       <li className="flex gap-3 text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                          Pre-position 2 response units in Malviya Nagar Sector 4.
                       </li>
                       <li className="flex gap-3 text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                          Issue "Alert Level 2" for Mansarovar Lake residential belt.
                       </li>
                    </ul>
                 </div>
                 <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Execute Recommended Actions
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Model Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
         <PerformanceStat label="Model Accuracy" value="94.6%" icon={<CheckCircle2 className="text-green-500" />} />
         <PerformanceStat label="Prediction F1" value="0.92" icon={<Activity className="text-blue-500" />} />
         <PerformanceStat label="Inference Time" value="124 ms" icon={<Zap className="text-yellow-500" />} />
         <PerformanceStat label="Training Cycle" value="v2.4.1" icon={<Database className="text-purple-500" />} />
      </div>
    </OperationsShell>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 pr-10 text-[10px] font-black text-[#0f172a] uppercase tracking-widest focus:outline-none hover:bg-white transition-all shadow-sm cursor-pointer">
        <option>{label}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
    </div>
  );
}

function PerformanceStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex items-center gap-4">
       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <h4 className="text-xl font-black text-[#0f172a]">{value}</h4>
       </div>
    </div>
  );
}

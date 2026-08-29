'use client';

import React from 'react';
import {
  AlertTriangle, Bell, Activity, Users,
  Map as MapIcon, ChevronDown, Plus, Download,
  TrendingUp, Home, Shield, Cloud, Info, Clock,
  MapPin, Send, LayoutGrid, Users2, FileText,
  ChevronRight, MoreHorizontal, MousePointer2,
  Navigation, Maximize2, Radio, Zap, Flame,
  Stethoscope, Truck, LifeBuoy, Filter, Search,
  ArrowUpRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-bold text-blue-900/20 text-4xl">Loading Map...</div>
});

const riskSummaryData = [
  { name: 'High Risk', value: 25, color: '#ef4444' },
  { name: 'Medium Risk', value: 45, color: '#f97316' },
  { name: 'Low Risk', value: 30, color: '#22c55e' },
];

const historicalTrendData = [
  { name: '18 Sep', high: 45, med: 30, low: 25 },
  { name: '19 Sep', high: 52, med: 28, low: 20 },
  { name: '20 Sep', high: 48, med: 35, low: 17 },
  { name: '21 Sep', high: 61, med: 25, low: 14 },
  { name: '22 Sep', high: 55, med: 30, low: 15 },
  { name: '23 Sep', high: 45, med: 35, low: 20 },
];

export default function HeatmapRiskAnalysis() {
  return (
    <OperationsShell eyebrow="Visualization intensity and vulnerability" title="Heatmap & Risk Analysis">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <FilterSelect label="Risk Type" value="Flood Risk" />
          <FilterSelect label="Time Range" value="Last 7 Days" />
          <FilterSelect label="District" value="Jaipur" />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
          <Zap size={14} /> Generate
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content: Heatmap */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                <MapIcon size={16} className="text-blue-600" />
                Regional Risk Heatmap
              </h3>
              <div className="flex items-center gap-4">
                 <button className="p-2 hover:bg-gray-50 rounded-lg"><Search size={14} className="text-gray-400" /></button>
                 <button className="p-2 hover:bg-gray-50 rounded-lg"><Maximize2 size={14} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 relative bg-blue-50">
              <LiveMap entities={[]} />

              {/* Floating Map Legend */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200/50">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-2 tracking-widest">Risk Intensity</p>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                  <span className="text-[8px] font-bold text-gray-400">LOW &rarr; HIGH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Risk by Area & Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Risk-by-Area */}
             <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#0f172a] text-sm">Risk-by-Area (Top 5)</h3>
                  <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">View All</button>
                </div>
                <div className="space-y-4">
                  <AreaRiskItem label="Malviya Nagar" value={92} level="High" color="bg-red-500" />
                  <AreaRiskItem label="Jhalana" value={78} level="High" color="bg-red-500" />
                  <AreaRiskItem label="Sanganer" value={65} level="Medium" color="bg-orange-500" />
                  <AreaRiskItem label="Chaksu" value={58} level="Medium" color="bg-orange-500" />
                  <AreaRiskItem label="Kotputli" value={42} level="Low" color="bg-green-500" />
                </div>
             </div>

             {/* Risk Factors */}
             <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-[#0f172a] text-sm mb-6">Risk Factors Contribution</h3>
                <div className="space-y-4">
                  <FactorItem label="Rainfall Intensity" percent={85} />
                  <FactorItem label="River / Water Level" percent={72} />
                  <FactorItem label="Land Elevation" percent={45} />
                  <FactorItem label="Population Density" percent={90} />
                  <FactorItem label="Drainage Capacity" percent={30} />
                </div>
             </div>
          </div>
        </div>

        {/* Right Sidebar: Analysis & Trends */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Risk Summary Output */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-[#0f172a] text-sm mb-6">Risk Summary Output</h3>

            <div className="flex items-center justify-center mb-6 relative">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskSummaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskSummaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Overall Risk</p>
                <p className="text-3xl font-black text-red-500">High</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
               {riskSummaryData.map((item) => (
                 <div key={item.name} className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#0f172a]">{item.value}%</span>
                 </div>
               ))}
            </div>

            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vulnerability Index</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f172a]">72</span>
                    <span className="text-[10px] font-bold text-gray-400">/ 100</span>
                  </div>
                  <span className="text-[8px] font-black px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-tighter">High</span>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Trend Analysis</p>
                  <div className="flex items-center justify-end gap-1 text-red-500">
                    <ArrowUpRight size={16} />
                    <span className="text-2xl font-black">8%</span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">vs last week</span>
               </div>
            </div>
          </div>

          {/* Historical Risk Trend */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-[#0f172a] text-sm">Historical Risk Trend</h3>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
               </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="med" stroke="#f97316" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between px-2">
               <TrendLegend color="bg-red-500" label="High" />
               <TrendLegend color="bg-orange-500" label="Medium" />
               <TrendLegend color="bg-green-500" label="Low" />
            </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function FilterSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
      <button className="flex items-center gap-6 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-[#0f172a] hover:bg-gray-100 transition-colors">
        {value}
        <ChevronDown size={12} className="text-gray-400" />
      </button>
    </div>
  );
}

function AreaRiskItem({ label, value, level, color }: { label: string; value: number; level: string; color: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#0f172a]">{label}</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
          </div>
          <span className={`text-[9px] font-black uppercase ${color.replace('bg-', 'text-')}`}>{level}</span>
        </div>
      </div>
    </div>
  );
}

function FactorItem({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-gray-600">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${percent}%` }}></div>
        </div>
        <span className="text-[9px] font-black text-[#0f172a] w-6">{percent}%</span>
      </div>
    </div>
  );
}

function TrendLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
       <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

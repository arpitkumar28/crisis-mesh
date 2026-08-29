'use client';

import React from 'react';
import { 
  Database, HardDrive, FileText, Activity, 
  BarChart3, PieChart, Download, Upload, 
  RefreshCw, Trash2, Database as DbIcon,
  Archive, Shield, Clock, ChevronDown
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';

const storageData = [
  { name: 'Sensors', value: 68.7, color: '#3b82f6' },
  { name: 'Incidents', value: 12.4, color: '#ef4444' },
  { name: 'Resources', value: 9.2, color: '#f59e0b' },
  { name: 'Weather', value: 6.7, color: '#06b6d4' },
  { name: 'Others', value: 3.0, color: '#94a3b8' },
];

const ingestionData = [
  { name: 'Sensors', value: 450, color: '#3b82f6' },
  { name: 'Media', value: 280, color: '#a855f7' },
  { name: 'Structural', value: 320, color: '#ec4899' },
  { name: 'Reports', value: 210, color: '#10b981' },
  { name: 'Others', value: 150, color: '#94a3b8' },
];

const retentionPolicies = [
  { label: 'Sensor Data', policy: '1 Year', status: 'Active', size: '12.45 TB' },
  { label: 'Incident Logs', policy: 'Indefinite', status: 'Active', size: '1.28 TB' },
  { label: 'Media Files', policy: '2 Years', status: 'Archived', size: '3.21 TB' },
  { label: 'Audit Logs', policy: '180 Days', status: 'Active', size: '850 GB' },
];

export default function DataManagementPage() {
  return (
    <OperationsShell eyebrow="Manage platform data and retention policies" title="Data Management">
      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
         {['Data Overview', 'Data Retention', 'Data Export', 'Data Import'].map(tab => (
            <button key={tab} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
               tab === 'Data Overview' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
               {tab}
               {tab === 'Data Overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
         ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
         <DataStat label="Total Data" value="18.42 TB" detail="System Wide" icon={<DbIcon size={20} />} />
         <DataStat label="Sensor Data" value="12.65 TB" detail="68% of Total" icon={<Activity size={20} className="text-blue-600" />} />
         <DataStat label="Incident Data" value="1.28 TB" detail="Relational Docs" icon={<FileText size={20} className="text-red-500" />} />
         <DataStat label="Media Files" value="3.21 TB" detail="High-res photos" icon={<HardDrive size={20} className="text-purple-500" />} />
         <DataStat label="Documents" value="1.28 TB" detail="Reports & Docs" icon={<Archive size={20} className="text-orange-500" />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Data Storage Distribution */}
        <div className="col-span-12 lg:col-span-4">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Data Storage Source</h3>
              <div className="flex-1 min-h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                       <Pie data={storageData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                          {storageData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                    </RePieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-[#0f172a]">18.42</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total TB</span>
                 </div>
              </div>
              <div className="mt-8 space-y-3">
                 {storageData.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-[#0f172a]">{item.value}%</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Data Ingestion Over Time */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Top Data Streams <span className="text-gray-400 font-bold ml-2">(Last 7 Days)</span></h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">Manage Streams</button>
              </div>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ingestionData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} />
                       <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {ingestionData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Data Retention Summary */}
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Data Retention Summary</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">View Policy Details</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
                 {retentionPolicies.map((p, i) => (
                    <div key={i} className="p-6 hover:bg-gray-50 transition-colors">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{p.label}</p>
                       <p className="text-sm font-black text-[#0f172a] uppercase mb-1">{p.policy}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-gray-400 uppercase">{p.size}</span>
                          <span className="text-[8px] font-black text-green-600 uppercase">{p.status}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function DataStat({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
         <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
      </div>
      <h4 className="text-3xl font-black text-[#0f172a]">{value}</h4>
      <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{detail}</p>
    </div>
  );
}

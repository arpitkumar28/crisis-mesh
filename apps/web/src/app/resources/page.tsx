'use client';

import React from 'react';
import {
  Plus, Download, Filter, Search,
  Truck, Users, Tool, Activity,
  ChevronDown, MapPin, ExternalLink,
  ChevronRight, MoreHorizontal,
  CheckCircle2, AlertTriangle, XCircle, Building2,
  Package, LifeBuoy, Shield, Boxes, ArrowUpRight,
  Clock, Calendar, FileText, Wrench
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const assetStats = [
  { label: 'Total Assets', value: '1,286', sub: '↑ 24 this month', color: 'text-[#0f172a]' },
  { label: 'Operational', value: '972', sub: '75.6%', color: 'text-green-600' },
  { label: 'Maintenance', value: '186', sub: '14.5%', color: 'text-orange-500' },
  { label: 'Out of Service', value: '64', sub: '5.0%', color: 'text-red-500' },
  { label: 'Expiring Soon', value: '28', sub: 'Next 30 days', color: 'text-blue-600' },
];

const categoryData = [
  { name: 'Vehicles', value: 35, color: '#3b82f6' },
  { name: 'Equipment', value: 25, color: '#10b981' },
  { name: 'Teams', value: 15, color: '#f59e0b' },
  { name: 'IT & Comm', value: 15, color: '#6366f1' },
  { name: 'Others', value: 10, color: '#94a3b8' },
];

const currentAssets = [
  { id: 'ASSET-102', name: 'Rescue Boat V2', category: 'Vehicles', location: 'Mansarovar Lake', status: 'Operational', lastService: '25 Aug, 10:15 AM' },
  { id: 'ASSET-084', name: 'JCB Excavator', category: 'Equipment', location: 'Vaishali Nagar', status: 'Operational', lastService: '23 Aug, 09:45 AM' },
  { id: 'ASSET-115', name: 'Drone X9', category: 'Equipment', location: 'Bani Park', status: 'Maintenance', lastService: '22 Aug, 02:30 PM' },
  { id: 'ASSET-092', name: 'Relief Truck #8', category: 'Vehicles', location: 'Civil Lines', status: 'Operational', lastService: '25 Aug, 08:30 AM' },
  { id: 'ASSET-201', name: 'Ambulance 108', category: 'Vehicles', location: 'City Center', status: 'Operational', lastService: '24 Aug, 11:20 AM' },
];

const maintenanceAlerts = [
  { id: 'AL-902', name: 'Ambulance 102', detail: 'Annual Service due in 5 days', priority: 'High', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'AL-845', name: 'Rescue Boat 07', detail: 'Engine overhaul due in 12 days', priority: 'Medium', color: 'text-orange-600', bg: 'bg-orange-50' },
];

export default function AssetManagement() {
  return (
    <OperationsShell eyebrow="Track and manage physical and digital assets" title="Asset Management">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search asset, location, category..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {assetStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
            <div className="mt-2 flex items-baseline gap-2">
              <h4 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h4>
              <span className="text-[8px] font-bold text-gray-400">{stat.sub}</span>
            </div>
            {i === 1 && (
              <div className="mt-3 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[75%]"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Assets by Category & Alerts */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Assets by Category</h3>
            <div className="flex items-center justify-center mb-8 relative">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-[#0f172a]">1,286</p>
                <p className="text-[8px] font-black text-gray-400 uppercase">Total Items</p>
              </div>
            </div>
            <div className="space-y-3">
              {categoryData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#0f172a]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Asset Expiry / Maintenance Alerts</h3>
            <div className="space-y-6">
              {maintenanceAlerts.map((alert, i) => (
                <div key={i} className={`p-4 rounded-2xl ${alert.bg} flex items-start gap-4`}>
                   <div className={`mt-1 ${alert.color}`}><AlertTriangle size={18} /></div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="text-xs font-black text-[#0f172a] uppercase">{alert.name}</h4>
                         <span className={`text-[8px] font-black uppercase ${alert.color}`}>{alert.priority}</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500">{alert.detail}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Asset List & Actions */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Current Assets</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase">View All Assets</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Asset ID</th>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Last Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentAssets.map((asset, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-[10px] font-black text-blue-600">{asset.id}</td>
                    <td className="px-8 py-4 text-[10px] font-black text-[#0f172a] uppercase">{asset.name}</td>
                    <td className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase">{asset.category}</td>
                    <td className="px-8 py-4 text-[10px] font-bold text-gray-500">{asset.location}</td>
                    <td className="px-8 py-4">
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                         asset.status === 'Operational' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                       }`}>{asset.status}</span>
                    </td>
                    <td className="px-8 py-4 text-[9px] font-bold text-gray-400">{asset.lastService}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
               <ActionButton icon={<Plus size={16} />} label="Add New Asset" />
               <ActionButton icon={<Calendar size={16} />} label="Schedule Maintenance" />
               <ActionButton icon={<FileText size={16} />} label="Generate Asset Report" />
               <ActionButton icon={<RefreshCw size={16} />} label="Bulk Asset Update" />
            </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-all group">
       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">{label}</span>
    </button>
  );
}

function RefreshCw({ size, className }: { size?: number; className?: string }) {
  return <Activity size={size} className={className} />;
}

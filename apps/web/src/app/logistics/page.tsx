'use client';

import React from 'react';
import {
  ShoppingCart, Search, Plus, Truck, MoreVertical, Building2, FileText
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const logisticsStats = [
  { label: 'Total Inventory Items', value: '842', color: 'text-[#0f172a]' },
  { label: 'Total Stock Value', value: '24,685', color: 'text-[#0f172a]' },
  { label: 'Low Stock Items', value: '32', sub: 'Needs attention', color: 'text-red-500' },
  { label: 'In-Transit Shipments', value: '18', sub: '12 Arrivals today', color: 'text-blue-600' },
  { label: 'Pending Requests', value: '26', sub: 'This week', color: 'text-orange-500' },
];

const inventoryItems = [
  { item: 'Water Bottles (1L)', category: 'Medical', inStock: '8,450', reorder: '1,500', status: 'Good' },
  { item: 'ORL Solution', category: 'Medical', inStock: '1,200', reorder: '500', status: 'Good' },
  { item: 'Life Jackets', category: 'Safety', inStock: '450', reorder: '600', status: 'Low Stock' },
  { item: 'Tents (4-Person)', category: 'Shelter', inStock: '180', reorder: '200', status: 'Low Stock' },
  { item: 'Dry Ration Kits', category: 'Food', inStock: '1,800', reorder: '500', status: 'Good' },
];

const recentShipments = [
  { id: 'SH-202508-01', supplier: 'Bharat Supplies Co.', type: 'Food / Water', status: 'In Transit', eta: '25 Aug, 04:00 PM' },
  { id: 'SH-202508-02', supplier: 'Apex Medicals', type: 'Medical Supplies', status: 'In Transit', eta: '25 Aug, 05:30 PM' },
  { id: 'SH-202508-03', supplier: 'SafeLife Industries', type: 'Life Jackets, Rope', status: 'Delivered', eta: '25 Aug, 10:20 AM' },
];

const topSuppliers = [
  { name: 'Bharat Supplies Co.', reliability: 98 },
  { name: 'Apex Medicals', reliability: 95 },
  { name: 'SafeLife Industries', reliability: 92 },
  { name: 'Reliance Infrastructure', reliability: 96 },
  { name: 'Jaipur Logistics', reliability: 88 },
];

export default function SupplyChainLogistics() {
  return (
    <OperationsShell eyebrow="Manage inventory, procurement and distribution" title="Supply Chain & Logistics">
      {/* Top Search & Admin Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search item, supplier..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        {logisticsStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
            <div className="mt-2 flex items-baseline gap-2">
              <h4 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h4>
              {stat.sub && <span className="text-[8px] font-bold text-gray-400">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Inventory Overview */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Inventory Overview</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase">View All Inventory</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Item Name</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">In Stock</th>
                  <th className="px-8 py-4">Reorder Level</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventoryItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-[10px] font-black text-[#0f172a] uppercase">{item.item}</td>
                    <td className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase">{item.category}</td>
                    <td className="px-8 py-4 text-[10px] font-black text-[#0f172a]">{item.inStock}</td>
                    <td className="px-8 py-4 text-[10px] font-bold text-gray-400">{item.reorder}</td>
                    <td className="px-8 py-4">
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                         item.status === 'Good' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                       }`}>{item.status}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                       <button className="text-gray-400 hover:text-[#0f172a]"><MoreVertical size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Recent Shipments</h3>
                <button className="text-[10px] font-black text-blue-600 uppercase">Track All</button>
             </div>
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Shipment ID</th>
                      <th className="px-8 py-4">Supplier</th>
                      <th className="px-8 py-4">Type</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">ETA / Arrival</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {recentShipments.map((ship, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-8 py-4 text-[10px] font-black text-blue-600">{ship.id}</td>
                         <td className="px-8 py-4 text-[10px] font-black text-[#0f172a] uppercase">{ship.supplier}</td>
                         <td className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase">{ship.type}</td>
                         <td className="px-8 py-4">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                              ship.status === 'In Transit' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>{ship.status}</span>
                         </td>
                         <td className="px-8 py-4 text-right text-[10px] font-black text-gray-500">{ship.eta}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Right Column: Suppliers & Quick Actions */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Top Suppliers</h3>
                 <button className="text-[9px] font-black text-blue-600 uppercase">Directory</button>
              </div>
              <div className="space-y-6">
                 {topSuppliers.map((sup, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                             <Building2 size={16} className="text-gray-400" />
                          </div>
                          <div>
                             <p className="text-xs font-black text-[#0f172a] uppercase">{sup.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Vendor Profile</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-green-600">{sup.reliability}%</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">Reliability</p>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all">
                 View All Suppliers &rarr;
              </button>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                 <ActionButton icon={<ShoppingCart size={16} />} label="Create Purchase Order" />
                 <ActionButton icon={<Plus size={16} />} label="Request New Stock" />
                 <ActionButton icon={<Truck size={16} />} label="Track Shipment" />
                 <ActionButton icon={<FileText size={16} />} label="Inventory Report" />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-all group w-full text-left">
       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">{label}</span>
    </button>
  );
}

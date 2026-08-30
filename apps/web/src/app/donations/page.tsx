'use client';

import React from 'react';
import {
  Heart, Users, DollarSign, CheckCircle2, Activity, Wallet
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const donationData = [
  { time: '19 Aug', amount: 12400 },
  { time: '20 Aug', time_label: '20 Aug', amount: 18600 },
  { time: '21 Aug', time_label: '21 Aug', amount: 15200 },
  { time: '22 Aug', time_label: '22 Aug', amount: 32400 },
  { time: '23 Aug', time_label: '23 Aug', amount: 24800 },
  { time: '24 Aug', time_label: '24 Aug', amount: 28600 },
  { time: '25 Aug', time_label: '25 Aug', amount: 14200 },
];

const topCampaigns = [
  { name: 'Flood Relief - Rajasthan', raised: '₹1.12 Cr', target: '₹1.50 Cr', status: 'Active' },
  { name: 'Relief Material Drive', raised: '₹45.6 Lakh', target: '₹60 Lakh', status: 'Active' },
  { name: 'Medical Kit Program', raised: '₹32.4 Lakh', target: '₹40 Lakh', status: 'Active' },
  { name: 'Shelter Support Fund', raised: '₹28.2 Lakh', target: '₹50 Lakh', status: 'Active' },
];

const recentDonations = [
  { donor: 'Amit Gupta', campaign: 'Flood Relief - Rajasthan', amount: '₹5,000', method: 'UPI', date: 'Just now' },
  { donor: 'Priya Verma', campaign: 'Medical Kit Program', amount: '₹10,000', method: 'Card', date: '5 min ago' },
  { donor: 'Corporate CSR', campaign: 'Flood Relief - Rajasthan', amount: '₹2.5 Lakh', method: 'Bank Transfer', date: '12 min ago' },
  { donor: 'Rajesh Mehra', campaign: 'Relief Material Drive', amount: '₹1,500', method: 'UPI', date: '25 min ago' },
];

export default function DonationsFundingPage() {
  return (
    <OperationsShell eyebrow="Manage donations, funding and transparency" title="Donations & Funding">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <DonationStat label="Total Collected" value="₹ 2.48 Cr" sub="+12% this month" icon={<DollarSign size={20} className="text-green-500" />} />
        <DonationStat label="Verified Donors" value="1,245" sub="+180 this month" icon={<Users size={20} className="text-blue-500" />} />
        <DonationStat label="Active Campaigns" value="8" sub="Ongoing" icon={<Heart size={20} className="text-red-500" />} />
        <DonationStat label="Utilized Amount" value="₹ 1.72 Cr" sub="69.3% Utilized" icon={<Activity size={20} className="text-purple-500" />} />
        <DonationStat label="Avg. Donation" value="₹ 19.8k" sub="System-wide" icon={<Wallet size={20} className="text-orange-500" />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Donation Trend Chart */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Donations Over Time</h3>
                 <div className="flex gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Total Contributions (₹)</div>
                 </div>
              </div>
              
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={donationData}>
                       <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                       <Tooltip />
                       <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-50">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Methods</h4>
                    <div className="grid grid-cols-3 gap-4">
                       <MethodStat label="UPI" val="45%" color="bg-blue-500" />
                       <MethodStat label="Card" val="32%" color="bg-green-500" />
                       <MethodStat label="Bank" val="23%" color="bg-orange-500" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Utilization Index</p>
                       <p className="text-xl font-black text-[#0f172a]">High Efficiency</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin flex items-center justify-center">
                       <CheckCircle2 size={18} className="text-green-500" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Top Campaigns Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Top Campaigns</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="flex-1 space-y-6">
                 {topCampaigns.map(c => (
                    <div key={c.name} className="space-y-3 group cursor-pointer">
                       <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{c.name}</p>
                          <span className="text-[10px] font-black text-green-600">{c.raised}</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
                       </div>
                       <div className="flex items-center justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          <span>Target: {c.target}</span>
                          <span className="text-blue-600">75% Complete</span>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-4 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
                 Launch New Campaign
              </button>
           </div>
        </div>

        {/* Recent Contributions Table */}
        <div className="col-span-12">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recent Contributions</h3>
                 <div className="flex gap-4">
                    <button className="px-5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest">Download Receipt</button>
                    <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Audit Full History</button>
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Donor Name</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Campaign</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Time</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {recentDonations.map((d, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black">
                                   {d.donor.slice(0, 1)}
                                </div>
                                <span className="text-xs font-black text-[#0f172a] uppercase">{d.donor}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.campaign}</td>
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a]">{d.amount}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase">{d.method}</td>
                          <td className="px-8 py-5">
                             <span className="text-[8px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase">Verified</span>
                          </td>
                          <td className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase">{d.date}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function DonationStat({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
         <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
      </div>
      <h4 className="text-3xl font-black text-[#0f172a]">{value}</h4>
      <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function MethodStat({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div className="text-center">
       <p className="text-[8px] font-black text-gray-400 uppercase mb-2">{label}</p>
       <div className={`h-1 rounded-full ${color} mb-1`} style={{ width: val }}></div>
       <p className="text-[10px] font-black text-[#0f172a]">{val}</p>
    </div>
  );
}

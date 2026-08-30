'use client';

import React from 'react';
import { 
  Home, Navigation, Search, 
  Filter, CheckCircle2, 
  AlertTriangle, Phone, Globe,
  Heart, Navigation2
} from 'lucide-react';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Safe Zones Map...</div> 
});

const shelters = [
  { name: 'SMS Stadium Shelter', distance: '1.2 km', capacity: '450 / 500', status: 'Available Now', type: 'Stadium' },
  { name: 'Govt. Sr. Sec. School', distance: '2.5 km', capacity: '120 / 300', status: 'Available Now', type: 'School' },
  { name: 'Community Hall, Mansarovar', distance: '3.8 km', capacity: '85 / 150', status: 'Available Now', type: 'Hall' },
  { name: 'JGDRI Relief Camp', distance: '4.8 km', capacity: '1850 / 2000', status: 'Near Full', type: 'Relief Camp' },
  { name: 'Bani Park School', distance: '5.2 km', capacity: '200 / 200', status: 'Full', type: 'School' },
];

export default function CitizenSheltersPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/20">
             <Home size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Find Shelters & Safe Zones</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nearby Shelters • Real-time Occupancy</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
           Back to Dashboard
        </button>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Shelter List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="p-8 border-b border-gray-100 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                         type="text" 
                         placeholder="Search by area or name..." 
                         className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none"
                       />
                    </div>
                    <button className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600">
                       <Filter size={18} />
                    </button>
                 </div>
                 
                 <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">All</button>
                    <button className="flex-1 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100">Medical</button>
                    <button className="flex-1 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100">Food Only</button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                 {shelters.map((s, i) => (
                    <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{s.name}</h4>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.type} • {s.distance}</p>
                          </div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                             s.status === 'Available Now' ? 'bg-green-100 text-green-600' : 
                             s.status === 'Near Full' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                          }`}>{s.status}</span>
                       </div>
                       
                       <div className="space-y-3">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                             <span className="text-gray-400">Occupancy</span>
                             <span className="text-[#0f172a]">{s.capacity}</span>
                          </div>
                          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                             <div className={`h-full ${
                                s.status === 'Available Now' ? 'bg-green-500' : 
                                s.status === 'Near Full' ? 'bg-orange-500' : 'bg-red-500'
                             }`} style={{ width: '80%' }}></div>
                          </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex gap-2">
                             <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Phone size={12} /></button>
                             <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Share2 size={12} /></button>
                          </div>
                          <button className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                             Get Directions <Navigation2 size={12} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Map View */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Safe Zones Map</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <LegendItem color="bg-green-500" label="Available" />
                    <LegendItem color="bg-orange-500" label="Near Full" />
                    <LegendItem color="bg-red-500" label="Full" />
                    <LegendItem color="bg-blue-600" label="You are here" />
                 </div>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
              </div>

              {/* Bottom Info Bar */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-8">
                    <FacilityInfo icon={<CheckCircle2 size={16} className="text-green-500" />} label="Power Available" />
                    <FacilityInfo icon={<Heart size={16} className="text-red-500" />} label="Medical Unit" />
                    <FacilityInfo icon={<Globe size={16} className="text-blue-500" />} label="WiFi Zones" />
                    <FacilityInfo icon={<AlertTriangle size={16} className="text-orange-500" />} label="Hazard Nearby" />
                 </div>
                 <button className="px-6 py-2.5 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Switch to List View
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
       <div className={`w-2 h-2 rounded-full ${color}`}></div>
       <span>{label}</span>
    </div>
  );
}

function FacilityInfo({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
       {icon}
       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function Share2({ size, className }: { size?: number; className?: string }) {
  return <Navigation size={size} className={className} />;
}

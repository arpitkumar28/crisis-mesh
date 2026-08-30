'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, MapPin, 
  Info, Droplets,
  Flame, Zap, Activity, Clock,
  Upload
} from 'lucide-react';

const hazardTypes = [
  { id: 'flood', label: 'Flood', icon: <Droplets size={20} /> },
  { id: 'fire', label: 'Fire', icon: <Flame size={20} /> },
  { id: 'storm', label: 'Storm', icon: <Zap size={20} /> },
  { id: 'earthquake', label: 'Earthquake', icon: <Activity size={20} /> },
  { id: 'accident', label: 'Accident', icon: <AlertTriangle size={20} /> },
  { id: 'other', label: 'Other', icon: <Info size={20} /> },
];

const previousReports = [
  { id: 'REP-042', time: 'Today, 02:15 PM', type: 'Flood', status: 'In Review', location: 'Mansarovar' },
  { id: 'REP-038', time: 'Yesterday, 10:30 AM', type: 'Traffic', status: 'Resolved', location: 'City Center' },
  { id: 'REP-035', time: '23 Aug, 04:45 PM', type: 'Other', status: 'Dismissed', location: 'Vaishali Nagar' },
];

export default function IncidentReportingPage() {
  const [selectedHazard, setSelectedHazard] = useState('flood');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
             <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Report Incident</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Community Reporting • Emergency Response</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
           Back to Dashboard
        </button>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Report Form */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight mb-8">Incident Details</h3>
              
              <div className="space-y-8">
                 {/* Hazard Selection */}
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Select Incident Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                       {hazardTypes.map(h => (
                          <button 
                            key={h.id}
                            onClick={() => setSelectedHazard(h.id)}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                               selectedHazard === h.id 
                                 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                 : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'
                            }`}
                          >
                             {h.icon}
                             <span className="text-[9px] font-black uppercase tracking-widest">{h.label}</span>
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Location */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Incident Location</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                       <input 
                         type="text" 
                         placeholder="Fetching current location..." 
                         className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                       />
                       <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Use Map</button>
                    </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Description</label>
                    <textarea 
                      placeholder="Provide more details about the situation..." 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none h-32"
                    ></textarea>
                 </div>

                 {/* Media Upload */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Upload Photos / Video (Optional)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <button className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-200 hover:text-blue-600 transition-all">
                          <Upload size={24} />
                          <span className="text-[8px] font-black uppercase">Upload</span>
                       </button>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                       <Info size={16} />
                       <p className="text-[9px] font-bold uppercase tracking-widest">False reporting is a punishable offense</p>
                    </div>
                    <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                       Submit Report
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-blue-400">Reporting Tips</h3>
              <div className="space-y-6">
                 <Step text="Be clear and concise with your description." />
                 <Step text="Upload photos if safe to do so." />
                 <Step text="Check if the incident is already reported." />
                 <Step text="Stay safe and move to a secure location." />
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">My Reports</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="space-y-6">
                 {previousReports.map(rep => (
                    <div key={rep.id} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100 group-hover:bg-white transition-all">
                             <Clock size={20} />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{rep.type} - {rep.location}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase">{rep.time}</p>
                          </div>
                       </div>
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          rep.status === 'Resolved' ? 'bg-green-100 text-green-600' : 
                          rep.status === 'In Review' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                       }`}>{rep.status}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="flex gap-4">
       <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{text}</p>
    </div>
  );
}

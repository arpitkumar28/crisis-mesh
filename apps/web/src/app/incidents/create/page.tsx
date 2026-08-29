'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, MapPin, Shield, Users, 
  ChevronRight, Calendar, Clock, Info,
  Camera, Plus, Search, CheckCircle2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function IncidentCreation() {
  const [step, setStep] = useState(1);

  return (
    <OperationsShell eyebrow="Register and create new incident" title="Incident Creation">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">AK</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Step Indicator */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-4">
              <StepItem number={1} label="Incident Details" active={step === 1} completed={step > 1} />
              <StepItem number={2} label="Location" active={step === 2} completed={step > 2} />
              <StepItem number={3} label="Impact & Severity" active={step === 3} completed={step > 3} />
              <StepItem number={4} label="Resources Needed" active={step === 4} completed={step > 4} />
              <StepItem number={5} label="Review & Create" active={step === 5} completed={step > 5} />
           </div>
        </div>

        {/* Right: Form Content */}
        <div className="col-span-12 lg:col-span-9">
           <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Incident Details</h3>
              
              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Incident Type</label>
                       <div className="relative">
                          <select className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none">
                             <option>Flood</option>
                             <option>Fire</option>
                             <option>Earthquake</option>
                          </select>
                          <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Incident Title</label>
                       <input 
                         type="text" 
                         defaultValue="Flash Flood in Mahapura Area"
                         className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Date & Time</label>
                       <div className="relative">
                          <Calendar size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" defaultValue="25 Aug 2025, 09:45 AM" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a]" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Control Room</label>
                       <div className="relative">
                          <select className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none">
                             <option>Jaipur South HQ</option>
                             <option>Jaipur North HQ</option>
                          </select>
                          <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initial Report</label>
                    </div>
                    <textarea 
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none resize-none"
                      defaultValue="Flash flood reported near Mahapura due to heavy overnight rainfall. Several low-lying areas are inundated."
                    />
                 </div>
              </div>

              <div className="mt-12 flex items-center justify-end gap-4">
                 <button className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Cancel</button>
                 <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2">
                    Next: Location <ChevronRight size={16} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function StepItem({ number, label, active = false, completed = false }: { number: number; label: string; active?: boolean; completed?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
         completed ? 'bg-blue-600 border-blue-600 text-white' : 
         active ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-300'
       }`}>
          {completed ? <CheckCircle2 size={12} /> : number}
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

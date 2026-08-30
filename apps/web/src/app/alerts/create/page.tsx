'use client';

import React from 'react';
import { 
  CheckCircle2, ChevronRight, Calendar
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function AlertCreation() {
  const step: number = 1;

  return (
    <OperationsShell eyebrow="Create and publish new alerts" title="Alert Creation">
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
              <StepItem number={1} label="Alert Details" active={step === 1} completed={step > 1} />
              <StepItem number={2} label="Target Area" active={step === 2} completed={step > 2} />
              <StepItem number={3} label="Severity & Type" active={step === 3} completed={step > 3} />
              <StepItem number={4} label="Message" active={step === 4} completed={step > 4} />
              <StepItem number={5} label="Review & Publish" active={step === 5} completed={step > 5} />
           </div>
        </div>

        {/* Right: Form Content */}
        <div className="col-span-12 lg:col-span-9">
           <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Alert Details</h3>
              
              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alert Title</label>
                    <input 
                      type="text" 
                      defaultValue="Heavy Rainfall Alert in Jaipur District"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alert Type</label>
                       <div className="relative">
                          <select className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none">
                             <option>Weather Alert</option>
                             <option>Flood Alert</option>
                             <option>System Alert</option>
                          </select>
                          <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Source</label>
                       <div className="relative">
                          <select className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none">
                             <option>India Meteorological Department (IMD)</option>
                             <option>CrisisMesh Sensor Network</option>
                          </select>
                          <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Time</label>
                       <div className="relative">
                          <Calendar size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" defaultValue="25 Aug 2025, 10:00 AM" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a]" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">End Time</label>
                       <div className="relative">
                          <Calendar size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" defaultValue="26 Aug 2025, 10:00 AM" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a]" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                       <span className="text-[8px] font-black text-gray-300 uppercase">154/500</span>
                    </div>
                    <textarea 
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                      defaultValue="Heavy rainfall expected in Jaipur district and surrounding areas. Citizens are advised to stay indoors and avoid waterlogged areas."
                    />
                 </div>
              </div>

              <div className="mt-12 flex items-center justify-end gap-4">
                 <button className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Save as Draft</button>
                 <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2">
                    Next: Target Area <ChevronRight size={16} />
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

'use client';

import React, { useState } from 'react';
import {
  ShieldCheck, Search, Play, CheckCircle2,
  AlertTriangle, XCircle, Briefcase, Droplets,
  Flame, Zap, Wind, Thermometer,
  ChevronRight, ArrowRight, Video, FileText, Phone, Activity
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function SafetyPage() {
  const [activeHazard, setActiveHazard] = useState('Flood');

  const hazards = [
    { id: 'Flood', icon: <Droplets size={18} /> },
    { id: 'Cyclone', icon: <Wind size={18} /> },
    { id: 'Heat Wave', icon: <Thermometer size={18} /> },
    { id: 'Earthquake', icon: <Activity size={18} /> },
    { id: 'Lightning', icon: <Zap size={18} /> },
    { id: 'Drought', icon: <SunIcon /> },
    { id: 'Landslide', icon: <MountainIcon /> },
    { id: 'Fire', icon: <Flame size={18} /> },
  ];

  return (
    <OperationsShell eyebrow="Stay safe with official guidelines and information" title="Safety & Guidance">
      {/* Hazard Tabs (Screen 7 Style) */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {hazards.map(h => (
          <button
            key={h.id}
            onClick={() => setActiveHazard(h.id)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0 shadow-sm ${
              activeHazard === h.id
                ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-lg shadow-blue-500/20'
                : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            {h.icon}
            {h.id}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Content - Do's and Don'ts (Screen 7 Style) */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Do's Section */}
             <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 -skew-x-12 translate-x-16 -translate-y-16 pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-black text-[#0f172a] uppercase tracking-[0.2em] text-sm">Do&apos;s</h3>
                </div>
                <div className="space-y-6">
                   <SafetyItem text="Move to higher ground immediately." />
                   <SafetyItem text="Do not wait to enter through low grounds." />
                   <SafetyItem text="Follow evacuation routes strictly." />
                   <SafetyItem text="Store extra food and medicine in waterproof containers." />
                   <SafetyItem text="Switch off electricity in case of flooding." />
                   <SafetyItem text="Keep emergency kit and important documents ready." />
                </div>
             </div>

             {/* Don'ts Section */}
             <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 -skew-x-12 translate-x-16 -translate-y-16 pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm">
                    <XCircle size={24} />
                  </div>
                  <h3 className="font-black text-[#0f172a] uppercase tracking-[0.2em] text-sm">Don&apos;ts</h3>
                </div>
                <div className="space-y-6">
                   <SafetyItem type="dont" text="Do not enter flood water alone." />
                   <SafetyItem type="dont" text="Do not walk or drive through flood waters." />
                   <SafetyItem type="dont" text="Do not return to flood areas until safe." />
                   <SafetyItem type="dont" text="Do not use mobile phones unless necessary." />
                   <SafetyItem type="dont" text="Do not drink water from tap during flooding." />
                   <SafetyItem type="dont" text="Do not eat food which was in contact with water." />
                </div>
             </div>
          </div>

          {/* Emergency Kit Checklist (Screen 7 Style) */}
          <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
            <h3 className="font-black text-[#0f172a] uppercase tracking-[0.2em] text-sm mb-10 text-center">Emergency Kit Checklist</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
               <KitItem icon={<Droplets size={28} />} label="Water" />
               <KitItem icon={<FoodIcon />} label="Food" />
               <KitItem icon={<Briefcase size={28} />} label="First Aid" />
               <KitItem icon={<Zap size={28} />} label="Torch" />
               <KitItem icon={<RadioIcon />} label="Radio" />
               <KitItem icon={<FileText size={28} />} label="Documents" />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Videos & Additional Info (Screen 7 Style) */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Watch Safety Videos</h3>
               <a href="#" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</a>
             </div>

             <div className="space-y-6">
                <VideoCard
                  title="Flash Flood Safety Tips"
                  thumbnail="https://images.unsplash.com/photo-1545048702-793e24bb1c33?auto=format&fit=crop&q=80&w=600"
                  duration="4:25"
                />
                <VideoCard
                  title="How to Pack Emergency Kit"
                  thumbnail="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=600"
                  duration="12:10"
                />
             </div>
          </div>

          {/* Emergency Hotline Card (Screen 7 Style) */}
          <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
              <Phone size={28} />
            </div>
            <h3 className="text-xl font-black mb-3 tracking-tight">Emergency Help</h3>
            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8">
              If you are in immediate danger, contact our 24/7 disaster response hotline.
            </p>
            <div className="text-3xl font-black text-white mb-8 tracking-tighter">0141-2456000</div>
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
               Find Responders <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function SafetyItem({ text, type = 'do' }: { text: string; type?: 'do' | 'dont' }) {
  return (
    <div className="flex gap-4 group">
      <div className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${type === 'do' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
      <p className="text-[11px] font-black text-gray-500 leading-relaxed group-hover:text-[#0f172a] transition-colors uppercase tracking-tight">{text}</p>
    </div>
  );
}

function KitItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-[28px] border border-gray-100 group hover:border-blue-500 hover:bg-white transition-all cursor-pointer shadow-sm">
      <div className="text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#0f172a]">{label}</span>
    </div>
  );
}

function VideoCard({ title, thumbnail, duration }: { title: string; thumbnail: string; duration: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video rounded-[24px] overflow-hidden mb-3 border border-gray-100 shadow-sm">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-[#061a37]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-2xl scale-75 group-hover:scale-100 transition-all">
             <Play size={24} className="ml-1" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-[#061a37]/90 text-white text-[9px] font-black rounded-lg uppercase tracking-widest backdrop-blur-sm">
          {duration}
        </div>
      </div>
      <h4 className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{title}</h4>
    </div>
  );
}

function SunIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>;
}

function MountainIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg>;
}

function RadioIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="8" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/><path d="M2 12h20"/><path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/></svg>;
}

function FoodIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1 y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>;
}

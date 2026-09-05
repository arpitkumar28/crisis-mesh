'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, CheckCircle2, AlertTriangle,
  Droplets, Flame, Wind,
  Thermometer,
  Activity, Download
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'flood', label: 'Flood', icon: <Droplets size={16} /> },
  { id: 'cyclone', label: 'Cyclone', icon: <Wind size={16} /> },
  { id: 'earthquake', label: 'Earthquake', icon: <Activity size={16} /> },
  { id: 'fire', label: 'Fire', icon: <Flame size={16} /> },
  { id: 'heatwave', label: 'Heatwave', icon: <Thermometer size={16} /> },
  { id: 'general', label: 'General' },
];

const safetyCards = [
  {
    category: 'flood',
    title: 'During Floods',
    icon: <Droplets className="text-blue-500" />,
    dos: ['Move to higher ground.', 'Switch off electricity.', 'Avoid walking in flood water.'],
    donts: ['Do not touch electric poles.', 'Do not drive in flooded areas.'],
  },
  {
    category: 'cyclone',
    title: 'During Cyclone',
    icon: <Wind className="text-cyan-500" />,
    dos: ['Stay indoors.', 'Keep windows & doors shut.', 'Listen for official updates.'],
    donts: ['Do not go near windows.', 'Do not ignore official warnings.'],
  },
  {
    category: 'earthquake',
    title: 'During Earthquakes',
    icon: <Activity className="text-orange-500" />,
    dos: ['Drop, Cover, Hold on.', 'Stay away from glass/windows.', 'Move to an open area if outside.'],
    donts: ['Do not use elevators.', 'Do not run outside during shaking.'],
  },
  {
    category: 'fire',
    title: 'During Fires',
    icon: <Flame className="text-red-500" />,
    dos: ['Get out, stay out.', 'Stay low to the floor.', 'Stop, Drop, and Roll if on fire.'],
    donts: ['Do not use elevators.', 'Do not go back inside for anything.'],
  },
  {
    category: 'heatwave',
    title: 'Heatwave Safety',
    icon: <Thermometer className="text-yellow-600" />,
    dos: ['Drink plenty of water.', 'Wear light clothing.', 'Stay in shaded/cool areas.'],
    donts: ['Avoid high-protein food.', 'Avoid strenuous activity at peak hours.'],
  },
  {
    category: 'general',
    title: 'General Safety',
    icon: <ShieldCheck className="text-green-500" />,
    dos: ['Keep emergency kit ready.', 'Stay informed.', 'Help others in need.'],
    donts: ['Do not spread rumors.', 'Do not panic during emergency.'],
  },
];

const initialChecklist = [
  { label: 'Drinking Water', checked: true },
  { label: 'Dry Food', checked: true },
  { label: 'First Aid Kit', checked: true },
  { label: 'Torch', checked: true },
  { label: 'Battery', checked: true },
  { label: 'Cash & ID', checked: false },
  { label: 'Power Bank', checked: false },
  { label: 'Documents', checked: false },
  { label: 'Whistle', checked: false },
];

export default function SafetyTipsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [checklist, setChecklist] = useState(initialChecklist);
  const router = useRouter();

  const visibleCards =
    activeTab === 'all' ? safetyCards : safetyCards.filter((c) => c.category === activeTab);

  const toggleChecklistItem = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)),
    );
  };

  const downloadChecklist = () => {
    const lines = checklist.map((item) => `[${item.checked ? 'x' : ' '}] ${item.label}`).join('\n');
    const blob = new Blob([`CrisisMesh Emergency Kit Checklist\n\n${lines}\n`], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emergency-kit-checklist.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
             <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Safety Tips & Guidelines</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stay Informed • Stay Safe during disasters</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/citizen')}
          className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
           Back to Dashboard
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0 shadow-sm ${
              activeTab === cat.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleCards.map((card) => (
                <SafetyCard key={card.category} title={card.title} icon={card.icon} dos={card.dos} donts={card.donts} />
              ))}
           </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8 text-center">Emergency Kit Checklist</h3>
              <div className="space-y-4">
                 {checklist.map((item, i) => (
                   <CheckItem key={item.label} label={item.label} checked={item.checked} onToggle={() => toggleChecklistItem(i)} />
                 ))}
              </div>
              <button
                onClick={downloadChecklist}
                className="w-full mt-8 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                 <Download size={14} /> Download Checklist
              </button>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center">
                    <AlertTriangle size={20} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Important</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6 uppercase tracking-widest">
                 In case of emergency, call 1070 or use SOS button for immediate assistance.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function SafetyCard({ title, icon, dos, donts }: { title: string; icon: React.ReactNode; dos: string[]; donts: string[] }) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm flex flex-col hover:shadow-md transition-all">
       <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
             {icon}
          </div>
          <h3 className="font-black text-[#0f172a] uppercase tracking-tight text-sm">{title}</h3>
       </div>

       <div className="flex-1 space-y-6">
          <div>
             <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-3">Do&apos;s</p>
             <ul className="space-y-2">
                {dos.map((item, i) => (
                   <li key={i} className="flex gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                      <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                      {item}
                   </li>
                ))}
             </ul>
          </div>
          <div>
             <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">Don&apos;ts</p>
             <ul className="space-y-2">
                {donts.map((item, i) => (
                   <li key={i} className="flex gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                      <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                      {item}
                   </li>
                ))}
             </ul>
          </div>
       </div>
    </div>
  );
}

function CheckItem({ label, checked = false, onToggle }: { label: string; checked?: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-3 group cursor-pointer w-full text-left">
       <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-transparent group-hover:border-blue-400'
       }`}>
          <CheckCircle2 size={12} strokeWidth={3} />
       </div>
       <span className={`text-[10px] font-black uppercase tracking-widest ${checked ? 'text-[#0f172a]' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}

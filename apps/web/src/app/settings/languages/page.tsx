'use client';

import React, { useState } from 'react';
import { 
  Globe, Languages, MessageSquare, Megaphone, 
  ChevronRight, Save, Shield, Info, Globe2,
  CheckCircle2, AlertTriangle, Radio, Play,
  BarChart3, Plus, Search, Filter
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const languageStats = [
  { name: 'Hindi', value: 42, color: '#3b82f6' },
  { name: 'English', value: 30, color: '#10b981' },
  { name: 'Rajasthani', value: 15, color: '#f59e0b' },
  { name: 'Gujarati', value: 8, color: '#06b6d4' },
  { name: 'Others', value: 5, color: '#94a3b8' },
];

const announcements = [
  { id: 1, lang: 'Hindi', text: 'भारी वर्षा की चेतावनी: अगले 24 घंटों में जयपुर में भारी वर्षा की संभावना है। कृपया सुरक्षित स्थानों पर रहें।', date: '25 Aug, 10:24 AM', status: 'Published' },
  { id: 2, lang: 'English', text: 'Heavy Rainfall Warning: Jaipur district expects heavy rainfall in the next 24 hours. Please stay safe.', date: '25 Aug, 10:24 AM', status: 'Published' },
  { id: 3, lang: 'Rajasthani', text: 'घणी बरसा री चेतावनी: जयपुर मांय अगलै २४ घंटां मांय घणी बरसा हो सकै है। आप सुरक्षित रैवो।', date: '25 Aug, 10:24 AM', status: 'Draft' },
];

export default function MultiLanguageSupportPage() {
  const [preferredLang, setPreferredLang] = useState('English');

  return (
    <OperationsShell eyebrow="Manage multi-language support and public announcements" title="Multi-Language Support">
      <div className="grid grid-cols-12 gap-8">
        {/* Language Selection & Translation */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Preferred Language</h3>
              <div className="space-y-4">
                 <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">System Default</label>
                    <select 
                      value={preferredLang}
                      onChange={(e) => setPreferredLang(e.target.value)}
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none"
                    >
                       <option>English</option>
                       <option>Hindi</option>
                       <option>Rajasthani</option>
                       <option>Gujarati</option>
                    </select>
                 </div>
                 
                 <div className="pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Supported Languages</p>
                    <div className="flex flex-wrap gap-2">
                       {['English', 'Hindi', 'Rajasthani', 'Gujarati', 'Bengali', 'Tamil'].map(l => (
                          <span key={l} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{l}</span>
                       ))}
                       <button className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest">+ Add</button>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                 Save Language Settings
              </button>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                 <Globe2 size={20} className="text-blue-400" />
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Instant Translation</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">Translate alerts into local dialects using our AI-driven translation engine.</p>
              <textarea placeholder="Type an alert message to translate..." className="w-full h-32 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none mb-6"></textarea>
              <div className="flex gap-2">
                 <button className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">Auto Detect</button>
                 <button className="flex-1 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Translate</button>
              </div>
           </div>
        </div>

        {/* Public Announcements */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Public Announcements</h3>
                 <button className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10">
                    <Megaphone size={16} /> New Announcement
                 </button>
              </div>
              
              <div className="p-8 bg-blue-50/50 border-b border-gray-100">
                 <div className="flex gap-3 mb-6">
                    {['Hindi', 'English', 'Rajasthani'].map(l => (
                       <button key={l} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${l === 'Hindi' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-400'}`}>
                          {l}
                       </button>
                    ))}
                 </div>
                 <div className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-sm relative group">
                    <h2 className="text-3xl font-black text-[#0f172a] leading-tight mb-4">भारी वर्षा की चेतावनी</h2>
                    <p className="text-lg font-bold text-gray-600 leading-relaxed">
                       जयपुर, राजस्थान: अगले 24 घंटों में भारी वर्षा की संभावना है। नागरिक सतर्क रहें और सुरक्षित स्थानों पर रहें।
                    </p>
                    <button className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                       <Play size={20} className="ml-1" />
                    </button>
                 </div>
              </div>

              <div className="divide-y divide-gray-50">
                 {announcements.map(ann => (
                    <div key={ann.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-all text-blue-600">
                             <Languages size={18} />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{ann.lang}</p>
                             <h4 className="text-xs font-black text-[#0f172a] uppercase truncate max-w-md">{ann.text}</h4>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                             ann.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>{ann.status}</span>
                          <button className="text-gray-300 group-hover:text-blue-600 transition-colors">
                             <ChevronRight size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Language Analytics */}
           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Language Analytics <span className="text-gray-400 font-bold ml-2">(Public Reach)</span></h3>
                 <BarChart3 size={16} className="text-blue-500" />
              </div>
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={languageStats}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} />
                       <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {languageStats.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

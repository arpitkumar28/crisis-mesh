'use client';

import React from 'react';
import { 
  BookOpen, Search, Filter, ChevronRight, 
  FileText, Video, HelpCircle, Shield,
  Clock, Star, ExternalLink, Download,
  Play, Book, MessageSquare, Info
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const categories = [
  { icon: <Shield size={24} className="text-blue-500" />, title: 'SOPs & Guidelines', count: 42 },
  { icon: <Activity size={24} className="text-red-500" />, title: 'Emergency Response', count: 28 },
  { icon: <Cpu size={24} className="text-orange-500" />, title: 'Technical Docs', count: 56 },
  { icon: <GraduationCap size={24} className="text-purple-500" />, title: 'Training Materials', count: 18 },
  { icon: <Scale size={24} className="text-green-500" />, title: 'Policies', count: 12 },
  { icon: <HelpCircle size={24} className="text-gray-500" />, title: 'FAQs', count: 124 },
];

const popularArticles = [
  { title: 'Flood Response Protocol v2.1', views: '2.4k', time: '5 min read' },
  { title: 'Emergency Contact Directory', views: '1.8k', time: '2 min read' },
  { title: 'Food Safety Guidelines', views: '1.2k', time: '10 min read' },
  { title: 'Evacuation SOP', views: '950', time: '15 min read' },
];

const recentlyAdded = [
  { title: 'Drone Operations Manual', type: 'Technical Doc', date: '25 Aug 2026' },
  { title: 'Incident Reporting via Mobile App', type: 'Guide', date: '24 Aug 2026' },
  { title: 'First Aid during Disasters', type: 'Training Material', date: '22 Aug 2026' },
  { title: 'Communication Protocols', type: 'Policy', date: '20 Aug 2026' },
];

export default function KnowledgeBasePage() {
  return (
    <OperationsShell eyebrow="Guidelines, SOPs and documentation" title="Knowledge Base">
      {/* Search Header */}
      <div className="bg-[#061a37] rounded-[40px] p-12 text-center text-white mb-12 relative overflow-hidden shadow-2xl shadow-blue-900/20">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
         <h2 className="text-3xl font-black mb-8 relative z-10">What are you looking for?</h2>
         <div className="max-w-2xl mx-auto relative z-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search SOPs, technical manuals, and guides..." 
              className="w-full pl-16 pr-6 py-5 bg-white/10 border border-white/10 rounded-[24px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
            />
         </div>
         <div className="mt-8 flex justify-center gap-4 relative z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trending:</span>
            {['#FloodSOP', '#ReliefGuide', '#ResponderTraining'].map(tag => (
               <button key={tag} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline">{tag}</button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Categories Grid */}
        <div className="col-span-12 lg:col-span-8">
           <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Browse by Category</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => (
                 <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                       {cat.icon}
                    </div>
                    <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{cat.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.count} Articles</p>
                 </div>
              ))}
           </div>

           <div className="mt-12 bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recently Added</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All Docs</button>
              </div>
              <div className="space-y-6">
                 {recentlyAdded.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                             <FileText size={18} />
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                             <p className="text-[9px] font-bold text-gray-400 uppercase">{doc.type} • {doc.date}</p>
                          </div>
                       </div>
                       <Download size={16} className="text-gray-300 group-hover:text-blue-600 transition-all" />
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Popular Articles</h3>
              <div className="space-y-6">
                 {popularArticles.map((art, i) => (
                    <div key={i} className="group cursor-pointer">
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-2">{art.title}</h4>
                       <div className="flex items-center gap-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500" /> {art.views} views</span>
                          <span>•</span>
                          <span>{art.time}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <h3 className="text-xl font-black mb-4 tracking-tight">Need Help?</h3>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8 uppercase tracking-widest">
                 Can&apos;t find what you&apos;re looking for? Ask our support team.
              </p>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                 Contact Support
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function Activity({ size, className }: { size?: number; className?: string }) {
  return <Info size={size} className={className} />;
}

function Cpu({ size, className }: { size?: number; className?: string }) {
  return <Shield size={size} className={className} />;
}

function GraduationCap({ size, className }: { size?: number; className?: string }) {
  return <BookOpen size={size} className={className} />;
}

function Scale({ size, className }: { size?: number; className?: string }) {
  return <Book size={size} className={className} />;
}

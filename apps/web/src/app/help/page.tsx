'use client';

import React from 'react';
import { 
  HelpCircle, Search, Book, User, Bell, 
  Activity, FileText, Settings, Mail, 
  PhoneCall, Ticket, ExternalLink, ChevronRight,
  ShieldCheck, Globe, Lock, Cpu
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const categories = [
  { icon: <Book className="text-blue-500" />, title: 'Getting Started', desc: 'Learn the basics of using the CrisisMesh platform.' },
  { icon: <User className="text-purple-500" />, title: 'Account & Access', desc: 'Manage your account and permissions.' },
  { icon: <Bell className="text-red-500" />, title: 'Incidents & Alerts', desc: 'Work with incidents and alerts.' },
  { icon: <Cpu className="text-orange-500" />, title: 'Sensors & Data', desc: 'Understand sensor data and usage.' },
  { icon: <FileText className="text-green-500" />, title: 'Reports & Analytics', desc: 'Generate and export reports.' },
  { icon: <Settings className="text-gray-500" />, title: 'Troubleshooting', desc: 'Find solutions to common issues.' },
];

export default function HelpSupportPage() {
  return (
    <OperationsShell eyebrow="How can we help you today?" title="Help & Support">
      {/* Search Section */}
      <div className="bg-[#061a37] rounded-[40px] p-12 text-center text-white mb-12 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
        <h2 className="text-3xl font-black mb-8 relative z-10">Search our knowledge base</h2>
        <div className="max-w-2xl mx-auto relative z-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for articles, guides, and tutorials..." 
            className="w-full pl-16 pr-6 py-5 bg-white/10 border border-white/10 rounded-[24px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Browse by Category */}
        <div className="col-span-12 lg:col-span-8">
           <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Browse by Category</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all group cursor-pointer">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                      {cat.icon}
                   </div>
                   <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{cat.title}</h4>
                   <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{cat.desc}</p>
                </div>
              ))}
           </div>

           <div className="mt-12 bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Frequently Asked Questions</h3>
              <div className="space-y-6">
                 <FAQItem question="How do I register a new sensor node?" />
                 <FAQItem question="What are the different alert severity levels?" />
                 <FAQItem question="How can I export regional risk reports?" />
                 <FAQItem question="Can I integrate CrisisMesh with local sirens?" />
              </div>
              <button className="w-full mt-8 py-4 bg-gray-50 text-[10px] font-black text-blue-600 uppercase tracking-widest rounded-2xl hover:bg-blue-50 transition-all">View All FAQs</button>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           {/* Contact Support */}
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Contact Support</h3>
              <div className="space-y-6">
                 <ContactMethod 
                   icon={<Mail className="text-blue-600" />} 
                   label="Support Email" 
                   value="support@crisismesh.gov.in" 
                 />
                 <ContactMethod 
                   icon={<PhoneCall className="text-green-600" />} 
                   label="Support Helpline" 
                   value="+91 800-123-4567" 
                 />
                 <div className="pt-6 border-t border-gray-50">
                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                       <Ticket size={16} /> Raise a Ticket
                    </button>
                    <p className="text-[9px] font-bold text-gray-400 text-center mt-3 uppercase tracking-widest">Typical response time: 2 hours</p>
                 </div>
              </div>
           </div>

           {/* Quick Links */}
           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8">Quick Links</h3>
              <div className="space-y-4">
                 <QuickLink label="User Manual" />
                 <QuickLink label="API Documentation" />
                 <QuickLink label="Video Tutorials" />
                 <QuickLink label="Platform Status" />
                 <QuickLink label="Privacy Policy" />
                 <QuickLink label="Terms of Use" />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function FAQItem({ question }: { question: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
       <span className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{question}</span>
       <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
    </div>
  );
}

function ContactMethod({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
       <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-xs font-black text-[#0f172a]">{value}</p>
       </div>
    </div>
  );
}

function QuickLink({ label }: { label: string }) {
  return (
    <a href="#" className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
       {label}
       <ExternalLink size={12} className="opacity-30" />
    </a>
  );
}

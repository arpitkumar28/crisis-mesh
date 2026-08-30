'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import {
  Activity, Shield, Clock, FileText, Boxes,
  MessageSquare, Navigation, AlertTriangle,
  Settings, ChevronDown, Search, Bell, User,
  Menu, X
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const sidebarLinks = [
  { label: 'My Dashboard', href: '/responder', Icon: Activity },
  { label: 'Assignments', href: '/responder/assignments', Icon: Shield },
  { label: 'Check-in & Out', href: '/responder/check-in', Icon: Clock },
  { label: 'Work Reports', href: '/responder/reports', Icon: FileText },
  { label: 'Resources', href: '/responder/resources', Icon: Boxes },
  { label: 'Team Chat', href: '/responder/chat', Icon: MessageSquare, badge: 4 },
  { label: 'Navigation', href: '/responder/nav', Icon: Navigation },
  { label: 'SOS', href: '/responder/sos', Icon: AlertTriangle, color: 'text-red-500' },
  { label: 'Settings', href: '/responder/settings', Icon: Settings },
];

export function ResponderShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#f5f7fb] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#061a37] text-white flex flex-col shrink-0 shadow-2xl">
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white overflow-hidden">
                 <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">Team<span className="text-blue-500">Alpha</span></span>
           </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
           {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a 
                  key={link.label}
                  href={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.Icon size={18} className={link.color} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                       {link.badge}
                    </span>
                  )}
                </a>
              );
           })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#041226]">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black">TA</div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase">Team Alpha</p>
                 <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Active On-Field</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input type="text" placeholder="Search mission, incident..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-64 focus:outline-none" />
              </div>
           </div>
           <div className="flex items-center gap-6">
              <button className="relative text-gray-400 hover:text-[#0f172a]"><Bell size={20} /></button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                 <span className="text-[10px] font-black text-[#0f172a] uppercase">Mission HQ</span>
                 <div className="w-8 h-8 rounded-full bg-[#061a37] flex items-center justify-center text-white text-xs font-black">HQ</div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">{eyebrow}</p>
                <h1 className="text-4xl font-black text-[#0f172a] uppercase tracking-tighter leading-none">{title}</h1>
              </div>
              <div className="flex items-center gap-3">
                 <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600">Back to Base</button>
                 <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20">Report Status</button>
              </div>
           </div>
           {children}
        </div>
      </main>
    </div>
  );
}

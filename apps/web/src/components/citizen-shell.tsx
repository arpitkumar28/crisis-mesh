'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import {
  Activity, Map, Bell, AlertTriangle,
  Home, Phone, Settings,
  ChevronDown, Search, Globe, User,
  Menu, X, Shield, ShieldCheck
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const sidebarLinks = [
  { label: 'Dashboard', href: '/citizen', Icon: Activity },
  { label: 'Live Map', href: '/map', Icon: Map },
  { label: 'Alerts', href: '/alerts', Icon: Bell, badge: 6 },
  { label: 'Report Incident', href: '/citizen/report', Icon: AlertTriangle },
  { label: 'SOS', href: '/citizen/sos', Icon: Shield, color: 'text-red-500' },
  { label: 'Safety Tips', href: '/citizen/safety', Icon: ShieldCheck },
  { label: 'Shelters', href: '/citizen/shelters', Icon: Home },
  { label: 'Helplines', href: '/citizen/helplines', Icon: Phone },
  { label: 'Settings', href: '/citizen/settings', Icon: Settings },
];

export function CitizenShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#f5f7fb] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#061a37] text-white flex flex-col shrink-0 shadow-2xl z-50">
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white overflow-hidden">
                 <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">Citizen<span className="text-blue-500">View</span></span>
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
              <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center font-black">GV</div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase">Guest Visitor</p>
                 <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Jaipur, RJ</p>
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
                 <input type="text" placeholder="Search locations, hazards..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-64 focus:outline-none" />
              </div>
           </div>
           <div className="flex items-center gap-6">
              <button className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                 <Globe size={16} /> English <ChevronDown size={12} />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                 <button onClick={() => router.push('/login')} className="px-4 py-2 bg-[#061a37] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Login</button>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#f8fafc]">
           <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">{subtitle}</p>
                <h1 className="text-4xl font-black text-[#0f172a] uppercase tracking-tighter leading-none">{title}</h1>
              </div>
              <div className="flex items-center gap-3">
                 <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 animate-pulse">Emergency SOS</button>
              </div>
           </div>
           {children}
        </div>
      </main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

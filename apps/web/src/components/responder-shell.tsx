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
    <div className="flex h-screen overflow-hidden bg-[#eef4fb] text-[#0f172a]">
      <aside className="z-50 flex w-[240px] shrink-0 flex-col border-r border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(58,118,255,0.22),transparent_28%),linear-gradient(180deg,#091d3b_0%,#0d234b_100%)] text-white shadow-[8px_0_25px_rgba(10,20,40,0.12)]">
        <div className="border-b border-white/8 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
              <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={32} height={32} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-200">Team</div>
              <div className="text-lg font-black uppercase tracking-tighter">Alpha</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 custom-scrollbar">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0a57d6] to-[#1d6ef3] text-white shadow-[0_12px_20px_rgba(10,87,214,0.28)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.Icon size={17} className={link.color || 'text-slate-200'} />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]">{link.label}</span>
                </div>
                {link.badge && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-black text-white">
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="border-t border-white/8 bg-[#07162d] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black">TA</div>
            <div>
              <p className="text-[10px] font-black uppercase text-white">Team Alpha</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-green-300">Active On-Field</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search mission, incident..."
              className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 transition-colors hover:text-slate-700">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <span className="text-[10px] font-black uppercase text-slate-700">Mission HQ</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#061a37] text-xs font-black text-white">HQ</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 custom-scrollbar">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-blue-600">{eyebrow}</p>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">Back to Base</button>
              <button className="rounded-xl bg-red-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_25px_rgba(220,38,38,0.22)]">Report Status</button>
            </div>
          </div>
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.45); border-radius: 9999px; }
      `}</style>
    </div>
  );
}

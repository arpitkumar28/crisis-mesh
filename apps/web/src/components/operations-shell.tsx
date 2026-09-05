'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  Activity, Bell, Boxes, LogOut, Map, Radio, AlertTriangle,
  Building2, Cloud, FileText, Newspaper,
  Search, Globe, ChevronDown, MapPin, TrendingUp, Settings,
  Shield, History, User, Users, Lock, Database,
  Layers, MessageSquare, Truck, LifeBuoy, Info,
  HelpCircle, Smartphone, Terminal, Cpu, Zap, Wifi,
  ShieldAlert, RefreshCw, BarChart3, Eye, LayoutGrid,
  Video, GraduationCap, Heart, Languages, Star, Navigation,
  FileJson, Table, Share2, Megaphone, Globe2, BookOpen,
  Ticket, Wrench, Wallet, CreditCard, DollarSign,
  Filter, Download, MoreVertical, Layout, ZapOff, ShoppingCart,
  HardHat, ClipboardList, Menu, X
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { performLogout } from '@/lib/auth';

const sidebarLinks = [
  { label: 'Heatmap & Risk', href: '/dashboard', Icon: Activity },
  { label: 'Asset Management', href: '/resources', Icon: Boxes },
  { label: 'Env. Monitoring', href: '/sensors', Icon: Cloud },
  { label: 'Crowd Monitoring', href: '/crowd', Icon: Users },
  { label: 'Power & Connectivity', href: '/connectivity', Icon: Zap },
  { label: 'Supply Chain', href: '/logistics', Icon: ShoppingCart },
  { label: 'Disaster Assessment', href: '/reports', Icon: ClipboardList },
  { label: 'GIS Mapping', href: '/map', Icon: Map },
  { label: 'System Analytics', href: '/settings/system-health', Icon: BarChart3 },
  { label: 'Settings', href: '/settings', Icon: Settings },
] as const;

export function OperationsShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await performLogout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9]">
      {/* Top Navigation Bar - Dark Themed as per image */}
      <header className="h-14 bg-[#061a37] flex items-center justify-between px-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-lg lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <a href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg shadow-blue-500/20 overflow-hidden">
              <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tighter text-white leading-none">
                CRISIS<span className="text-blue-400">MESH</span>
              </span>
              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Resilience Platform</span>
            </div>
          </a>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search location, asset, sensor..."
            className="w-full pl-9 pr-4 py-1.5 bg-white/10 border border-white/10 rounded-md text-[11px] text-white focus:outline-none focus:bg-white/20 transition-all placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-3 pl-4 border-l border-white/10 group">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white leading-none uppercase">{user?.name || 'Signed out'}</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user?.role || '—'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
              {(user?.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop — mobile only, closes the drawer on tap outside it */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar — fixed off-canvas drawer below lg, static in-flow above it */}
        <aside
          className={`fixed inset-y-0 left-0 top-14 lg:top-0 w-[240px] lg:w-[200px] bg-[#061a37] text-white flex flex-col h-[calc(100vh-56px)] shrink-0 z-40 transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 lg:hidden">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menu</span>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded transition-all group ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
                  </div>
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
             <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-wider w-full">
                <Settings size={16} />
                <span>Settings</span>
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto overflow-x-hidden bg-[#f8fafc] custom-scrollbar">
          <div className="p-4 flex-1">
            {children}
          </div>
        </main>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

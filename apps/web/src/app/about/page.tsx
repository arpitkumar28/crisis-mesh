'use client';

import React from 'react';
import Image from 'next/image';
import {
  Shield, Users, Zap, Target, Eye,
  Heart, ArrowRight, ShieldCheck,
  Radio
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function AboutPage() {
  return (
    <OperationsShell eyebrow="Learn about our mission and technology" title="About CrisisMesh">
      <div className="grid grid-cols-12 gap-8">
        {/* Main Hero Section (Screen 9 Style) */}
        <div className="col-span-12 bg-[#061a37] rounded-[48px] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
           <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-blue-600/30 to-transparent"></div>
           </div>

           <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40 border border-blue-500 overflow-hidden">
                  <Image src="/brand/crisismesh-icon.png" alt="CrisisMesh" width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-blue-400">CrisisMesh Platform</span>
              </div>

              <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
                India&apos;s Integrated <br/>
                <span className="text-blue-500">Disaster Intel</span> Platform.
              </h2>

              <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12 max-w-xl">
                CrisisMesh is a production-grade disaster intelligence platform that
                combines official data, advanced AI, and IoT server
                networks to deliver real-time insights and empower
                communities and authorities to act faster.
              </p>

              <div className="flex flex-wrap gap-6">
                 <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20">
                    Explore Platform <ArrowRight size={18} />
                 </button>
                 <button className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs transition-all">
                    View Documentation
                 </button>
              </div>
           </div>

           {/* Illustration Placeholder (matches design) */}
           <div className="absolute right-12 bottom-0 w-[40%] h-[80%] hidden xl:block opacity-40">
              <div className="w-full h-full bg-gradient-to-t from-blue-600/20 to-transparent rounded-t-[100px] border-x border-t border-white/5 relative overflow-hidden">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-blue-500/50 animate-spin-slow mb-8"></div>
                    <Radio size={48} className="text-blue-500 animate-pulse" />
                 </div>
              </div>
           </div>
        </div>

        {/* Mission & Vision (Screen 9 Style) */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm relative overflow-hidden group hover:border-blue-500 transition-all">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                 <Target size={24} />
              </div>
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-[0.2em]">Our Mission</h3>
           </div>
           <p className="text-gray-500 font-bold leading-relaxed uppercase text-[11px] tracking-widest">
              To build a safer and more resilient India by
              providing accurate, real-time, and actionable
              disaster intelligence to every citizen and
              authority. We aim to reduce response times
              through technological innovation.
           </p>
        </div>

        <div className="col-span-12 lg:col-span-6 bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm relative overflow-hidden group hover:border-green-500 transition-all">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                 <Eye size={24} />
              </div>
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-[0.2em]">Our Vision</h3>
           </div>
           <p className="text-gray-500 font-bold leading-relaxed uppercase text-[11px] tracking-widest">
              A disaster-resilient India where technology
              and data empower every community to prepare,
              respond, and recover from any crisis with
              maximum coordination and efficiency.
           </p>
        </div>

        {/* Core Values (Screen 9 Style) */}
        <div className="col-span-12 pt-12">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12 text-center">Our Core Values</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <ValueItem title="Integrity & Transparency" icon={<Shield className="text-blue-500" />} />
              <ValueItem title="Innovation & Resilience" icon={<Zap className="text-orange-500" />} />
              <ValueItem title="Collaborative Trust" icon={<Users className="text-purple-500" />} />
              <ValueItem title="People First" icon={<Heart className="text-red-500" />} />
              <ValueItem title="Accountability" icon={<ShieldCheck className="text-green-500" />} />
           </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </OperationsShell>
  );
}

function ValueItem({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all text-center flex flex-col items-center group">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100 group-hover:scale-110 group-hover:bg-white transition-all overflow-hidden">
        {icon}
      </div>
      <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.15em] leading-tight">{title}</h4>
    </div>
  );
}

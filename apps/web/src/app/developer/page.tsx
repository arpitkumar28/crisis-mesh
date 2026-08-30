'use client';

import React from 'react';
import {
  Terminal, Globe, Zap, ShieldCheck, Database, Copy, ExternalLink
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const endpoints = [
  { method: 'GET', path: '/api/v1/alerts', desc: 'Get all active alerts' },
  { method: 'GET', path: '/api/v1/incidents', desc: 'Get live incident data' },
  { method: 'POST', path: '/api/v1/incidents', desc: 'Report a new incident' },
  { method: 'GET', path: '/api/v1/sensors', desc: 'Get sensor network status' },
  { method: 'GET', path: '/api/v1/weather', desc: 'Get current weather data' },
  { method: 'GET', path: '/api/v1/resources', desc: 'Get available resources' },
];

const partners = [
  { name: 'NDMA', logo: 'NDMA' },
  { name: 'IMD', logo: 'IMD' },
  { name: 'ISRO', logo: 'ISRO' },
  { name: 'Google', logo: 'Google' },
  { name: 'AWS', logo: 'AWS' },
  { name: 'NIC India', logo: 'NIC' },
];

export default function DeveloperPortal() {
  return (
    <OperationsShell eyebrow="Integrate CrisisMesh services with your systems and applications" title="API & Integrations">
      <div className="grid grid-cols-12 gap-8">
        {/* API Overview & Documentation */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-2">API Overview</h3>
                    <p className="text-xs font-bold text-gray-400">RESTful and WebSocket APIs for real-time data integration.</p>
                 </div>
                 <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                    View API Documentation
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                 <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm"><Globe size={20} /></div>
                    <div>
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">RESTful API</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Version v1.0 • Stable</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm"><Zap size={20} /></div>
                    <div>
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">Real-time Webhook</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Low-latency events</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-600 shadow-sm"><ShieldCheck size={20} /></div>
                    <div>
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">Secure & Scalable</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Auth & Rate Limited</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm"><Database size={20} /></div>
                    <div>
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">Comprehensive Data</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">JSON Format</p>
                    </div>
                 </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Popular Endpoints</h4>
                 <div className="bg-[#0f172a] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-white">
                       <thead>
                          <tr className="bg-white/5 border-b border-white/5">
                             <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Endpoint</th>
                             <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Method</th>
                             <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Description</th>
                             <th className="px-6 py-4 text-right"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {endpoints.map((ep, i) => (
                             <tr key={i} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 text-[11px] font-mono text-blue-400">{ep.path}</td>
                                <td className="px-6 py-4">
                                   <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                                      ep.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                   }`}>{ep.method}</span>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-gray-400">{ep.desc}</td>
                                <td className="px-6 py-4 text-right">
                                   <button className="text-gray-600 group-hover:text-white transition-colors"><Copy size={14} /></button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Integration Partners */}
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Integration Partners</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                 {partners.map(p => (
                    <div key={p.name} className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                       <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-xs text-gray-400 border border-gray-100">
                          {p.logo}
                       </div>
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{p.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Terminal size={20} />
                 </div>
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Quick Start</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 Get started with our API in minutes. Generate your API key from the dashboard and follow our implementation guide.
              </p>
              <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] text-blue-300 mb-8 border border-white/5">
                 <span className="text-gray-500">{/* # Install CrisisMesh SDK */}</span> <br />
                 npm install @crisismesh/sdk <br /><br />
                 <span className="text-gray-500">{/* // Initialize client */}</span> <br />
                 const cm = new CrisisMesh(&apos;API_KEY&apos;);
              </div>
              <button className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                 Generate API Key
              </button>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">System Status</h3>
              <div className="space-y-4">
                 <StatusItem label="API Services" status="Online" color="text-green-500" />
                 <StatusItem label="WebSocket" status="Online" color="text-green-500" />
                 <StatusItem label="MQTT Broker" status="Online" color="text-green-500" />
                 <StatusItem label="Data Processing" status="Operational" color="text-green-500" />
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                 <span className="text-[9px] font-black text-gray-400 uppercase">Uptime last 30 days</span>
                 <span className="text-[10px] font-black text-[#0f172a]">99.98%</span>
              </div>
           </div>
           
           <div className="bg-blue-50 rounded-[32px] border border-blue-100 p-8">
              <h3 className="font-black text-blue-600 uppercase tracking-wider text-xs mb-6">Help & Resources</h3>
              <div className="space-y-4">
                 <HelpLink label="API Reference" />
                 <HelpLink label="Webhooks Guide" />
                 <HelpLink label="SDK Downloads" />
                 <HelpLink label="Sample Code" />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function StatusItem({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
       <span className={`text-[10px] font-black uppercase ${color}`}>{status}</span>
    </div>
  );
}

function HelpLink({ label }: { label: string }) {
  return (
    <a href="#" className="flex items-center justify-between text-[10px] font-black text-blue-800/60 uppercase tracking-widest hover:text-blue-600 transition-colors">
       {label}
       <ExternalLink size={12} />
    </a>
  );
}

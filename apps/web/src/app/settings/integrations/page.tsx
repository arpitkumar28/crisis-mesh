'use client';

import React from 'react';
import { 
  Share2, Plus, Globe, Zap, MessageSquare, 
  Database, Twitter, Shield, CheckCircle2,
  AlertCircle, Clock, MoreHorizontal, ExternalLink,
  Key, RefreshCw, Mail, Smartphone
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const integrations = [
  { name: 'NDMA India', type: 'Government Feed', status: 'Connected', icon: <Globe className="text-blue-600" />, lastSync: '1 min ago' },
  { name: 'IMD Weather API', type: 'Meteorological', status: 'Connected', icon: <Zap className="text-orange-500" />, lastSync: '5 min ago' },
  { name: 'ISRO Bhuvan', type: 'Satellite Imagery', status: 'Connected', icon: <Globe className="text-green-600" />, lastSync: '12 min ago' },
  { name: 'Twitter Alerts', type: 'Social Feed', status: 'Disconnected', icon: <Twitter className="text-blue-400" />, lastSync: '2 hours ago' },
  { name: 'WhatsApp Business', type: 'Communication', status: 'Connected', icon: <MessageSquare className="text-green-500" />, lastSync: 'Just now' },
  { name: 'SMS Gateway', type: 'Notification', status: 'Connected', icon: <Smartphone className="text-blue-500" />, lastSync: '1 min ago' },
  { name: 'Email Service', type: 'Communication', status: 'Connected', icon: <Mail className="text-red-500" />, lastSync: '8 min ago' },
  { name: 'AWS S3 Storage', type: 'Cloud Storage', status: 'Connected', icon: <Database className="text-orange-600" />, lastSync: '1 min ago' },
];

const webhooks = [
  { event: 'incident.created', url: 'https://webhook.ndma.gov.in/events', status: 'Success', latency: '124ms', lastSent: '25 Aug, 02:50 PM' },
  { event: 'alert.published', url: 'https://api.relief.in/v1/notify', status: 'Success', latency: '186ms', lastSent: '25 Aug, 02:45 PM' },
  { event: 'resource.deployed', url: 'https://logistics.ncmc.gov.in/track', status: 'Success', latency: '92ms', lastSent: '25 Aug, 02:30 PM' },
  { event: 'sensor.offline', url: 'https://monitoring.it.gov.in/alerts', status: 'Failed', latency: 'Timeout', lastSent: '25 Aug, 02:15 PM' },
];

export default function IntegrationsWebhooksPage() {
  return (
    <OperationsShell eyebrow="Manage third-party integrations and webhooks" title="Integrations & Webhooks">
      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
         {['Integrations', 'Webhooks', 'API Keys'].map(tab => (
            <button key={tab} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
               tab === 'Integrations' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
               {tab}
               {tab === 'Integrations' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Integrations Grid */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Active Integrations</h3>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                 <Plus size={16} /> Add Integration
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((int, i) => (
                 <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-colors">
                          {int.icon}
                       </div>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                          int.status === 'Connected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                       }`}>{int.status}</span>
                    </div>
                    <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight mb-1">{int.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{int.type}</p>
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Last Sync: {int.lastSync}</span>
                       <button className="text-gray-300 group-hover:text-blue-600 transition-colors"><Settings size={14} /></button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Webhooks Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Recent Webhooks</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="space-y-6">
                 {webhooks.map((wh, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{wh.event}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                             wh.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>{wh.status}</span>
                       </div>
                       <p className="text-[9px] font-bold text-gray-400 truncate">{wh.url}</p>
                       <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          <span>{wh.latency}</span>
                          <span>{wh.lastSent}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Key size={16} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Security Advisory</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 Rotate your API keys every 90 days to maintain high security standards. 
                 Last rotation was 45 days ago.
              </p>
              <button className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
                 Manage API Keys
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function Settings({ size, className }: { size?: number; className?: string }) {
  return <MoreHorizontal size={size} className={className} />;
}

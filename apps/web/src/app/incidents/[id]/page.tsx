'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Navigation, Loader2, Clock
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { Toast } from '@/lib/toast';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-black text-blue-900/20 text-4xl">Loading Map...</div>
});

export default function IncidentDetailsPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchIncidentDetails = async () => {
    try {
      const response = await apiClient.get(`/incidents/${id}`);
      setIncident(response.data.data);
    } catch (error) {
      console.error('Failed to fetch incident details:', error);
      Toast.error('Failed to load incident information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  if (loading) {
    return (
      <OperationsShell eyebrow="Track incident response" title="Loading Incident...">
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </OperationsShell>
    );
  }

  if (!incident) return null;

  return (
    <OperationsShell eyebrow="Track all actions and updates in timeline" title={`Incident: ${incident.title}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
           <div className={`p-3 rounded-2xl border shrink-0 ${
             incident.severity === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'
           }`}>
              <AlertTriangle size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">{incident.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                 <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                   incident.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                 }`}>{incident.severity}</span>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   {format(new Date(incident.reported_at), 'dd MMM yyyy, hh:mm a')}
                 </span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-gray-400">Reporter: {incident.reporter?.name || 'Anonymous'}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-6">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-10 h-[600px] overflow-y-auto no-scrollbar">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Incident Description</h3>
              <p className="text-sm font-bold text-gray-600 leading-relaxed mb-10">{incident.description}</p>
              
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Response Timeline</h3>
              <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                 <TimelineItem 
                   time={format(new Date(incident.reported_at), 'hh:mm a')}
                   title="Incident Reported"
                   desc="Initial report received via platform."
                   status="Completed"
                 />
                 {incident.updated_at !== incident.reported_at && (
                    <TimelineItem 
                      time={format(new Date(incident.updated_at), 'hh:mm a')}
                      title="Last Update"
                      desc={`Status changed to ${incident.status}`}
                      status="In Progress"
                    />
                 )}
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Location: {incident.location?.name || 'Assigned Sector'}</h3>
                 <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Navigation size={12} /> Live View</button>
              </div>
              <div className="flex-1 relative bg-blue-50">
                 <LiveMap entities={[{ ...incident, entityType: 'incident' }]} />
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Assignment Details</h3>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-xl font-black text-blue-600 uppercase">{incident.status}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Responder</p>
                    <p className="text-xl font-black text-[#0f172a]">{incident.assignee?.name || 'Unassigned'}</p>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end gap-4">
                 <button 
                  onClick={() => window.location.href = `/incidents`}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest"
                 >
                   Back to List
                 </button>
                 <button className="px-6 py-2.5 bg-[#061a37] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                   Dispatch Responder
                 </button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function TimelineItem({ time, title, desc, status }: any) {
  return (
    <div className="flex gap-8 relative z-10 group">
       <div className={`w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm transition-all ${
         status === 'Completed' ? 'bg-green-500' : 'bg-blue-600 animate-pulse'
       }`}>
          {status === 'Completed' ? <CheckCircle2 size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
       </div>
       <div>
          <div className="flex items-center gap-3 mb-1">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{time}</span>
             <h4 className="text-sm font-black uppercase tracking-tight text-[#0f172a]">{title}</h4>
          </div>
          <p className="text-[11px] font-bold text-gray-500 leading-relaxed max-w-md">{desc}</p>
       </div>
    </div>
  );
}

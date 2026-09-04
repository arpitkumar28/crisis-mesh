'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, RefreshCw, Filter, Search,
  ChevronDown, Plus, MapPin,
  CheckCircle2, AlertCircle, Info, TrendingUp, Loader2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { wsClient } from '@/lib/websocket-client';
import { useAuthStore } from '@/lib/store/auth-store';
import { format } from 'date-fns';
import { Toast } from '@/lib/toast';

interface Incident {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  reported_at: string;
  location?: {
    name: string;
  };
  reporter?: {
    name: string;
  };
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    critical: 0
  });
  const token = useAuthStore((state) => state.token);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/incidents');
      const data = response.data.data;
      setIncidents(data);

      const active = data.filter((i: any) => ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(i.status)).length;
      const resolved = data.filter((i: any) => i.status === 'RESOLVED').length;
      const critical = data.filter((i: any) => i.severity === 'CRITICAL').length;

      setStats({
        total: data.length,
        active,
        resolved,
        critical
      });
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      Toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (!token) return;
    wsClient.connect(token);

    const onIncidentCreated = (incident: any) => {
      Toast.info(`New Incident: ${incident.title || 'Incident reported'}`);
      fetchIncidents();
    };
    const refresh = () => fetchIncidents();

    wsClient.on('incident.created', onIncidentCreated);
    wsClient.on('incident.updated', refresh);
    wsClient.on('incident.status_changed', refresh);

    let isFirstConnectionEvent = true;
    const stopConnection = wsClient.onConnectionChange((state) => {
      if (isFirstConnectionEvent) {
        isFirstConnectionEvent = false;
        return;
      }
      if (state === 'disconnected') {
        Toast.warning('Live incident feed disconnected — reconnecting…');
      } else if (state === 'reconnected') {
        Toast.success('Live incident feed reconnected');
        refresh();
      } else if (state === 'auth_error') {
        Toast.error('Your session has expired. Please log in again.');
      }
    });

    return () => {
      wsClient.off('incident.created', onIncidentCreated);
      wsClient.off('incident.updated', refresh);
      wsClient.off('incident.status_changed', refresh);
      stopConnection();
    };
  }, [token]);

  return (
    <OperationsShell eyebrow="Track and manage all active and past incidents" title="Incidents">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard label="Total Incidents" value={stats.total.toString()} detail="Registered in system" icon={<AlertTriangle size={20} />} />
        <SummaryCard label="Active Incidents" value={stats.active.toString()} detail="Requiring action" icon={<AlertCircle size={20} className="text-red-500" />} />
        <SummaryCard label="Resolved Incidents" value={stats.resolved.toString()} detail="Successfully closed" icon={<CheckCircle2 size={20} className="text-green-500" />} />
        <SummaryCard label="Critical Incidents" value={stats.critical.toString()} detail="Urgent attention" icon={<Info size={20} className="text-orange-500" />} />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <FilterSelect label="All Districts" />
          <FilterSelect label="All Hazards" />
          <FilterSelect label="All Status" />
          <FilterSelect label="Sort: Newest" />
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search location, incident, ID..."
              className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>
          <button 
            onClick={fetchIncidents}
            disabled={loading}
            className="p-3 border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all bg-white disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          </button>
          <button 
            onClick={() => window.location.href = '/incidents/create'}
            className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all"
          >
            <Plus size={16} /> New Incident
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Loading Incidents...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <AlertCircle size={40} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">No incidents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Incident ID</th>
                  <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Incident Title</th>
                  <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Severity</th>
                  <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Reported By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50 transition-all cursor-pointer group"
                    onClick={() => window.location.href = `/incidents/${incident.id}`}
                  >
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-blue-600">#{incident.id.substring(0, 8)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-[#0f172a] uppercase">{incident.title}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{incident.type}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[11px] font-black text-[#0f172a]">
                        <MapPin size={12} className="text-gray-400" />
                        {incident.location?.name || 'Unknown Location'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${
                        incident.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' :
                        incident.severity === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        incident.severity === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                        ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(incident.status) ? 'text-green-600' :
                        incident.status === 'RESOLVED' ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(incident.status) ? 'bg-green-600 animate-pulse' :
                          incident.status === 'RESOLVED' ? 'bg-blue-600' :
                          'bg-gray-400'
                        }`}></div>
                        {incident.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#0f172a] uppercase">{incident.reporter?.name || 'Anonymous'}</span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                          {format(new Date(incident.reported_at), 'dd MMM yyyy, hh:mm a')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Showing {incidents.length} Incidents
          </span>
          <div className="flex items-center gap-2">
            <PaginationButton label="Prev" disabled />
            <div className="flex gap-1 mx-2">
              <PaginationNumber number={1} active />
            </div>
            <PaginationButton label="Next" disabled={incidents.length < 10} />
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all border border-gray-100">
          {icon}
        </div>
      </div>
      <h4 className="text-3xl font-black text-[#0f172a] mb-1">{value}</h4>
      <div className="flex items-center gap-1.5">
        <TrendingUp size={12} className="text-green-500" />
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{detail}</span>
      </div>
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-[10px] font-black text-[#0f172a] uppercase tracking-widest focus:outline-none hover:bg-white transition-all shadow-sm">
        <option>{label}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
    </div>
  );
}

function PaginationButton({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
        disabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm'
      }`}
    >
      {label}
    </button>
  );
}

function PaginationNumber({ number, active = false }: { number: string | number; active?: boolean }) {
  return (
    <button className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all flex items-center justify-center ${
      active ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-600 shadow-sm'
    }`}>
      {number}
    </button>
  );
}

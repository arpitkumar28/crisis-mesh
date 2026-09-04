'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell, AlertTriangle, Shield, Cloud, Activity,
  MapPin, Clock, Info, Search,
  ChevronRight, CheckCircle2,
  AlertCircle, Zap, Loader2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { wsClient } from '@/lib/websocket-client';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDistanceToNow } from 'date-fns';
import { Toast } from '@/lib/toast';

interface Alert {
  id: string;
  title: string;
  type: string;
  description: string;
  severity: string;
  status: string;
  source: string;
  issued_at: string;
  location?: {
    name: string;
  };
}

export default function AlertsPage() {
  const [selectedTab, setSelectedTab] = useState('All Alerts');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.get('/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      Toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    if (token) {
      wsClient.connect(token);

      // The alert.created/alert.updated broadcast payloads are minimal
      // (alert_id, severity, type, location, message, timestamp) — not
      // the full Alert shape this list renders. Splicing them in
      // directly would render broken rows and risks duplicate entries
      // if the event races the initial fetch. Re-fetching on the event
      // is not polling (it's push-triggered, not interval-based) and
      // guarantees complete, de-duplicated data.
      const handleAlertCreated = (newAlert: any) => {
        Toast.info(`New Alert: ${newAlert.message || newAlert.title || 'Alert created'}`);
        fetchAlerts();
      };

      const handleAlertUpdated = () => {
        fetchAlerts();
      };

      wsClient.on('alert.created', handleAlertCreated);
      wsClient.on('alert.updated', handleAlertUpdated);

      // Surface real connection state — never silently miss alerts
      // without telling the operator the live feed dropped. Skip the
      // initial callback (onConnectionChange fires immediately with the
      // pre-connect state), so a normal page load never shows a false
      // "disconnected" warning.
      let isFirstConnectionEvent = true;
      const stopConnection = wsClient.onConnectionChange((state) => {
        if (isFirstConnectionEvent) {
          isFirstConnectionEvent = false;
          return;
        }
        if (state === 'disconnected') {
          Toast.warning('Live alert feed disconnected — reconnecting…');
        } else if (state === 'reconnected') {
          Toast.success('Live alert feed reconnected');
          fetchAlerts();
        } else if (state === 'auth_error') {
          Toast.error('Your session has expired. Please log in again.');
        }
      });

      return () => {
        wsClient.off('alert.created', handleAlertCreated);
        wsClient.off('alert.updated', handleAlertUpdated);
        stopConnection();
      };
    }
  }, [token]);

  const filteredAlerts = alerts.filter(alert => {
    if (selectedTab === 'All Alerts') return true;
    if (selectedTab === 'Active') return alert.status === 'ACTIVE';
    if (selectedTab === 'Resolved') return alert.status === 'RESOLVED';
    if (selectedTab === 'CrisisMesh') return alert.source === 'CrisisMesh';
    if (selectedTab === 'Official Alerts') return alert.source !== 'CrisisMesh' && alert.source !== 'System';
    return true;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'ACTIVE').length,
    critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length,
    resolvedToday: alerts.filter(a => a.status === 'RESOLVED').length, // Simplified for now
  };

  return (
    <OperationsShell eyebrow="Monitor and manage all active alerts and notifications" title="Alerts Center">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard label="Total Alerts" value={stats.total.toString()} icon={<Bell size={20} />} detail="All recorded notifications" />
        <SummaryCard label="Active Alerts" value={stats.active.toString()} icon={<AlertTriangle size={20} className="text-orange-500" />} detail="Immediate action req." color="text-orange-500" />
        <SummaryCard label="Critical Alerts" value={stats.critical.toString()} icon={<AlertCircle size={20} className="text-red-500" />} detail="High priority threats" color="text-red-500" />
        <SummaryCard label="Resolved Alerts" value={stats.resolvedToday.toString()} icon={<CheckCircle2 size={20} className="text-green-500" />} detail="Successfully handled" color="text-green-500" />
      </div>

      {/* Toolbar & Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6">
            {['All Alerts', 'Official Alerts', 'CrisisMesh', 'Active', 'Resolved'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`text-[11px] font-black uppercase tracking-widest transition-all relative pb-2 ${
                  selectedTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {selectedTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search alerts..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button 
              onClick={fetchAlerts}
              className="p-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Loading Alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Bell size={40} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">No alerts found</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-600' :
                  alert.severity === 'HIGH' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                  'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  {getAlertIcon(alert.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-black text-[#0f172a] truncate uppercase tracking-tight">{alert.title}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      alert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                      alert.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-300" /> {alert.location?.name || 'Unknown Location'}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-300" /> {formatDistanceToNow(new Date(alert.issued_at), { addSuffix: true })}</span>
                    <span className="flex items-center gap-1.5"><Shield size={12} className="text-gray-300" /> Source: {alert.source}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                      alert.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${alert.status === 'ACTIVE' ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
                      {alert.status}
                    </span>
                  </div>
                  <button className="text-gray-300 group-hover:text-blue-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filteredAlerts.length > 0 && (
          <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100 text-xs font-bold text-gray-400">
            <p>Showing {filteredAlerts.length} alerts</p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center">1</button>
            </div>
          </div>
        )}
      </div>
    </OperationsShell>
  );
}

function RefreshCw({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function SummaryCard({ label, value, icon, detail, color = "text-[#0f172a]" }: { label: string; value: string; icon: React.ReactNode; detail: string; color?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
          {icon}
        </div>
      </div>
      <h4 className={`text-2xl font-black ${color}`}>{value}</h4>
      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">{detail}</p>
    </div>
  );
}

function getAlertIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('weather')) return <Cloud size={20} />;
  if (t.includes('flood')) return <Zap size={20} />;
  if (t.includes('safety') || t.includes('security')) return <Shield size={20} />;
  if (t.includes('system')) return <Info size={20} />;
  if (t.includes('utility') || t.includes('power')) return <Activity size={20} />;
  return <Bell size={20} />;
}

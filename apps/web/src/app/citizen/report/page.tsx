'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, MapPin,
  Info, Droplets,
  Flame, Zap, Activity, Clock, Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';

const hazardTypes = [
  { id: 'flood', label: 'Flood', icon: <Droplets size={20} />, incidentType: 'DISASTER' },
  { id: 'fire', label: 'Fire', icon: <Flame size={20} />, incidentType: 'EMERGENCY' },
  { id: 'storm', label: 'Storm', icon: <Zap size={20} />, incidentType: 'DISASTER' },
  { id: 'earthquake', label: 'Earthquake', icon: <Activity size={20} />, incidentType: 'DISASTER' },
  { id: 'accident', label: 'Accident', icon: <AlertTriangle size={20} />, incidentType: 'ACCIDENT' },
  { id: 'other', label: 'Other', icon: <Info size={20} />, incidentType: 'OTHER' },
] as const;

interface MyReport {
  id: string;
  title: string;
  type: string;
  status: string;
  reported_at: string;
}

export default function IncidentReportingPage() {
  const router = useRouter();
  const [selectedHazard, setSelectedHazard] = useState<(typeof hazardTypes)[number]['id']>('flood');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myReports, setMyReports] = useState<MyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const fetchMyReports = async () => {
    try {
      // The backend scopes CITIZEN callers to only their own reports
      // server-side (see IncidentsService.scopeToOwnerIfCitizen) — this
      // is never a client-side filter over other citizens' data.
      const response = await apiClient.get('/incidents');
      setMyReports((response.data.data || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load previous reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!description.trim()) {
      Toast.error('Please describe the situation before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const hazard = hazardTypes.find((h) => h.id === selectedHazard)!;
      const combinedDescription = location.trim()
        ? `Location: ${location.trim()}\n\n${description.trim()}`
        : description.trim();

      const response = await apiClient.post('/incidents', {
        type: hazard.incidentType,
        title: `${hazard.label} reported${location.trim() ? ` — ${location.trim()}` : ''}`.slice(0, 500),
        description: combinedDescription,
      });

      Toast.success('Report submitted successfully');
      const created = response.data?.data;
      setDescription('');
      setLocation('');
      fetchMyReports();
      if (created?.id) {
        router.push(`/incidents/${created.id}`);
      }
    } catch (error: any) {
      const apiMessage = error.response?.data?.message;
      const validationDetails = error.response?.data?.error?.details;
      if (Array.isArray(validationDetails) && validationDetails.length > 0) {
        Toast.error(validationDetails.join(' '));
      } else {
        Toast.error(apiMessage || 'Failed to submit report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
             <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Report Incident</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Community Reporting • Emergency Response</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/citizen')}
          className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
           Back to Dashboard
        </button>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Report Form */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight mb-8">Incident Details</h3>

              <div className="space-y-8">
                 {/* Hazard Selection */}
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Select Incident Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                       {hazardTypes.map(h => (
                          <button
                            key={h.id}
                            onClick={() => setSelectedHazard(h.id)}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                               selectedHazard === h.id
                                 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                 : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'
                            }`}
                          >
                             {h.icon}
                             <span className="text-[9px] font-black uppercase tracking-widest">{h.label}</span>
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Location */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Incident Location (optional)</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                       <input
                         type="text"
                         value={location}
                         onChange={(e) => setLocation(e.target.value)}
                         placeholder="e.g. Near City Park, Sector 5"
                         className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                       />
                    </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more details about the situation..."
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none h-32"
                    ></textarea>
                 </div>

                 <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                       <Info size={16} />
                       <p className="text-[9px] font-bold uppercase tracking-widest">False reporting is a punishable offense</p>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:bg-blue-400 transition-all flex items-center gap-2"
                    >
                       {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                       {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-blue-400">Reporting Tips</h3>
              <div className="space-y-6">
                 <Step text="Be clear and concise with your description." />
                 <Step text="Mention the exact location if possible." />
                 <Step text="Check if the incident is already reported." />
                 <Step text="Stay safe and move to a secure location." />
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">My Reports</h3>
                 <button onClick={() => router.push('/incidents')} className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              {reportsLoading ? (
                <div className="py-8 flex items-center justify-center text-gray-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : myReports.length === 0 ? (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-8">No reports yet</p>
              ) : (
                <div className="space-y-6">
                   {myReports.map(rep => (
                      <div
                        key={rep.id}
                        onClick={() => router.push(`/incidents/${rep.id}`)}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100 group-hover:bg-white transition-all shrink-0">
                               <Clock size={20} />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight truncate">{rep.title}</p>
                               <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(rep.reported_at).toLocaleString()}</p>
                            </div>
                         </div>
                         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            rep.status === 'RESOLVED' || rep.status === 'CLOSED' ? 'bg-green-100 text-green-600' :
                            rep.status === 'REPORTED' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-600'
                         }`}>{rep.status}</span>
                      </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="flex gap-4">
       <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{text}</p>
    </div>
  );
}

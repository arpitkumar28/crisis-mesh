'use client';

import React, { useState } from 'react';
import {
  AlertTriangle, MapPin, Loader2, CheckCircle2, XCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-red-50 flex items-center justify-center text-red-900/20 font-black uppercase tracking-widest text-xs">Initializing Emergency Map...</div>,
});

type SosState = 'idle' | 'locating' | 'sending' | 'sent' | 'error';

interface LocationResult {
  lat: number;
  lng: number;
  accuracy: number;
}

function getCurrentPosition(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

export default function SOSAssistancePage() {
  const [state, setState] = useState<SosState>('idle');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSos() {
    if (state === 'locating' || state === 'sending') return;
    setState('locating');
    setLocationError(null);
    setErrorMessage(null);

    let loc: LocationResult | null = null;
    try {
      loc = await getCurrentPosition();
      setLocation(loc);
    } catch (err: any) {
      // Real device location was not available — say so, do not fabricate one.
      setLocationError(err?.message || 'Location unavailable');
    }

    setState('sending');
    try {
      const description = loc
        ? `Citizen SOS request. Reported location: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)} (accuracy ~${Math.round(loc.accuracy)}m).`
        : 'Citizen SOS request. Device location was not available.';

      const res = await apiClient.post('/incidents', {
        type: 'EMERGENCY',
        title: 'Citizen SOS Request',
        description,
        severity: 'CRITICAL',
      });
      setIncidentId(res.data?.data?.id || null);
      setState('sent');
      Toast.success('SOS sent to authorities');
    } catch (err) {
      console.error('Failed to submit SOS incident:', err);
      setErrorMessage('Could not reach the server. Please call emergency services directly using the numbers below.');
      setState('error');
      Toast.error('Failed to send SOS');
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
             <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Emergency SOS</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reports a real emergency incident to authorities</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* SOS Action Center */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 -skew-x-12 translate-x-16 -translate-y-16 pointer-events-none"></div>

              <div className="mb-8">
                 <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">Urgent Assistance</p>
                 <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Need Immediate Help?</h3>
                 <p className="text-xs font-bold text-gray-400 mt-2">
                   {state === 'sent'
                     ? 'Your report has been submitted to authorities.'
                     : 'Your device location will be shared if you allow it.'}
                 </p>
              </div>

              <button
                onClick={handleSos}
                disabled={state === 'locating' || state === 'sending' || state === 'sent'}
                className={`w-64 h-64 rounded-full border-[12px] flex items-center justify-center transition-all duration-500 group relative disabled:cursor-not-allowed ${
                  state === 'sent' ? 'bg-red-600 border-red-100 shadow-[0_0_80px_rgba(239,68,68,0.4)]' : 'bg-white border-red-50 shadow-xl'
                }`}
              >
                 {state === 'sent' && <div className="absolute inset-0 rounded-full border-4 border-red-600 animate-ping"></div>}
                 <div className="text-center">
                    {state === 'locating' || state === 'sending' ? (
                      <Loader2 size={48} className="animate-spin text-red-600 mx-auto" />
                    ) : (
                      <span className={`text-6xl font-black block leading-none ${state === 'sent' ? 'text-white' : 'text-red-600'}`}>SOS</span>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-2 block ${state === 'sent' ? 'text-red-100' : 'text-gray-400'}`}>
                       {state === 'locating' ? 'GETTING LOCATION…' :
                        state === 'sending' ? 'SENDING…' :
                        state === 'sent' ? 'SIGNAL SENT' :
                        state === 'error' ? 'TAP TO RETRY' :
                        'TAP TO SEND'}
                    </span>
                 </div>
              </button>

              <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
                 <div className="flex items-center gap-3 mb-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-wider">Device Location</span>
                 </div>
                 {location ? (
                   <>
                     <p className="text-[10px] font-bold text-gray-500 text-left">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                     <p className="text-[9px] font-black text-gray-300 text-left uppercase mt-1">Accuracy: ~{Math.round(location.accuracy)} m</p>
                   </>
                 ) : locationError ? (
                   <p className="text-[10px] font-bold text-orange-500 text-left uppercase">Location unavailable — {locationError}</p>
                 ) : (
                   <p className="text-[10px] font-bold text-gray-400 text-left uppercase">Not yet requested</p>
                 )}
              </div>

              {state === 'sent' && incidentId && (
                <div className="mt-4 flex items-center gap-2 text-green-600 text-[10px] font-black uppercase">
                  <CheckCircle2 size={14} /> Incident #{incidentId.slice(0, 8)} created
                </div>
              )}
              {state === 'error' && errorMessage && (
                <div className="mt-4 flex items-center gap-2 text-red-600 text-[10px] font-black uppercase text-left">
                  <XCircle size={14} className="shrink-0" /> {errorMessage}
                </div>
              )}
           </div>

           {/* Real, universal India emergency helplines — not app-tracked data */}
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[80px]"></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-red-400">Direct Helplines</h3>
              <div className="grid grid-cols-2 gap-4">
                 <HelplineBtn label="Police" number="100" />
                 <HelplineBtn label="Ambulance" number="102" />
                 <HelplineBtn label="Fire" number="101" />
                 <HelplineBtn label="Disaster" number="1070" />
              </div>
           </div>
        </div>

        {/* Map + honest "no live responder tracking" state */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Your Location</h3>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-4">Nearest Responders</h3>
              <p className="text-xs font-bold text-gray-400">
                Live responder location and ETA tracking is not yet available. Your SOS report is submitted
                directly to the incident queue that authorities monitor.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function HelplineBtn({ label, number }: { label: string; number: string }) {
  return (
    <a href={`tel:${number}`} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 transition-all group block">
       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover:text-red-400 transition-colors">{label}</p>
       <p className="text-xl font-black text-white">{number}</p>
    </a>
  );
}

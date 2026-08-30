'use client';

import React from 'react';
import { 
  Shield, 
  Camera, CheckCircle2,
  Star, Navigation, 
  Radio, Briefcase, LifeBuoy, Wrench,
  PhoneCall, Map as MapIcon
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function ResponderProfile() {
  return (
    <OperationsShell eyebrow="Manage responder profile and availability" title="Responder Profile">
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Responder Info */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 -skew-x-12 translate-x-32 -translate-y-32 pointer-events-none"></div>
              
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Responder Information</h3>
              
              <div className="flex flex-col md:flex-row gap-10 mb-10">
                 <div className="flex flex-col items-center shrink-0">
                    <div className="relative group">
                       <div className="w-32 h-32 rounded-[40px] bg-[#061a37] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-900/20 border-4 border-white">
                          RV
                       </div>
                       <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center text-blue-600">
                          <Camera size={18} />
                       </button>
                    </div>
                    <button className="mt-4 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Change Photo</button>
                 </div>

                 <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-8">
                    <InfoField label="Full Name" value="Rohit Verma" />
                    <InfoField label="Responder ID" value="RESP-2024-056" />
                    <InfoField label="Team" value="NDRF - Jaipur Unit" />
                    <InfoField label="Role" value="Team Leader" />
                    <InfoField label="Phone Number" value="+91 97654 32109" verified />
                    <InfoField label="Official Email" value="rohit.verma@ndrf.gov.in" verified />
                    <InfoField label="Joining Date" value="12 Mar 2022" />
                    <InfoField label="Blood Group" value="B+" />
                 </div>
              </div>

              <div className="pt-10 border-t border-gray-100 flex items-center justify-between">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Emergency Contact</p>
                    <p className="text-sm font-black text-[#0f172a] uppercase">Damini Verma (Wife)</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">+91 98765 12345</p>
                 </div>
                 <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                    <PhoneCall size={18} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
                 <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">Skills & Certifications</h3>
                 <div className="space-y-4">
                    <SkillItem label="Swift Water Rescue" status="Certified" />
                    <SkillItem label="First Aid & CPR" status="Certified" />
                    <SkillItem label="Search & Rescue" status="Certified" />
                    <SkillItem label="Hazardous Materials" status="Verified" />
                 </div>
                 <button className="mt-8 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Add Certification</button>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
                 <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">Equipment Assigned</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <EquipItem icon={<LifeBuoy size={16} />} label="Life Jacket" />
                    <EquipItem icon={<Radio size={16} />} label="Rescue Radio" />
                    <EquipItem icon={<Briefcase size={16} />} label="First Aid Kit" />
                    <EquipItem icon={<Wrench size={16} />} label="VHF Radio" />
                 </div>
                 <button className="w-full mt-8 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all">View All Equipment</button>
              </div>
           </div>
        </div>

        {/* Right Column: Status & Location */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">Availability Status</h3>
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xl font-black text-green-600 uppercase tracking-tighter">Available</span>
                 </div>
                 <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Change Status</button>
              </div>
              
              <div className="pt-8 border-t border-gray-100">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Current Location</p>
                    <button className="text-[9px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1"><Navigation size={10} /> Update Location</button>
                 </div>
                 <p className="text-xs font-black text-[#0f172a] uppercase mb-4">Jaipur, Rajasthan <br /><span className="text-[9px] text-gray-400">Updated 2 mins ago</span></p>
                 
                 <div className="h-40 bg-gray-100 rounded-2xl relative overflow-hidden border border-gray-100">
                    <MapIcon size={64} className="absolute inset-0 m-auto text-gray-200" />
                    <div className="absolute inset-0 bg-blue-500/5"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-xl animate-bounce"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Shield size={20} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Performance Index</h4>
              </div>
              <div className="flex items-center gap-4 mb-8">
                 <h2 className="text-5xl font-black">9.8</h2>
                 <div className="flex flex-col">
                    <div className="flex gap-1 text-yellow-500"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mt-1">Exceptional Responder</p>
                 </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-white/5">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Missions Completed</span>
                    <span>124</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Average ETA</span>
                    <span>14.2 min</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function InfoField({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-center gap-2">
          <p className="text-xs font-black text-[#0f172a] uppercase">{value}</p>
          {verified && <CheckCircle2 size={12} className="text-green-500" />}
       </div>
    </div>
  );
}

function SkillItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-bold text-[#0f172a] uppercase">{label}</span>
       <span className="text-[8px] font-black text-green-500 uppercase">{status}</span>
    </div>
  );
}

function EquipItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
       <div className="text-blue-600">{icon}</div>
       <span className="text-[9px] font-black text-[#0f172a] uppercase">{label}</span>
    </div>
  );
}

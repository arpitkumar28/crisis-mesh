'use client';

import React from 'react';
import { 
  Cpu, Activity, Zap, Radio, RefreshCw, 
  Settings, Play, Square, AlertTriangle, 
  CheckCircle2, Clock, Battery, HardDrive,
  ChevronRight, MoreHorizontal, Database
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const simulatorStats = [
  { label: 'Total Virtual Sensors', value: '120', sub: 'System-wide', icon: <Cpu size={20} /> },
  { label: 'Active / Online', value: '110', sub: '91.7% Active', icon: <CheckCircle2 size={20} className="text-green-500" /> },
  { label: 'Offline Nodes', value: '8', sub: '6.7% Connection', icon: <Radio size={20} className="text-red-500" /> },
  { label: 'Maintenance', value: '2', sub: '1.6% Service', icon: <Settings size={20} className="text-orange-500" /> },
  { label: 'MQTT Connected', value: 'Active', sub: 'Broker: Online', icon: <Zap size={20} className="text-blue-500" /> },
];

const sensorNodes = [
  { id: 'VL-SN-001', type: 'Water Level', loc: 'Malviya Nagar', status: 'Online', battery: '82%', lastData: '10:24:12 AM' },
  { id: 'VL-SN-002', type: 'Rainfall', loc: 'Mansarovar', status: 'Online', battery: '76%', lastData: '10:24:08 AM' },
  { id: 'VL-SN-003', type: 'Soil Moisture', loc: 'Sanganer', status: 'Online', battery: '91%', lastData: '10:23:55 AM' },
  { id: 'VL-SN-004', type: 'Water Level', loc: 'Jhotwara', status: 'Offline', battery: '12%', lastData: '09:12:44 AM' },
  { id: 'VL-SN-005', type: 'Rainfall', loc: 'Vaishali Nagar', status: 'Online', battery: '64%', lastData: '10:24:02 AM' },
  { id: 'VL-SN-006', type: 'Wind Speed', loc: 'Bani Park', status: 'Maintenance', battery: '45%', lastData: '24 Aug, 08:30 PM' },
];

const liveData = [
  { time: '10:20', val: 42 },
  { time: '10:21', val: 58 },
  { time: '10:22', val: 45 },
  { time: '10:23', val: 72 },
  { time: '10:24', val: 54 },
  { time: '10:25', val: 38 },
];

export default function SimulatorMonitorPage() {
  return (
    <OperationsShell eyebrow="Virtual IoT hardware and mesh network simulation" title="Simulator / Virtual Hardware Monitor">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {simulatorStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
               <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{stat.icon}</div>
            </div>
            <h4 className="text-3xl font-black text-[#0f172a]">{stat.value}</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sensor Table */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Virtual Sensor Nodes</h3>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">Refresh Nodes</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Add Virtual Node</button>
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Node ID</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Sensor Type</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Battery</th>
                       <th className="px-8 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Data</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {sensorNodes.map((node, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-[10px] font-black text-blue-600 uppercase">{node.id}</td>
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a] uppercase">{node.type}</td>
                          <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">{node.loc}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                node.status === 'Online' ? 'bg-green-100 text-green-600' : 
                                node.status === 'Offline' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                             }`}>{node.status}</span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <Battery size={14} className={parseInt(node.battery) < 20 ? 'text-red-500' : 'text-gray-400'} />
                                <span className="text-[10px] font-black text-[#0f172a]">{node.battery}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right text-[10px] font-bold text-gray-400">{node.lastData}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Live Data Stream Chart */}
           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Live Data Stream <span className="text-gray-400 font-bold ml-2">(All Sensors)</span></h3>
                 <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase">
                    <Activity size={14} className="animate-pulse" /> Streaming Active
                 </div>
              </div>
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liveData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" hide />
                       <YAxis hide />
                       <Tooltip />
                       <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} animationDuration={300} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Sidebar Info & Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between">
              <div>
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-blue-400">Device Control</h3>
                 <div className="space-y-4 mb-10">
                    <ControlButton icon={<RefreshCw size={16} />} label="Restart All Nodes" />
                    <ControlButton icon={<Zap size={16} />} label="Calibrate Sensors" />
                    <ControlButton icon={<Database size={16} />} label="Update Firmware" />
                    <ControlButton icon={<History size={16} />} label="View Simulator Logs" />
                 </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase">Mesh Health</span>
                    <span className="text-[9px] font-black text-green-500 uppercase">Excellent</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Radio size={16} className="text-green-500" />
                    <span className="text-xs font-bold uppercase">98.2% Connectivity</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Scenario Simulator</h3>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8">Inject synthetic data scenarios to test platform resilience and alert triggers.</p>
              <div className="space-y-3">
                 <ScenarioButton label="Urban Flash Flood" />
                 <ScenarioButton label="Widespread Power Outage" />
                 <ScenarioButton label="Sensor Communication Failure" />
                 <ScenarioButton label="Heat Wave Anomaly" />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function ControlButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-left">
       <span className="text-blue-500">{icon}</span>
       {label}
    </button>
  );
}

function ScenarioButton({ label }: { label: string }) {
  return (
    <button className="w-full py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-[#0f172a] uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
       {label}
    </button>
  );
}

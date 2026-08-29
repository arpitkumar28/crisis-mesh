'use client';

import React, { useState } from 'react';
import { 
  Shield, Lock, Key, Check, Plus, Search, 
  ChevronRight, MoreHorizontal, Trash2, Edit2,
  Users, Eye, FileText, Database, Radio, Bell
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const roles = [
  { id: 'role-1', name: 'Super Admin', users: 3, permissions: 128, desc: 'Full access to all system features and settings.' },
  { id: 'role-2', name: 'District Admin', users: 18, permissions: 86, desc: 'Manage district-level operations, users, and resources.' },
  { id: 'role-3', name: 'Operator', users: 42, permissions: 45, desc: 'Handle incidents, alerts, and field team coordination.' },
  { id: 'role-4', name: 'Field Officer', users: 85, permissions: 24, desc: 'Access to field tools, reports, and team communication.' },
  { id: 'role-5', name: 'Viewer', users: 76, permissions: 12, desc: 'Read-only access to maps, news, and dashboards.' },
  { id: 'role-6', name: 'Guest', users: 12, permissions: 4, desc: 'Limited access to public information and basic tools.' },
];

const permissionCategories = [
  { 
    title: 'Dashboard & Maps', 
    perms: [
      { name: 'View Dashboard', key: 'dash_v' },
      { name: 'Live Map Access', key: 'map_v' },
      { name: 'Heatmap View', key: 'map_h' },
      { name: 'GIS Layer Controls', key: 'map_gis' }
    ]
  },
  { 
    title: 'Incident Management', 
    perms: [
      { name: 'Create Incident', key: 'inc_c' },
      { name: 'Edit Incident', key: 'inc_e' },
      { name: 'Delete Incident', key: 'inc_d' },
      { name: 'Deploy Teams', key: 'inc_t' }
    ]
  },
  { 
    title: 'Alerts & Notifications', 
    perms: [
      { name: 'Publish Alerts', key: 'alt_p' },
      { name: 'Configure Thresholds', key: 'alt_c' },
      { name: 'SMS Broadcast', key: 'alt_sms' },
      { name: 'WhatsApp Integration', key: 'alt_wa' }
    ]
  },
  { 
    title: 'System Settings', 
    perms: [
      { name: 'Manage Users', key: 'sys_u' },
      { name: 'Role Management', key: 'sys_r' },
      { name: 'Database Backup', key: 'sys_b' },
      { name: 'API Configuration', key: 'sys_a' }
    ]
  }
];

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState(roles[1]);

  return (
    <OperationsShell eyebrow="Configure roles and manage permissions" title="Roles & Permissions">
      <div className="grid grid-cols-12 gap-8">
        {/* Roles List - Left Side */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Roles ({roles.length})</h3>
                <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                   <Plus size={14} /> Add Role
                </button>
             </div>
             
             <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                   <input 
                     type="text" 
                     placeholder="Search roles..." 
                     className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-black focus:outline-none"
                   />
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {roles.map(role => (
                  <button 
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      selectedRole.id === role.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <Shield size={18} className={selectedRole.id === role.id ? 'text-white' : 'text-blue-500'} />
                       <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-tight">{role.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedRole.id === role.id ? 'text-blue-200' : 'text-gray-400'}`}>
                            {role.users} Users
                          </p>
                       </div>
                    </div>
                    <ChevronRight size={16} className={selectedRole.id === role.id ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Permissions Matrix - Right Side */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">Role Details</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Configure permissions for <span className="text-blue-600 font-black">{selectedRole.name}</span>
                    </p>
                 </div>
                 <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Reset</button>
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Save Changes</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-xs font-bold text-[#0f172a] leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      {selectedRole.desc}
                    </p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Users</p>
                       <h4 className="text-2xl font-black text-[#0f172a]">{selectedRole.users}</h4>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Permissions</p>
                       <h4 className="text-2xl font-black text-blue-600">{selectedRole.permissions}</h4>
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 {permissionCategories.map(cat => (
                    <div key={cat.title}>
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-50 pb-2">{cat.title}</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {cat.perms.map(perm => (
                             <div key={perm.key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group cursor-pointer">
                                <span className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600">{perm.name}</span>
                                <div className="w-5 h-5 rounded-md border-2 border-blue-600 bg-blue-600 flex items-center justify-center text-white">
                                   <Check size={14} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-red-50 rounded-[32px] p-8 border border-red-100 flex items-center justify-between">
              <div>
                 <h4 className="text-sm font-black text-red-600 uppercase tracking-wider mb-1">Danger Zone</h4>
                 <p className="text-[10px] font-bold text-red-800/60 uppercase tracking-widest">Deleting this role will affect {selectedRole.users} active users.</p>
              </div>
              <button className="px-6 py-2.5 border border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Delete Role</button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

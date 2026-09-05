'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users, ShieldCheck, ScrollText, Activity, Cpu, Database,
  Share2, Globe, Smartphone, WifiOff, FileText, Ticket,
  MapPinned, Archive, Radar, ChevronRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

// Previously a self-contained fake settings form: a "System Status"
// widget with hardcoded storage/latency/AI-engine numbers, a tab switcher
// whose tabs never actually changed the displayed content, and Save
// Changes / Run Diagnostics / Purge Cache buttons with no handlers. There
// is no settings-persistence backend module to back any of that. This is
// now a real navigation hub into the settings sub-pages that actually
// exist — each of which independently shows either real data or an
// honest "not available" state.
const settingsSections = [
  { href: '/settings/users', label: 'Users', desc: 'Manage accounts and roles', icon: Users },
  { href: '/settings/roles', label: 'Roles & Permissions', desc: 'Role-based access configuration', icon: ShieldCheck },
  { href: '/settings/audit-logs', label: 'Audit Logs', desc: 'Review system activity history', icon: ScrollText },
  { href: '/settings/system-health', label: 'System Health', desc: 'Live backend/database/MQTT status', icon: Activity },
  { href: '/settings/simulator', label: 'Simulator', desc: 'Virtual hardware monitor', icon: Cpu },
  { href: '/settings/gis', label: 'GIS', desc: 'Geographic data configuration', icon: MapPinned },
  { href: '/settings/geofencing', label: 'Geofencing', desc: 'Boundary and zone rules', icon: Radar },
  { href: '/settings/data-management', label: 'Data Management', desc: 'Manage stored operational data', icon: Database },
  { href: '/settings/data-export', label: 'Data Export', desc: 'Export records and reports', icon: FileText },
  { href: '/settings/backup', label: 'Backup', desc: 'Backup and recovery configuration', icon: Archive },
  { href: '/settings/integrations', label: 'Integrations', desc: 'External service connections', icon: Share2 },
  { href: '/settings/languages', label: 'Languages', desc: 'Localization settings', icon: Globe },
  { href: '/settings/mobile-app', label: 'Mobile App', desc: 'Mobile app management', icon: Smartphone },
  { href: '/settings/offline-sync', label: 'Offline Sync', desc: 'Offline data synchronization', icon: WifiOff },
  { href: '/settings/security', label: 'Security', desc: 'Security policy configuration', icon: ShieldCheck },
  { href: '/settings/templates', label: 'Templates', desc: 'Message and report templates', icon: FileText },
  { href: '/settings/tickets', label: 'Tickets', desc: 'Support ticket management', icon: Ticket },
];

export default function SettingsPage() {
  return (
    <OperationsShell eyebrow="Configure system preferences and parameters" title="System Settings">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-blue-600 shrink-0">
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">{section.label}</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest truncate">{section.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </OperationsShell>
  );
}

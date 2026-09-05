'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell, AlertTriangle, Info, CheckCircle2, Loader2,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

const TABS = [
  'Alert History',
  'Notification Preferences',
  'Subscribed Districts',
  'Email Subscriptions',
  'SMS & WhatsApp',
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('Alert History');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/notifications')
      .then((res) => {
        if (!cancelled) setNotifications(res.data.data ?? res.data);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = async (id: string) => {
    setMarkingId(id);
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {
      // leave state unchanged on failure
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <OperationsShell
      eyebrow="Your alert history and communication channels"
      title="Notifications & Subscriptions"
    >
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
              Account Contact
            </h3>
            <p className="text-xs font-bold text-[#0f172a] break-all">
              {user?.email || 'Not signed in'}
            </p>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">
              Manage your email address in Profile settings.
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-6">
          {activeTab === 'Alert History' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight mb-8">
                Alert History
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center py-16">
                  No notifications yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start justify-between gap-4 p-4 rounded-2xl border ${
                        n.is_read ? 'border-gray-100 bg-gray-50' : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {n.priority === 'CRITICAL' || n.priority === 'HIGH' ? (
                          <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                        ) : (
                          <Info className="text-blue-500 mt-0.5" size={18} />
                        )}
                        <div>
                          <p className="text-xs font-black text-[#0f172a] uppercase tracking-tight">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => markRead(n.id)}
                          disabled={markingId === n.id}
                          className="shrink-0 flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} /> Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Notification Preferences' && (
            <NotAvailable
              icon={Bell}
              title="Preference Management Not Available"
              description="Per-category notification preferences are not yet backed by the platform. Critical alerts are always visible in Alert History and delivered over the live WebSocket connection."
            />
          )}

          {activeTab === 'Subscribed Districts' && (
            <NotAvailable
              title="District Subscriptions Not Available"
              description="Subscribing to specific districts for targeted alerts is not yet supported by the backend."
            />
          )}

          {activeTab === 'Email Subscriptions' && (
            <NotAvailable
              title="Email Delivery Not Available"
              description="Email notification delivery is not yet implemented. Alerts are currently delivered in-app and over the live WebSocket connection only."
            />
          )}

          {activeTab === 'SMS & WhatsApp' && (
            <NotAvailable
              title="SMS & WhatsApp Delivery Not Available"
              description="SMS and WhatsApp notification channels are not yet implemented."
            />
          )}
        </div>
      </div>
    </OperationsShell>
  );
}

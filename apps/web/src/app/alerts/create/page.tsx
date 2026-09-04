'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';

const ALERT_TYPES = ['WEATHER', 'FLOOD', 'EARTHQUAKE', 'WILDFIRE', 'LANDSLIDE', 'TSUNAMI', 'CYCLONE', 'MANUAL'] as const;
const ALERT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

interface AlertFormState {
  type: (typeof ALERT_TYPES)[number];
  severity: (typeof ALERT_SEVERITIES)[number];
  title: string;
  description: string;
  expiresAt: string;
}

interface FormErrors {
  title?: string;
  expiresAt?: string;
}

const INITIAL_FORM: AlertFormState = {
  type: 'WEATHER',
  severity: 'MEDIUM',
  title: '',
  description: '',
  expiresAt: '',
};

export default function AlertCreation() {
  const router = useRouter();
  const [form, setForm] = useState<AlertFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.title.trim()) {
      nextErrors.title = 'Alert title is required.';
    } else if (form.title.length > 500) {
      nextErrors.title = 'Alert title must be 500 characters or fewer.';
    }
    if (form.expiresAt && Number.isNaN(new Date(form.expiresAt).getTime())) {
      nextErrors.expiresAt = 'Enter a valid expiry date/time.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        type: form.type,
        severity: form.severity,
        title: form.title.trim(),
      };
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.expiresAt) payload.expires_at = new Date(form.expiresAt).toISOString();

      const response = await apiClient.post('/alerts', payload);
      const created = response.data?.data;

      Toast.success('Alert created successfully');
      if (created?.id) {
        router.push(`/alerts/${created.id}`);
      } else {
        router.push('/alerts');
      }
    } catch (error: any) {
      const apiMessage = error.response?.data?.message;
      const validationDetails = error.response?.data?.error?.details;
      if (Array.isArray(validationDetails) && validationDetails.length > 0) {
        Toast.error(validationDetails.join(' '));
      } else {
        Toast.error(apiMessage || 'Failed to create alert. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OperationsShell eyebrow="Create and publish new alerts" title="Alert Creation">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-9 lg:col-start-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
            <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Alert Details</h3>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alert Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Heavy Rainfall Alert in Jaipur District"
                  maxLength={500}
                  className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all ${
                    errors.title ? 'border-red-400' : 'border-gray-100'
                  }`}
                />
                {errors.title && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alert Type</label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as AlertFormState['type'] })}
                      className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none"
                    >
                      {ALERT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Severity</label>
                  <div className="relative">
                    <select
                      value={form.severity}
                      onChange={(e) => setForm({ ...form, severity: e.target.value as AlertFormState['severity'] })}
                      className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none"
                    >
                      {ALERT_SEVERITIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none ${
                    errors.expiresAt ? 'border-red-400' : 'border-gray-100'
                  }`}
                />
                {errors.expiresAt && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.expiresAt}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (optional)</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the hazard, affected areas, and recommended action."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-12 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/alerts')}
                disabled={submitting}
                className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Publishing...' : 'Publish Alert'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </OperationsShell>
  );
}

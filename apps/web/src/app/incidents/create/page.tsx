'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';

const INCIDENT_TYPES = ['DISASTER', 'EMERGENCY', 'ACCIDENT', 'HAZARD', 'OTHER'] as const;
const INCIDENT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

interface IncidentFormState {
  type: (typeof INCIDENT_TYPES)[number];
  title: string;
  description: string;
  severity: (typeof INCIDENT_SEVERITIES)[number] | '';
}

interface FormErrors {
  title?: string;
}

const INITIAL_FORM: IncidentFormState = {
  type: 'DISASTER',
  title: '',
  description: '',
  severity: '',
};

export default function IncidentCreation() {
  const router = useRouter();
  const [form, setForm] = useState<IncidentFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.title.trim()) {
      nextErrors.title = 'Incident title is required.';
    } else if (form.title.length > 500) {
      nextErrors.title = 'Incident title must be 500 characters or fewer.';
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
        title: form.title.trim(),
      };
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.severity) payload.severity = form.severity;

      const response = await apiClient.post('/incidents', payload);
      const created = response.data?.data;

      Toast.success('Incident created successfully');
      if (created?.id) {
        router.push(`/incidents/${created.id}`);
      } else {
        router.push('/incidents');
      }
    } catch (error: any) {
      const apiMessage = error.response?.data?.message;
      const validationDetails = error.response?.data?.error?.details;
      if (Array.isArray(validationDetails) && validationDetails.length > 0) {
        Toast.error(validationDetails.join(' '));
      } else {
        Toast.error(apiMessage || 'Failed to create incident. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OperationsShell eyebrow="Register and create new incident" title="Incident Creation">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-9 lg:col-start-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm">
            <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Incident Details</h3>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Incident Type</label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as IncidentFormState['type'] })}
                      className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none"
                    >
                      {INCIDENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Severity (optional)</label>
                  <div className="relative">
                    <select
                      value={form.severity}
                      onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentFormState['severity'] })}
                      className="w-full appearance-none px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none"
                    >
                      <option value="">Unspecified</option>
                      {INCIDENT_SEVERITIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Incident Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Flash Flood in Mahapura Area"
                  maxLength={500}
                  className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none ${
                    errors.title ? 'border-red-400' : 'border-gray-100'
                  }`}
                />
                {errors.title && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (optional)</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what happened, where, and any immediate observations."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-12 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/incidents')}
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
                {submitting ? 'Creating...' : 'Create Incident'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </OperationsShell>
  );
}

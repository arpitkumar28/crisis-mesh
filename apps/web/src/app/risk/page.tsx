'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, Loader2, AlertTriangle, ShieldAlert, Database,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';

interface RiskAssessmentRecord {
  id: string;
  risk_type: string;
  risk_level: string;
  severity: string;
  confidence: string | null;
  source: string;
  prediction: string | null;
  location_id: string | null;
  created_at: string;
}

interface RiskSummary {
  total: number;
  high_risk: number;
  critical_risk: number;
  by_type: { type: string; count: number }[];
}

function severityClass(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 text-red-600';
    case 'HIGH': return 'bg-orange-100 text-orange-600';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

/**
 * This screen previously fabricated an entire "AI/Neural-Net" narrative —
 * a fake flood-probability gauge, a fake confidence score, a fake rainfall
 * forecast chart, fake per-model accuracy/F1/inference-time stats, and
 * fake "AI recommendations" for named neighborhoods. None of that existed
 * anywhere in the backend.
 *
 * The real backend (services/api/src/risk) is an explicitly RULE-BASED
 * engine (see risk-engine.service.ts / risk-rules.ts) — it evaluates fixed
 * thresholds against real telemetry, never claims a confidence percentage
 * (RiskAssessment.confidence is always null), and never claims to be a
 * trained model. This page now shows exactly what that engine produces,
 * with a "Rule-Based Engine" source label, and nothing invented.
 */
export default function RiskAssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<RiskAssessmentRecord[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [listRes, summaryRes] = await Promise.all([
          apiClient.get('/risk'),
          apiClient.get('/risk/summary'),
        ]);
        if (cancelled) return;
        setAssessments(listRes.data?.data || []);
        setSummary(summaryRes.data?.data || null);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load risk assessments:', err);
        setError('Unable to load risk assessments from the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(
    () => [...assessments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [assessments],
  );

  if (loading) {
    return (
      <OperationsShell eyebrow="Rule-based environmental risk assessment" title="Risk Assessments">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (error) {
    return (
      <OperationsShell eyebrow="Rule-based environmental risk assessment" title="Risk Assessments">
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-1">{error}</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Rule-based environmental risk assessment — not AI/ML" title="Risk Assessments">
      {/* Real counts from GET /v1/risk/summary. No accuracy/confidence
          metric is shown because the engine does not produce one. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Assessments</span>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><Database size={20} /></div>
          </div>
          <h4 className="text-3xl font-black text-[#0f172a]">{summary?.total ?? 0}</h4>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Severity</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center border border-gray-100"><ShieldAlert size={20} className="text-orange-500" /></div>
          </div>
          <h4 className="text-3xl font-black text-orange-600">{summary?.high_risk ?? 0}</h4>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Critical Severity</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center border border-gray-100"><AlertTriangle size={20} className="text-red-500" /></div>
          </div>
          <h4 className="text-3xl font-black text-red-600">{summary?.critical_risk ?? 0}</h4>
        </div>
      </div>

      {summary && summary.by_type.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-widest mb-4">By Hazard Type</h3>
          <div className="flex flex-wrap gap-4">
            {summary.by_type.map((t) => (
              <div key={t.type} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-black text-[#0f172a]">{t.type}</span>
                <span className="text-xs font-bold text-gray-500">×{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">No active risk assessments.</p>
          <p className="text-xs font-bold text-gray-400">Assessments appear here when live telemetry crosses a defined threshold.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Hazard</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Severity</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Explanation</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Source</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-blue-600" />
                      <span className="text-xs font-black text-[#0f172a] uppercase">{a.risk_type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${severityClass(a.severity)}`}>{a.severity}</span>
                  </td>
                  <td className="px-8 py-5 text-[11px] font-bold text-gray-500 max-w-md">{a.prediction || 'No explanation recorded.'}</td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase bg-gray-100 text-gray-600" title="Fixed-threshold rules, not a trained model">
                      {a.source === 'RULE_BASED_ENGINE' ? 'Rule-Based Engine' : a.source}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OperationsShell>
  );
}

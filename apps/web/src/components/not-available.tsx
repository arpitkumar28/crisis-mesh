import type { LucideIcon } from 'lucide-react';
import { Ban } from 'lucide-react';

/**
 * Standard "no live data source" state for a screen whose backend does not
 * exist yet. Used instead of ever rendering fabricated operational
 * numbers, statuses, or "LIVE" badges — see the real-data audit for the
 * full list of screens this replaced.
 */
export function NotAvailable({
  title,
  description,
  icon: Icon = Ban,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-center text-gray-400">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-6">
        <Icon size={28} />
      </div>
      <p className="text-sm font-black text-[#0f172a] mb-2 uppercase tracking-tight">{title}</p>
      <p className="text-xs font-bold text-gray-400 max-w-md">{description}</p>
    </div>
  );
}

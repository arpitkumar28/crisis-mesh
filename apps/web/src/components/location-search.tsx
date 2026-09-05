'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export interface SelectedLocation {
  name: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * Resolves any place name (city, district, or state) to real coordinates
 * via the backend's /public/weather/search endpoint — itself a thin
 * wrapper over Open-Meteo's free geocoding API. This covers every place
 * in India (or anywhere) without a hardcoded coordinate table to
 * maintain.
 */
export function LocationSearch({
  onSelect,
  placeholder = 'Search city, district or state…',
  autoFocus = false,
}: {
  onSelect: (location: SelectedLocation) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SelectedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchFailed(false);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/public/weather/search', { params: { query: trimmed } });
        if (cancelled) return;
        setResults(res.data.data || []);
        setSearchFailed(false);
        setOpen(true);
      } catch {
        if (cancelled) return;
        setResults([]);
        setSearchFailed(true);
        setOpen(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={14} />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={`${location.name}-${location.latitude}-${location.longitude}-${index}`}
              type="button"
              onClick={() => {
                onSelect(location);
                setQuery('');
                setResults([]);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors text-xs font-bold text-[#0f172a] border-b border-gray-50 last:border-0"
            >
              <MapPin size={12} className="text-gray-400 shrink-0" />
              <span>{location.name}{location.state ? `, ${location.state}` : ''}</span>
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-xs font-bold text-gray-400">
          {searchFailed ? 'Location search is unavailable right now.' : 'No matching places found.'}
        </div>
      )}
    </div>
  );
}

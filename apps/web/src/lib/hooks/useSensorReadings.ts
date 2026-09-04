import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface SensorReading {
  id: string;
  sensor_id: string;
  value: number;
  unit: string;
  timestamp: string;
  quality_flag: number;
}

/**
 * Fetches readings for a sensor from GET /telemetry/sensor/:sensorId and
 * returns them sorted oldest-to-newest (the order both the sensor detail
 * page and the history page chart/table need). Used by both pages to avoid
 * duplicating the fetch + sort logic.
 */
export function useSensorReadings(sensorId: string | null | undefined, limit = 100) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!sensorId) {
      setReadings([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiClient
      .get(`/telemetry/sensor/${sensorId}`, { params: { limit } })
      .then((res) => {
        if (cancelled) return;
        const data: SensorReading[] = res.data?.data || [];
        setReadings([...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch sensor readings:', err);
        setError('Failed to load readings for this sensor.');
        setReadings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sensorId, limit]);

  useEffect(() => fetch(), [fetch]);

  return { readings, loading, error, refetch: fetch };
}

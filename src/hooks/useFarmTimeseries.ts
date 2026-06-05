import { useCallback, useEffect, useRef, useState } from "react";
import { getFarmTimeseries, type TimeSeriesResponseDto } from "../api/supervisorMetrics";

const DEFAULT_FARM_ID = "aaaaaaaa-0000-0000-0000-000000000001";

export function useFarmTimeseries(farmIdParam?: string, opts?: { start?: string; end?: string; days?: number; metric?: string; interval?: string; groupBy?: string; aggregations?: string }) {
  const farmId = farmIdParam || DEFAULT_FARM_ID;
  const days = opts?.days ?? 30;
  const fixedStart = opts?.start;
  const fixedEnd = opts?.end;
  const metric = opts?.metric ?? "feed";
  const interval = opts?.interval ?? "day";
  const groupBy = opts?.groupBy ?? "none";
  const aggregations = opts?.aggregations ?? "sum";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeseries, setTimeseries] = useState<TimeSeriesResponseDto | null>(null);

  const lastFetchRef = useRef<number>(0);

  const fetchTimeseries = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    setLoading(true);
    setError(null);

    const end = fixedEnd ?? new Date().toISOString();
    const start = fixedStart ?? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    try {
      const res = await getFarmTimeseries(farmId, start, end, { metric, interval, groupBy, aggregations });
      setTimeseries(res ?? null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [farmId, days, fixedStart, fixedEnd, metric, interval, groupBy, aggregations]);

  useEffect(() => {
    fetchTimeseries();
  }, [fetchTimeseries]);

  return { loading, error, timeseries, refetch: fetchTimeseries } as const;
}

export default useFarmTimeseries;

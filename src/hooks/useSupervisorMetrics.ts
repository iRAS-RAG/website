import { useCallback, useEffect, useRef, useState } from "react";
import { getFarmSummary, getFarmTimeseries, getTopBatches, type BatchSummaryDto, type FarmSummaryDto, type TimeSeriesResponseDto } from "../api/supervisorMetrics";

const DEFAULT_FARM_ID = "aaaaaaaa-0000-0000-0000-000000000001";

export function useSupervisorMetrics(farmIdParam?: string, opts?: { start?: string; end?: string; days?: number }) {
  const farmId = farmIdParam || DEFAULT_FARM_ID;
  const days = opts?.days ?? 30;

  // Compute default start/end once on mount so they are stable across renders
  const rangeRef = useRef<{ start: string; end: string } | null>(null);
  if (rangeRef.current === null) {
    const endDefault = opts?.end ?? new Date().toISOString();
    const startDefault = opts?.start ?? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    rangeRef.current = { start: startDefault, end: endDefault };
  }
  const start = rangeRef.current.start;
  const end = rangeRef.current.end;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<FarmSummaryDto | null>(null);
  const [feedTimeseries, setFeedTimeseries] = useState<TimeSeriesResponseDto | null>(null);
  const [mortalityTimeseries, setMortalityTimeseries] = useState<TimeSeriesResponseDto | null>(null);
  const [topBatches, setTopBatches] = useState<BatchSummaryDto[]>([]);

  const lastFetchRef = useRef<number>(0);

  const fetchAll = useCallback(async () => {
    const now = Date.now();
    // Simple rate limit: avoid calling more than once per second
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    setLoading(true);
    setError(null);
    try {
      const [summaryRes, feedRes, mortalityRes, topRes] = await Promise.all([
        getFarmSummary(farmId, start, end),
        getFarmTimeseries(farmId, start, end, { metric: "feed", interval: "day", groupBy: "none", aggregations: "sum" }),
        getFarmTimeseries(farmId, start, end, { metric: "mortality", interval: "day", groupBy: "none", aggregations: "sum" }),
        getTopBatches(farmId, start, end, { metric: "feed", limit: 10 }),
      ]);

      setSummary(summaryRes ?? null);
      setFeedTimeseries(feedRes ?? null);
      setMortalityTimeseries(mortalityRes ?? null);
      setTopBatches(topRes ?? []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [farmId, start, end]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    loading,
    error,
    summary,
    feedTimeseries,
    mortalityTimeseries,
    topBatches,
    refetch: fetchAll,
  } as const;
}

export default useSupervisorMetrics;

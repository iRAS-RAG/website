import { useCallback, useEffect, useState } from "react";
import { getFarmSummary, type FarmSummaryDto } from "../api/supervisorMetrics";

const DEFAULT_FARM_ID = "aaaaaaaa-0000-0000-0000-000000000001";

export function useFarmSummary(farmIdParam?: string, opts?: { start?: string; end?: string; days?: number; groupBy?: string }) {
  const farmId = farmIdParam || DEFAULT_FARM_ID;
  const days = opts?.days ?? 30;
  const fixedStart = opts?.start;
  const fixedEnd = opts?.end;
  const groupBy = opts?.groupBy;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<FarmSummaryDto | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    const end = fixedEnd ?? new Date().toISOString();
    const start = fixedStart ?? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    try {
      const res = await getFarmSummary(farmId, start, end, groupBy);
      setSummary(res ?? null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [farmId, days, fixedStart, fixedEnd, groupBy]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { loading, error, summary, refetch: fetchSummary } as const;
}

export default useFarmSummary;

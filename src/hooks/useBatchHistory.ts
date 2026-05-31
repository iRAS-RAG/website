import { useCallback, useEffect, useRef, useState } from "react";
import { getBatchHistory, type BatchHistoryDto } from "../api/supervisorMetrics";

export function useBatchHistory(batchIdParam?: string, opts?: { start?: string; end?: string; days?: number; metrics?: string; interval?: string }) {
  const batchId = batchIdParam;
  const days = opts?.days ?? 30;
  const fixedStart = opts?.start;
  const fixedEnd = opts?.end;
  const metrics = opts?.metrics ?? "feed,mortality";
  const interval = opts?.interval ?? "day";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [history, setHistory] = useState<BatchHistoryDto | null>(null);

  const lastFetchRef = useRef<number>(0);

  const fetchHistory = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    if (!batchId) {
      setHistory(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const end = fixedEnd ?? new Date().toISOString();
    const start = fixedStart ?? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    try {
      const res = await getBatchHistory(batchId, start, end, { metrics, interval });
      setHistory(res ?? null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [batchId, days, fixedStart, fixedEnd, metrics, interval]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { loading, error, history, refetch: fetchHistory } as const;
}

export default useBatchHistory;

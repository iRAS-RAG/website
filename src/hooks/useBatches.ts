import { useCallback, useEffect, useState } from "react";
import {
  compareBatches as apiCompareBatches,
  createBatch as apiCreateBatch,
  createBatchOperationLog as apiCreateLog,
  deleteBatch as apiDeleteBatch,
  getBatch as apiGetBatch,
  harvestBatch as apiHarvestBatch,
  startBatch as apiStartBatch,
  terminateBatch as apiTerminateBatch,
  updateBatch as apiUpdateBatch,
  updateBatchSchedule as apiUpdateBatchSchedule,
  getBatchOperationLogs,
  getBatchPerformance,
  getBatches,
  type BatchesQuery,
} from "../api/batches";
import type { Batch, BatchComparison, BatchOperationLog, BatchPerformance, CreateBatchPayload, HarvestBatchPayload } from "../types/batch";

export type UseBatchesOptions = {
  autoLoad?: boolean;
  statusFilter?: "ACTIVE" | "HARVESTED" | "PAUSED" | "TERMINATED";
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export default function useBatches(options: UseBatchesOptions = {}) {
  const { autoLoad = true, statusFilter, page = 1, pageSize = 10, searchTerm = "", sortBy, sortDir } = options;

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(
    (statusOverride?: string): BatchesQuery => ({
      status: (statusOverride ?? statusFilter) as BatchesQuery["status"],
      page,
      pageSize,
      searchTerm: searchTerm || undefined,
      sortBy: sortBy || undefined,
      sortDir: sortDir || undefined,
    }),
    [statusFilter, page, pageSize, searchTerm, sortBy, sortDir],
  );

  // Load batches
  const loadBatches = useCallback(
    async (statusOverride?: "ACTIVE" | "HARVESTED" | "PAUSED" | "TERMINATED") => {
      setLoading(true);
      setError(null);
      try {
        const result = await getBatches(buildQuery(statusOverride));
        setBatches(result.items);
        setTotalItems(result.total);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load batches";
        setError(message);
        console.error("Failed to load batches:", err);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery],
  );

  // Auto-load on mount / when params change
  useEffect(() => {
    if (autoLoad) {
      loadBatches();
    }
  }, [autoLoad, loadBatches]);

  // Create a new batch
  const createBatch = async (payload: CreateBatchPayload): Promise<Batch | null> => {
    try {
      const newBatch = await apiCreateBatch(payload);
      if (newBatch) {
        setBatches((prev) => [newBatch, ...prev]);
      }
      return newBatch;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create batch";
      setError(message);
      throw err;
    }
  };

  // Update a batch
  const updateBatch = async (id: string, payload: Partial<CreateBatchPayload>): Promise<Batch | null> => {
    try {
      const updated = await apiUpdateBatch(id, payload);
      if (updated) {
        setBatches((prev) => prev.map((b) => (b.id === id ? updated : b)));
      }
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update batch";
      setError(message);
      throw err;
    }
  };

  // Harvest a batch
  const harvestBatch = async (id: string, payload: HarvestBatchPayload): Promise<Batch | null> => {
    try {
      const harvested = await apiHarvestBatch(id, payload);
      if (harvested) {
        setBatches((prev) => prev.map((b) => (b.id === id ? harvested : b)));
      }
      return harvested;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to harvest batch";
      setError(message);
      throw err;
    }
  };

  // Start/resume a paused batch
  const startBatch = async (id: string): Promise<Batch | null> => {
    try {
      const started = await apiStartBatch(id);
      if (started) {
        setBatches((prev) => prev.map((b) => (b.id === id ? started : b)));
      }
      return started;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start batch";
      setError(message);
      throw err;
    }
  };

  // Mark batch as terminated
  const terminateBatch = async (id: string): Promise<Batch | null> => {
    try {
      const terminated = await apiTerminateBatch(id);
      if (terminated) {
        setBatches((prev) => prev.map((b) => (b.id === id ? terminated : b)));
      }
      return terminated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to terminate batch";
      setError(message);
      throw err;
    }
  };

  // Delete a batch
  const deleteBatch = async (id: string): Promise<boolean> => {
    try {
      const success = await apiDeleteBatch(id);
      if (success) {
        setBatches((prev) => prev.filter((b) => b.id !== id));
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete batch";
      setError(message);
      return false;
    }
  };

  // Update batch schedule (for PAUSED batches)
  const updateBatchSchedule = async (id: string, payload: { startDate?: string; speciesId?: string; initialQuantity?: number }): Promise<Batch | null> => {
    try {
      const updated = await apiUpdateBatchSchedule(id, payload);
      if (updated) {
        setBatches((prev) => prev.map((b) => (b.id === id ? updated : b)));
      }
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update batch schedule";
      setError(message);
      throw err;
    }
  };

  // Refresh single batch
  const refreshBatch = async (id: string): Promise<Batch | null> => {
    try {
      const batch = await apiGetBatch(id);
      if (batch) {
        setBatches((prev) => {
          const exists = prev.some((b) => b.id === id);
          if (exists) {
            return prev.map((b) => (b.id === id ? batch : b));
          }
          return [batch, ...prev];
        });
      }
      return batch;
    } catch (err) {
      console.error("Failed to refresh batch:", err);
      return null;
    }
  };

  return {
    loading,
    batches,
    totalItems,
    error,
    loadBatches,
    createBatch,
    updateBatch,
    updateBatchSchedule,
    harvestBatch,
    startBatch,
    terminateBatch,
    deleteBatch,
    refreshBatch,
  } as const;
}

// Separate hook for batch details and operations
export function useBatchDetails(batchId: string | null) {
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [logs, setLogs] = useState<BatchOperationLog[]>([]);
  const [performance, setPerformance] = useState<BatchPerformance[]>([]);

  // Load batch details
  const loadBatchDetails = async (id: string) => {
    setLoading(true);
    try {
      const batchData = await apiGetBatch(id);
      const [logsData, performanceData] = await Promise.all([
        getBatchOperationLogs(id).catch((err) => {
          console.warn("Batch logs API unavailable, using empty logs:", err);
          return [] as BatchOperationLog[];
        }),
        getBatchPerformance(id, 7).catch((err) => {
          console.warn("Batch performance API unavailable, using empty performance data:", err);
          return [] as BatchPerformance[];
        }),
      ]);

      setBatch(batchData);
      setLogs(logsData);
      setPerformance(performanceData);
    } catch (err) {
      console.error("Failed to load batch details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create operation log
  const createLog = async (log: Omit<BatchOperationLog, "id" | "batchId" | "createdAt">): Promise<BatchOperationLog | null> => {
    if (!batchId) return null;
    try {
      const newLog = await apiCreateLog(batchId, log);
      if (newLog) {
        setLogs((prev) => [newLog, ...prev]);
        // If it's a mortality event, refresh batch data
        if (log.operationType === "mortality") {
          const updated = await apiGetBatch(batchId);
          if (updated) setBatch(updated);
        }
      }
      return newLog;
    } catch (err) {
      console.error("Failed to create log:", err);
      throw err;
    }
  };

  // Load performance for a specific time range
  const loadPerformance = async (days: number = 7) => {
    if (!batchId) return;
    try {
      const data = await getBatchPerformance(batchId, days);
      setPerformance(data);
    } catch (err) {
      console.error("Failed to load performance:", err);
    }
  };

  useEffect(() => {
    if (batchId) {
      loadBatchDetails(batchId);
    }
  }, [batchId]);

  return {
    loading,
    batch,
    logs,
    performance,
    loadBatchDetails,
    createLog,
    loadPerformance,
  } as const;
}

// Hook for batch comparison
export function useBatchComparison() {
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState<BatchComparison[]>([]);
  const [error, setError] = useState<string | null>(null);

  const compareBatches = async (batchIds: string[]) => {
    if (batchIds.length < 2) {
      setError("Please select at least 2 batches to compare");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiCompareBatches(batchIds);
      setComparisons(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to compare batches";
      setError(message);
      console.error("Failed to compare batches:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearComparison = () => {
    setComparisons([]);
    setError(null);
  };

  return {
    loading,
    comparisons,
    error,
    compareBatches,
    clearComparison,
  } as const;
}

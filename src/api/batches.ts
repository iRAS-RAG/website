import type { Batch, BatchComparison, BatchOperationLog, BatchPerformance, CreateBatchPayload, HarvestBatchPayload, PlannedStage } from "../types/batch";
import { apiFetch, extractArray } from "./client";

// Type converters
function toBatch(item: Record<string, unknown>): Batch {
  const initialQty = Number(item.initialQuantity ?? 0);
  const currentQty = typeof item.currentQuantity === "number" ? item.currentQuantity : initialQty;
  const survivalRate = initialQty > 0 ? (currentQty / initialQty) * 100 : undefined;

  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    fishTankId: String(item.fishTankId ?? ""),
    fishTankName: (item.fishTankName as string) || undefined,
    speciesStageConfigId: String(item.speciesStageConfigId ?? ""),
    plannedStages: Array.isArray(item.plannedStages)
      ? (item.plannedStages as unknown[]).map((s) => {
          const st = s as Record<string, unknown>;
          return {
            id: String(st.id ?? ""),
            sequence: Number(st.sequence ?? 0),
            speciesStageConfigId: (st.speciesStageConfigId as string) || undefined,
            growthStageId: (st.growthStageId as string) || undefined,
            stageName: (st.stageName as string) || "",
            expectedDurationDays: typeof st.expectedDurationDays === "number" ? (st.expectedDurationDays as number) : undefined,
            estimatedStartDate: (st.estimatedStartDate as string) || undefined,
            estimatedEndDate: (st.estimatedEndDate as string) || undefined,
          };
        })
      : undefined,
    speciesId: (item.speciesId as string) || undefined,
    speciesName: (item.speciesName as string) || undefined,
    growthStageId: (item.growthStageId as string) || undefined,
    stageName: (item.stageName as string) || undefined,
    status: (item.status as Batch["status"]) ?? "ACTIVE",
    pausedReason: item.pausedReason === null ? null : (item.pausedReason as string) || undefined,
    startDate: String(item.startDate ?? ""),
    estimatedHarvestDate: (item.estimatedHarvestDate as string) || undefined,
    actualHarvestDate: (item.actualHarvestDate as string) || undefined,
    initialQuantity: initialQty,
    currentQuantity: currentQty,
    unitOfMeasure: String(item.unitOfMeasure ?? "con"),
    estimatedHarvestCount: typeof item.estimatedHarvestCount === "number" ? (item.estimatedHarvestCount as number) : undefined,
    estimatedHarvestWeightKg: typeof item.estimatedHarvestWeightKg === "number" ? (item.estimatedHarvestWeightKg as number) : undefined,
    actualHarvestCount:
      typeof item.actualHarvestCount === "number" ? (item.actualHarvestCount as number) : typeof item.actual_harvest_count === "number" ? (item.actual_harvest_count as number) : undefined,
    actualHarvestWeightKg:
      typeof item.actualHarvestWeightKg === "number"
        ? (item.actualHarvestWeightKg as number)
        : typeof item.actual_harvest_weight_kg === "number"
          ? (item.actual_harvest_weight_kg as number)
          : undefined,
    fcr: typeof item.fcr === "number" ? (item.fcr as number) : undefined,
    tankVolume: typeof item.tankVolume === "number" ? (item.tankVolume as number) : typeof item.tank_volume === "number" ? (item.tank_volume as number) : undefined,
    survivalRate,
    createdAt: (item.createdAt as string) || undefined,
    modifiedAt: item.modifiedAt === null ? null : (item.modifiedAt as string) || undefined,
  };
}

function toBatchOperationLog(item: Record<string, unknown>): BatchOperationLog {
  return {
    id: String(item.id ?? ""),
    batchId: String(item.batchId ?? item.batch_id ?? ""),
    operationType: (item.operationType as BatchOperationLog["operationType"]) || (item.operation_type as BatchOperationLog["operationType"]) || "other",
    description: String(item.description ?? ""),
    quantity: typeof item.quantity === "number" ? item.quantity : undefined,
    loggedBy: (item.loggedBy as string) || (item.logged_by as string) || undefined,
    loggedByName: (item.loggedByName as string) || (item.logged_by_name as string) || undefined,
    timestamp: String(item.timestamp ?? item.created_at ?? ""),
    createdAt: (item.createdAt as string) || (item.created_at as string) || undefined,
  };
}

function toBatchPerformance(item: Record<string, unknown>): BatchPerformance {
  return {
    batchId: String(item.batchId ?? item.batch_id ?? ""),
    date: String(item.date ?? ""),
    averageTemp: typeof item.averageTemp === "number" ? item.averageTemp : (item.average_temp as number) || undefined,
    averagePh: typeof item.averagePh === "number" ? item.averagePh : (item.average_ph as number) || undefined,
    averageDo: typeof item.averageDo === "number" ? item.averageDo : (item.average_do as number) || undefined,
    estimatedBiomass: typeof item.estimatedBiomass === "number" ? item.estimatedBiomass : (item.estimated_biomass as number) || undefined,
    feedAmount: typeof item.feedAmount === "number" ? item.feedAmount : (item.feed_amount as number) || undefined,
  };
}

function toPlannedStage(item: Record<string, unknown>): PlannedStage {
  return {
    id: String(item.id ?? ""),
    sequence: Number(item.sequence ?? 0),
    speciesStageConfigId: (item.speciesStageConfigId as string) || undefined,
    growthStageId: (item.growthStageId as string) || undefined,
    stageName: (item.stageName as string) || "",
    expectedDurationDays: typeof item.expectedDurationDays === "number" ? (item.expectedDurationDays as number) : undefined,
    estimatedStartDate: (item.estimatedStartDate as string) || undefined,
    estimatedEndDate: (item.estimatedEndDate as string) || undefined,
    actualStartDate: (item.actualStartDate as string) || undefined,
    actualEndDate: item.actualEndDate === null ? undefined : (item.actualEndDate as string) || undefined,
    amountPer100Fish: typeof item.amountPer100Fish === "number" ? (item.amountPer100Fish as number) : undefined,
    frequencyPerDay: typeof item.frequencyPerDay === "number" ? (item.frequencyPerDay as number) : undefined,
    maxStockingDensity: typeof item.maxStockingDensity === "number" ? (item.maxStockingDensity as number) : undefined,
    feedTypeNames: Array.isArray(item.feedTypeNames) ? (item.feedTypeNames as unknown[]).map((f) => String(f)) : undefined,
    // Per-batch calculated fields returned by /batches/{id}/stages
    expectedCount: typeof item.expectedCount === "number" ? (item.expectedCount as number) : typeof item.expected_count === "number" ? (item.expected_count as number) : undefined,
    expectedTotalWeightKg:
      typeof item.expectedTotalWeightKg === "number"
        ? (item.expectedTotalWeightKg as number)
        : typeof item.expected_total_weight_kg === "number"
          ? (item.expected_total_weight_kg as number)
          : undefined,
    estimatedDailyFeedKg:
      typeof item.estimatedDailyFeedKg === "number" ? (item.estimatedDailyFeedKg as number) : typeof item.estimated_daily_feed_kg === "number" ? (item.estimated_daily_feed_kg as number) : undefined,
    expectedWeightKgPerFish: typeof item.expectedWeightKgPerFish === "number" ? (item.expectedWeightKgPerFish as number) : undefined,
    survivalRate: typeof item.survivalRate === "number" ? (item.survivalRate as number) : undefined,
  };
}

// API Functions

/**
 * Get all batches with optional status filter
 */
export type BatchesQuery = {
  status?: "ACTIVE" | "HARVESTED" | "PAUSED" | "TERMINATED";
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDir?: string;
};

// ─── Active batch with safe thresholds ────────────────────────────────────────

export type SafeThreshold = {
  sensorTypeId: string;
  sensorTypeName: string;
  unitOfMeasure: string;
  minValue: number;
  maxValue: number;
};

export type ActiveBatchInfo = {
  farmingBatchName: string;
  fishTankName: string;
  speciesName: string;
  currentQuantity: number;
  tankVolume: number;
  safeThresholds: SafeThreshold[];
};

/**
 * Get the active batch for a tank, including species-config safe thresholds.
 */
export async function getActiveBatch(fishTankId: string): Promise<ActiveBatchInfo | null> {
  try {
    const res = await apiFetch<{ message?: string; data?: ActiveBatchInfo }>(`/batches/active?fishTankId=${encodeURIComponent(fishTankId)}`);
    if (!res) return null;
    const data = (res as Record<string, unknown>).data ?? res;
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    return {
      farmingBatchName: String(d.farmingBatchName ?? ""),
      fishTankName: String(d.fishTankName ?? ""),
      speciesName: String(d.speciesName ?? ""),
      currentQuantity: Number(d.currentQuantity ?? 0),
      tankVolume: Number(d.tankVolume ?? 0),
      safeThresholds: Array.isArray(d.safeThresholds)
        ? (d.safeThresholds as unknown[]).map((t) => {
            const th = t as Record<string, unknown>;
            return {
              sensorTypeId: String(th.sensorTypeId ?? ""),
              sensorTypeName: String(th.sensorTypeName ?? ""),
              unitOfMeasure: String(th.unitOfMeasure ?? ""),
              minValue: Number(th.minValue ?? 0),
              maxValue: Number(th.maxValue ?? 0),
            };
          })
        : [],
    };
  } catch {
    return null;
  }
}

export async function getBatches(query?: BatchesQuery): Promise<{ items: Batch[]; total: number }> {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.page) params.set("page", String(query.page));
  if (query?.pageSize) params.set("pageSize", String(query.pageSize));
  if (query?.searchTerm) params.set("searchTerm", query.searchTerm);
  if (query?.sortBy) params.set("sortBy", query.sortBy);
  if (query?.sortDir) params.set("sortDir", query.sortDir);
  const res = await apiFetch<unknown>(`/batches?${params.toString()}`);
  const items = extractArray(res);
  let total = 0;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const meta = obj["meta"] as Record<string, unknown> | undefined;
    total = (meta?.totalItems as number) ?? items.length;
  }
  return { items: items.map((i) => toBatch(i as Record<string, unknown>)), total };
}

/**
 * Get a single batch by ID
 */
export async function getBatch(id: string): Promise<Batch | null> {
  try {
    const res = await apiFetch<Record<string, unknown>>(`/batches/${id}`);
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to get batch:", error);
    return null;
  }
}

/**
 * Create a new batch
 */
export async function createBatch(payload: CreateBatchPayload): Promise<Batch | null> {
  try {
    const body = {
      fishTankId: payload.fishTankId,
      name: payload.name,
      speciesId: payload.speciesId,
      startDate: payload.startDate,
      initialQuantity: payload.initialQuantity,
      unitOfMeasure: payload.unitOfMeasure,
    };
    const res = await apiFetch<Record<string, unknown>>("/batches", {
      method: "POST",
      body,
    });
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to create batch:", error);
    throw error;
  }
}

/**
 * Update batch information (name, currentQuantity, unitOfMeasure)
 */
export async function updateBatch(id: string, payload: { name?: string; currentQuantity?: number; unitOfMeasure?: string }): Promise<Batch | null> {
  try {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.currentQuantity !== undefined) body.currentQuantity = payload.currentQuantity;
    if (payload.unitOfMeasure !== undefined) body.unitOfMeasure = payload.unitOfMeasure;

    const res = await apiFetch<Record<string, unknown>>(`/batches/${id}`, {
      method: "PUT",
      body,
    });
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to update batch:", error);
    throw error;
  }
}

/**
 * Update batch schedule (for PAUSED batches: startDate, speciesId, initialQuantity)
 */
export async function updateBatchSchedule(id: string, payload: { startDate?: string; speciesId?: string; initialQuantity?: number }): Promise<Batch | null> {
  try {
    const body: Record<string, unknown> = {};
    if (payload.startDate !== undefined) body.startDate = payload.startDate;
    if (payload.speciesId !== undefined) body.speciesId = payload.speciesId;
    if (payload.initialQuantity !== undefined) body.initialQuantity = payload.initialQuantity;

    const res = await apiFetch<Record<string, unknown>>(`/batches/${id}/schedule`, {
      method: "PUT",
      body,
    });
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to update batch schedule:", error);
    throw error;
  }
}

/**
 * Harvest/close a batch
 */
export async function harvestBatch(id: string, payload: HarvestBatchPayload): Promise<Batch | null> {
  try {
    const body: Record<string, unknown> = {
      harvestDate: payload.harvestDate,
      force: payload.force ?? false,
      actualHarvestWeightKg: (payload as Record<string, unknown>).actualHarvestWeightKg,
    };
    const res = await apiFetch<Record<string, unknown>>(`/batches/${id}/harvest`, { method: "POST", body });
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to harvest batch:", error);
    throw error;
  }
}

/**
 * Start/resume a paused batch
 */
export async function startBatch(id: string): Promise<Batch | null> {
  try {
    const res = await apiFetch<Record<string, unknown>>(`/batches/${id}/start`, { method: "POST" });
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to start batch:", error);
    throw error;
  }
}

/**
 * Mark a batch as terminated
 */
export async function terminateBatch(id: string): Promise<Batch | null> {
  try {
    const res = await apiFetch<Record<string, unknown>>(`/batches/${id}/terminate`, {
      method: "POST",
    });
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to terminate batch:", error);
    throw error;
  }
}

/**
 * Delete a batch
 */
export async function deleteBatch(id: string): Promise<boolean> {
  try {
    await apiFetch<void>(`/batches/${id}`, { method: "DELETE" });
    return true;
  } catch (error) {
    console.error("Failed to delete batch:", error);
    return false;
  }
}

// Operation Logs

/**
 * Get operation logs for a batch
 */
export async function getBatchOperationLogs(batchId: string): Promise<BatchOperationLog[]> {
  try {
    const res = await apiFetch<unknown>(`/batches/${batchId}/logs`);
    const items = extractArray(res);
    return items.map((i) => toBatchOperationLog(i as Record<string, unknown>));
  } catch (error) {
    // Backend endpoint may not be available yet; keep detail page functional.
    if ((error as { status?: number })?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Create an operation log entry
 */
export async function createBatchOperationLog(batchId: string, log: Omit<BatchOperationLog, "id" | "batchId" | "createdAt">): Promise<BatchOperationLog | null> {
  try {
    const body = {
      operation_type: log.operationType,
      description: log.description,
      quantity: log.quantity,
      timestamp: log.timestamp,
    };
    const res = await apiFetch<Record<string, unknown>>(`/batches/${batchId}/logs`, { method: "POST", body });
    if (!res) return null;
    return toBatchOperationLog(res);
  } catch (error) {
    console.error("Failed to create operation log:", error);
    throw error;
  }
}

/**
 * Get planned stages for a batch
 */
export async function getBatchStages(batchId: string): Promise<PlannedStage[]> {
  try {
    const res = await apiFetch<unknown>(`/batches/${batchId}/stages`);
    const items = extractArray(res);
    return items.map((i) => toPlannedStage(i as Record<string, unknown>));
  } catch (error) {
    console.error("Failed to get batch stages:", error);
    return [];
  }
}

// Performance data

/**
 * Get performance metrics for a batch
 */
export async function getBatchPerformance(batchId: string, days: number = 7): Promise<BatchPerformance[]> {
  try {
    const res = await apiFetch<unknown>(`/batches/${batchId}/performance?days=${days}`);
    const items = extractArray(res);
    return items.map((i) => toBatchPerformance(i as Record<string, unknown>));
  } catch (error) {
    console.error("Failed to get batch performance:", error);
    return [];
  }
}

// Comparison

/**
 * Compare multiple batches
 */
export async function compareBatches(batchIds: string[]): Promise<BatchComparison[]> {
  try {
    const query = batchIds.map((id) => `batchIds=${id}`).join("&");
    const res = await apiFetch<unknown>(`/reports/compare-batches?${query}`);
    const items = extractArray(res);
    return items.map((item) => {
      const i = item as Record<string, unknown>;
      return {
        batchId: String(i.batchId ?? i.batch_id ?? ""),
        batchName: String(i.batchName ?? i.batch_name ?? ""),
        survivalRate: Number(i.survivalRate ?? i.survival_rate ?? 0),
        averageDo: Number(i.averageDo ?? i.average_do ?? 0),
        averageTemp: Number(i.averageTemp ?? i.average_temp ?? 0),
        averagePh: Number(i.averagePh ?? i.average_ph ?? 0),
        incidentCount: Number(i.incidentCount ?? i.incident_count ?? 0),
        cycleDuration: Number(i.cycleDuration ?? i.cycle_duration ?? 0),
      };
    });
  } catch (error) {
    console.error("Failed to compare batches:", error);
    return [];
  }
}

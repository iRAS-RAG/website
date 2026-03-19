import type {
  Batch,
  BatchComparison,
  BatchOperationLog,
  BatchPerformance,
  CreateBatchPayload,
  HarvestBatchPayload,
} from "../types/batch";
import { apiFetch, extractArray } from "./client";

// Type converters
function toBatch(item: Record<string, unknown>): Batch {
  const initialQty = Number(item.initialQuantity ?? 0);
  const currentQty =
    typeof item.currentQuantity === "number"
      ? item.currentQuantity
      : initialQty;
  const survivalRate =
    initialQty > 0 ? (currentQty / initialQty) * 100 : undefined;

  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    fishTankId: String(item.fishTankId ?? ""),
    fishTankName: (item.fishTankName as string) || undefined,
    speciesStageConfigId: String(item.speciesStageConfigId ?? ""),
    speciesId: (item.speciesId as string) || undefined,
    speciesName: (item.speciesName as string) || undefined,
    growthStageId: (item.growthStageId as string) || undefined,
    stageName: (item.stageName as string) || undefined,
    status: (item.status as Batch["status"]) ?? "ACTIVE",
    pausedReason:
      item.pausedReason === null
        ? null
        : (item.pausedReason as string) || undefined,
    startDate: String(item.startDate ?? ""),
    estimatedHarvestDate: (item.estimatedHarvestDate as string) || undefined,
    actualHarvestDate: (item.actualHarvestDate as string) || undefined,
    initialQuantity: initialQty,
    currentQuantity: currentQty,
    unitOfMeasure: String(item.unitOfMeasure ?? "con"),
    survivalRate,
    createdAt: (item.createdAt as string) || undefined,
    modifiedAt:
      item.modifiedAt === null
        ? null
        : (item.modifiedAt as string) || undefined,
  };
}

function toBatchOperationLog(item: Record<string, unknown>): BatchOperationLog {
  return {
    id: String(item.id ?? ""),
    batchId: String(item.batchId ?? item.batch_id ?? ""),
    operationType:
      (item.operationType as BatchOperationLog["operationType"]) ||
      (item.operation_type as BatchOperationLog["operationType"]) ||
      "other",
    description: String(item.description ?? ""),
    quantity: typeof item.quantity === "number" ? item.quantity : undefined,
    loggedBy:
      (item.loggedBy as string) || (item.logged_by as string) || undefined,
    loggedByName:
      (item.loggedByName as string) ||
      (item.logged_by_name as string) ||
      undefined,
    timestamp: String(item.timestamp ?? item.created_at ?? ""),
    createdAt:
      (item.createdAt as string) || (item.created_at as string) || undefined,
  };
}

function toBatchPerformance(item: Record<string, unknown>): BatchPerformance {
  return {
    batchId: String(item.batchId ?? item.batch_id ?? ""),
    date: String(item.date ?? ""),
    averageTemp:
      typeof item.averageTemp === "number"
        ? item.averageTemp
        : (item.average_temp as number) || undefined,
    averagePh:
      typeof item.averagePh === "number"
        ? item.averagePh
        : (item.average_ph as number) || undefined,
    averageDo:
      typeof item.averageDo === "number"
        ? item.averageDo
        : (item.average_do as number) || undefined,
    estimatedBiomass:
      typeof item.estimatedBiomass === "number"
        ? item.estimatedBiomass
        : (item.estimated_biomass as number) || undefined,
    feedAmount:
      typeof item.feedAmount === "number"
        ? item.feedAmount
        : (item.feed_amount as number) || undefined,
  };
}

// API Functions

/**
 * Get all batches with optional status filter
 */
export async function getBatches(
  status?: "ACTIVE" | "HARVESTED" | "PAUSED" | "TERMINATED",
): Promise<Batch[]> {
  const query = status ? `?status=${status}` : "";
  const res = await apiFetch<unknown>(`/batches${query}`);
  const items = extractArray(res);
  return items.map((i) => toBatch(i as Record<string, unknown>));
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
export async function createBatch(
  payload: CreateBatchPayload,
): Promise<Batch | null> {
  try {
    const body = {
      fishTankId: payload.fishTankId,
      name: payload.name,
      speciesStageConfigId: payload.speciesStageConfigId,
      startDate: payload.startDate,
      estimatedHarvestDate: payload.estimatedHarvestDate,
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
 * Update batch information
 */
export async function updateBatch(
  id: string,
  payload: Partial<CreateBatchPayload>,
): Promise<Batch | null> {
  try {
    const body: Record<string, unknown> = {};
    if (payload.name) body.name = payload.name;
    if (payload.fishTankId) body.fishTankId = payload.fishTankId;
    if (payload.speciesStageConfigId)
      body.speciesStageConfigId = payload.speciesStageConfigId;
    if (payload.startDate) body.startDate = payload.startDate;
    if (payload.estimatedHarvestDate)
      body.estimatedHarvestDate = payload.estimatedHarvestDate;
    if (payload.initialQuantity) body.initialQuantity = payload.initialQuantity;
    if (payload.unitOfMeasure) body.unitOfMeasure = payload.unitOfMeasure;

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
 * Harvest/close a batch
 */
export async function harvestBatch(
  id: string,
  payload: HarvestBatchPayload,
): Promise<Batch | null> {
  try {
    const body = {
      actualHarvestDate: payload.actualHarvestDate,
      finalQuantity: payload.finalQuantity,
      notes: payload.notes,
      status: "HARVESTED",
    };
    const res = await apiFetch<Record<string, unknown>>(
      `/batches/${id}/harvest`,
      { method: "POST", body },
    );
    if (!res) return null;
    return toBatch(res);
  } catch (error) {
    console.error("Failed to harvest batch:", error);
    throw error;
  }
}

/**
 * Mark a batch as terminated
 */
export async function terminateBatch(
  id: string,
  reason: string,
): Promise<Batch | null> {
  try {
    const body = { status: "TERMINATED", pausedReason: reason };
    const res = await apiFetch<Record<string, unknown>>(`/batches/${id}`, {
      method: "PUT",
      body,
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
export async function getBatchOperationLogs(
  batchId: string,
): Promise<BatchOperationLog[]> {
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
export async function createBatchOperationLog(
  batchId: string,
  log: Omit<BatchOperationLog, "id" | "batchId" | "createdAt">,
): Promise<BatchOperationLog | null> {
  try {
    const body = {
      operation_type: log.operationType,
      description: log.description,
      quantity: log.quantity,
      timestamp: log.timestamp,
    };
    const res = await apiFetch<Record<string, unknown>>(
      `/batches/${batchId}/logs`,
      { method: "POST", body },
    );
    if (!res) return null;
    return toBatchOperationLog(res);
  } catch (error) {
    console.error("Failed to create operation log:", error);
    throw error;
  }
}

// Performance data

/**
 * Get performance metrics for a batch
 */
export async function getBatchPerformance(
  batchId: string,
  days: number = 7,
): Promise<BatchPerformance[]> {
  try {
    const res = await apiFetch<unknown>(
      `/batches/${batchId}/performance?days=${days}`,
    );
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
export async function compareBatches(
  batchIds: string[],
): Promise<BatchComparison[]> {
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

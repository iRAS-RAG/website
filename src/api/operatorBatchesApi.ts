// src/api/operatorBatchesApi.ts
import { apiFetch } from "./client";

export const operatorBatchesApi = {
  getBatches: async () =>
    await apiFetch<unknown>("/batches?page=1&pageSize=50", { method: "GET" }),

  // LẤY DANH SÁCH LOẠI THỨC ĂN (CHO DROPDOWN)
  getFeedTypes: async () =>
    await apiFetch<unknown>("/feed-types?page=1&pageSize=50", {
      method: "GET",
    }),

  getFeedingLogs: async (batchId: string) =>
    await apiFetch<unknown>(
      `/batches/${batchId}/feeding-logs?page=1&pageSize=50`,
      { method: "GET" },
    ),

  getMortalityLogs: async (batchId: string) =>
    await apiFetch<unknown>(
      `/mortality-logs?BatchId=${batchId}&page=1&pageSize=50`,
      { method: "GET" },
    ),

  // CẬP NHẬT: Gửi thêm feedTypeId xuống Backend
  recordFeeding: async (batchId: string, amount: number, feedTypeId: string) =>
    await apiFetch<unknown>(`/batches/${batchId}/feeding`, {
      method: "POST",
      body: {
        farmingBatchId: batchId,
        amount: amount,
        feedTypeId: feedTypeId,
        createdDate: new Date().toISOString(),
      },
    }),

  // Validate trước khi ghi nhận: trả về { isWithinRange, message }
  validateMortality: async (
    batchId: string,
    quantity: number,
    weight: number,
    date: string,
  ) =>
    await apiFetch<{ isWithinRange: boolean; message: string }>(
      `/batches/${batchId}/mortality/validate`,
      {
        method: "POST",
        body: { quantity, lostWeightKg: weight, date },
      },
    ),

  logMortality: async (
    batchId: string,
    quantity: number,
    weight: number,
    date: string,
  ) =>
    await apiFetch<unknown>(`/batches/${batchId}/mortality`, {
      method: "POST",
      body: { quantity, lostWeightKg: weight, date },
    }),

  harvestBatch: async (batchId: string) =>
    await apiFetch<unknown>(`/batches/${batchId}/harvest`, {
      method: "PUT",
      body: {},
    }),

  pauseBatch: async (batchId: string) =>
    await apiFetch<unknown>(`/batches/${batchId}/pause`, {
      method: "PUT",
      body: { reason: 0 },
    }),
};

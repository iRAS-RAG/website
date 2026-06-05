import { apiFetch } from "./client";

export type BatchSummaryDto = {
  batchId: string;
  batchName?: string;
  fishTankId?: string;
  fishTankName?: string;
  initialQuantity?: number;
  currentQuantity?: number;
  totalFeedKg?: number | null;
  totalDeaths?: number | null;
  totalDeadWeightKg?: number | null;
  fcr?: number | null;
};

export type FarmSummaryDto = {
  farmId: string;
  totalInitialQuantity: number;
  totalCurrentQuantity: number;
  totalFeedKg: number;
  totalDeathsCount: number;
  totalDeadWeightKg: number;
  totalHarvestedBatches: number;
  totalHarvestWeightKg: number;
  fcr?: number | null;
  batches: BatchSummaryDto[];
};

export type TimeSeriesPointDto = {
  timestamp: string;
  value: number;
};

export type TimeSeriesSeriesDto = {
  groupId: string;
  groupName: string;
  points: TimeSeriesPointDto[];
};

export type TimeSeriesResponseDto = {
  metric: string;
  series: TimeSeriesSeriesDto[];
};

export type BatchHistoryDto = {
  batchId: string;
  batchName?: string;
  feedSeries?: TimeSeriesPointDto[];
  mortalitySeries?: TimeSeriesPointDto[];
  countSeries?: TimeSeriesPointDto[];
  fcrSeries?: TimeSeriesPointDto[];
};

export async function getFarmSummary(farmId: string, start: string, end: string, groupBy?: string) {
  const params = new URLSearchParams({ start, end });
  if (groupBy) params.set("groupBy", groupBy);
  return apiFetch<FarmSummaryDto>(`supervisor/metrics/farm/${farmId}/summary?${params.toString()}`);
}

export async function getFarmTimeseries(farmId: string, start: string, end: string, options?: { metric?: string; interval?: string; groupBy?: string; aggregations?: string }) {
  const { metric = "feed", interval = "day", groupBy = "none", aggregations = "sum" } = options || {};
  const params = new URLSearchParams({ start, end, metric, interval, groupBy, aggregations });
  return apiFetch<TimeSeriesResponseDto>(`supervisor/metrics/farm/${farmId}/timeseries?${params.toString()}`);
}

export async function getBatchHistory(batchId: string, start: string, end: string, options?: { metrics?: string; interval?: string }) {
  const { metrics = "feed,mortality", interval = "day" } = options || {};
  const params = new URLSearchParams({ start, end, metrics, interval });
  return apiFetch<BatchHistoryDto>(`supervisor/metrics/batch/${batchId}/history?${params.toString()}`);
}

export async function getTopBatches(farmId: string, start: string, end: string, options?: { metric?: string; limit?: number }) {
  const { metric = "feed", limit = 10 } = options || {};
  const params = new URLSearchParams({ start, end, metric, limit: String(limit) });
  return apiFetch<BatchSummaryDto[]>(`supervisor/metrics/farm/${farmId}/top-batches?${params.toString()}`);
}

export default { getFarmSummary, getFarmTimeseries, getBatchHistory, getTopBatches };

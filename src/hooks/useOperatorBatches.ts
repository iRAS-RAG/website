// src/hooks/useOperatorBatches.ts
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { operatorBatchesApi } from "../api/operatorBatchesApi";
import { extractArray } from "../api/client";

import type {
  IOperatorFarmingBatch,
  IOperatorFeedingLog,
  IOperatorMortalityLog,
  IFeedType,
} from "../types/operatorBatch";

export const useOperatorBatches = () => {
  const [batches, setBatches] = useState<IOperatorFarmingBatch[]>([]);
  const [selectedBatch, setSelectedBatch] =
    useState<IOperatorFarmingBatch | null>(null);

  const [feedingLogs, setFeedingLogs] = useState<IOperatorFeedingLog[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<IOperatorMortalityLog[]>(
    [],
  );
  const [feedTypes, setFeedTypes] = useState<IFeedType[]>([]);

  const [loading, setLoading] = useState(true);

  // Load đồng thời Lô nuôi và Danh sách Cám
  const fetchMasterData = useCallback(async () => {
    try {
      const [batchesRes, feedTypesRes] = await Promise.all([
        operatorBatchesApi.getBatches().catch(() => []),
        operatorBatchesApi.getFeedTypes().catch(() => []),
      ]);

      const batchesData = extractArray(batchesRes) as IOperatorFarmingBatch[];
      setBatches(batchesData);
      if (batchesData.length > 0 && !selectedBatch)
        setSelectedBatch(batchesData[0]);

      setFeedTypes(extractArray(feedTypesRes) as IFeedType[]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const fetchBatchDetails = useCallback(async () => {
    if (!selectedBatch) return;
    try {
      const [feedRes, mortRes] = await Promise.all([
        operatorBatchesApi.getFeedingLogs(selectedBatch.id).catch(() => []),
        operatorBatchesApi.getMortalityLogs(selectedBatch.id).catch(() => []),
      ]);

      setFeedingLogs(extractArray(feedRes) as IOperatorFeedingLog[]);
      setMortalityLogs(extractArray(mortRes) as IOperatorMortalityLog[]);
    } catch (error) {
      console.error("Lỗi tải chi tiết lô", error);
    }
  }, [selectedBatch]);

  useEffect(() => {
    fetchBatchDetails();
  }, [fetchBatchDetails]);

  const totalFeed = feedingLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalDead = mortalityLogs.reduce((sum, log) => sum + log.quantity, 0);
  const ageDays = selectedBatch
    ? dayjs().diff(dayjs(selectedBatch.startDate), "day")
    : 0;

  const survivalRate =
    selectedBatch && selectedBatch.initialQuantity > 0
      ? (
          (selectedBatch.currentQuantity / selectedBatch.initialQuantity) *
          100
        ).toFixed(1)
      : "0.0";

  return {
    batches,
    selectedBatch,
    setSelectedBatch,
    feedingLogs,
    mortalityLogs,
    feedTypes, // Bổ sung FeedTypes
    totalFeed,
    totalDead,
    ageDays,
    survivalRate,
    loading,
    refetch: fetchMasterData,
    refetchDetails: fetchBatchDetails,
  };
};

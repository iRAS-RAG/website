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

  const fetchMasterData = useCallback(async () => {
    try {
      const [batchesRes, feedTypesRes] = await Promise.all([
        operatorBatchesApi.getBatches().catch(() => []),
        operatorBatchesApi.getFeedTypes().catch(() => []),
      ]);

      const batchesData = extractArray(batchesRes) as IOperatorFarmingBatch[];
      setBatches(batchesData);

      // FIX BUG REDIRECT: Dùng callback của setState để luôn lấy được selectedBatch mới nhất
      setSelectedBatch((prevSelected) => {
        if (!prevSelected && batchesData.length > 0) return batchesData[0];
        if (prevSelected) {
          // Cập nhật lại data mới nhất cho batch đang chọn (bao gồm currentQuantity mới từ Server)
          const updated = batchesData.find((b) => b.id === prevSelected.id);
          return updated || batchesData[0];
        }
        return null;
      });

      setFeedTypes(extractArray(feedTypesRes) as IFeedType[]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
    } finally {
      setLoading(false);
    }
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
    setBatches,
    selectedBatch,
    setSelectedBatch, // Chắc chắn export hàm này
    feedingLogs,
    mortalityLogs,
    feedTypes,
    totalFeed,
    totalDead,
    ageDays,
    survivalRate,
    loading,
    refetch: fetchMasterData,
    refetchDetails: fetchBatchDetails,
  };
};

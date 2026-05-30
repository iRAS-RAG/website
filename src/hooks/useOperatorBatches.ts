import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { getBatch as getBatchDetails } from "../api/batches";
import { extractArray } from "../api/client";
import { operatorBatchesApi } from "../api/operatorBatchesApi";

import type { IFeedType, IOperatorFarmingBatch, IOperatorFeedingLog, IOperatorMortalityLog } from "../types/operatorBatch";

export const useOperatorBatches = () => {
  const [batches, setBatches] = useState<IOperatorFarmingBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<IOperatorFarmingBatch | null>(null);

  const [feedingLogs, setFeedingLogs] = useState<IOperatorFeedingLog[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<IOperatorMortalityLog[]>([]);
  const [feedTypes, setFeedTypes] = useState<IFeedType[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchMasterData = useCallback(async () => {
    try {
      const [batchesRes, feedTypesRes] = await Promise.all([operatorBatchesApi.getBatches().catch(() => []), operatorBatchesApi.getFeedTypes().catch(() => [])]);

      // Sort: lô mới (startDate gần nhất) lên đầu; nếu thiếu startDate thì đẩy xuống cuối.
      const batchesData = (extractArray(batchesRes) as IOperatorFarmingBatch[]).slice().sort((a, b) => {
        const ta = a.startDate ? new Date(a.startDate).getTime() : 0;
        const tb = b.startDate ? new Date(b.startDate).getTime() : 0;
        return tb - ta;
      });
      setBatches(batchesData);

      // KHÔNG auto-select batch đầu tiên — user phải chủ động chọn.
      // Chỉ giữ lại selection nếu batch đó vẫn tồn tại sau refetch.
      setSelectedBatch((prevSelected) => {
        if (!prevSelected) return null;
        const updated = batchesData.find((b) => b.id === prevSelected.id);
        return updated || null;
      });

      // If we have a chosen batch id, attempt to fetch richer batch details and merge estimated fields
      try {
        const chosenId = (selectedBatch && selectedBatch.id) || (batchesData[0] && batchesData[0].id) || null;
        if (chosenId) {
          const detailed = await getBatchDetails(chosenId).catch(() => null);
          if (detailed) {
            setSelectedBatch((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                currentQuantity: detailed.currentQuantity ?? prev.currentQuantity,
                tankVolume: detailed.tankVolume ?? prev.tankVolume,
                estimatedHarvestCount: detailed.estimatedHarvestCount ?? (prev as any).estimatedHarvestCount,
                estimatedHarvestWeightKg: detailed.estimatedHarvestWeightKg ?? (prev as any).estimatedHarvestWeightKg,
              } as IOperatorFarmingBatch;
            });
          }
        }
      } catch (err) {
        // ignore detail fetch errors
        console.warn("Failed to fetch detailed batch info:", err);
      }

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
      const [feedRes, mortRes] = await Promise.all([operatorBatchesApi.getFeedingLogs(selectedBatch.id).catch(() => []), operatorBatchesApi.getMortalityLogs(selectedBatch.id).catch(() => [])]);

      // Sort DESC: log mới nhất (createdDate / date gần nhất) luôn ở đầu
      const feedingArr = (extractArray(feedRes) as IOperatorFeedingLog[])
        .slice()
        .sort((a, b) => {
          const ta = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const tb = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          return tb - ta;
        });
      const mortalityArr = (extractArray(mortRes) as IOperatorMortalityLog[])
        .slice()
        .sort((a, b) => {
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return tb - ta;
        });
      setFeedingLogs(feedingArr);
      setMortalityLogs(mortalityArr);

      try {
        const detailed = await getBatchDetails(selectedBatch.id).catch(() => null);
        if (detailed) {
          setSelectedBatch((prev) => {
            if (!prev) return prev;
            const newCurrentQuantity = detailed.currentQuantity ?? prev.currentQuantity;
            const newTankVolume = detailed.tankVolume ?? prev.tankVolume;
            const newEstimatedHarvestCount = detailed.estimatedHarvestCount ?? (prev as any).estimatedHarvestCount;
            const newEstimatedHarvestWeightKg = detailed.estimatedHarvestWeightKg ?? (prev as any).estimatedHarvestWeightKg;

            const unchanged =
              newCurrentQuantity === prev.currentQuantity &&
              newTankVolume === prev.tankVolume &&
              newEstimatedHarvestCount === (prev as any).estimatedHarvestCount &&
              newEstimatedHarvestWeightKg === (prev as any).estimatedHarvestWeightKg;

            if (unchanged) return prev;

            return {
              ...prev,
              currentQuantity: newCurrentQuantity,
              tankVolume: newTankVolume,
              estimatedHarvestCount: newEstimatedHarvestCount,
              estimatedHarvestWeightKg: newEstimatedHarvestWeightKg,
            } as IOperatorFarmingBatch;
          });
        }
      } catch (err) {
        console.warn("Failed to fetch detailed batch info:", err);
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết lô", error);
    }
  }, [selectedBatch]);

  useEffect(() => {
    fetchBatchDetails();
  }, [fetchBatchDetails]);

  const totalFeed = feedingLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalDead = mortalityLogs.reduce((sum, log) => sum + log.quantity, 0);
  const ageDays = selectedBatch ? dayjs().diff(dayjs(selectedBatch.startDate), "day") : 0;

  const survivalRate = selectedBatch && selectedBatch.initialQuantity > 0 ? ((selectedBatch.currentQuantity / selectedBatch.initialQuantity) * 100).toFixed(1) : "0.0";

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

import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBatch as getBatchDetails, getBatchStages } from "../api/batches";
import { extractArray } from "../api/client";
import { operatorBatchesApi } from "../api/operatorBatchesApi";

import type { PlannedStage } from "../types/batch";
import type { IFeedType, IOperatorFarmingBatch, IOperatorFeedingLog, IOperatorMortalityLog } from "../types/operatorBatch";
import { filterFeedTypesForStage, getActiveStage } from "../utils/stageUtils";

export const useOperatorBatches = () => {
  const [batches, setBatches] = useState<IOperatorFarmingBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<IOperatorFarmingBatch | null>(null);

  const [feedingLogs, setFeedingLogs] = useState<IOperatorFeedingLog[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<IOperatorMortalityLog[]>([]);
  const [feedTypes, setFeedTypes] = useState<IFeedType[]>([]);
  const [plannedStages, setPlannedStages] = useState<PlannedStage[] | undefined>(undefined);

  const [loading, setLoading] = useState(true);

  const fetchMasterData = useCallback(async () => {
    try {
      const [batchesRes, feedTypesRes] = await Promise.all([operatorBatchesApi.getBatches().catch(() => []), operatorBatchesApi.getFeedTypes().catch(() => [])]);

      const batchesData = extractArray(batchesRes) as IOperatorFarmingBatch[];
      setBatches(batchesData);

      // FIX BUG REDIRECT: Dùng callback của setState để luôn lấy được selectedBatch mới nhất
      // Decide which batch should be selected (preserve previous selection if possible)
      setSelectedBatch((prevSelected) => {
        if (!prevSelected && batchesData.length > 0) return batchesData[0];
        if (prevSelected) {
          const updated = batchesData.find((b) => b.id === prevSelected.id);
          return updated || batchesData[0];
        }
        return null;
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

      setFeedingLogs(extractArray(feedRes) as IOperatorFeedingLog[]);
      setMortalityLogs(extractArray(mortRes) as IOperatorMortalityLog[]);

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

      // Fetch planned stages for the selected batch (used to determine allowed feed types)
      try {
        const batchId = selectedBatch.id;
        const stages = await getBatchStages(batchId).catch(() => [] as PlannedStage[]);
        // avoid setting state for stale selection
        if (selectedBatch && selectedBatch.id === batchId) {
          setPlannedStages(stages);
        }
      } catch (err) {
        console.warn("Failed to fetch batch stages:", err);
        setPlannedStages([]);
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết lô", error);
    }
  }, [selectedBatch]);

  const activeStage = useMemo(() => getActiveStage(plannedStages, selectedBatch?.stageName), [plannedStages, selectedBatch?.stageName]);

  const availableFeedTypes = useMemo(() => filterFeedTypesForStage(feedTypes, activeStage), [feedTypes, activeStage]);

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
    plannedStages,
    activeStage,
    availableFeedTypes,
  };
};

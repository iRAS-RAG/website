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
                estimatedHarvestCount: detailed.estimatedHarvestCount ?? prev.estimatedHarvestCount,
                estimatedHarvestWeightKg: detailed.estimatedHarvestWeightKg ?? prev.estimatedHarvestWeightKg,
                actualHarvestCount: detailed.actualHarvestCount ?? prev.actualHarvestCount,
                actualHarvestWeightKg: detailed.actualHarvestWeightKg ?? prev.actualHarvestWeightKg,
                fcr: detailed.fcr ?? prev.fcr,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load; selectedBatch identity is stable enough
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
            const newEstimatedHarvestCount = detailed.estimatedHarvestCount ?? prev.estimatedHarvestCount;
            const newEstimatedHarvestWeightKg = detailed.estimatedHarvestWeightKg ?? prev.estimatedHarvestWeightKg;
            const newActualHarvestCount = detailed.actualHarvestCount ?? prev.actualHarvestCount;
            const newActualHarvestWeightKg = detailed.actualHarvestWeightKg ?? prev.actualHarvestWeightKg;
            const newFcr = detailed.fcr ?? prev.fcr;

            const unchanged =
              newCurrentQuantity === prev.currentQuantity &&
              newTankVolume === prev.tankVolume &&
              newEstimatedHarvestCount === prev.estimatedHarvestCount &&
              newEstimatedHarvestWeightKg === prev.estimatedHarvestWeightKg &&
              newActualHarvestCount === prev.actualHarvestCount &&
              newActualHarvestWeightKg === prev.actualHarvestWeightKg &&
              newFcr === prev.fcr;

            if (unchanged) return prev;

            return {
              ...prev,
              currentQuantity: newCurrentQuantity,
              tankVolume: newTankVolume,
              estimatedHarvestCount: newEstimatedHarvestCount,
              estimatedHarvestWeightKg: newEstimatedHarvestWeightKg,
              actualHarvestCount: newActualHarvestCount,
              actualHarvestWeightKg: newActualHarvestWeightKg,
              fcr: newFcr,
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

import { Box, Paper } from "@mui/material";
import React, { useState } from "react";
import { getSpeciesStageConfigs } from "../../api/species-stage-configs";
import { getSpeciesThresholds } from "../../api/species-threshholds";
import SpeciesDetail from "../../components/supervisor/species-configs/SpeciesDetail";
import SpeciesList from "../../components/supervisor/species-configs/SpeciesList";
import useSpeciesConfigs from "../../hooks/useSpeciesConfigs";

const SpeciesConfigsTab: React.FC = () => {
  const { speciesConfigs, setSpeciesConfigs, updateStage, updateStageThreshold, addStage, removeStage } = useSpeciesConfigs();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  async function handleSelect(id: string) {
    const sp = speciesConfigs.find((s) => s.id === id);
    if (!sp) {
      setSelectedId(id);
      return;
    }

    try {
      const configs = await getSpeciesStageConfigs(sp.name);
      // map API configs to Stage[]
      const thresholdsAll = await getSpeciesThresholds();

      const stages = configs.map((c) => {
        const mappedThresholds = (thresholdsAll || [])
          .filter((t) => {
            const speciesMatch = (t.speciesId && sp.id && t.speciesId === sp.id) || (t.speciesName && t.speciesName === sp.name);
            const stageMatch = (t.growthStageId && c.growthStageId && t.growthStageId === c.growthStageId) || (t.growthStageName && t.growthStageName === c.growthStageName);
            return speciesMatch && stageMatch;
          })
          .map((t) => ({ id: t.id ?? generateId(), sensor: t.sensorTypeName ?? "", sensorTypeId: t.sensorTypeId ?? "", min: t.minValue ?? null, max: t.maxValue ?? null }));

        return {
          id: generateId(),
          name: c.growthStageName ?? "",
          growthStageId: c.growthStageId,
          configId: c.id,
          feedType: c.feedTypeId ?? c.feedTypeName ?? "",
          feedPer100: c.amountPer100Fish ?? 0,
          frequencyPerDay: c.frequencyPerDay ?? 0,
          maxStockingDensity: c.maxStockingDensity ?? 0,
          expectedDurationDays: c.expectedDurationDays ?? 0,
          thresholds: mappedThresholds,
        };
      });

      const next = speciesConfigs.map((s) => (s.id === id ? { ...s, stages } : s));
      setSpeciesConfigs(next);
    } catch (e) {
      console.error("Failed to fetch species stage configs or thresholds", e);
    }

    setSelectedId(id);
  }

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flexBasis: { xs: "100%", md: "33.333%" } }}>
          <Paper sx={{ p: 2 }}>
            <SpeciesList items={speciesConfigs} onSelect={handleSelect} selectedId={selectedId} />
          </Paper>
        </Box>

        <Box sx={{ flexBasis: { xs: "100%", md: "66.666%" } }}>
          <Paper sx={{ p: 2 }}>
            {selectedId ? (
              (() => {
                const sp = speciesConfigs.find((s) => s.id === selectedId);
                return sp ? (
                  <SpeciesDetail species={sp} updateStage={updateStage} updateStageThreshold={updateStageThreshold} addStage={addStage} removeStage={removeStage} />
                ) : (
                  <div>Chọn một loài để xem chi tiết.</div>
                );
              })()
            ) : (
              <div>Chọn một loài để xem chi tiết.</div>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SpeciesConfigsTab;

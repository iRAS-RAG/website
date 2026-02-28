import { Box, Paper } from "@mui/material";
import React, { useState } from "react";
import { getSpeciesStageConfigs } from "../../api/species-stage-configs";
import SpeciesDetail from "../../components/supervisor/species-configs/SpeciesDetail";
import SpeciesList from "../../components/supervisor/species-configs/SpeciesList";
import useSpeciesConfigs from "../../hooks/useSpeciesConfigs";

const SpeciesConfigsTab: React.FC = () => {
  const { speciesConfigs, setSpeciesConfigs, updateStage, updateStageThreshold, addStage } = useSpeciesConfigs();
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
      const stages = configs.map((c) => ({
        id: generateId(),
        name: c.growthStageName ?? "",
        feedType: c.feedTypeName ?? "",
        feedPer100: c.amountPer100Fish ?? 0,
        frequencyPerDay: c.frequencyPerDay ?? 0,
        maxStockingDensity: c.maxStockingDensity ?? 0,
        expectedDurationDays: c.expectedDurationDays ?? 0,
        thresholds: [],
      }));

      const next = speciesConfigs.map((s) => (s.id === id ? { ...s, stages } : s));
      setSpeciesConfigs(next);
    } catch (e) {
      // ignore, keep existing stages
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
                return sp ? <SpeciesDetail species={sp} updateStage={updateStage} updateStageThreshold={updateStageThreshold} addStage={addStage} /> : <div>Chọn một loài để xem chi tiết.</div>;
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

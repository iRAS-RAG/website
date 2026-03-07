import AddIcon from "@mui/icons-material/Add";
import PetsIcon from "@mui/icons-material/Pets";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField } from "@mui/material";
import React, { useState } from "react";
import { createSpecies, deleteSpecies, updateSpecies } from "../../api/species";
import { getSpeciesStageConfigs } from "../../api/species-stage-configs";
import { getSpeciesThresholds } from "../../api/species-threshholds";
import { useToast } from "../../components/common/toastContext";
import SpeciesDetail from "../../components/supervisor/species-configs/SpeciesDetail";
import SpeciesList from "../../components/supervisor/species-configs/SpeciesList";
import useSpeciesConfigs from "../../hooks/useSpeciesConfigs";

const SpeciesConfigsTab: React.FC = () => {
  const { speciesConfigs, setSpeciesConfigs, updateStage, updateStageThreshold, addStage, removeStage } = useSpeciesConfigs();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [creatingSpecies, setCreatingSpecies] = useState(false);

  function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  async function fetchStagesForSpecies(speciesId: string, speciesName: string) {
    const configs = await getSpeciesStageConfigs(speciesName);
    const thresholdsAll = await getSpeciesThresholds();

    return configs.map((c) => {
      const mappedThresholds = (thresholdsAll || [])
        .filter((t) => {
          const speciesMatch = (t.speciesId && speciesId && t.speciesId === speciesId) || (t.speciesName && t.speciesName === speciesName);
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
  }

  async function handleCreateSpecies() {
    const name = newSpeciesName.trim();
    if (!name) return;

    setCreatingSpecies(true);
    try {
      const created = await createSpecies({ name });

      let createdStages: Awaited<ReturnType<typeof fetchStagesForSpecies>> = [];
      try {
        createdStages = await fetchStagesForSpecies(created.id, created.name);
      } catch (e) {
        console.error("Failed to fetch created species stages", e);
        toast.error("Tải cấu hình loài thất bại");
      }

      const next = [{ id: created.id, name: created.name, stages: createdStages }, ...speciesConfigs];
      setSpeciesConfigs(next);
      setSelectedId(created.id);
      setCreateOpen(false);
      setNewSpeciesName("");
      toast.success("Tạo loài thành công");
    } catch (e) {
      console.error("Failed to create species", e);
      toast.error("Tạo loài thất bại");
    } finally {
      setCreatingSpecies(false);
    }
  }

  async function handleSelect(id: string) {
    const sp = speciesConfigs.find((s) => s.id === id);
    if (!sp) {
      setSelectedId(id);
      return;
    }

    try {
      const stages = await fetchStagesForSpecies(sp.id, sp.name);

      const next = speciesConfigs.map((s) => (s.id === id ? { ...s, stages } : s));
      setSpeciesConfigs(next);
    } catch (e) {
      console.error("Failed to fetch species stage configs or thresholds", e);
      toast.error("Tải cấu hình loài thất bại");
    }

    setSelectedId(id);
  }

  async function handleDeleteSpecies(id: string) {
    try {
      await deleteSpecies(id);
      const next = speciesConfigs.filter((s) => s.id !== id);
      setSpeciesConfigs(next);
      setSelectedId((current) => {
        if (current !== id) return current;
        return next[0]?.id ?? null;
      });
      toast.success("Xóa loài thành công");
    } catch (e) {
      console.error("Failed to delete species", e);
      toast.error("Xóa loài thất bại");
      throw e;
    }
  }

  async function handleRenameSpecies(id: string, name: string) {
    const nextName = name.trim();
    if (!nextName) return;

    try {
      const updated = await updateSpecies(id, { name: nextName });
      const finalName = updated?.name || nextName;
      const next = speciesConfigs.map((s) => (s.id === id ? { ...s, name: finalName } : s));
      setSpeciesConfigs(next);
      toast.success("Đổi tên loài thành công");
    } catch (e) {
      console.error("Failed to rename species", e);
      toast.error("Đổi tên loài thất bại");
      throw e;
    }
  }

  return (
    <Box>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
              <PetsIcon fontSize="small" />
              Danh sách loài
            </Box>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Thêm loài
            </Button>
          </Box>
          <SpeciesList items={speciesConfigs} onSelect={handleSelect} selectedId={selectedId} />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 700, mb: 1 }}>
            <SettingsSuggestIcon fontSize="small" />
            Chi tiết cấu hình
          </Box>
          {selectedId ? (
            (() => {
              const sp = speciesConfigs.find((s) => s.id === selectedId);
              return sp ? (
                <SpeciesDetail
                  species={sp}
                  updateStage={updateStage}
                  updateStageThreshold={updateStageThreshold}
                  addStage={addStage}
                  removeStage={removeStage}
                  onDeleteSpecies={handleDeleteSpecies}
                  onRenameSpecies={handleRenameSpecies}
                />
              ) : (
                <div>
                  <SettingsSuggestIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Chọn một loài để xem chi tiết.
                </div>
              );
            })()
          ) : (
            <div>
              <SettingsSuggestIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: 6 }} />
              Chọn một loài để xem chi tiết.
            </div>
          )}
        </Paper>
      </Box>

      <Dialog open={createOpen} onClose={() => !creatingSpecies && setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
          <AddIcon fontSize="small" />
          Thêm loài mới
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField label="Tên loài" value={newSpeciesName} onChange={(e) => setNewSpeciesName(e.target.value)} autoFocus fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creatingSpecies}>
            Hủy
          </Button>
          <Button onClick={handleCreateSpecies} disabled={creatingSpecies || !newSpeciesName.trim()} variant="contained" startIcon={<AddIcon fontSize="small" />}>
            Tạo loài
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpeciesConfigsTab;

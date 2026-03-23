import AddIcon from "@mui/icons-material/Add";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { createSpecies, deleteSpecies, updateSpecies } from "../../api/species";
import { getSpeciesStageConfigs } from "../../api/species-stage-configs";
import { getSpeciesThresholds } from "../../api/species-threshholds";
import { useToast } from "../../components/common/toastContext";
import SpeciesDetail from "../../components/supervisor/species-configs/SpeciesDetail";
import SpeciesList from "../../components/supervisor/species-configs/SpeciesList";
import useSpeciesConfigs from "../../hooks/useSpeciesConfigs";

const SpeciesConfigsTab: React.FC = () => {
  const {
    speciesConfigs,
    setSpeciesConfigs,
    updateStage,
    updateStageThreshold,
    addStage,
    removeStage,
  } = useSpeciesConfigs();
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
          const speciesMatch =
            (t.speciesId && speciesId && t.speciesId === speciesId) ||
            (t.speciesName && t.speciesName === speciesName);
          const stageMatch =
            (t.growthStageId &&
              c.growthStageId &&
              t.growthStageId === c.growthStageId) ||
            (t.growthStageName && t.growthStageName === c.growthStageName);
          return speciesMatch && stageMatch;
        })
        .map((t) => ({
          id: t.id ?? generateId(),
          sensor: t.sensorTypeName ?? "",
          sensorTypeId: t.sensorTypeId ?? "",
          min: t.minValue ?? null,
          max: t.maxValue ?? null,
        }));

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

      const next = [
        { id: created.id, name: created.name, stages: createdStages },
        ...speciesConfigs,
      ];
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
      const next = speciesConfigs.map((s) =>
        s.id === id ? { ...s, stages } : s,
      );
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
      const next = speciesConfigs.map((s) =>
        s.id === id ? { ...s, name: finalName } : s,
      );
      setSpeciesConfigs(next);
      toast.success("Đổi tên loài thành công");
    } catch (e) {
      console.error("Failed to rename species", e);
      toast.error("Đổi tên loài thất bại");
      throw e;
    }
  }

  return (
    // ĐÃ SỬA CHỖ NÀY: Loại bỏ bgcolor, minHeight và padding cứng. Để flexGrow tự nhiên lấp đầy Container cha
    <Box sx={{ width: "100%", flexGrow: 1 }}>
      {/* HEADER PAGE */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
          >
            Cấu hình thông số loài
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Thiết lập ngưỡng môi trường và quy chuẩn cho từng loài thủy sản.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            borderRadius: "8px",
            bgcolor: "#2A85FF",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#1F6FDB" },
          }}
        >
          Thêm loài mới
        </Button>
      </Stack>

      {/* MAIN SPLIT PANE CONTENT */}
      <Box
        sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        {/* LEFT COLUMN: DANH SÁCH LOÀI (30%) */}
        <Box sx={{ width: { xs: "100%", md: "30%" }, minWidth: "300px" }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              minHeight: "600px",
              p: 2,
            }}
          >
            <SpeciesList
              items={speciesConfigs}
              onSelect={handleSelect}
              selectedId={selectedId}
            />
          </Paper>
        </Box>

        {/* RIGHT COLUMN: CHI TIẾT CẤU HÌNH (70%) */}
        <Box sx={{ flexGrow: 1, width: { xs: "100%", md: "70%" } }}>
          {selectedId ? (
            (() => {
              const sp = speciesConfigs.find((s) => s.id === selectedId);
              return sp ? (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    minHeight: "600px",
                    p: { xs: 3, md: 4 },
                  }}
                >
                  <SpeciesDetail
                    species={sp}
                    updateStage={updateStage}
                    updateStageThreshold={updateStageThreshold}
                    addStage={addStage}
                    removeStage={removeStage}
                    onDeleteSpecies={handleDeleteSpecies}
                    onRenameSpecies={handleRenameSpecies}
                  />
                </Paper>
              ) : null;
            })()
          ) : (
            // EMPTY STATE (CHƯA CHỌN LOÀI)
            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                minHeight: "600px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                textAlign: "center",
              }}
            >
              <SettingsSuggestIcon
                sx={{ fontSize: 80, color: "#CBD5E1", mb: 2 }}
              />
              <Typography
                sx={{ color: "#94A3B8", fontSize: "1.1rem", maxWidth: 400 }}
              >
                Vui lòng chọn một loài từ danh sách bên trái để xem và chỉnh sửa
                cấu hình.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* DIALOG THÊM LOÀI */}
      <Dialog
        open={createOpen}
        onClose={() => !creatingSpecies && setCreateOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
        >
          <AddIcon fontSize="small" />
          Thêm loài mới
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Tên loài (VD: Cá chép, Tôm sú...)"
              value={newSpeciesName}
              onChange={(e) => setNewSpeciesName(e.target.value)}
              autoFocus
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateOpen(false)}
            disabled={creatingSpecies}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateSpecies}
            disabled={creatingSpecies || !newSpeciesName.trim()}
            variant="contained"
            startIcon={<AddIcon fontSize="small" />}
          >
            Tạo loài
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpeciesConfigsTab;

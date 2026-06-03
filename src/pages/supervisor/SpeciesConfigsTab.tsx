import AddIcon from "@mui/icons-material/Add";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Paper, Popover, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { createSpecies, deleteSpecies, updateSpecies } from "../../api/species";
import { getSpeciesStageConfigsBySpecies } from "../../api/species-stage-configs";
import { getSpeciesThresholds } from "../../api/species-threshholds";
import { useToast } from "../../components/common/toastContext";
import SpeciesDetail from "../../components/supervisor/species-configs/SpeciesDetail";
import SpeciesList from "../../components/supervisor/species-configs/SpeciesList";
import useSpeciesConfigs from "../../hooks/useSpeciesConfigs";

import { autoSuggestIcon, SPECIES_ICONS } from "../../utils/iconMapper";

const SpeciesConfigsTab: React.FC = () => {
  const { speciesConfigs, setSpeciesConfigs, updateStage, updateStageThreshold, addStage, removeStage } = useSpeciesConfigs();
  const toast = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [creatingSpecies, setCreatingSpecies] = useState(false);

  // --- THÊM STATE CHO ICON PICKER ---
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Logic xác định Icon hiển thị
  const displayIcon = selectedIcon !== null ? selectedIcon : autoSuggestIcon(newSpeciesName);

  function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  async function fetchStagesForSpecies(speciesId: string, speciesName: string) {
    // Use per-species endpoint rather than SearchTerm query
    const configs = await getSpeciesStageConfigsBySpecies(speciesId);
    const thresholdsAll = await getSpeciesThresholds();

    return configs.map((c) => {
      const cfg = c as Record<string, unknown>;
      const mappedThresholds = (thresholdsAll || [])
        .filter((t) => {
          const speciesMatch = (t.speciesId && speciesId && t.speciesId === speciesId) || (t.speciesName && t.speciesName === speciesName);
          const stageMatch = (t.growthStageId && c.growthStageId && t.growthStageId === c.growthStageId) || (t.growthStageName && t.growthStageName === c.growthStageName);
          return speciesMatch && stageMatch;
        })
        .map((t) => ({
          id: t.id ?? generateId(),
          sensor: t.sensorTypeName ?? "",
          sensorTypeId: t.sensorTypeId ?? "",
          min: t.minValue ?? null,
          max: t.maxValue ?? null,
        }));

      const feedTypeIds: string[] | undefined = Array.isArray(cfg.feedTypeIds) ? (cfg.feedTypeIds as string[]).map(String) : cfg.feedTypeId ? [String(cfg.feedTypeId)] : undefined;

      const feedTypeNames: string[] | undefined = Array.isArray(cfg.feedTypeNames) ? (cfg.feedTypeNames as string[]).map(String) : cfg.feedTypeName ? [String(cfg.feedTypeName)] : undefined;

      const feedTypeDisplay = (feedTypeNames && feedTypeNames.length > 0 ? feedTypeNames.join(", ") : undefined) ?? feedTypeIds?.[0] ?? String(cfg.feedTypeName ?? "");

      return {
        id: generateId(),
        name: String(cfg.growthStageName ?? ""),
        growthStageId: c.growthStageId,
        configId: c.id,
        feedType: feedTypeDisplay,
        feedTypeIds: feedTypeIds,
        feedPer100: Number(cfg.amountPer100Fish ?? 0),
        frequencyPerDay: Number(cfg.frequencyPerDay ?? 0),
        maxStockingDensity: Number(cfg.maxStockingDensity ?? 0),
        expectedDurationDays: Number(cfg.expectedDurationDays ?? 0),
        expectedWeightKgPerFish: Number(cfg.expectedWeightKgPerFish ?? 0),
        survivalRate: Number(cfg.survivalRate ?? 1),
        sequence: cfg.sequence as number | undefined,
        thresholds: mappedThresholds,
      };
    });
  }

  async function handleCreateSpecies() {
    const name = newSpeciesName.trim();
    if (!name) return;

    // Kiểm tra trùng tên ở Frontend
    const isDuplicate = speciesConfigs.some((s) => s.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      toast.warning(`Loài "${name}" đã tồn tại trong hệ thống!`);
      return;
    }

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
      setSelectedIcon(null);

      toast.success("Tạo loài thành công");
    } catch (e: unknown) {
      // SỬA LỖI Ở ĐÂY: Thay 'any' bằng 'unknown'
      console.error("Failed to create species", e);

      let errMsg = "Tạo loài thất bại (Có thể do trùng lặp)";

      // Kiểm tra an toàn xem e có phải là object chứa message lỗi hay không
      if (
        e !== null &&
        typeof e === "object" &&
        "response" in e &&
        e.response !== null &&
        typeof e.response === "object" &&
        "data" in e.response &&
        e.response.data !== null &&
        typeof e.response.data === "object" &&
        "message" in e.response.data &&
        typeof e.response.data.message === "string"
      ) {
        errMsg = e.response.data.message;
      } else if (e instanceof Error) {
        // Fallback sử dụng message từ Error chuẩn
        errMsg = e.message;
      }

      toast.error(errMsg);
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

  async function refreshStagesForSpecies(speciesId: string) {
    const sp = speciesConfigs.find((s) => s.id === speciesId);
    if (!sp) return;

    try {
      const stages = await fetchStagesForSpecies(sp.id, sp.name);
      const next = speciesConfigs.map((s) => (s.id === speciesId ? { ...s, stages } : s));
      setSpeciesConfigs(next);
    } catch (e) {
      console.error("Failed to refresh species stages", e);
      toast.error("Tải cấu hình loài thất bại");
    }
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

  // Handle thay đổi text trong Input
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSpeciesName(e.target.value);
    // Nếu xóa hết chữ, trả icon về tự động
    if (e.target.value === "") {
      setSelectedIcon(null);
    }
  };

  // Handle chọn Icon thủ công
  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ width: "100%", flexGrow: 1 }}>
      {/* HEADER PAGE */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}>
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
      <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
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
            <SpeciesList items={speciesConfigs} onSelect={handleSelect} selectedId={selectedId} />
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
                    refreshStages={() => refreshStagesForSpecies(sp.id)}
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
              <SettingsSuggestIcon sx={{ fontSize: 80, color: "#CBD5E1", mb: 2 }} />
              <Typography sx={{ color: "#94A3B8", fontSize: "1.1rem", maxWidth: 400 }}>Vui lòng chọn một loài từ danh sách bên trái để xem và chỉnh sửa cấu hình.</Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* DIALOG THÊM LOÀI */}
      <Dialog
        open={createOpen}
        onClose={() => {
          if (!creatingSpecies) {
            setCreateOpen(false);
            setNewSpeciesName("");
            setSelectedIcon(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
          <AddIcon fontSize="small" />
          Thêm loài mới
        </DialogTitle>
        <DialogContent sx={{ overflow: "visible" }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Tên loài (VD: Cá chép, Tôm sú...)"
              value={newSpeciesName}
              onChange={handleNameChange}
              autoFocus
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      sx={{
                        bgcolor: "#F1F5F9",
                        borderRadius: 2,
                        width: 40,
                        height: 40,
                        transition: "transform 0.2s",
                        "&:hover": {
                          bgcolor: "#E2E8F0",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{displayIcon}</span>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* POPOVER CHỌN ICON */}
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{ paper: { elevation: 3, sx: { borderRadius: 2 } } }}
          >
            <Box sx={{ p: 2, width: 250 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "#475569" }}>
                Chọn biểu tượng
              </Typography>

              {/* SỬ DỤNG BOX THAY CHO GRID */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {Object.values(SPECIES_ICONS).map((icon) => (
                  <Box
                    key={icon}
                    sx={{
                      flex: "1 0 21%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      onClick={() => handleIconSelect(icon)}
                      sx={{
                        border: displayIcon === icon ? "2px solid #2A85FF" : "2px solid transparent",
                        bgcolor: displayIcon === icon ? "#EFF6FF" : "transparent",
                      }}
                    >
                      {icon}
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Nút reset về chế độ tự động */}
              {selectedIcon !== null && (
                <Button
                  fullWidth
                  size="small"
                  sx={{ mt: 2, textTransform: "none" }}
                  onClick={() => {
                    setSelectedIcon(null);
                    setAnchorEl(null);
                  }}
                >
                  Reset về tự động gán
                </Button>
              )}
            </Box>
          </Popover>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setNewSpeciesName("");
              setSelectedIcon(null);
            }}
            disabled={creatingSpecies}
          >
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

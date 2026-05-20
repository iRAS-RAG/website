import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import SaveIcon from "@mui/icons-material/Save";
import ScaleIcon from "@mui/icons-material/Scale";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SensorsIcon from "@mui/icons-material/Sensors";
import TimelineIcon from "@mui/icons-material/Timeline";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import {
  createGrowthStage,
  deleteGrowthStage,
} from "../../../api/growth-stages";
import useFeedTypes from "../../../hooks/useFeedTypes";
import useGrowthStages from "../../../hooks/useGrowthStages";
import useSensorTypes from "../../../hooks/useSensorTypes";
import type { SpeciesConfig, Stage } from "../../../hooks/useSpeciesConfigs";
import useSpeciesStageConfigs from "../../../hooks/useSpeciesStageConfigs";
import useSpeciesThresholds from "../../../hooks/useSpeciesThresholds";
import { useToast } from "../../common/toastContext";
import ThresholdEditor from "./ThresholdEditor";

// COMPONENT DÙNG CHUNG
import ConfirmDialog from "../../common/ConfirmDialog";
import { autoSuggestIcon } from "../../../utils/iconMapper";

// --- HÀM TIỆN ÍCH TRÁNH DÙNG ANY ĐỂ BẮT LỖI TỪ BACKEND ---
function extractErrorMessage(e: unknown, defaultMsg: string): string {
  try {
    const err = e as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }
    if (err?.message) {
      return err.message;
    }
  } catch {
    // Ignore error in parsing
  }
  return defaultMsg;
}

const SpeciesDetail: React.FC<{
  species: SpeciesConfig;
  updateStage: (
    speciesId: string,
    stageId: string,
    patch: Partial<Stage>,
  ) => void;
  updateStageThreshold: (
    speciesId: string,
    stageId: string,
    sensor: string,
    min: number | null,
    max: number | null,
    id?: string,
  ) => void;
  addStage: (speciesId: string, growthStageId?: string, name?: string) => void;
  removeStage?: (speciesId: string, stageId: string) => void;
  onDeleteSpecies?: (speciesId: string) => Promise<void> | void;
  onRenameSpecies?: (speciesId: string, name: string) => Promise<void> | void;
}> = ({
  species,
  updateStage,
  updateStageThreshold,
  addStage,
  removeStage,
  onDeleteSpecies,
  onRenameSpecies,
}) => {
  const toast = useToast();
  const { feeds: feedTypes, loading: feedLoading } = useFeedTypes();
  const {
    stages: growthStages,
    setStages: setGrowthStages,
    loading: growthLoading,
  } = useGrowthStages();
  const { createConfig, updateConfig, removeConfig } = useSpeciesStageConfigs();
  const { create: createThreshold, update: updateThreshold } =
    useSpeciesThresholds();
  const { items: sensorTypes } = useSensorTypes();

  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newStageName, setNewStageName] = React.useState("");
  const [newStageDesc, setNewStageDesc] = React.useState("");
  const [creatingStage, setCreatingStage] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(species.name);
  const [renamingSpecies, setRenamingSpecies] = React.useState(false);

  // MODAL XÓA LOÀI
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deletingSpecies, setDeletingSpecies] = React.useState(false);

  // MODAL XÓA CẤU HÌNH GIAI ĐOẠN
  const [stageToDelete, setStageToDelete] = React.useState<Stage | null>(null);
  const [deletingStage, setDeletingStage] = React.useState(false);

  React.useEffect(() => {
    setRenameValue(species.name);
  }, [species.id, species.name]);

  const labelWithIcon = (icon: React.ReactNode, text: string) => (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
    >
      {icon}
      {text}
    </Box>
  );

  function handleAddStage(gs: { id: string; name: string }) {
    addStage(species.id, gs.id, gs.name);
    setDialogOpen(false);
  }

  async function handleCreateStage() {
    if (!newStageName) return;
    setCreatingStage(true);
    try {
      const created = await createGrowthStage({
        name: newStageName,
        description: newStageDesc,
      });
      if (created) {
        setGrowthStages((s) => [created, ...s]);
        handleAddStage({ id: created.id, name: created.name });
        setNewStageName("");
        setNewStageDesc("");
        toast.success("Tạo giai đoạn thành công");
      }
    } catch (e: unknown) {
      console.error("Failed to create stage", e);
      toast.error(extractErrorMessage(e, "Tạo giai đoạn thất bại"));
    } finally {
      setCreatingStage(false);
    }
  }

  async function handleDeleteGrowthStage(id: string) {
    const target = growthStages.find((g) => g.id === id);
    const targetName = target?.name ?? "giai đoạn này";
    if (!window.confirm(`Bạn có chắc muốn xóa ${targetName}?`)) return;

    try {
      await deleteGrowthStage(id);
      setGrowthStages((s) => s.filter((g) => g.id !== id));
      toast.success("Xóa giai đoạn thành công");
    } catch (e: unknown) {
      console.error("Failed to delete stage", e);
      toast.error(extractErrorMessage(e, "Xóa giai đoạn thất bại"));
    }
  }

  // --- HÀM XÓA CẤU HÌNH GIAI ĐOẠN (Đã cập nhật) ---
  async function handleExecuteDeleteStageConfig(st: Stage) {
    if (!st.configId || deletingStage) return;

    setDeletingStage(true);
    try {
      await removeConfig(st.configId);
      if (typeof removeStage === "function") {
        removeStage(species.id, st.id);
      } else {
        updateStage(species.id, st.id, { configId: undefined, thresholds: [] });
      }
      toast.success("Xóa cấu hình giai đoạn thành công");
      setStageToDelete(null);
    } catch (e: unknown) {
      console.error("Failed to delete stage config", e);
      toast.error(extractErrorMessage(e, "Xóa cấu hình giai đoạn thất bại"));
    } finally {
      setDeletingStage(false);
    }
  }

  async function saveStage(st: Stage) {
    if (!species.id) return;
    setSaving((s) => ({ ...s, [st.id]: true }));
    try {
      // Ép kiểu an toàn không dùng any
      const payload = {
        speciesId: species.id,
        growthStageId: st.growthStageId ?? "",
        feedTypeIds: st.feedType ? [st.feedType] : [], // Bọc thành List<Guid> cho API C#
        amountPer100Fish: st.feedPer100,
        frequencyPerDay: st.frequencyPerDay,
        maxStockingDensity: st.maxStockingDensity,
        expectedDurationDays: st.expectedDurationDays,
      } as unknown as Parameters<typeof createConfig>[0];

      if (st.configId) {
        await updateConfig(st.configId, payload);
      } else {
        const created = await createConfig(payload);
        if (created && created.id) {
          updateStage(species.id, st.id, { configId: created.id });
        }
      }

      for (const th of st.thresholds || []) {
        const sensor = sensorTypes.find((s) => s.name === th.sensor);
        if (!sensor) continue;
        const tPayload = {
          speciesId: species.id,
          growthStageId: st.growthStageId ?? "",
          sensorTypeId: sensor.id,
          minValue: th.min ?? 0,
          maxValue: th.max ?? 0,
        };

        if (th.id) {
          await updateThreshold(th.id, tPayload);
        } else {
          const created = await createThreshold(tPayload);
          if (created && created.id) {
            const nextThresholds = (st.thresholds || []).map((tt) =>
              tt.sensor === th.sensor ? { ...tt, id: created.id } : tt,
            );
            updateStage(species.id, st.id, { thresholds: nextThresholds });
          }
        }
      }
      toast.success("Lưu giai đoạn thành công");
    } catch (e: unknown) {
      console.error("Failed to save stage", e);
      toast.error(extractErrorMessage(e, "Lưu giai đoạn thất bại"));
    } finally {
      setSaving((s) => ({ ...s, [st.id]: false }));
    }
  }

  async function handleExecuteDelete() {
    if (!onDeleteSpecies || deletingSpecies) return;
    setDeletingSpecies(true);
    try {
      await onDeleteSpecies(species.id);
      setDeleteModalOpen(false);
    } catch (e: unknown) {
      console.error("Failed to delete species", e);
      toast.error(extractErrorMessage(e, "Xóa loài thất bại"));
    } finally {
      setDeletingSpecies(false);
    }
  }

  async function handleRenameSpecies() {
    const nextName = renameValue.trim();
    if (!onRenameSpecies || !nextName || renamingSpecies) return;

    setRenamingSpecies(true);
    try {
      await onRenameSpecies(species.id, nextName);
      setRenameOpen(false);
    } catch (e: unknown) {
      console.error("Failed to rename species", e);
      toast.error(extractErrorMessage(e, "Đổi tên thất bại"));
    } finally {
      setRenamingSpecies(false);
    }
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#0F172A",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <span style={{ fontSize: "2rem" }}>
            {autoSuggestIcon(species.name)}
          </span>
          {species.name}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => setRenameOpen(true)}
            disabled={!onRenameSpecies || renamingSpecies}
            sx={{
              color: "#64748B",
              bgcolor: "#F1F5F9",
              "&:hover": { bgcolor: "#E2E8F0", color: "#2A85FF" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteModalOpen(true)}
            disabled={!onDeleteSpecies || deletingSpecies}
            sx={{
              color: "#EF4444",
              bgcolor: "#FEF2F2",
              "&:hover": { bgcolor: "#FEE2E2", color: "#DC2626" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2}>
        {species.stages.map((st) => (
          <Accordion
            key={st.id}
            elevation={0}
            sx={{
              border: "1px solid #E2E8F0",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: "#F8FAFC" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#334155" }}>
                  {st.name}
                </Typography>
                {st.configId && (
                  <IconButton
                    component="span"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setStageToDelete(st); // MỞ MODAL THAY VÌ CONFIRM CŨ
                    }}
                    onFocus={(e) => e.stopPropagation()}
                    sx={{ ml: 1, color: "#94A3B8" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 3 }}>
              {/* THAY THẾ GRID BẰNG BOX FLEX */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                  <FormControl fullWidth>
                    <InputLabel id={`feedtype-label-${st.id}`}>
                      {labelWithIcon(
                        <LocalDiningIcon fontSize="small" />,
                        "Loại thức ăn",
                      )}
                    </InputLabel>
                    <Select
                      labelId={`feedtype-label-${st.id}`}
                      label={labelWithIcon(
                        <LocalDiningIcon fontSize="small" />,
                        "Loại thức ăn",
                      )}
                      value={st.feedType ?? ""}
                      onChange={(e) =>
                        updateStage(species.id, st.id, {
                          feedType: String(e.target.value),
                        })
                      }
                    >
                      {feedLoading ? (
                        <MenuItem value="">
                          <CircularProgress size={18} />
                        </MenuItem>
                      ) : (
                        [
                          <MenuItem
                            key="empty"
                            value=""
                            sx={{ display: "none" }}
                          ></MenuItem>,
                          st.feedType &&
                          !feedTypes.some((f) => f.id === st.feedType) ? (
                            <MenuItem
                              key="fallback"
                              value={st.feedType}
                              sx={{ display: "none" }}
                            >
                              {st.feedType}
                            </MenuItem>
                          ) : null,
                          ...feedTypes.map((f) => (
                            <MenuItem key={f.id} value={f.id}>
                              {f.name}
                            </MenuItem>
                          )),
                        ]
                      )}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                  <TextField
                    label={labelWithIcon(
                      <LocalDiningIcon fontSize="small" />,
                      "Lượng thức ăn (kg/100 cá)",
                    )}
                    type="number"
                    fullWidth
                    value={st.feedPer100}
                    onChange={(e) =>
                      updateStage(species.id, st.id, {
                        feedPer100: Number(e.target.value),
                      })
                    }
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "calc(33.333% - 16px)" } }}>
                  <TextField
                    label={labelWithIcon(
                      <TimelineIcon fontSize="small" />,
                      "Số lần/ngày",
                    )}
                    type="number"
                    fullWidth
                    value={st.frequencyPerDay}
                    onChange={(e) =>
                      updateStage(species.id, st.id, {
                        frequencyPerDay: Number(e.target.value),
                      })
                    }
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "calc(33.333% - 16px)" } }}>
                  <TextField
                    label={labelWithIcon(
                      <ScaleIcon fontSize="small" />,
                      "Mật độ tối đa (cá/m3)",
                    )}
                    type="number"
                    fullWidth
                    value={st.maxStockingDensity}
                    onChange={(e) =>
                      updateStage(species.id, st.id, {
                        maxStockingDensity: Number(e.target.value),
                      })
                    }
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "calc(33.333% - 16px)" } }}>
                  <TextField
                    label={labelWithIcon(
                      <ScheduleIcon fontSize="small" />,
                      "Thời gian (ngày)",
                    )}
                    type="number"
                    fullWidth
                    value={st.expectedDurationDays}
                    onChange={(e) =>
                      updateStage(species.id, st.id, {
                        expectedDurationDays: Number(e.target.value),
                      })
                    }
                  />
                </Box>

                <Box sx={{ width: "100%" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      mb: 1,
                      color: "#475569",
                    }}
                  >
                    <SensorsIcon fontSize="small" /> Ngưỡng cảm biến
                  </Typography>
                  <ThresholdEditor
                    speciesId={species.id}
                    stage={st}
                    onSaveThreshold={(sensor, min, max, id) =>
                      updateStageThreshold(
                        species.id,
                        st.id,
                        sensor,
                        min,
                        max,
                        id,
                      )
                    }
                    onRemoveThreshold={(sensor) => {
                      const next = (st.thresholds || []).filter(
                        (t) => t.sensor !== sensor,
                      );
                      updateStage(species.id, st.id, { thresholds: next });
                    }}
                  />
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={
                        !saving[st.id] ? (
                          <SaveIcon fontSize="small" />
                        ) : undefined
                      }
                      onClick={() => saveStage(st)}
                      disabled={!!saving[st.id]}
                    >
                      {saving[st.id] ? (
                        <CircularProgress size={16} />
                      ) : (
                        "Lưu giai đoạn này"
                      )}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
          >
            Thêm giai đoạn phát triển
          </Button>
        </Box>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
          >
            <AddIcon fontSize="small" /> Thêm giai đoạn
          </DialogTitle>
          <DialogContent>
            {growthLoading ? (
              <CircularProgress />
            ) : (
              <>
                <List>
                  {growthStages.map((gs) => {
                    const already = species.stages.some(
                      (s) => s.growthStageId === gs.id,
                    );
                    return (
                      <ListItem
                        key={gs.id}
                        disablePadding
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGrowthStage(gs.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemButton
                          disabled={already}
                          onClick={() => handleAddStage(gs)}
                        >
                          <ListItemText
                            primary={
                              already ? `${gs.name} — Đã cấu hình` : gs.name
                            }
                            secondary={gs.description ?? undefined}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    <AddIcon fontSize="small" /> Tạo giai đoạn mới
                  </Typography>

                  {/* THAY THẾ GRID BẰNG BOX FLEX TRONG DIALOG */}
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    <Box sx={{ width: { xs: "100%", md: "calc(50% - 4px)" } }}>
                      <TextField
                        label={labelWithIcon(
                          <TimelineIcon fontSize="small" />,
                          "Tên",
                        )}
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: "calc(50% - 4px)" } }}>
                      <TextField
                        label={labelWithIcon(
                          <DescriptionIcon fontSize="small" />,
                          "Mô tả",
                        )}
                        value={newStageDesc}
                        onChange={(e) => setNewStageDesc(e.target.value)}
                        fullWidth
                      />
                    </Box>
                    <Box
                      sx={{
                        width: { xs: "100%", md: "calc(33.333% - 5.33px)" },
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={
                          !creatingStage ? (
                            <AddIcon fontSize="small" />
                          ) : undefined
                        }
                        onClick={handleCreateStage}
                        disabled={creatingStage || !newStageName}
                        sx={{ height: 56 }} // Cho bằng chiều cao của TextField
                      >
                        {creatingStage ? (
                          <CircularProgress size={16} />
                        ) : (
                          "Tạo và thêm"
                        )}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={renameOpen}
          onClose={() => !renamingSpecies && setRenameOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle
            sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
          >
            <EditIcon fontSize="small" /> Đổi tên loài
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                label="Tên loài"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRenameOpen(false)}
              disabled={renamingSpecies}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              startIcon={
                !renamingSpecies ? <SaveIcon fontSize="small" /> : undefined
              }
              onClick={handleRenameSpecies}
              disabled={renamingSpecies || !renameValue.trim()}
            >
              {renamingSpecies ? <CircularProgress size={16} /> : "Lưu tên"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
        loading={deletingSpecies}
        title="Xóa loài thủy sản"
        confirmText="Xóa vĩnh viễn"
        color="error"
        content={
          <>
            Bạn có chắc chắn muốn xóa loài <b>"{species.name}"</b> không? Hành
            động này sẽ gỡ bỏ toàn bộ cấu hình thuộc loài này và{" "}
            <b>không thể hoàn tác</b>.
          </>
        }
      />

      {/* MODAL MỚI CHO GIAI ĐOẠN CON */}
      <ConfirmDialog
        open={Boolean(stageToDelete)}
        onClose={() => setStageToDelete(null)}
        onConfirm={() => {
          if (stageToDelete) handleExecuteDeleteStageConfig(stageToDelete);
        }}
        loading={deletingStage}
        title="Xóa cấu hình giai đoạn"
        confirmText="Xóa cấu hình"
        color="error"
        content={
          <>
            Bạn có chắc chắn muốn xóa cấu hình của giai đoạn{" "}
            <b>"{stageToDelete?.name}"</b> không? Hành động này không thể hoàn
            tác.
          </>
        }
      />
    </Box>
  );
};

export default SpeciesDetail;

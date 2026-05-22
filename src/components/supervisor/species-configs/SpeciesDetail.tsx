import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
  Checkbox,
  Chip,
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
import React, { useEffect, useRef, useState } from "react";

import { createGrowthStage, deleteGrowthStage } from "../../../api/growth-stages";
import { createSpeciesStageConfig, deleteSpeciesStageConfig, updateSpeciesStageConfig } from "../../../api/species-stage-configs";
import useFeedTypes from "../../../hooks/useFeedTypes";
import useGrowthStages from "../../../hooks/useGrowthStages";
import type { SpeciesConfig, Stage } from "../../../hooks/useSpeciesConfigs";
import ConfirmDialog from "../../common/ConfirmDialog";
import { useToast } from "../../common/toastContext";
import ThresholdEditor from "./ThresholdEditor";

type Props = {
  species: SpeciesConfig;
  updateStage: (speciesId: string, stageId: string, patch: Partial<Stage>) => void;
  updateStageThreshold: (speciesId: string, stageId: string, sensor: string, min: number | null, max: number | null, id?: string) => void;
  addStage: (speciesId: string, growthStageId?: string, name?: string) => void;
  removeStage: (speciesId: string, stageId: string) => void;
  onDeleteSpecies?: (id: string) => Promise<void>;
  onRenameSpecies?: (id: string, name: string) => Promise<void>;
  refreshStages?: () => Promise<void>;
};

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
}

const SpeciesDetail: React.FC<Props> = ({ species, updateStage, updateStageThreshold, addStage, removeStage, onDeleteSpecies, onRenameSpecies, refreshStages }) => {
  const toast = useToast();
  const { stages: growthStages, setStages: setGrowthStages, loading: growthLoading } = useGrowthStages(species.id);
  const { feeds: feedTypes, loading: feedLoading } = useFeedTypes();

  const [displayStages, setDisplayStages] = useState<Stage[]>(() => (species.stages || []).slice().sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)));
  useEffect(() => setDisplayStages((species.stages || []).slice().sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))), [species.stages]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageDesc, setNewStageDesc] = useState("");
  const [creatingStage, setCreatingStage] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(species.name);
  const [renamingSpecies, setRenamingSpecies] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSpecies, setDeletingSpecies] = useState(false);

  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);
  const [deletingStage] = useState(false);

  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [reordering, setReordering] = useState(false);

  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const pendingCreateRef = useRef<{ growthStageId: string; created?: any } | null>(null);

  useEffect(() => {
    const pending = pendingCreateRef.current;
    if (!pending) return;
    const found = (species.stages || []).find((s) => s.growthStageId === pending.growthStageId && !s.configId);
    if (found && pending.created) {
      updateStage(species.id, found.id, {
        configId: String(pending.created.id ?? ""),
        sequence: pending.created.sequence ?? found.sequence,
        feedPer100: pending.created.amountPer100Fish ?? found.feedPer100,
        frequencyPerDay: pending.created.frequencyPerDay ?? found.frequencyPerDay,
        maxStockingDensity: pending.created.maxStockingDensity ?? found.maxStockingDensity,
        expectedDurationDays: pending.created.expectedDurationDays ?? found.expectedDurationDays,
        feedTypeIds: pending.created.feedTypeIds ?? found.feedTypeIds,
      });
      pendingCreateRef.current = null;
    }
  }, [species.stages, updateStage]);

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragIndexRef.current = idx;
    try {
      e.dataTransfer?.setData("text/plain", String(idx));
    } catch {
      /* ignore */
    }
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    dragOverIndexRef.current = idx;
  }

  async function handleDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === undefined) return;
    const to = idx;
    if (from === to) {
      dragIndexRef.current = null;
      dragOverIndexRef.current = null;
      return;
    }

    const prevSeqMap = Object.fromEntries((displayStages || []).map((s) => [s.id, s.sequence]));
    const next = arrayMove(displayStages, from, to);
    // Assign contiguous sequences in the new order
    const normalized = next.map((s, i) => ({ ...s, sequence: i + 1 }));
    setDisplayStages(normalized);

    setReordering(true);
    try {
      const movedId = displayStages[from]?.id;
      const updates: Promise<unknown>[] = [];

      normalized.forEach((s) => {
        const newSeq = s.sequence ?? 0;
        const oldSeq = Number(prevSeqMap[s.id] ?? 0);
        // Update local parent cache immediately
        updateStage(species.id, s.id, { sequence: newSeq });
        // Persist only the moved stage when a server config exists and the sequence changed
        if (s.id === movedId && s.configId && oldSeq !== newSeq) {
          updates.push(updateSpeciesStageConfig(s.configId, { sequence: newSeq }));
        }
      });

      if (updates.length > 0) await Promise.all(updates);

      // Let parent re-fetch authoritative order if provided (API sorts by sequence)
      if (typeof refreshStages === "function") {
        try {
          await refreshStages();
        } catch (err) {
          // ignore refresh errors, we already updated local cache
          console.error("Failed to refresh stages after reorder", err);
        }
      }

      toast.success("Cập nhật thứ tự giai đoạn thành công");
    } catch (err) {
      console.error("Failed to persist sequence", err);
      // Revert to authoritative order from props
      setDisplayStages((species.stages || []).slice().sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)));
      toast.error("Không thể lưu thứ tự giai đoạn");
    } finally {
      setReordering(false);
      dragIndexRef.current = null;
      dragOverIndexRef.current = null;
    }
  }

  async function saveStage(st: Stage) {
    setSaving((s) => ({ ...s, [st.id]: true }));
    try {
      const payload: Record<string, unknown> = {
        amountPer100Fish: st.feedPer100,
        frequencyPerDay: st.frequencyPerDay,
        maxStockingDensity: st.maxStockingDensity,
        expectedDurationDays: st.expectedDurationDays,
        feedTypeIds: st.feedTypeIds,
        sequence: st.sequence ?? displayStages.findIndex((d) => d.id === st.id) + 1,
      };

      if (st.configId) {
        await updateSpeciesStageConfig(st.configId, payload);
      } else {
        const created = await createSpeciesStageConfig({ speciesId: species.id, growthStageId: st.growthStageId ?? "", ...payload } as any);
        pendingCreateRef.current = { growthStageId: st.growthStageId ?? "", created };
      }

      toast.success("Lưu giai đoạn thành công");
    } catch (e) {
      console.error("Failed to save stage", e);
      toast.error("Lưu giai đoạn thất bại");
    } finally {
      setSaving((s) => ({ ...s, [st.id]: false }));
    }
  }

  async function handleAddStage(gs: { id: string; name: string }) {
    if ((species.stages || []).some((s) => s.growthStageId === gs.id)) return;
    addStage(species.id, gs.id, gs.name);
    try {
      const seq = (displayStages.length ?? (species.stages || []).length) + 1;
      const created = await createSpeciesStageConfig({ speciesId: species.id, growthStageId: gs.id, sequence: seq } as any);
      pendingCreateRef.current = { growthStageId: gs.id, created };
      toast.success("Thêm giai đoạn thành công");
    } catch (e) {
      console.error("Failed to create species stage config", e);
      //toast.error("Không thể thêm giai đoạn");
    }
  }

  async function handleDeleteGrowthStage(growthStageId: string) {
    try {
      await deleteGrowthStage(growthStageId);
      // Remove any species stages that reference this growth stage id so the UI updates immediately
      const toRemoveStages = (species.stages || []).filter((s) => s.growthStageId === growthStageId);
      toRemoveStages.forEach((s) => removeStage(species.id, s.id));
      // Remove from local growth stages list so the dialog updates without refresh
      try {
        setGrowthStages((prev) => prev.filter((g) => g.id !== growthStageId));
      } catch (err) {
        // ignore if setter not available
      }
      toast.success("Xóa giai đoạn thành công");
    } catch (e) {
      console.error("Failed to delete growth stage", e);
      toast.error("Xóa giai đoạn thất bại");
    }
  }

  async function handleDeleteSpeciesStageConfig(configId: string) {
    try {
      await deleteSpeciesStageConfig(configId);
      const toRemove = (species.stages || []).find((s) => s.configId === configId);
      if (toRemove) removeStage(species.id, toRemove.id);
      toast.success("Xóa cấu hình giai đoạn thành công");
      setStageToDelete(null);
    } catch (e) {
      console.error("Failed to delete species stage config", e);
      toast.error("Xóa cấu hình giai đoạn thất bại");
    }
  }

  async function handleCreateStage() {
    if (!newStageName) return;
    setCreatingStage(true);
    try {
      const created = await createGrowthStage({ name: newStageName, description: newStageDesc, speciesId: species.id });
      await handleAddStage({ id: created.id, name: created.name });
      setNewStageName("");
      setNewStageDesc("");
      setDialogOpen(false);
    } catch (e) {
      console.error("Failed to create growth stage", e);
      toast.error("Không thể tạo giai đoạn mới");
    } finally {
      setCreatingStage(false);
    }
  }

  async function handleExecuteDelete() {
    if (!onDeleteSpecies || deletingSpecies) return;
    setDeletingSpecies(true);
    try {
      await onDeleteSpecies(species.id);
      setDeleteModalOpen(false);
    } catch (e) {
      console.error("Failed to delete species", e);
      toast.error("Xóa loài thất bại");
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
    } catch (e) {
      console.error("Failed to rename species", e);
      toast.error("Đổi tên thất bại");
    } finally {
      setRenamingSpecies(false);
    }
  }

  const labelWithIcon = (icon: React.ReactNode, text: string) => (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
      {icon}
      {text}
    </Box>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 1.5 }}>
          <span style={{ fontSize: "2rem" }}>🐟</span>
          {species.name}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => setRenameOpen(true)}
            disabled={!onRenameSpecies || renamingSpecies}
            sx={{ color: "#64748B", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0", color: "#2A85FF" } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteModalOpen(true)}
            disabled={!onDeleteSpecies || deletingSpecies}
            sx={{ color: "#EF4444", bgcolor: "#FEF2F2", "&:hover": { bgcolor: "#FEE2E2", color: "#DC2626" } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>
            Thứ tự giai đoạn
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            Từ trên xuống dưới
          </Typography>
          <ArrowDownwardIcon fontSize="small" sx={{ color: "#94A3B8", ml: 0.5 }} />
        </Box>
        {displayStages.map((st, idx) => (
          <Accordion
            key={st.id}
            elevation={0}
            sx={{ border: "1px solid #E2E8F0", "&:before": { display: "none" } }}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={() => {
              dragIndexRef.current = null;
              dragOverIndexRef.current = null;
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#F8FAFC" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pr: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#EFF6FF", color: "#2A85FF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                  >
                    {idx + 1}
                  </Box>
                  <Box
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={() => {
                      dragIndexRef.current = null;
                      dragOverIndexRef.current = null;
                    }}
                    sx={{ display: "inline-flex", alignItems: "center", cursor: "grab", color: "#94A3B8" }}
                  >
                    <DragIndicatorIcon fontSize="small" />
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: "#334155" }}>{st.name}</Typography>
                  {idx === 0 ? <Chip label="Bắt đầu" size="small" sx={{ ml: 1 }} /> : idx === displayStages.length - 1 ? <Chip label="Cuối" size="small" sx={{ ml: 1 }} /> : null}
                </Box>
                {st.configId && (
                  <IconButton
                    component="span"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setStageToDelete(st);
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
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                  <FormControl fullWidth>
                    <InputLabel id={`feedtype-label-${st.id}`}>{labelWithIcon(<LocalDiningIcon fontSize="small" />, "Loại thức ăn")}</InputLabel>
                    <Select
                      labelId={`feedtype-label-${st.id}`}
                      label={labelWithIcon(<LocalDiningIcon fontSize="small" />, "Loại thức ăn")}
                      multiple
                      value={(st.feedTypeIds && st.feedTypeIds.length > 0 ? st.feedTypeIds : st.feedType ? [st.feedType] : []) as string[]}
                      onChange={(e) => {
                        const val = e.target.value;
                        const arr = Array.isArray(val)
                          ? val.map(String)
                          : String(val)
                              .split(",")
                              .map((s) => s.trim());
                        const names = arr.map((id) => feedTypes.find((f) => f.id === id)?.name).filter(Boolean) as string[];
                        updateStage(species.id, st.id, { feedTypeIds: arr, feedType: names.length > 0 ? names.join(", ") : (arr[0] ?? "") });
                      }}
                      renderValue={(selected) => (selected as string[]).map((id) => feedTypes.find((f) => f.id === id)?.name ?? id).join(", ")}
                    >
                      {feedLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={18} />
                        </MenuItem>
                      ) : (
                        <>
                          <MenuItem key="empty" value="" sx={{ display: "none" }} />
                          {st.feedType && !feedTypes.some((f) => f.id === st.feedType) ? (
                            <MenuItem key="fallback" value={st.feedType} sx={{ display: "none" }}>
                              {st.feedType}
                            </MenuItem>
                          ) : null}
                          {feedTypes.map((f) => {
                            const isSelected = (st.feedTypeIds && st.feedTypeIds.includes(f.id)) || st.feedType === f.id || (st.feedType || "").includes(f.name);
                            return (
                              <MenuItem
                                key={f.id}
                                value={f.id}
                                onClick={(e) => {
                                  // Prevent the click from bubbling to parent handlers
                                  e.stopPropagation();

                                  // Compute current selections as strings
                                  const current = (st.feedTypeIds && st.feedTypeIds.length > 0 ? st.feedTypeIds.slice() : st.feedType ? [st.feedType] : []) as string[];
                                  const idx = current.indexOf(f.id);
                                  if (idx === -1) current.push(f.id);
                                  else current.splice(idx, 1);

                                  const names = current.map((id) => feedTypes.find((ff) => ff.id === id)?.name).filter(Boolean) as string[];

                                  updateStage(species.id, st.id, { feedTypeIds: current, feedType: names.length > 0 ? names.join(", ") : (current[0] ?? "") });
                                }}
                              >
                                <Checkbox size="small" checked={isSelected} />
                                <ListItemText primary={f.name} />
                              </MenuItem>
                            );
                          })}
                        </>
                      )}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
                  <TextField
                    label={labelWithIcon(<LocalDiningIcon fontSize="small" />, "Lượng thức ăn (kg/100 cá)")}
                    type="number"
                    fullWidth
                    value={st.feedPer100}
                    onChange={(e) => updateStage(species.id, st.id, { feedPer100: Number(e.target.value) })}
                  />
                </Box>

                <Box sx={{ width: { xs: "100%", md: "calc(33.333% - 16px)" } }}>
                  <TextField
                    label={labelWithIcon(<TimelineIcon fontSize="small" />, "Số lần/ngày")}
                    type="number"
                    fullWidth
                    value={st.frequencyPerDay}
                    onChange={(e) => updateStage(species.id, st.id, { frequencyPerDay: Number(e.target.value) })}
                  />
                </Box>

                <Box sx={{ width: { xs: "100%", md: "calc(33.333% - 16px)" } }}>
                  <TextField
                    label={labelWithIcon(<ScaleIcon fontSize="small" />, "Mật độ tối đa (cá/m3)")}
                    type="number"
                    fullWidth
                    value={st.maxStockingDensity}
                    onChange={(e) => updateStage(species.id, st.id, { maxStockingDensity: Number(e.target.value) })}
                  />
                </Box>

                <Box sx={{ width: { xs: "100%", md: "calc(33.333% - 16px)" } }}>
                  <TextField
                    label={labelWithIcon(<ScheduleIcon fontSize="small" />, "Thời gian (ngày)")}
                    type="number"
                    fullWidth
                    value={st.expectedDurationDays}
                    onChange={(e) => updateStage(species.id, st.id, { expectedDurationDays: Number(e.target.value) })}
                  />
                </Box>

                <Box sx={{ width: "100%" }}>
                  <Typography variant="subtitle2" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 1, color: "#475569" }}>
                    <SensorsIcon fontSize="small" /> Ngưỡng cảm biến
                  </Typography>
                  <ThresholdEditor
                    speciesId={species.id}
                    stage={st}
                    onSaveThreshold={(sensor, min, max, id) => updateStageThreshold(species.id, st.id, sensor, min, max, id)}
                    onRemoveThreshold={(sensor) => {
                      const nextThresholds = (st.thresholds || []).filter((t) => t.sensor !== sensor);
                      updateStage(species.id, st.id, { thresholds: nextThresholds });
                    }}
                  />
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={!saving[st.id] ? <SaveIcon fontSize="small" /> : undefined}
                      onClick={() => saveStage(st)}
                      disabled={!!saving[st.id] || reordering}
                    >
                      {saving[st.id] ? <CircularProgress size={16} /> : "Lưu giai đoạn này"}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}>
            Thêm giai đoạn phát triển
          </Button>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <AddIcon fontSize="small" /> Thêm giai đoạn
          </DialogTitle>
          <DialogContent>
            {growthLoading ? (
              <CircularProgress />
            ) : (
              <>
                <List>
                  {growthStages.map((gs) => {
                    const already = (species.stages || []).some((s) => s.growthStageId === gs.id);
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
                        <ListItemButton disabled={already} onClick={() => handleAddStage(gs)}>
                          <ListItemText primary={already ? `${gs.name} — Đã cấu hình` : gs.name} secondary={gs.description ?? undefined} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                    <AddIcon fontSize="small" /> Tạo giai đoạn mới
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                    <Box sx={{ width: { xs: "100%", md: "calc(50% - 4px)" } }}>
                      <TextField label={labelWithIcon(<TimelineIcon fontSize="small" />, "Tên")} value={newStageName} onChange={(e) => setNewStageName(e.target.value)} fullWidth />
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: "calc(50% - 4px)" } }}>
                      <TextField label={labelWithIcon(<DescriptionIcon fontSize="small" />, "Mô tả")} value={newStageDesc} onChange={(e) => setNewStageDesc(e.target.value)} fullWidth />
                    </Box>
                    <Box sx={{ width: { xs: "100%", md: "calc(33.333% - 5.33px)" }, display: "flex", alignItems: "center" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={!creatingStage ? <AddIcon fontSize="small" /> : undefined}
                        onClick={handleCreateStage}
                        disabled={creatingStage || !newStageName}
                        sx={{ height: 56 }}
                      >
                        {creatingStage ? <CircularProgress size={16} /> : "Tạo và thêm"}
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

        <Dialog open={renameOpen} onClose={() => !renamingSpecies && setRenameOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <EditIcon fontSize="small" /> Đổi tên loài
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField label="Tên loài" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRenameOpen(false)} disabled={renamingSpecies}>
              Hủy
            </Button>
            <Button variant="contained" startIcon={!renamingSpecies ? <SaveIcon fontSize="small" /> : undefined} onClick={handleRenameSpecies} disabled={renamingSpecies || !renameValue.trim()}>
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
            <>
              Bạn có chắc chắn muốn xóa loài <b>"{species.name}"</b> không? Hành động này sẽ gỡ bỏ toàn bộ cấu hình thuộc loài này và <b>không thể hoàn tác</b>.
            </>
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(stageToDelete)}
        onClose={() => setStageToDelete(null)}
        onConfirm={() => {
          if (stageToDelete) {
            if (stageToDelete.configId) handleDeleteSpeciesStageConfig(stageToDelete.configId);
            else removeStage(species.id, stageToDelete.id);
          }
        }}
        loading={deletingStage}
        title="Xóa cấu hình giai đoạn"
        confirmText="Xóa cấu hình"
        color="error"
        content={
          <>
            <>
              Bạn có chắc chắn muốn xóa cấu hình của giai đoạn <b>"{stageToDelete?.name}"</b> không? Hành động này không thể hoàn tác.
            </>
          </>
        }
      />
    </Box>
  );
};

export default SpeciesDetail;
export { SpeciesDetail };

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PetsIcon from "@mui/icons-material/Pets";
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
  Grid,
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
import { createGrowthStage, deleteGrowthStage } from "../../../api/growth-stages";
import useFeedTypes from "../../../hooks/useFeedTypes";
import useGrowthStages from "../../../hooks/useGrowthStages";
import useSensorTypes from "../../../hooks/useSensorTypes";
import type { SpeciesConfig, Stage } from "../../../hooks/useSpeciesConfigs";
import useSpeciesStageConfigs from "../../../hooks/useSpeciesStageConfigs";
import useSpeciesThresholds from "../../../hooks/useSpeciesThresholds";
import { useToast } from "../../common/toastContext";
import ThresholdEditor from "./ThresholdEditor";

const SpeciesDetail: React.FC<{
  species: SpeciesConfig;
  updateStage: (speciesId: string, stageId: string, patch: Partial<Stage>) => void;
  updateStageThreshold: (speciesId: string, stageId: string, sensor: string, min: number | null, max: number | null, id?: string) => void;
  addStage: (speciesId: string, growthStageId?: string, name?: string) => void;
  removeStage?: (speciesId: string, stageId: string) => void;
  onDeleteSpecies?: (speciesId: string) => Promise<void> | void;
  onRenameSpecies?: (speciesId: string, name: string) => Promise<void> | void;
}> = ({ species, updateStage, updateStageThreshold, addStage, removeStage, onDeleteSpecies, onRenameSpecies }) => {
  const toast = useToast();
  const { feeds: feedTypes, loading: feedLoading } = useFeedTypes();
  const { stages: growthStages, setStages: setGrowthStages, loading: growthLoading } = useGrowthStages();
  const { createConfig, updateConfig, removeConfig } = useSpeciesStageConfigs();
  const { create: createThreshold, update: updateThreshold } = useSpeciesThresholds();
  const { items: sensorTypes } = useSensorTypes();

  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newStageName, setNewStageName] = React.useState("");
  const [newStageDesc, setNewStageDesc] = React.useState("");
  const [creatingStage, setCreatingStage] = React.useState(false);
  const [deletingSpecies, setDeletingSpecies] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(species.name);
  const [renamingSpecies, setRenamingSpecies] = React.useState(false);

  React.useEffect(() => {
    setRenameValue(species.name);
  }, [species.id, species.name]);

  const labelWithIcon = (icon: React.ReactNode, text: string) => (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
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
      const created = await createGrowthStage({ name: newStageName, description: newStageDesc });
      if (created) {
        setGrowthStages((s) => [created, ...s]);
        handleAddStage({ id: created.id, name: created.name });
        setNewStageName("");
        setNewStageDesc("");
        toast.success("Tạo giai đoạn thành công");
      }
    } catch (e) {
      console.error("Failed to create stage", e);
      toast.error("Tạo giai đoạn thất bại");
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
    } catch (e) {
      console.error("Failed to delete stage", e);
      toast.error("Xóa giai đoạn thất bại");
    }
  }

  async function handleDeleteStageConfig(st: Stage) {
    if (!st.configId) return;
    if (!window.confirm(`Bạn có chắc muốn xóa cấu hình giai đoạn "${st.name}"?`)) return;

    try {
      await removeConfig(st.configId);
      // remove config from local species stages
      if (typeof removeStage === "function") {
        removeStage(species.id, st.id);
        toast.success("Xóa cấu hình giai đoạn thành công");
        return;
      }

      // fallback: clear linkage
      updateStage(species.id, st.id, { configId: undefined, thresholds: [] });
      toast.success("Xóa cấu hình giai đoạn thành công");
    } catch (e) {
      console.error("Failed to delete stage config", e);
      toast.error("Xóa cấu hình giai đoạn thất bại");
    }
  }

  async function saveStage(st: Stage) {
    if (!species.id) return;
    setSaving((s) => ({ ...s, [st.id]: true }));
    try {
      const payload = {
        speciesId: species.id,
        growthStageId: st.growthStageId ?? "",
        feedTypeId: st.feedType,
        amountPer100Fish: st.feedPer100,
        frequencyPerDay: st.frequencyPerDay,
        maxStockingDensity: st.maxStockingDensity,
        expectedDurationDays: st.expectedDurationDays,
      } as const;

      if (st.configId) {
        await updateConfig(st.configId, payload);
      } else {
        const created = await createConfig(payload);
        if (created && created.id) {
          updateStage(species.id, st.id, { configId: created.id });
        }
      }

      // persist thresholds
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
            const nextThresholds = (st.thresholds || []).map((tt) => (tt.sensor === th.sensor ? { ...tt, id: created.id } : tt));
            updateStage(species.id, st.id, { thresholds: nextThresholds });
          }
        }
      }
      toast.success("Lưu giai đoạn thành công");
    } catch (e) {
      console.error("Failed to save stage", e);
      toast.error("Lưu giai đoạn thất bại");
    } finally {
      setSaving((s) => ({ ...s, [st.id]: false }));
    }
  }

  async function handleDeleteSpecies() {
    if (!onDeleteSpecies || deletingSpecies) return;
    if (!window.confirm(`Bạn có chắc muốn xóa loài "${species.name}"?`)) return;

    setDeletingSpecies(true);
    try {
      await onDeleteSpecies(species.id);
    } catch (e) {
      console.error("Failed to delete species", e);
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
    } finally {
      setRenamingSpecies(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
          <PetsIcon fontSize="small" />
          {species.name}
        </Typography>
        <IconButton size="small" aria-label="edit-species-name" onClick={() => setRenameOpen(true)} disabled={!onRenameSpecies || renamingSpecies}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Divider sx={{ my: 1 }} />

      <Stack spacing={2}>
        {species.stages.map((st) => (
          <Accordion key={st.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{st.name}</Typography>
              {st.configId ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeleteStageConfig(st);
                  }}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              ) : null}
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Growth stage name is not editable */}

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id={`feedtype-label-${st.id}`}>{labelWithIcon(<LocalDiningIcon fontSize="small" />, "Loại thức ăn")}</InputLabel>
                    <Select
                      labelId={`feedtype-label-${st.id}`}
                      label={labelWithIcon(<LocalDiningIcon fontSize="small" />, "Loại thức ăn")}
                      value={st.feedType ?? ""}
                      onChange={(e) => updateStage(species.id, st.id, { feedType: String(e.target.value) })}
                    >
                      {feedLoading ? (
                        <MenuItem value="">
                          <CircularProgress size={18} />
                        </MenuItem>
                      ) : (
                        feedTypes.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={labelWithIcon(<LocalDiningIcon fontSize="small" />, "Lượng thức ăn (kg/100 cá)")}
                    type="number"
                    fullWidth
                    value={st.feedPer100}
                    onChange={(e) => updateStage(species.id, st.id, { feedPer100: Number(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={labelWithIcon(<TimelineIcon fontSize="small" />, "Số lần/ngày")}
                    type="number"
                    fullWidth
                    value={st.frequencyPerDay}
                    onChange={(e) => updateStage(species.id, st.id, { frequencyPerDay: Number(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={labelWithIcon(<ScaleIcon fontSize="small" />, "Mật độ tối đa (cá/m3)")}
                    type="number"
                    fullWidth
                    value={st.maxStockingDensity}
                    onChange={(e) => updateStage(species.id, st.id, { maxStockingDensity: Number(e.target.value) })}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={labelWithIcon(<ScheduleIcon fontSize="small" />, "Thời gian (ngày)")}
                    type="number"
                    fullWidth
                    value={st.expectedDurationDays}
                    onChange={(e) => updateStage(species.id, st.id, { expectedDurationDays: Number(e.target.value) })}
                  />
                </Grid>

                <Grid size={12}>
                  <Typography variant="subtitle2" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                    <SensorsIcon fontSize="small" />
                    Ngưỡng cảm biến
                  </Typography>
                  <ThresholdEditor
                    speciesId={species.id}
                    stage={st}
                    onSaveThreshold={(sensor, min, max, id) => updateStageThreshold(species.id, st.id, sensor, min, max, id)}
                    onRemoveThreshold={(sensor) => {
                      const next = (st.thresholds || []).filter((t) => t.sensor !== sensor);
                      updateStage(species.id, st.id, { thresholds: next });
                    }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button variant="outlined" size="small" startIcon={!saving[st.id] ? <SaveIcon fontSize="small" /> : undefined} onClick={() => saveStage(st)} disabled={!!saving[st.id]}>
                      {saving[st.id] ? <CircularProgress size={16} /> : "Lưu giai đoạn"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Thêm giai đoạn
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSpecies} disabled={!onDeleteSpecies || deletingSpecies}>
            {deletingSpecies ? <CircularProgress size={16} color="inherit" /> : "Xóa loài"}
          </Button>
        </Stack>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <AddIcon fontSize="small" />
            Thêm giai đoạn
          </DialogTitle>
          <DialogContent>
            {growthLoading ? (
              <CircularProgress />
            ) : (
              <>
                <List>
                  {growthStages.map((gs) => {
                    const already = species.stages.some((s) => s.growthStageId === gs.id);
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
                    <AddIcon fontSize="small" />
                    Tạo giai đoạn mới
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField label={labelWithIcon(<TimelineIcon fontSize="small" />, "Tên")} value={newStageName} onChange={(e) => setNewStageName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField label={labelWithIcon(<DescriptionIcon fontSize="small" />, "Mô tả")} value={newStageDesc} onChange={(e) => setNewStageDesc(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Button variant="contained" startIcon={!creatingStage ? <AddIcon fontSize="small" /> : undefined} onClick={handleCreateStage} disabled={creatingStage || !newStageName}>
                        {creatingStage ? <CircularProgress size={16} /> : "Tạo và thêm"}
                      </Button>
                    </Grid>
                  </Grid>
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
            <EditIcon fontSize="small" />
            Đổi tên loài
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
    </Box>
  );
};

export default SpeciesDetail;

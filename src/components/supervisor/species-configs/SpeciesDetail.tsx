import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import ThresholdEditor from "./ThresholdEditor";

const SpeciesDetail: React.FC<{
  species: SpeciesConfig;
  updateStage: (speciesId: string, stageId: string, patch: Partial<Stage>) => void;
  updateStageThreshold: (speciesId: string, stageId: string, sensor: string, min: number | null, max: number | null, id?: string) => void;
  addStage: (speciesId: string, growthStageId?: string, name?: string) => void;
  removeStage?: (speciesId: string, stageId: string) => void;
}> = ({ species, updateStage, updateStageThreshold, addStage, removeStage }) => {
  const { feeds: feedTypes, loading: feedLoading } = useFeedTypes();
  const { stages: growthStages, setStages: setGrowthStages, loading: growthLoading } = useGrowthStages();
  const { createConfig, updateConfig, removeConfig } = useSpeciesStageConfigs();
  const { create: createThreshold, update: updateThreshold, remove: removeThreshold } = useSpeciesThresholds();
  const { items: sensorTypes } = useSensorTypes();

  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newStageName, setNewStageName] = React.useState("");
  const [newStageDesc, setNewStageDesc] = React.useState("");
  const [creatingStage, setCreatingStage] = React.useState(false);

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
      }
    } catch {
      // ignore for now
    } finally {
      setCreatingStage(false);
    }
  }

  async function handleDeleteGrowthStage(id: string) {
    try {
      await deleteGrowthStage(id);
      setGrowthStages((s) => s.filter((g) => g.id !== id));
    } catch {
      // ignore
    }
  }

  async function handleDeleteStageConfig(st: Stage) {
    if (!st.configId) return;
    try {
      await removeConfig(st.configId);
      // remove config from local species stages
      if (typeof removeStage === "function") {
        removeStage(species.id, st.id);
        return;
      }

      // fallback: clear linkage
      updateStage(species.id, st.id, { configId: undefined, thresholds: [] });
    } catch {
      // ignore
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
    } catch {
      // ignore for now
    } finally {
      setSaving((s) => ({ ...s, [st.id]: false }));
    }
  }

  return (
    <Box>
      <Typography variant="h6">{species.name}</Typography>
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
                    <InputLabel id={`feedtype-label-${st.id}`}>Loại thức ăn</InputLabel>
                    <Select labelId={`feedtype-label-${st.id}`} label="Loại thức ăn" value={st.feedType ?? ""} onChange={(e) => updateStage(species.id, st.id, { feedType: String(e.target.value) })}>
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
                  <TextField label="Feed (kg/100 cá)" type="number" fullWidth value={st.feedPer100} onChange={(e) => updateStage(species.id, st.id, { feedPer100: Number(e.target.value) })} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField label="Số lần/ngày" type="number" fullWidth value={st.frequencyPerDay} onChange={(e) => updateStage(species.id, st.id, { frequencyPerDay: Number(e.target.value) })} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Mật độ tối đa (cá/m3)"
                    type="number"
                    fullWidth
                    value={st.maxStockingDensity}
                    onChange={(e) => updateStage(species.id, st.id, { maxStockingDensity: Number(e.target.value) })}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Thời gian (ngày)"
                    type="number"
                    fullWidth
                    value={st.expectedDurationDays}
                    onChange={(e) => updateStage(species.id, st.id, { expectedDurationDays: Number(e.target.value) })}
                  />
                </Grid>

                <Grid size={12}>
                  <Typography variant="subtitle2">Ngưỡng cảm biến</Typography>
                  <ThresholdEditor
                    speciesId={species.id}
                    stage={st}
                    onSaveThreshold={(sensor, min, max, id) => updateStageThreshold(species.id, st.id, sensor, min, max, id)}
                    onRemoveThreshold={async (sensor) => {
                      const found = (st.thresholds || []).find((t) => t.sensor === sensor);
                      if (found && found.id) {
                        try {
                          await removeThreshold(found.id);
                        } catch {
                          // ignore deletion error but still update UI
                        }
                      }
                      const next = (st.thresholds || []).filter((t) => t.sensor !== sensor);
                      updateStage(species.id, st.id, { thresholds: next });
                    }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => saveStage(st)} disabled={!!saving[st.id]}>
                      {saving[st.id] ? <CircularProgress size={16} /> : "Lưu giai đoạn"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Thêm giai đoạn
          </Button>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Thêm giai đoạn</DialogTitle>
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
                  <Typography variant="subtitle2">Tạo giai đoạn mới</Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField label="Tên" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField label="Mô tả" value={newStageDesc} onChange={(e) => setNewStageDesc(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Button variant="contained" onClick={handleCreateStage} disabled={creatingStage || !newStageName}>
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
      </Stack>
    </Box>
  );
};

export default SpeciesDetail;

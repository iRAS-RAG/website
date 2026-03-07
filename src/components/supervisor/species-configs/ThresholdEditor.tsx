import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Grid, IconButton, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import useSensorTypes from "../../../hooks/useSensorTypes";
import type { Stage } from "../../../hooks/useSpeciesConfigs";
import useSpeciesThresholds from "../../../hooks/useSpeciesThresholds";
import type { SpeciesThresholdCreate } from "../../../types/species-threshold";

const ThresholdEditor: React.FC<{
  speciesId: string;
  stage: Stage;
  onSaveThreshold: (sensor: string, min: number | null, max: number | null, id?: string) => void;
  onRemoveThreshold?: (sensor: string) => void;
}> = ({ speciesId, stage, onSaveThreshold, onRemoveThreshold }) => {
  const { items: sensorTypes, loading } = useSensorTypes();
  const { create: createThreshold } = useSpeciesThresholds();

  const configured = useMemo(() => stage.thresholds.map((t) => t.sensor), [stage.thresholds]);

  const [edits, setEdits] = useState<Record<string, { min: string; max: string }>>(() => {
    const init: Record<string, { min: string; max: string }> = {};
    for (const t of stage.thresholds) init[t.sensor] = { min: t.min === null ? "" : String(t.min ?? ""), max: t.max === null ? "" : String(t.max ?? "") };
    return init;
  });

  function handleExistingChange(sensor: string, field: "min" | "max", value: string) {
    setEdits((s) => ({ ...s, [sensor]: { min: s[sensor]?.min ?? "", max: s[sensor]?.max ?? "", [field]: value } }));
  }

  function handleExistingSave(sensor: string) {
    const e = edits[sensor];
    const min = e?.min === "" ? null : Number(e?.min);
    const max = e?.max === "" ? null : Number(e?.max);
    onSaveThreshold(sensor, min, max);
  }

  const [newSensor, setNewSensor] = useState<string>("");
  const [newMin, setNewMin] = useState<string>("");
  const [newMax, setNewMax] = useState<string>("");

  async function handleAdd() {
    if (!newSensor) return;
    const min = newMin === "" ? null : Number(newMin);
    const max = newMax === "" ? null : Number(newMax);

    const sensor = sensorTypes.find((s) => s.name === newSensor);
    if (!sensor) {
      // fallback: still update UI without persisting
      onSaveThreshold(newSensor, min, max);
      setNewSensor("");
      setNewMin("");
      setNewMax("");
      return;
    }

    try {
      const payload: SpeciesThresholdCreate = {
        speciesId,
        growthStageId: stage.growthStageId ?? "",
        sensorTypeId: sensor.id,
        minValue: min ?? 0,
        maxValue: max ?? 0,
      };

      const created = await createThreshold(payload);
      // update local UI with returned id
      onSaveThreshold(newSensor, min, max, created?.id);
    } catch {
      // if API fails, still update UI optimistically without id
      onSaveThreshold(newSensor, min, max);
    } finally {
      setNewSensor("");
      setNewMin("");
      setNewMax("");
    }
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={1}>
        {stage.thresholds.map((t) => (
          <Grid size={12} key={t.sensor}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                <TextField label="Sensor" value={t.sensor} fullWidth disabled />
              </Box>
              <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                <TextField label="Min" value={edits[t.sensor]?.min ?? (t.min === null ? "" : String(t.min ?? ""))} onChange={(e) => handleExistingChange(t.sensor, "min", e.target.value)} fullWidth />
              </Box>
              <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                <TextField label="Max" value={edits[t.sensor]?.max ?? (t.max === null ? "" : String(t.max ?? ""))} onChange={(e) => handleExistingChange(t.sensor, "max", e.target.value)} fullWidth />
              </Box>
              <Box sx={{ flex: "0 0 120px", display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => handleExistingSave(t.sensor)}>
                  Lưu
                </Button>
                <IconButton onClick={() => onRemoveThreshold && onRemoveThreshold(t.sensor)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}

        <Grid size={12}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2">Thêm ngưỡng mới</Typography>
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
              <Select fullWidth value={newSensor} onChange={(e) => setNewSensor(String(e.target.value))} displayEmpty>
                <MenuItem value="">Chọn sensor</MenuItem>
                {loading ? (
                  <MenuItem value="">Đang tải...</MenuItem>
                ) : (
                  sensorTypes.map((st) => (
                    <MenuItem key={st.id} value={st.name} disabled={configured.includes(st.name)}>
                      {st.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </Box>
            <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
              <TextField label="Min" value={newMin} onChange={(e) => setNewMin(e.target.value)} fullWidth />
            </Box>
            <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
              <TextField label="Max" value={newMax} onChange={(e) => setNewMax(e.target.value)} fullWidth />
            </Box>
            <Box sx={{ flex: "0 0 120px" }}>
              <Button variant="contained" onClick={handleAdd} disabled={!newSensor} fullWidth>
                Thêm
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThresholdEditor;

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SensorsIcon from "@mui/icons-material/Sensors";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Button, Grid, IconButton, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import useSensorTypes from "../../../hooks/useSensorTypes";
import type { Stage } from "../../../hooks/useSpeciesConfigs";
import useSpeciesThresholds from "../../../hooks/useSpeciesThresholds";
import type { SpeciesThresholdCreate } from "../../../types/species-threshold";
import { useToast } from "../../common/toastContext";

const ThresholdEditor: React.FC<{
  speciesId: string;
  stage: Stage;
  onSaveThreshold: (sensor: string, min: number | null, max: number | null, id?: string) => void;
  onRemoveThreshold?: (sensor: string) => void;
}> = ({ speciesId, stage, onSaveThreshold, onRemoveThreshold }) => {
  const toast = useToast();
  const { items: sensorTypes, loading } = useSensorTypes();
  const { create: createThreshold, update: updateThreshold, remove: removeThreshold } = useSpeciesThresholds();

  const configured = useMemo(() => stage.thresholds.map((t) => t.sensor), [stage.thresholds]);

  const [edits, setEdits] = useState<Record<string, { min: string; max: string }>>(() => {
    const init: Record<string, { min: string; max: string }> = {};
    for (const t of stage.thresholds) init[t.sensor] = { min: t.min === null ? "" : String(t.min ?? ""), max: t.max === null ? "" : String(t.max ?? "") };
    return init;
  });

  useEffect(() => {
    const next: Record<string, { min: string; max: string }> = {};
    for (const t of stage.thresholds) {
      next[t.sensor] = {
        min: t.min === null ? "" : String(t.min ?? ""),
        max: t.max === null ? "" : String(t.max ?? ""),
      };
    }
    setEdits(next);
  }, [stage.id, stage.thresholds]);

  const [savingExisting, setSavingExisting] = useState<Record<string, boolean>>({});
  const [deletingExisting, setDeletingExisting] = useState<Record<string, boolean>>({});

  function handleExistingChange(sensor: string, field: "min" | "max", value: string) {
    setEdits((s) => ({ ...s, [sensor]: { min: s[sensor]?.min ?? "", max: s[sensor]?.max ?? "", [field]: value } }));
  }

  async function handleExistingSave(sensor: string) {
    const e = edits[sensor];
    const min = e?.min === "" ? null : Number(e?.min);
    const max = e?.max === "" ? null : Number(e?.max);

    const current = stage.thresholds.find((t) => t.sensor === sensor);
    if (!current) return;

    setSavingExisting((s) => ({ ...s, [sensor]: true }));
    try {
      const sensorTypeId = current.sensorTypeId || sensorTypes.find((s) => s.name === sensor)?.id;
      if (!sensorTypeId) {
        // Keep UI responsive even if sensor type cannot be resolved.
        onSaveThreshold(sensor, min, max, current.id);
        return;
      }

      const payload: SpeciesThresholdCreate = {
        speciesId,
        growthStageId: stage.growthStageId ?? "",
        sensorTypeId,
        minValue: min ?? 0,
        maxValue: max ?? 0,
      };

      if (current.id) {
        await updateThreshold(current.id, payload);
        onSaveThreshold(sensor, min, max, current.id);
      } else {
        const created = await createThreshold(payload);
        onSaveThreshold(sensor, min, max, created?.id);
      }
      toast.success("Lưu ngưỡng cảm biến thành công");
    } catch (e) {
      console.error("Failed to save threshold", e);
      toast.error("Lưu ngưỡng cảm biến thất bại");
    } finally {
      setSavingExisting((s) => ({ ...s, [sensor]: false }));
    }
  }

  async function handleExistingDelete(sensor: string) {
    if (!onRemoveThreshold || deletingExisting[sensor]) return;

    const confirmed = window.confirm(`Bạn có chắc muốn xóa ngưỡng cảm biến "${sensor}"?`);
    if (!confirmed) return;

    setDeletingExisting((s) => ({ ...s, [sensor]: true }));
    try {
      const current = stage.thresholds.find((t) => t.sensor === sensor);
      if (current?.id) {
        await removeThreshold(current.id);
      }

      onRemoveThreshold(sensor);
      toast.success("Xóa ngưỡng cảm biến thành công");
    } catch (e) {
      console.error("Failed to delete threshold", e);
      toast.error("Xóa ngưỡng cảm biến thất bại");
    } finally {
      setDeletingExisting((s) => ({ ...s, [sensor]: false }));
    }
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
      toast.warning("Không tìm thấy loại cảm biến, chỉ cập nhật tạm trên giao diện");
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
      toast.success("Thêm ngưỡng cảm biến thành công");
    } catch (e) {
      console.error("Failed to create threshold", e);
      // if API fails, still update UI optimistically without id
      onSaveThreshold(newSensor, min, max);
      toast.warning("Không thể lưu ngưỡng lên máy chủ, đã cập nhật tạm trên giao diện");
    } finally {
      setNewSensor("");
      setNewMin("");
      setNewMax("");
    }
  }

  const labelWithIcon = (icon: React.ReactNode, text: string) => (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
      {icon}
      {text}
    </Box>
  );

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={1}>
        {stage.thresholds.map((t) => (
          <Grid size={12} key={t.sensor}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                <TextField label={labelWithIcon(<SensorsIcon fontSize="small" />, "Cảm biến")} value={t.sensor} fullWidth disabled />
              </Box>
              <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                <TextField
                  label={labelWithIcon(<TrendingDownIcon fontSize="small" />, "Min")}
                  value={edits[t.sensor]?.min ?? (t.min === null ? "" : String(t.min ?? ""))}
                  onChange={(e) => handleExistingChange(t.sensor, "min", e.target.value)}
                  fullWidth
                />
              </Box>
              <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                <TextField
                  label={labelWithIcon(<TrendingUpIcon fontSize="small" />, "Max")}
                  value={edits[t.sensor]?.max ?? (t.max === null ? "" : String(t.max ?? ""))}
                  onChange={(e) => handleExistingChange(t.sensor, "max", e.target.value)}
                  fullWidth
                />
              </Box>
              <Box sx={{ flex: "0 0 120px", display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={!savingExisting[t.sensor] ? <SaveIcon fontSize="small" /> : undefined}
                  onClick={() => void handleExistingSave(t.sensor)}
                  disabled={!!savingExisting[t.sensor] || !!deletingExisting[t.sensor]}
                >
                  Lưu
                </Button>
                <IconButton onClick={() => void handleExistingDelete(t.sensor)} disabled={!!deletingExisting[t.sensor] || !!savingExisting[t.sensor]}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}

        <Grid size={12}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
              <AddIcon fontSize="small" />
              Thêm ngưỡng mới
            </Typography>
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
              <Select fullWidth value={newSensor} onChange={(e) => setNewSensor(String(e.target.value))} displayEmpty>
                <MenuItem value="">Chọn cảm biến</MenuItem>
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
              <TextField label={labelWithIcon(<TrendingDownIcon fontSize="small" />, "Min")} value={newMin} onChange={(e) => setNewMin(e.target.value)} fullWidth />
            </Box>
            <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
              <TextField label={labelWithIcon(<TrendingUpIcon fontSize="small" />, "Max")} value={newMax} onChange={(e) => setNewMax(e.target.value)} fullWidth />
            </Box>
            <Box sx={{ flex: "0 0 120px" }}>
              <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={handleAdd} disabled={!newSensor} fullWidth>
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

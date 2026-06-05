import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SensorsIcon from "@mui/icons-material/Sensors";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Button, Grid, IconButton, MenuItem, Select, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import type { SensorType } from "../../../types/sensor-type";
import type { Stage } from "../../../hooks/useSpeciesConfigs";
import type { SpeciesThreshold, SpeciesThresholdCreate } from "../../../types/species-threshold";
import ConfirmDialog from "../../common/ConfirmDialog";
import { useToast } from "../../common/toastContext";

const ThresholdEditor: React.FC<{
  speciesId: string;
  stage: Stage;
  sensorTypes: SensorType[];
  sensorTypesLoading: boolean;
  createThreshold: (payload: SpeciesThresholdCreate) => Promise<SpeciesThreshold>;
  updateThreshold: (id: string, payload: Partial<SpeciesThresholdCreate>) => Promise<SpeciesThreshold | null>;
  removeThreshold: (id: string) => Promise<boolean>;
  onSaveThreshold: (sensor: string, min: number | null, max: number | null, id?: string) => void;
  onRemoveThreshold?: (sensor: string) => void;
}> = ({ speciesId, stage, sensorTypes, sensorTypesLoading, createThreshold, updateThreshold, removeThreshold, onSaveThreshold, onRemoveThreshold }) => {
  const toast = useToast();

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

  /** Look up the sensor type definition for range validation. */
  function getSensorTypeRange(sensorName: string) {
    const sensorType = sensorTypes.find((s) => s.name === sensorName);
    return {
      sensorType,
      minPossible: sensorType?.minPossibleValue ?? -Infinity,
      maxPossible: sensorType?.maxPossibleValue ?? Infinity,
    };
  }

  /** Returns an inline error message if the value exceeds the sensor's absolute possible range. */
  function getInlineError(sensorName: string, value: number | null, field: "min" | "max"): string | null {
    if (value === null) return null;
    const { sensorType, minPossible, maxPossible } = getSensorTypeRange(sensorName);
    if (!sensorType) return null;
    const unit = sensorType.unitOfMeasure ?? "";
    if (field === "min" && value < minPossible) return `Min không thể nhỏ hơn ${minPossible}${unit ? ` ${unit}` : ""}`;
    if (field === "max" && value > maxPossible) return `Max không thể lớn hơn ${maxPossible}${unit ? ` ${unit}` : ""}`;
    return null;
  }

  /** Helper text showing the allowed absolute range for a sensor. */
  function getRangeHint(sensorName: string, field: "min" | "max"): string {
    const { sensorType, minPossible, maxPossible } = getSensorTypeRange(sensorName);
    if (!sensorType) return "";
    const unit = sensorType.unitOfMeasure ?? "";
    if (field === "min") return `Tối thiểu: ${minPossible}${unit ? ` ${unit}` : ""}`;
    return `Tối đa: ${maxPossible}${unit ? ` ${unit}` : ""}`;
  }

  /** Check if a sensor type is binary (only 0 or 1). */
  function isBinarySensor(sensorName: string): boolean {
    const st = sensorTypes.find((s) => s.name === sensorName);
    return st?.unitOfMeasure === "0/1";
  }

  /** Map a binary threshold's min/max to a selection key: "0", "1", or "both". */
  function binarySelectionKey(min: number | null, max: number | null): string {
    if (min === 0 && max === 0) return "0";
    if (min === 1 && max === 1) return "1";
    return "both";
  }

  async function handleExistingSave(sensor: string) {
    const e = edits[sensor];
    const min = e?.min === "" ? null : Number(e?.min);
    const max = e?.max === "" ? null : Number(e?.max);

    const current = stage.thresholds.find((t) => t.sensor === sensor);
    if (!current) return;

    // Validate min < max before sending API request (skip for binary sensors where min == max is valid)
    if (min !== null && max !== null && min >= max && !isBinarySensor(sensor)) {
      toast.warning("Giá trị Min phải nhỏ hơn Max");
      return;
    }

    // Validate against sensor type's absolute possible range
    const { sensorType: st, minPossible, maxPossible } = getSensorTypeRange(sensor);
    if (min !== null && st && min < minPossible) {
      toast.warning(`Giá trị Min (${min}) thấp hơn ngưỡng tối thiểu cho phép (${minPossible} ${st.unitOfMeasure ?? ""}).`);
      return;
    }
    if (max !== null && st && max > maxPossible) {
      toast.warning(`Giá trị Max (${max}) vượt quá ngưỡng tối đa cho phép (${maxPossible} ${st.unitOfMeasure ?? ""}).`);
      return;
    }

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
    setDeleteTarget(sensor);
  }

  async function confirmDelete() {
    const sensor = deleteTarget;
    if (!sensor) return;

    setDeletingExisting((s) => ({ ...s, [sensor]: true }));
    setDeleteTarget(null);
    try {
      const current = stage.thresholds.find((t) => t.sensor === sensor);
      if (current?.id) {
        await removeThreshold(current.id);
      }

      onRemoveThreshold?.(sensor);
      toast.success("Xóa ngưỡng cảm biến thành công");
    } catch (e) {
      console.error("Failed to delete threshold", e);
      toast.error("Xóa ngưỡng cảm biến thất bại");
    } finally {
      setDeletingExisting((s) => ({ ...s, [sensor]: false }));
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [newSensor, setNewSensor] = useState<string>("");
  const [newMin, setNewMin] = useState<string>("");
  const [newMax, setNewMax] = useState<string>("");
  const [binChoice, setBinChoice] = useState<string>("both");
  const unconfiguredSensors = useMemo(() => sensorTypes.filter((s) => !configured.includes(s.name)), [sensorTypes, configured]);

  async function handleAdd() {
    if (!newSensor) return;
    const min = newMin === "" ? null : Number(newMin);
    const max = newMax === "" ? null : Number(newMax);

    if (min !== null && max !== null && min >= max) {
      toast.warning("Giá trị Min phải nhỏ hơn Max");
      return;
    }

    // Validate against sensor type's absolute possible range
    const { sensorType: st, minPossible, maxPossible } = getSensorTypeRange(newSensor);
    if (min !== null && st && min < minPossible) {
      toast.warning(`Giá trị Min (${min}) thấp hơn ngưỡng tối thiểu cho phép (${minPossible} ${st.unitOfMeasure ?? ""}).`);
      return;
    }
    if (max !== null && st && max > maxPossible) {
      toast.warning(`Giá trị Max (${max}) vượt quá ngưỡng tối đa cho phép (${maxPossible} ${st.unitOfMeasure ?? ""}).`);
      return;
    }

    const sensor = sensorTypes.find((s) => s.name === newSensor);
    if (!sensor) {
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
      onSaveThreshold(newSensor, min, max, created?.id);
      toast.success("Thêm ngưỡng cảm biến thành công");
    } catch (e) {
      console.error("Failed to create threshold", e);
      toast.error("Không thể lưu ngưỡng lên máy chủ");
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
        {stage.thresholds.map((t) => {
          const binary = isBinarySensor(t.sensor);
          const binVal = binarySelectionKey(
            edits[t.sensor]?.min === "" ? null : Number(edits[t.sensor]?.min ?? t.min),
            edits[t.sensor]?.max === "" ? null : Number(edits[t.sensor]?.max ?? t.max),
          );
          return (
            <Grid size={12} key={t.sensor}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                  <TextField label={labelWithIcon(<SensorsIcon fontSize="small" />, "Cảm biến")} value={t.sensor} fullWidth disabled />
                </Box>
                {binary ? (
                  <>
                    <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <TrendingDownIcon fontSize="inherit" /> TRẠNG THÁI BÌNH THƯỜNG
                      </Typography>
                      <ToggleButtonGroup
                        value={binVal}
                        exclusive
                        size="small"
                        onChange={(_, val) => {
                          if (!val) return;
                          setEdits((s) => {
                            const base = s[t.sensor] ?? { min: "", max: "" };
                            if (val === "0") return { ...s, [t.sensor]: { ...base, min: "0", max: "0" } };
                            if (val === "1") return { ...s, [t.sensor]: { ...base, min: "1", max: "1" } };
                            return { ...s, [t.sensor]: { ...base, min: "0", max: "1" } };
                          });
                        }}
                      >
                        <ToggleButton value="0" sx={{ textTransform: "none", px: 2 }}>0 (Tắt)</ToggleButton>
                        <ToggleButton value="1" sx={{ textTransform: "none", px: 2 }}>1 (Bật)</ToggleButton>
                        <ToggleButton value="both" sx={{ textTransform: "none", px: 2 }}>Cả hai</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    <Box sx={{ flex: "0 0 60px", display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={!savingExisting[t.sensor] ? <SaveIcon fontSize="small" /> : undefined}
                        onClick={() => void handleExistingSave(t.sensor)}
                        disabled={!!savingExisting[t.sensor] || !!deletingExisting[t.sensor]}
                      >
                        Lưu
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                      <TextField
                        label={labelWithIcon(<TrendingDownIcon fontSize="small" />, "Min")}
                        value={edits[t.sensor]?.min ?? (t.min === null ? "" : String(t.min ?? ""))}
                        onChange={(e) => handleExistingChange(t.sensor, "min", e.target.value)}
                        error={!!getInlineError(t.sensor, edits[t.sensor]?.min === "" ? null : Number(edits[t.sensor]?.min), "min")}
                        helperText={getInlineError(t.sensor, edits[t.sensor]?.min === "" ? null : Number(edits[t.sensor]?.min), "min") || getRangeHint(t.sensor, "min")}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                      <TextField
                        label={labelWithIcon(<TrendingUpIcon fontSize="small" />, "Max")}
                        value={edits[t.sensor]?.max ?? (t.max === null ? "" : String(t.max ?? ""))}
                        onChange={(e) => handleExistingChange(t.sensor, "max", e.target.value)}
                        error={!!getInlineError(t.sensor, edits[t.sensor]?.max === "" ? null : Number(edits[t.sensor]?.max), "max")}
                        helperText={getInlineError(t.sensor, edits[t.sensor]?.max === "" ? null : Number(edits[t.sensor]?.max), "max") || getRangeHint(t.sensor, "max")}
                        fullWidth
                      />
                    </Box>
                  </>
                )}
                <Box sx={{ flex: "0 0 60px", display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  {!binary && (
                    <Button
                      variant="outlined"
                      startIcon={!savingExisting[t.sensor] ? <SaveIcon fontSize="small" /> : undefined}
                      onClick={() => void handleExistingSave(t.sensor)}
                      disabled={!!savingExisting[t.sensor] || !!deletingExisting[t.sensor]}
                    >
                      Lưu
                    </Button>
                  )}
                  <IconButton onClick={() => void handleExistingDelete(t.sensor)} disabled={!!deletingExisting[t.sensor] || !!savingExisting[t.sensor]}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          );
        })}

        {unconfiguredSensors.length > 0 && (
          <Grid size={12}>
            <Box sx={{ mt: 1, mb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SensorsIcon fontSize="small" />}
                onClick={() => {
                  for (const sensor of unconfiguredSensors) {
                    onSaveThreshold(sensor.name, null, null);
                  }
                }}
              >
                {`Thêm tất cả cảm biến (${unconfiguredSensors.length})`}
              </Button>
            </Box>
          </Grid>
        )}

        <Grid size={12}>
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
              <AddIcon fontSize="small" />
              Thêm ngưỡng mới
            </Typography>
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
              <Select fullWidth value={newSensor} onChange={(e) => {
                setNewSensor(String(e.target.value));
                setNewMin("");
                setNewMax("");
                setBinChoice("both");
              }} displayEmpty>
                <MenuItem value="">Chọn cảm biến</MenuItem>
                {sensorTypesLoading ? (
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
            {newSensor && isBinarySensor(newSensor) ? (
              <>
                <Box sx={{ flex: "1 1 50%", minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <TrendingDownIcon fontSize="inherit" /> TRẠNG THÁI BÌNH THƯỜNG
                  </Typography>
                  <ToggleButtonGroup
                    value={binChoice}
                    exclusive
                    size="small"
                    onChange={(_, val) => { if (val) setBinChoice(val); }}
                  >
                    <ToggleButton value="0" sx={{ textTransform: "none", px: 2 }}>0 (Tắt)</ToggleButton>
                    <ToggleButton value="1" sx={{ textTransform: "none", px: 2 }}>1 (Bật)</ToggleButton>
                    <ToggleButton value="both" sx={{ textTransform: "none", px: 2 }}>Cả hai</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box sx={{ flex: "0 0 120px" }}>
                  <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={() => {
                    if (!newSensor || !newSensor) return;
                    const min = binChoice === "0" ? 0 : binChoice === "1" ? 1 : 0;
                    const max = binChoice === "0" ? 0 : binChoice === "1" ? 1 : 1;
                    const sensor = sensorTypes.find((s) => s.name === newSensor);
                    if (!sensor) { toast.warning("Không tìm thấy loại cảm biến"); return; }
                    (async () => {
                      try {
                        const payload = { speciesId, growthStageId: stage.growthStageId ?? "", sensorTypeId: sensor.id, minValue: min, maxValue: max };
                        const created = await createThreshold(payload);
                        onSaveThreshold(newSensor, min, max, created?.id);
                        toast.success("Thêm ngưỡng cảm biến thành công");
                      } catch { toast.error("Không thể lưu ngưỡng lên máy chủ"); }
                    })();
                    setNewSensor("");
                    setNewMin("");
                    setNewMax("");
                    setBinChoice("both");
                  }} disabled={!newSensor} fullWidth>
                    Thêm
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                  <TextField label={labelWithIcon(<TrendingDownIcon fontSize="small" />, "Min")} value={newMin} onChange={(e) => setNewMin(e.target.value)}
                    error={!!getInlineError(newSensor, newMin === "" ? null : Number(newMin), "min")}
                    helperText={newSensor ? (getInlineError(newSensor, newMin === "" ? null : Number(newMin), "min") || getRangeHint(newSensor, "min")) : ""}
                    fullWidth />
                </Box>
                <Box sx={{ flex: "1 1 25%", minWidth: 0 }}>
                  <TextField label={labelWithIcon(<TrendingUpIcon fontSize="small" />, "Max")} value={newMax} onChange={(e) => setNewMax(e.target.value)}
                    error={!!getInlineError(newSensor, newMax === "" ? null : Number(newMax), "max")}
                    helperText={newSensor ? (getInlineError(newSensor, newMax === "" ? null : Number(newMax), "max") || getRangeHint(newSensor, "max")) : ""}
                    fullWidth />
                </Box>
                <Box sx={{ flex: "0 0 120px" }}>
                  <Button variant="contained" startIcon={<AddIcon fontSize="small" />} onClick={handleAdd} disabled={!newSensor} fullWidth>
                    Thêm
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xóa ngưỡng cảm biến"
        content={`Bạn có chắc muốn xóa ngưỡng cảm biến "${deleteTarget ?? ""}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        color="error"
      />
    </Box>
  );
};

export default ThresholdEditor;

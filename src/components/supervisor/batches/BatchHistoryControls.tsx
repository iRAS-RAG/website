import { Box, Button, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, TextField } from "@mui/material";
import React from "react";

interface Props {
  start?: string;
  end?: string;
  metrics?: string[];
  interval?: "day" | "hour";
  onChange: (params: { start?: string; end?: string; metrics?: string[]; interval?: string }) => void;
}

function isoToDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

const METRIC_OPTIONS: { value: string; label: string }[] = [
  { value: "feed", label: "Cám" },
  { value: "mortality", label: "Tử vong" },
  { value: "count", label: "Số lượng" },
  { value: "fcr", label: "FCR" },
];

export default function BatchHistoryControls({ start, end, metrics = ["feed", "mortality"], interval = "day", onChange }: Props) {
  const [localStart, setLocalStart] = React.useState<string>(isoToDate(start));
  const [localEnd, setLocalEnd] = React.useState<string>(isoToDate(end));
  const [localInterval, setLocalInterval] = React.useState<string>(interval);
  const [localMetrics, setLocalMetrics] = React.useState<string[]>(metrics || ["feed", "mortality"]);

  React.useEffect(() => setLocalStart(isoToDate(start)), [start]);
  React.useEffect(() => setLocalEnd(isoToDate(end)), [end]);
  React.useEffect(() => setLocalInterval(interval), [interval]);

  const handleRefresh = () => {
    const startIso = localStart ? new Date(localStart).toISOString() : undefined;
    const endIso = localEnd ? new Date(localEnd).toISOString() : undefined;
    onChange({ start: startIso, end: endIso, metrics: localMetrics, interval: localInterval });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <TextField label="Từ ngày" type="date" value={localStart} onChange={(e) => setLocalStart(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
      <TextField label="Đến ngày" type="date" value={localEnd} onChange={(e) => setLocalEnd(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="metrics-label">Chỉ số</InputLabel>
        <Select
          labelId="metrics-label"
          multiple
          value={localMetrics}
          onChange={(e) => setLocalMetrics(typeof e.target.value === "string" ? e.target.value.split(",") : (e.target.value as string[]))}
          input={<OutlinedInput label="Chỉ số" />}
          renderValue={(selected) => (selected as string[]).map((s) => METRIC_OPTIONS.find((o) => o.value === s)?.label ?? s).join(", ")}
        >
          {METRIC_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              <Checkbox checked={localMetrics.indexOf(opt.value) > -1} />
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="interval-label">Khoảng</InputLabel>
        <Select labelId="interval-label" value={localInterval} label="Khoảng" onChange={(e) => setLocalInterval(String(e.target.value))}>
          <MenuItem value="day">Ngày</MenuItem>
          <MenuItem value="hour">Giờ</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleRefresh}>
        Cập nhật
      </Button>
    </Box>
  );
}

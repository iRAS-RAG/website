import { Box, Button, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from "@mui/material";
import React from "react";
import LocalizedDateField from "../common/LocalizedDateField";

interface Props {
  start?: string;
  end?: string;
  groupBy?: "none" | "tank" | "batch";
  metric?: "feed" | "mortality";
  interval?: "day" | "hour";
  aggregations?: string[];
  onChange: (params: { start?: string; end?: string; groupBy?: string; metric?: string; interval?: string; aggregations?: string[] }) => void;
}

function isoToDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

const AGG_OPTIONS: { value: string; label: string }[] = [
  { value: "sum", label: "Tổng (sum)" },
  { value: "avg", label: "Trung bình (avg)" },
  { value: "min", label: "Nhỏ nhất (min)" },
  { value: "max", label: "Lớn nhất (max)" },
  { value: "median", label: "Trung vị (median)" },
  { value: "p90", label: "P90 (p90)" },
];

export default function FarmTimeseriesControls({ start, end, groupBy = "none", metric = "feed", interval = "day", aggregations = ["sum"], onChange }: Props) {
  const [localStart, setLocalStart] = React.useState<string>(isoToDate(start));
  const [localEnd, setLocalEnd] = React.useState<string>(isoToDate(end));
  const [localGroupBy, setLocalGroupBy] = React.useState<string>(groupBy);
  const [localMetric, setLocalMetric] = React.useState<string>(metric);
  const [localInterval, setLocalInterval] = React.useState<string>(interval);
  const [localAggs, setLocalAggs] = React.useState<string[]>(aggregations || ["sum"]);

  React.useEffect(() => setLocalStart(isoToDate(start)), [start]);
  React.useEffect(() => setLocalEnd(isoToDate(end)), [end]);
  React.useEffect(() => setLocalGroupBy(groupBy), [groupBy]);

  const handleRefresh = () => {
    const startIso = localStart ? new Date(localStart).toISOString() : undefined;
    const endIso = localEnd ? new Date(localEnd).toISOString() : undefined;
    onChange({ start: startIso, end: endIso, groupBy: localGroupBy, metric: localMetric, interval: localInterval, aggregations: localAggs });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <LocalizedDateField label="Từ ngày" value={localStart} onChange={setLocalStart} size="small" />
      <LocalizedDateField label="Đến ngày" value={localEnd} onChange={setLocalEnd} size="small" />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="groupby-label">Nhóm theo</InputLabel>
        <Select labelId="groupby-label" value={localGroupBy} label="Nhóm theo" onChange={(e) => setLocalGroupBy(String(e.target.value))}>
          <MenuItem value="none">Không</MenuItem>
          <MenuItem value="tank">Bể</MenuItem>
          <MenuItem value="batch">Lô</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="metric-label">Chỉ số</InputLabel>
        <Select labelId="metric-label" value={localMetric} label="Chỉ số" onChange={(e) => setLocalMetric(String(e.target.value))}>
          <MenuItem value="feed">Cám (kg)</MenuItem>
          <MenuItem value="mortality">Tử vong (con)</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="interval-label">Khoảng</InputLabel>
        <Select labelId="interval-label" value={localInterval} label="Khoảng" onChange={(e) => setLocalInterval(String(e.target.value))}>
          <MenuItem value="day">Ngày</MenuItem>
          <MenuItem value="hour">Giờ</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="agg-label">Hàm gộp</InputLabel>
        <Select
          labelId="agg-label"
          multiple
          value={localAggs}
          onChange={(e) => setLocalAggs(typeof e.target.value === "string" ? e.target.value.split(",") : (e.target.value as string[]))}
          input={<OutlinedInput label="Hàm gộp" />}
          renderValue={(selected) => (selected as string[]).map((s) => AGG_OPTIONS.find((o) => o.value === s)?.label ?? s).join(", ")}
        >
          {AGG_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              <Checkbox checked={localAggs.indexOf(opt.value) > -1} />
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleRefresh}>
        Cập nhật
      </Button>
    </Box>
  );
}

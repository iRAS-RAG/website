import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import React from "react";

interface Props {
  start?: string;
  end?: string;
  groupBy?: "none" | "tank" | "batch";
  metric?: string;
  limit?: number;
  onChange: (params: { start?: string; end?: string; groupBy?: string; metric?: string; limit?: number }) => void;
}

function isoToDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function FarmSummaryControls({ start, end, groupBy = "none", metric = "totalFeedKg", limit = 10, onChange }: Props) {
  const [localStart, setLocalStart] = React.useState<string>(isoToDate(start));
  const [localEnd, setLocalEnd] = React.useState<string>(isoToDate(end));
  const [localGroupBy, setLocalGroupBy] = React.useState<string>(groupBy);
  const [localMetric, setLocalMetric] = React.useState<string>(metric);
  const [localLimit, setLocalLimit] = React.useState<number>(limit);

  React.useEffect(() => setLocalStart(isoToDate(start)), [start]);
  React.useEffect(() => setLocalEnd(isoToDate(end)), [end]);
  React.useEffect(() => setLocalGroupBy(groupBy), [groupBy]);

  const handleRefresh = () => {
    const startIso = localStart ? new Date(localStart).toISOString() : undefined;
    const endIso = localEnd ? new Date(localEnd).toISOString() : undefined;
    onChange({ start: startIso, end: endIso, groupBy: localGroupBy, metric: localMetric, limit: Number(localLimit) });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <TextField label="Từ ngày" type="date" value={localStart} onChange={(e) => setLocalStart(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
      <TextField label="Đến ngày" type="date" value={localEnd} onChange={(e) => setLocalEnd(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="groupby-label">Nhóm theo</InputLabel>
        <Select labelId="groupby-label" value={localGroupBy} label="Nhóm theo" onChange={(e) => setLocalGroupBy(String(e.target.value))}>
          <MenuItem value="none">Không</MenuItem>
          <MenuItem value="tank">Bể</MenuItem>
          <MenuItem value="batch">Lô</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="metric-label">Chỉ số</InputLabel>
        <Select labelId="metric-label" value={localMetric} label="Chỉ số" onChange={(e) => setLocalMetric(String(e.target.value))}>
          <MenuItem value="totalFeedKg">Tổng cám (kg)</MenuItem>
          <MenuItem value="totalDeaths">Tổng tử vong (con)</MenuItem>
          <MenuItem value="currentQuantity">Số lượng hiện tại (con)</MenuItem>
          <MenuItem value="fcr">FCR</MenuItem>
        </Select>
      </FormControl>

      <TextField label="Giới hạn" type="number" value={localLimit} onChange={(e) => setLocalLimit(Number(e.target.value) || 10)} size="small" sx={{ width: 100 }} />

      <Button variant="contained" onClick={handleRefresh}>
        Cập nhật
      </Button>
    </Box>
  );
}

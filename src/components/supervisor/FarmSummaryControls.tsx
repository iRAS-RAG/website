import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";

import React from "react";
import LocalizedDateField from "../common/LocalizedDateField";

interface Props {
  start?: string;
  end?: string;
  metric?: string;
  limit?: number;
  onChange: (params: { start?: string; end?: string; metric?: string; limit?: number }) => void;
}

function isoToDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function FarmSummaryControls({ start, end, metric = "totalFeedKg", limit = 10, onChange }: Props) {
  const [localStart, setLocalStart] = React.useState<string>(isoToDate(start));
  const [localEnd, setLocalEnd] = React.useState<string>(isoToDate(end));
  const [localMetric, setLocalMetric] = React.useState<string>(metric);
  const [localLimit, setLocalLimit] = React.useState<number>(limit);

  React.useEffect(() => setLocalStart(isoToDate(start)), [start]);
  React.useEffect(() => setLocalEnd(isoToDate(end)), [end]);

  const handleRefresh = () => {
    const startIso = localStart ? new Date(localStart).toISOString() : undefined;
    const endIso = localEnd ? new Date(localEnd).toISOString() : undefined;
    onChange({ start: startIso, end: endIso, metric: localMetric, limit: Number(localLimit) });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      <LocalizedDateField label="Từ ngày" value={localStart} onChange={setLocalStart} size="small" />
      <LocalizedDateField label="Đến ngày" value={localEnd} onChange={setLocalEnd} size="small" />

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

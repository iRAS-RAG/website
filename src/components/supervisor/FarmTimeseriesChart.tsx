import { Autocomplete, Box, Button, Checkbox, Chip, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import useFarmTimeseries from "../../hooks/useFarmTimeseries";
import useSupervisorMetricsSignalR from "../../hooks/useSupervisorMetricsSignalR";
import TimeseriesChart from "../common/charts/TimeseriesChart";
import FarmTimeseriesControls from "./FarmTimeseriesControls";

function mapSeries(ts?: { series: { groupId?: string; groupName?: string; points: { timestamp: string; value: number }[] }[] } | null) {
  if (!ts || !ts.series) return [] as { name: string; points: { timestamp: string; value: number }[] }[];
  return ts.series.map((s) => {
    let name = s.groupName || s.groupId || "Chuỗi";
    if (name === "Farm") name = "Nông trại";
    return { name, points: s.points };
  });
}

const defaultEnd = new Date().toISOString();
const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

const metricLabel = (k?: string) => {
  switch (k) {
    case "feed":
      return "Cám (kg)";
    case "mortality":
      return "Tử vong";
    default:
      return k ?? "Chuỗi";
  }
};

type TimeseriesParams = {
  start: string;
  end: string;
  metric: "feed" | "mortality";
  interval: "day" | "hour";
  groupBy: "none" | "tank" | "batch";
  aggregations: string[];
};

const FarmTimeseriesChart: React.FC<{ farmId?: string; defaultMetric?: "feed" | "mortality"; height?: number }> = ({ farmId, defaultMetric = "feed", height = 420 }) => {
  const [params, setParams] = React.useState<TimeseriesParams>({ start: defaultStart, end: defaultEnd, metric: defaultMetric, interval: "day", groupBy: "none", aggregations: ["sum"] });

  const { loading, error, timeseries, refetch } = useFarmTimeseries(farmId, {
    start: params.start,
    end: params.end,
    metric: params.metric,
    interval: params.interval,
    groupBy: params.groupBy === "none" ? undefined : params.groupBy,
    aggregations: (params.aggregations || ["sum"]).join(","),
  });

  // Debounced refetch for SignalR events
  const refetchTimer = React.useRef<number | null>(null);
  const scheduleRefetch = React.useCallback(() => {
    if (refetchTimer.current) window.clearTimeout(refetchTimer.current);
    refetchTimer.current = window.setTimeout(() => {
      refetch();
      refetchTimer.current = null;
    }, 1500) as unknown as number;
  }, [refetch]);

  React.useEffect(() => {
    return () => {
      if (refetchTimer.current) window.clearTimeout(refetchTimer.current);
    };
  }, []);

  useSupervisorMetricsSignalR("aaaaaaaa-0000-0000-0000-000000000001", {
    onFeeding: scheduleRefetch,
    onMortality: scheduleRefetch,
  });

  const handleControlsChange = (p: { start?: string; end?: string; groupBy?: string; metric?: string; interval?: string; aggregations?: string[] }) => {
    setParams((prev) => {
      // When switching to batch grouping, force a single aggregation to avoid chart clutter
      if (p.groupBy === "batch" && p.groupBy !== prev.groupBy) {
        return { ...prev, ...p, aggregations: ["sum"] } as TimeseriesParams;
      }
      return { ...prev, ...p } as TimeseriesParams;
    });
  };

  const series = React.useMemo(() => mapSeries(timeseries), [timeseries]);

  // Multi-select filter for batch series
  const allSeriesNames = React.useMemo(() => series.map((s) => s.name), [series]);
  const [visibleSeries, setVisibleSeries] = React.useState<string[]>([]);
  const initializedRef = React.useRef(false);

  // Initialize visibleSeries once when data first arrives, or when groupBy changes
  React.useEffect(() => {
    if (allSeriesNames.length === 0) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      setVisibleSeries(params.groupBy === "batch" && allSeriesNames.length > 10 ? allSeriesNames.slice(0, 10) : allSeriesNames);
    }
  }, [allSeriesNames, params.groupBy]);

  // Reset initialization when groupBy mode changes
  React.useEffect(() => {
    initializedRef.current = false;
  }, [params.groupBy]);

  const filteredSeries = React.useMemo(() => {
    if (params.groupBy === "batch" && visibleSeries.length < allSeriesNames.length) {
      return series.filter((s) => visibleSeries.includes(s.name));
    }
    return series;
  }, [series, visibleSeries, allSeriesNames, params.groupBy]);

  const exportCsv = () => {
    const headers = ["Thời gian", "Chuỗi", "Giá trị"];
    const rows: string[][] = [];
    (timeseries?.series || []).forEach((s) => {
      (s.points || []).forEach((p) => {
        rows.push([p.timestamp, s.groupName || s.groupId || "", String(p.value ?? "")]);
      });
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(params.metric || defaultMetric).replace(/[^a-z0-9]/gi, "_")}_timeseries_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: "14px", border: "1px solid #E2E8F0", bgcolor: "#fff" }}>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 2 }}>{metricLabel(params.metric)} theo thời gian</Typography>

        <FarmTimeseriesControls
          start={params.start}
          end={params.end}
          groupBy={params.groupBy}
          metric={params.metric}
          interval={params.interval}
          aggregations={params.aggregations}
          onChange={handleControlsChange}
        />

        {params.groupBy === "batch" && allSeriesNames.length > 1 && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", whiteSpace: "nowrap" }}>Hiển thị lô:</Typography>
            <Autocomplete
              multiple
              size="small"
              options={allSeriesNames}
              value={visibleSeries}
              onChange={(_, newValue) => setVisibleSeries(newValue)}
              disableCloseOnSelect
              sx={{ minWidth: 280, maxWidth: "100%" }}
              renderInput={(params) => <TextField {...params} label="Chọn lô" placeholder="Tìm lô..." />}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox checked={selected} size="small" sx={{ mr: 1 }} />
                  {option}
                </li>
              )}
              renderTags={(value, getTagProps) => value.slice(0, 3).map((name, index) => <Chip label={name} size="small" sx={{ height: 20, fontSize: "0.7rem" }} {...getTagProps({ index })} />)}
            />
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              {visibleSeries.length}/{allSeriesNames.length} lô
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ color: "error.main", py: 4 }}>{String(error)}</Box>
        ) : series.length === 0 ? (
          <Box sx={{ py: 4, color: "#64748B" }}>Không có dữ liệu cho khoảng thời gian đã chọn.</Box>
        ) : (
          <>
            <Box sx={{ mt: 2 }}>
              <TimeseriesChart title={undefined} series={filteredSeries} height={height} />
            </Box>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button size="small" variant="outlined" onClick={exportCsv} sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px" }}>
                Xuất CSV
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default FarmTimeseriesChart;

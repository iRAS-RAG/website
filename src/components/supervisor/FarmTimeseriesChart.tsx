import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import React from "react";
import useFarmTimeseries from "../../hooks/useFarmTimeseries";
import useSupervisorMetricsSignalR from "../../hooks/useSupervisorMetricsSignalR";
import TimeseriesChart from "../common/charts/TimeseriesChart";
import FarmTimeseriesControls from "./FarmTimeseriesControls";

function mapSeries(ts?: { series: { groupId?: string; groupName?: string; points: { timestamp: string; value: number }[] }[] } | null) {
  if (!ts || !ts.series) return [] as { name: string; points: { timestamp: string; value: number }[] }[];
  return ts.series.map((s) => ({ name: s.groupName || s.groupId || "Chuỗi", points: s.points }));
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

const FarmTimeseriesChart: React.FC<{ farmId?: string; defaultMetric?: string; height?: number }> = ({ farmId, defaultMetric = "feed", height = 420 }) => {
  const [params, setParams] = React.useState({ start: defaultStart, end: defaultEnd, metric: defaultMetric, interval: "day", groupBy: "none", aggregations: ["sum"] as string[] });

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
    setParams((prev) => ({ ...prev, ...(p as any) }));
  };

  const series = mapSeries(timeseries);

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
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px" }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          {metricLabel(params.metric)} theo thời gian
        </Typography>

        <FarmTimeseriesControls
          start={params.start}
          end={params.end}
          groupBy={params.groupBy as any}
          metric={params.metric as any}
          interval={params.interval as any}
          aggregations={params.aggregations}
          onChange={handleControlsChange}
        />

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
              <TimeseriesChart title={undefined} series={series} height={height} />
            </Box>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button size="small" onClick={exportCsv}>
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

import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import React from "react";
import useBatchHistory from "../../../hooks/useBatchHistory";
import useSupervisorMetricsSignalR from "../../../hooks/useSupervisorMetricsSignalR";
import TimeseriesChart from "../../common/charts/TimeseriesChart";
import BatchHistoryControls from "./BatchHistoryControls";

const DEFAULT_FARM_ID = "aaaaaaaa-0000-0000-0000-000000000001";

const metricLabel = (k?: string) => {
  switch (k) {
    case "feed":
      return "Cám (kg)";
    case "mortality":
      return "Tử vong";
    case "count":
      return "Số lượng";
    case "fcr":
      return "FCR";
    default:
      return k ?? "Chuỗi";
  }
};

function mapHistory(h?: { feedSeries?: any[]; mortalitySeries?: any[]; countSeries?: any[]; fcrSeries?: any[] } | null) {
  if (!h) return [] as { name: string; points: { timestamp: string; value: number }[] }[];
  const out: { name: string; points: { timestamp: string; value: number }[] }[] = [];
  if (h.feedSeries && h.feedSeries.length > 0) out.push({ name: metricLabel("feed"), points: h.feedSeries });
  if (h.mortalitySeries && h.mortalitySeries.length > 0) out.push({ name: metricLabel("mortality"), points: h.mortalitySeries });
  if (h.countSeries && h.countSeries.length > 0) out.push({ name: metricLabel("count"), points: h.countSeries });
  if (h.fcrSeries && h.fcrSeries.length > 0) out.push({ name: metricLabel("fcr"), points: h.fcrSeries });
  return out;
}

const defaultEnd = new Date().toISOString();
const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

const BatchHistoryChart: React.FC<{ batchId?: string; defaultStart?: string; defaultEnd?: string; defaultMetrics?: string[]; height?: number }> = ({
  batchId,
  defaultStart: ds = defaultStart,
  defaultEnd: de = defaultEnd,
  defaultMetrics = ["feed", "mortality"],
  height = 420,
}) => {
  const [params, setParams] = React.useState({ start: ds, end: de, metrics: defaultMetrics, interval: "day" as string });

  const { loading, error, history, refetch } = useBatchHistory(batchId, {
    start: params.start,
    end: params.end,
    metrics: (params.metrics || []).join(","),
    interval: params.interval,
  });

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

  useSupervisorMetricsSignalR(DEFAULT_FARM_ID, { onFeeding: scheduleRefetch, onMortality: scheduleRefetch });

  const handleControlsChange = (p: { start?: string; end?: string; metrics?: string[]; interval?: string }) => {
    setParams((prev) => ({ ...prev, ...(p as any) }));
  };

  const series = mapHistory(history as any);

  const exportCsv = () => {
    const headers = ["Thời gian", "Chuỗi", "Giá trị"];
    const rows: string[][] = [];

    if (!history) return;

    if (history.feedSeries) {
      history.feedSeries.forEach((p: any) => rows.push([p.timestamp, metricLabel("feed"), String(p.value ?? "")]));
    }
    if (history.mortalitySeries) {
      history.mortalitySeries.forEach((p: any) => rows.push([p.timestamp, metricLabel("mortality"), String(p.value ?? "")]));
    }
    if (history.countSeries) {
      history.countSeries.forEach((p: any) => rows.push([p.timestamp, metricLabel("count"), String(p.value ?? "")]));
    }
    if (history.fcrSeries) {
      history.fcrSeries.forEach((p: any) => rows.push([p.timestamp, metricLabel("fcr"), String(p.value ?? "")]));
    }

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${String(batchId ?? "batch")}_history_${(params.metrics || []).join("_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px" }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Lịch sử vụ nuôi theo thời gian
        </Typography>

        <BatchHistoryControls start={params.start} end={params.end} metrics={params.metrics} interval={params.interval as any} onChange={handleControlsChange} />

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

export default BatchHistoryChart;

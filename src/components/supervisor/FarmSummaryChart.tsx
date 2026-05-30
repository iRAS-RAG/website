import { Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useFarmSummary from "../../hooks/useFarmSummary";
import useSupervisorMetricsSignalR from "../../hooks/useSupervisorMetricsSignalR";
import FarmSummaryControls from "./FarmSummaryControls";

const COLORS = ["#2A85FF", "#10B981", "#F59E0B", "#9333EA", "#EF4444", "#06B6D4"];

function formatNumber(val: number | null | undefined, decimals = 2) {
  if (val === null || val === undefined) return "—";
  if (Math.abs(val - Math.round(val)) < 1e-9) return String(Math.round(val));
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }).format(val);
}

const defaultEnd = new Date().toISOString();
const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

const FarmSummaryChart: React.FC<{ farmId?: string }> = ({ farmId }) => {
  const [params, setParams] = React.useState({ start: defaultStart, end: defaultEnd, groupBy: "none", metric: "totalFeedKg", limit: 10 });

  const { loading, error, summary, refetch } = useFarmSummary(farmId, { start: params.start, end: params.end, groupBy: params.groupBy === "none" ? undefined : params.groupBy });

  // Debounced refetch for SignalR events
  const refetchTimer = React.useRef<number | null>(null);
  const scheduleRefetch = React.useCallback(() => {
    if (refetchTimer.current) {
      window.clearTimeout(refetchTimer.current);
    }
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

  type ParamsType = { start: string; end: string; groupBy: string; metric: string; limit: number };
  const handleControlsChange = (p: Partial<ParamsType>) => {
    setParams((prev) => ({ ...prev, ...p }));
  };

  React.useEffect(() => {
    // ensure data refresh when controls change
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.start, params.end, params.groupBy]);

  const batches = (summary?.batches ?? []).slice();
  const metricKey = params.metric;
  const limit = params.limit ?? 10;

  const barData = batches
    .map((b) => {
      let raw: number | null | undefined = 0;
      if (metricKey === "totalFeedKg") raw = b.totalFeedKg ?? 0;
      else if (metricKey === "totalDeaths") raw = b.totalDeaths ?? 0;
      else if (metricKey === "currentQuantity") raw = b.currentQuantity ?? 0;
      else if (metricKey === "fcr") raw = b.fcr ?? 0;
      else raw = 0;
      return { name: b.batchName ?? b.batchId, value: Number(raw ?? 0), batchId: b.batchId };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  const exportCsv = () => {
    const headers = ["Mã lô", "Tên lô", "Số lượng hiện có", "Cám (kg)", "Tử vong", "FCR"];
    const rows = (summary?.batches ?? []).map((b) => [b.batchId, b.batchName ?? "", String(b.currentQuantity ?? ""), String(b.totalFeedKg ?? ""), String(b.totalDeaths ?? ""), String(b.fcr ?? "")]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tong_quan_trang_trai_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metricLabel = (k: string) => {
    switch (k) {
      case "totalFeedKg":
        return "Cám (kg)";
      case "totalDeaths":
        return "Tử vong";
      case "currentQuantity":
        return "Số lượng hiện có";
      case "fcr":
        return "FCR";
      default:
        return k;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px", mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Tổng quan trang trại
        </Typography>

        <FarmSummaryControls start={params.start} end={params.end} groupBy={params.groupBy as "none" | "tank" | "batch"} metric={params.metric} limit={params.limit} onChange={handleControlsChange} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ color: "error.main", py: 4 }}>{String(error)}</Box>
        ) : !summary ? (
          <Box sx={{ py: 4, color: "#64748B" }}>Không có dữ liệu cho khoảng thời gian đã chọn.</Box>
        ) : (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ flex: "1 1 25%", minWidth: 220 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                  <Typography variant="caption">Tổng cám (kg)</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalFeedKg, 2)}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ flex: "1 1 25%", minWidth: 220 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                  <Typography variant="caption">Tổng tử vong</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalDeathsCount, 0)}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ flex: "1 1 25%", minWidth: 220 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                  <Typography variant="caption">Số lượng hiện có</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalCurrentQuantity, 0)}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ flex: "1 1 25%", minWidth: 220 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                  <Typography variant="caption">FCR</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {summary.fcr === null || summary.fcr === undefined ? "—" : summary.fcr.toFixed(2)}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Các vụ nuôi hàng đầu theo {metricLabel(params.metric)}
              </Typography>
              {barData.length === 0 ? (
                <Box sx={{ py: 4, color: "#64748B" }}>Không có dữ liệu để hiển thị biểu đồ.</Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer>
                      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={160} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name={metricLabel(params.metric)} fill={COLORS[0]}>
                          {barData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              )}
            </Box>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Các vụ nuôi
              </Typography>
              <Button size="small" onClick={exportCsv}>
                Xuất CSV
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1, borderRadius: "12px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Lô</TableCell>
                    <TableCell align="right">Số lượng hiện có</TableCell>
                    <TableCell align="right">Cám (kg)</TableCell>
                    <TableCell align="right">Tử vong</TableCell>
                    <TableCell align="right">FCR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(summary?.batches ?? []).map((b) => (
                    <TableRow key={b.batchId}>
                      <TableCell>{b.batchName ?? b.batchId}</TableCell>
                      <TableCell align="right">{b.currentQuantity ?? "—"}</TableCell>
                      <TableCell align="right">{b.totalFeedKg ?? "—"}</TableCell>
                      <TableCell align="right">{b.totalDeaths ?? "—"}</TableCell>
                      <TableCell align="right">{b.fcr ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default FarmSummaryChart;

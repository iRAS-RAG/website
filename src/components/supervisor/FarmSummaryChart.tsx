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
  const [params, setParams] = React.useState({ start: defaultStart, end: defaultEnd, metric: "totalFeedKg", limit: 10 });

  const { loading, error, summary, refetch } = useFarmSummary(farmId, { start: params.start, end: params.end });

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

  type ParamsType = { start: string; end: string; metric: string; limit: number };
  const handleControlsChange = (p: Partial<ParamsType>) => {
    setParams((prev) => ({ ...prev, ...p }));
  };

  React.useEffect(() => {
    // ensure data refresh when controls change
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.start, params.end]);

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
      <Paper elevation={0} sx={{ p: 3, borderRadius: "14px", border: "1px solid #E2E8F0", bgcolor: "#fff" }}>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 2 }}>Tổng quan trang trại</Typography>

        <FarmSummaryControls start={params.start} end={params.end} metric={params.metric} limit={params.limit} onChange={handleControlsChange} />

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
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>Tổng cám</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {formatNumber(summary.totalFeedKg, 2)} kg
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>Tử vong</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {formatNumber(summary.totalDeathsCount, 0)} con
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>Số lượng hiện có</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {formatNumber(summary.totalCurrentQuantity, 0)} con
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>FCR</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {summary.fcr === null || summary.fcr === undefined ? "—" : summary.fcr.toFixed(2)}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                Các vụ nuôi hàng đầu theo {metricLabel(params.metric)}
              </Typography>
              {barData.length === 0 ? (
                <Box sx={{ py: 4, color: "#64748B" }}>Không có dữ liệu để hiển thị biểu đồ.</Box>
              ) : (
                <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <Box sx={{ height: Math.max(200, Math.min(600, barData.length * 48)) }}>
                    <ResponsiveContainer>
                      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 12 }} />
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

            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>Các vụ nuôi</Typography>
              <Button size="small" variant="outlined" onClick={exportCsv} sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px" }}>
                Xuất CSV
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ mt: 1.5, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
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
                  {(summary?.batches ?? [])
                    .slice()
                    .sort((a, b) => {
                      const getVal = (batch: typeof a) => {
                        if (metricKey === "totalFeedKg") return batch.totalFeedKg ?? 0;
                        if (metricKey === "totalDeaths") return batch.totalDeaths ?? 0;
                        if (metricKey === "currentQuantity") return batch.currentQuantity ?? 0;
                        return batch.fcr ?? 0;
                      };
                      return Number(getVal(b)) - Number(getVal(a));
                    })
                    .slice(0, limit)
                    .map((b) => (
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

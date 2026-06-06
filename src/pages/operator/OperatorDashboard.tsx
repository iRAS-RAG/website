import SearchIcon from "@mui/icons-material/Search";
import { Box, CircularProgress, FormControl, InputAdornment, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { RecentAlertsList } from "../../components/operator/RecentAlertsList";
import { TankPulseCard } from "../../components/operator/TankPulseCard";

import { getTanks } from "../../api/tanks";
import { useOperatorDashboard, type DayFilter } from "../../hooks/useOperatorDashboard";
import type { Tank } from "../../types/tank";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_OPTIONS: { value: DayFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "today", label: "Hôm nay" },
  { value: "7", label: "7 ngày" },
  { value: "30", label: "30 ngày" },
];

// ─── Pie chart tooltip ────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  payload: { name: string; value: number; color: string };
}

const CustomTooltip = ({ active, payload, total }: { active?: boolean; payload?: TooltipPayloadItem[]; total: number }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
  return (
    <Paper elevation={3} sx={{ p: 1.5, borderRadius: "10px", minWidth: 140, border: "1px solid #E2E8F0" }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#1E293B" }}>{name}</Typography>
      </Stack>
      <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>
        {value} ({pct}%)
      </Typography>
    </Paper>
  );
};

// ─── Pie chart card ───────────────────────────────────────────────────────────

interface PieSlice {
  name: string;
  value: number;
  color: string;
}

interface PieChartCardProps {
  title: string;
  data: PieSlice[];
  total: number;
  totalLabel: string;
  dayFilter?: DayFilter;
  onDayFilterChange?: (v: DayFilter) => void;
}

const EMPTY_SLICE: PieSlice[] = [{ name: "Không có dữ liệu", value: 1, color: "#E2E8F0" }];

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data, total, totalLabel, dayFilter, onDayFilterChange }) => {
  const hasData = total > 0;
  const chartData = hasData ? data.filter((d) => d.value > 0) : EMPTY_SLICE;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: "1px solid #E2E8F0",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</Typography>
        {dayFilter !== undefined && onDayFilterChange && (
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select value={dayFilter} onChange={(e) => onDayFilterChange(e.target.value as DayFilter)} sx={{ fontSize: "0.75rem", "& .MuiSelect-select": { py: 0.75, px: 1.5 } }}>
              {DAY_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.8rem" }}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      {/* Pie chart */}
      <Box sx={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius="45%" outerRadius="72%" paddingAngle={hasData ? 2 : 0} dataKey="value" stroke="none">
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            {hasData && <Tooltip content={<CustomTooltip total={total} />} wrapperStyle={{ outline: "none" }} />}
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Summary rows */}
      <Stack spacing={0.75}>
        {/* Total row */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 0.75, borderBottom: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>{totalLabel}</Typography>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "#0F172A" }}>{total}</Typography>
        </Stack>
        {/* Each slice */}
        {data.map((slice) => (
          <Stack key={slice.name} direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: slice.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{slice.name}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1E293B" }}>{slice.value}</Typography>
              {total > 0 && <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>({((slice.value / total) * 100).toFixed(0)}%)</Typography>}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

// ─── OperatorDashboard ───────────────────────────────────────────────────────

const OperatorDashboard = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);

  const [alertDays, setAlertDays] = useState<DayFilter>("all");
  const [batchDays, setBatchDays] = useState<DayFilter>("all");

  const [tankSearch, setTankSearch] = useState("");
  const [tankPage, setTankPage] = useState(1);
  const TANKS_PER_PAGE = 4;

  const navigate = useNavigate();

  useEffect(() => {
    getTanks()
      .then(setTanks)
      .catch((err) => console.error("Không thể tải danh sách bể:", err));
  }, []);

  const { alertStats, batchStats, deviceStats, batches, loading } = useOperatorDashboard(undefined, alertDays, batchDays);

  const filteredTanks = useMemo(() => {
    const q = tankSearch.toLowerCase().trim();
    return tanks.filter((t) => !q || t.name.toLowerCase().includes(q));
  }, [tanks, tankSearch]);

  const totalTankPages = Math.ceil(filteredTanks.length / TANKS_PER_PAGE);
  const pagedTanks = filteredTanks.slice((tankPage - 1) * TANKS_PER_PAGE, tankPage * TANKS_PER_PAGE);

  // Pie chart data
  const alertPieData: PieSlice[] = [
    { name: "Chờ xử lý", value: alertStats.open, color: "#EF4444" },
    { name: "Đang xử lý", value: alertStats.acknowledged, color: "#F59E0B" },
    { name: "Đóng sự cố", value: alertStats.resolved, color: "#10B981" },
    { name: "Bỏ qua", value: alertStats.dismissed, color: "#94A3B8" },
  ];

  const batchPieData: PieSlice[] = [
    { name: "Đang nuôi", value: batchStats.active, color: "#2A85FF" },
    { name: "Đã thu hoạch", value: batchStats.harvested, color: "#10B981" },
    { name: "Tạm dừng", value: batchStats.paused, color: "#F59E0B" },
    { name: "Đã hủy", value: batchStats.terminated, color: "#EF4444" },
  ];

  const devicePieData: PieSlice[] = [
    { name: "Đang bật", value: deviceStats.running, color: "#10B981" },
    { name: "Đang tắt", value: deviceStats.stopped, color: "#CBD5E1" },
  ];

  return (
    <Box sx={{ display: "flex", bgcolor: "#F8FAFC", minHeight: "100vh", width: "100%" }}>
      <OperatorSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <OperatorHeader title="Tổng quan hệ thống iRAS-RAG" />

        <Box component="main" sx={{ p: { xs: 2.5, md: 3.5 }, flexGrow: 1, width: "100%" }}>
          {loading && !tanks.length ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* ── ZONE 1: Pie Charts ── */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 2.5,
                  mb: 3,
                }}
              >
                <PieChartCard title="Tổng quan cảnh báo" data={alertPieData} total={alertStats.total} totalLabel="Tổng số cảnh báo" dayFilter={alertDays} onDayFilterChange={setAlertDays} />
                <PieChartCard title="Tổng quan vụ nuôi" data={batchPieData} total={batchStats.total} totalLabel="Tổng số vụ nuôi" dayFilter={batchDays} onDayFilterChange={setBatchDays} />
                <PieChartCard title="Tổng quan thiết bị điều khiển" data={devicePieData} total={deviceStats.total} totalLabel="Tổng số thiết bị điều khiển" />
              </Box>

              {/* ── ZONE 2 + 3: Tank Grid + Side Panel ── */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
                  gap: 2.5,
                  alignItems: "start",
                }}
              >
                {/* Tank Grid */}
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B" }}>
                      Trạng thái các bể
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      {filteredTanks.length} bể được hiển thị
                    </Typography>
                  </Stack>

                  {/* Search */}
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Tìm kiếm theo tên bể..."
                    value={tankSearch}
                    onChange={(e) => {
                      setTankSearch(e.target.value);
                      setTankPage(1);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1.5, bgcolor: "#fff", borderRadius: "10px", "& .MuiOutlinedInput-root": { borderRadius: "10px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" } }}
                  />

                  {filteredTanks.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 4, borderRadius: "14px", border: "1px dashed #CBD5E1", textAlign: "center", bgcolor: "#fff" }}>
                      <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                        {tankSearch ? "Không tìm thấy bể phù hợp" : "Chưa có bể nào được cấu hình"}
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: pagedTanks.length === 1 ? "1fr" : { xs: "1fr", sm: "repeat(2, 1fr)" },
                          gap: 2,
                        }}
                      >
                        {pagedTanks.map((tank) => {
                          const tankBatch = batches.find((b) => b.fishTankId === tank.id);
                          return <TankPulseCard key={tank.id} tankId={tank.id} tankName={tank.name} batch={tankBatch} onClick={() => navigate("/operator/sensors")} />;
                        })}
                      </Box>

                      {totalTankPages > 1 && (
                        <Stack alignItems="center" mt={2}>
                          <Pagination count={totalTankPages} page={tankPage} onChange={(_, p) => setTankPage(p)} size="small" color="primary" />
                        </Stack>
                      )}
                    </>
                  )}
                </Box>

                {/* Side Panel */}
                <Stack spacing={2.5}>
                  <RecentAlertsList limit={5} />
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;

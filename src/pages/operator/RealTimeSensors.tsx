import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brush, CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Components
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { SensorCard } from "../../components/operator/SensorCard";

// Hooks & API
import { extractArray } from "../../api/client";
import { realtimeApi } from "../../api/realtimeApi";
import { useToast } from "../../components/common/toastContext";
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry";
import { useRealTimeTanks } from "../../hooks/useRealTimeTanks";

// Icons
import AirIcon from "@mui/icons-material/Air";
import BoltIcon from "@mui/icons-material/Bolt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScienceIcon from "@mui/icons-material/Science";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

// --- TYPES ---
type TimeFilter = "10s" | "1m" | "1h" | "1d" | "1w";

interface ChartPoint {
  time: string;
  value: number | null;
  ts?: number; // epoch ms — dùng để deduplicate live buffer cho filter 10s
}

// --- FILTER CONFIG ---
const TIME_FILTERS: { label: string; value: TimeFilter; seconds: number }[] = [
  { label: "10s", value: "10s", seconds: 10 },
  { label: "1 phút", value: "1m", seconds: 60 },
  { label: "1 giờ", value: "1h", seconds: 3600 },
  { label: "1 ngày", value: "1d", seconds: 86400 },
  { label: "1 tuần", value: "1w", seconds: 604800 },
];

// --- HELPERS ---
const formatCountdown = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}:${m.toString().padStart(2, "0")}`;
};

const getSensorIcon = (name: string) => {
  const lower = name?.toLowerCase() || "";
  if (lower.includes("nhiệt độ")) return ThermostatIcon;
  if (lower.includes("ph")) return ScienceIcon;
  if (lower.includes("oxy") || lower.includes("do")) return AirIcon;
  if (lower.includes("ammonia") || lower.includes("nh3")) return WaterDropIcon;
  return ScienceIcon;
};

const getSensorColor = (sensorTypeName: string) => {
  const lower = sensorTypeName?.toLowerCase() || "";
  if (lower.includes("nhiệt độ") || lower.includes("temp")) return "#3B82F6";
  if (lower.includes("ph")) return "#8B5CF6";
  if (lower.includes("oxy") || lower.includes("do")) return "#10B981";
  return "#64748B";
};

const getDefaultThreshold = (sensorTypeName: string) => {
  const lower = sensorTypeName?.toLowerCase() || "";
  if (lower.includes("nhiệt độ") || lower.includes("temp")) return { min: 26, max: 30 };
  if (lower.includes("ph")) return { min: 6.5, max: 8.5 };
  if (lower.includes("oxy") || lower.includes("do")) return { min: 4, max: 8 };
  return { min: 0, max: 100 };
};

// --- CUSTOM DOT ---
interface CustomDotProps {
  cx?: number;
  cy?: number;
  value?: number;
  safeMin: number;
  safeMax: number;
  defaultColor: string;
}

const renderCustomDot = (props: CustomDotProps) => {
  const { cx, cy, value, safeMin, safeMax, defaultColor } = props;
  if (cx == null || cy == null || value == null) return null;
  const isOut = value < safeMin || value > safeMax;
  return <circle cx={cx} cy={cy} r={isOut ? 7 : 5} fill={isOut ? "#EF4444" : defaultColor} stroke={isOut ? "#FEE2E2" : "#ffffff"} strokeWidth={isOut ? 4 : 2} />;
};

// --- MAIN COMPONENT ---
const RealTimeSensors = () => {
  const theme = useTheme();
  const toast = useToast();

  const { tanks, selectedTank, setSelectedTank, latestData, devices, loading, refetch } = useRealTimeTanks();
  const liveSeries = useLiveTelemetry(selectedTank?.id ?? null);

  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1h");
  const [countdown, setCountdown] = useState(3600);
  const [sensorChartData, setSensorChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [deviceToToggle, setDeviceToToggle] = useState<(typeof devices)[number] | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Buffer tích lũy dữ liệu live (10s filter) — không bị giới hạn WINDOW_MS của hook
  const [accumulatedLive, setAccumulatedLive] = useState<ChartPoint[]>([]);
  const lastAccumulatedTsRef = useRef<number>(0);

  // Only use selected sensor if it's still in current tank's data
  const currentSensorId = latestData.some((s) => s.sensorId === selectedSensorId) ? selectedSensorId : null;

  const activeSensor = latestData.find((s) => s.sensorId === currentSensorId);

  // Thresholds: prefer values from API (populated from active batch config), fallback to defaults
  const thresholds = useMemo(() => {
    if (!activeSensor) return { min: 0, max: 100 };
    if (activeSensor.minThreshold != null && activeSensor.maxThreshold != null) {
      return { min: activeSensor.minThreshold, max: activeSensor.maxThreshold };
    }
    return getDefaultThreshold(activeSensor.sensorTypeName);
  }, [activeSensor]);

  // --- Fetch history-based chart data ---
  const fetchChartData = useCallback(async () => {
    if (!currentSensorId || timeFilter === "10s") return;
    setChartLoading(true);
    try {
      const now = dayjs();
      let fromDate: string;
      let intervalMin: number;
      let timeFormat: string;

      switch (timeFilter) {
        case "1m":
          // 1 giá trị/phút — lấy lịch sử 2h gần nhất → tối đa 120 điểm (scroll)
          fromDate = now.subtract(2, "hour").toISOString();
          intervalMin = 1;
          timeFormat = "HH:mm";
          break;
        case "1h":
          // 1 giá trị/giờ — lấy lịch sử 48h gần nhất → tối đa 48 điểm (scroll)
          fromDate = now.subtract(48, "hour").toISOString();
          intervalMin = 60;
          timeFormat = "DD/MM HH:mm";
          break;
        case "1d":
          // 1 giá trị/2h — lấy 24h → đúng 12 điểm (không scroll)
          fromDate = now.subtract(24, "hour").toISOString();
          intervalMin = 120;
          timeFormat = "HH:mm";
          break;
        case "1w":
          // 1 giá trị/ngày — lấy 7 ngày → đúng 7 điểm (không scroll)
          fromDate = now.subtract(7, "day").toISOString();
          intervalMin = 1440;
          timeFormat = "DD/MM";
          break;
        default:
          return;
      }

      const res = await realtimeApi.getSensorHistory(currentSensorId, fromDate, now.toISOString(), intervalMin);

      type RawLog = {
        recordedAt?: string;
        createdAt?: string;
        created_at?: string;
        timestamp?: string;
        value?: number;
        averageValue?: number;
        data?: number;
      };

      const raw = extractArray(res) as RawLog[];
      const points: ChartPoint[] = raw
        .map((d) => {
          const ts = d.recordedAt || d.createdAt || d.created_at || d.timestamp;
          const val = d.value ?? d.averageValue ?? d.data ?? null;
          return {
            time: ts ? dayjs(ts).format(timeFormat) : "",
            value: val !== null ? Number(Number(val).toFixed(2)) : null,
          };
        })
        .filter((d) => d.time);

      setSensorChartData(points);
    } catch (err) {
      console.error("Error fetching sensor chart data:", err);
    } finally {
      setChartLoading(false);
    }
  }, [currentSensorId, timeFilter]);

  // Tích lũy live data vào buffer (không bị cắt bởi WINDOW_MS)
  useEffect(() => {
    if (!currentSensorId) return;
    const rawPoints = liveSeries.get(currentSensorId) ?? [];
    if (rawPoints.length === 0) return;
    const newPoints = rawPoints.filter((p) => p.ts > lastAccumulatedTsRef.current).map((p) => ({ time: p.time, value: p.value, ts: p.ts }));
    if (newPoints.length > 0) {
      lastAccumulatedTsRef.current = newPoints[newPoints.length - 1].ts;
      setAccumulatedLive((prev) => [...prev, ...newPoints]);
    }
  }, [liveSeries, currentSensorId]);

  // Reset buffer khi đổi sensor
  useEffect(() => {
    setAccumulatedLive([]);
    lastAccumulatedTsRef.current = 0;
  }, [currentSensorId]);

  // displayChartData: 10s dùng live buffer, còn lại dùng history
  const displayChartData: ChartPoint[] = timeFilter === "10s" ? accumulatedLive : sensorChartData;

  // Fetch when sensor or filter changes
  useEffect(() => {
    setSensorChartData([]);
    if (currentSensorId && timeFilter !== "10s") {
      fetchChartData();
    }
  }, [currentSensorId, timeFilter, fetchChartData]);

  // Countdown timer — resets and re-fetches on expiry
  useEffect(() => {
    const total = TIME_FILTERS.find((f) => f.value === timeFilter)?.seconds ?? 3600;
    setCountdown(total);

    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timeFilter !== "10s" && currentSensorId) {
            fetchChartData();
          }
          return total;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timeFilter, currentSensorId, fetchChartData]);

  const handleFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    setSensorChartData([]);
  };

  const handleConfirmToggle = async () => {
    if (!deviceToToggle) return;
    setIsToggling(true);
    try {
      await realtimeApi.toggleDevice(deviceToToggle.id, !deviceToToggle.state);
      refetch(true);
      toast.success(deviceToToggle.state ? "Đã tắt thiết bị" : "Đã bật thiết bị");
    } catch (err) {
      console.error(err);
      toast.error("Không thể chuyển trạng thái thiết bị");
    } finally {
      setIsToggling(false);
      setDeviceToToggle(null);
    }
  };

  const chartColor = activeSensor ? getSensorColor(activeSensor.sensorTypeName) : "#64748B";

  // Daily min/max from API — phải khai báo TRƯỚC yDomain để tránh TDZ error
  const dailyMin: number | null = activeSensor?.latestData?.latestMin ?? activeSensor?.minValue ?? null;
  const dailyMax: number | null = activeSensor?.latestData?.latestMax ?? activeSensor?.maxValue ?? null;

  const currentValue = activeSensor?.latestData?.latestAvg ?? 0;
  const isCurrentDanger = currentValue < thresholds.min || currentValue > thresholds.max;

  const yDomain = useMemo(() => {
    const values = displayChartData.map((d) => d.value).filter((v): v is number => v !== null);
    const allValues = [...values, thresholds.min, thresholds.max, ...(dailyMin != null ? [dailyMin] : []), ...(dailyMax != null ? [dailyMax] : [])];
    if (allValues.length === 0) return [0, 100];
    return [Math.floor(Math.min(...allValues) - 1), Math.ceil(Math.max(...allValues) + 1)];
  }, [displayChartData, thresholds, dailyMin, dailyMax]);

  // Ticks trục Y: đảm bảo luôn hiển thị 2 mốc ngưỡng an toàn
  const yAxisTicks = useMemo(() => {
    const raw = [yDomain[0], thresholds.min, thresholds.max, yDomain[1]];
    return Array.from(new Set(raw.map((v) => Number(Number(v).toFixed(1))))).sort((a, b) => a - b);
  }, [yDomain, thresholds]);

  return (
    <Box sx={{ display: "flex", bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <OperatorSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <OperatorHeader />

        <Box sx={{ display: "flex", flexGrow: 1, p: 3, gap: 4 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* TITLE */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h1" sx={{ fontSize: "2rem", fontWeight: 600, color: theme.palette.text.primary }}>
                Giám sát cảm biến thời gian thực
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                Theo dõi chi tiết thông số cảm biến và trạng thái thiết bị của từng bể
              </Typography>
            </Box>

            {/* TANK SELECTION */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
              CHỌN BỂ NUÔI
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
              {tanks.map((tank) => (
                <Paper
                  key={tank.id}
                  onClick={() => {
                    setSelectedTank(tank);
                    setSelectedSensorId(null);
                  }}
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    borderRadius: "16px",
                    position: "relative",
                    width: "calc((100% - 48px) / 4)",
                    minWidth: "160px",
                    border: selectedTank?.id === tank.id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                    bgcolor: selectedTank?.id === tank.id ? theme.palette.primary.light + "20" : theme.palette.background.paper,
                  }}
                >
                  <Box
                    className={tank.hasOpenAlert ? "pulse-red" : "pulse-green"}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: tank.hasOpenAlert ? theme.palette.error.main : theme.palette.success.main,
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {tank.name}
                  </Typography>
                </Paper>
              ))}
              {tanks.length === 0 && <Typography variant="body2">Đang tải danh sách bể...</Typography>}
            </Box>

            {/* SENSOR CARDS */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5, color: theme.palette.text.primary }}>
              Chỉ số hiện tại {selectedTank ? `- ${selectedTank.name}` : ""}
            </Typography>
            {loading ? (
              <CircularProgress sx={{ mb: 4 }} />
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 5 }}>
                {latestData.map((sensor) => (
                  <Box
                    key={sensor.sensorId}
                    sx={{
                      width: "calc((100% - 72px) / 4)",
                      minWidth: "200px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <SensorCard
                      label={sensor.sensorTypeName}
                      value={sensor.latestData?.latestAvg?.toFixed(2) ?? "--"}
                      unit={sensor.unitOfMeasure}
                      status={sensor.latestData?.isWarning ? "Cảnh báo" : "An toàn"}
                      statusColor={sensor.latestData?.isWarning ? "error" : "success"}
                      icon={getSensorIcon(sensor.sensorTypeName)}
                      isSelected={currentSensorId === sensor.sensorId}
                      onClick={() => setSelectedSensorId(sensor.sensorId)}
                    />
                  </Box>
                ))}
                {latestData.length === 0 && (
                  <Typography variant="body2" sx={{ width: "100%" }}>
                    Bể này chưa có dữ liệu cảm biến.
                  </Typography>
                )}
              </Box>
            )}

            {/* CHART — shown when a sensor card is clicked */}
            {activeSensor && (
              <Paper variant="outlined" sx={{ p: 3, mb: 5, borderRadius: "16px", borderColor: theme.palette.divider }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Biểu đồ: {activeSensor.sensorTypeName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Ngưỡng an toàn: {thresholds.min} – {thresholds.max} {activeSensor.unitOfMeasure}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      icon={<RefreshIcon sx={{ fontSize: 14 }} />}
                      label={formatCountdown(countdown)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: theme.palette.text.secondary,
                      }}
                    />
                    {TIME_FILTERS.map((f) => (
                      <Button
                        key={f.value}
                        size="small"
                        variant={timeFilter === f.value ? "contained" : "outlined"}
                        onClick={() => handleFilterChange(f.value)}
                        sx={{
                          minWidth: 0,
                          px: 1.5,
                          py: 0.5,
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          borderRadius: "8px",
                          boxShadow: "none",
                        }}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>

                {/* Chart area — tăng chiều cao để có chỗ cho Brush */}
                <Box sx={{ height: 340, width: "100%", mb: 3 }}>
                  {chartLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress size={32} />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={displayChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={8} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          domain={yDomain}
                          ticks={yAxisTicks}
                          tick={(props: { x?: string | number; y?: string | number; payload?: { value?: number | string } }) => {
                            const { x, y, payload } = props;
                            const tickValue = payload?.value ?? 0;
                            const isThresholdTick = Math.abs(Number(tickValue) - thresholds.min) < 0.05 || Math.abs(Number(tickValue) - thresholds.max) < 0.05;
                            return (
                              <text
                                x={x}
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize={isThresholdTick ? 12 : 11}
                                fontWeight={isThresholdTick ? 700 : 400}
                                fill={isThresholdTick ? "#10B981" : "#6B7280"}
                              >
                                {tickValue}
                              </text>
                            );
                          }}
                          label={{
                            value: activeSensor.unitOfMeasure,
                            position: "top",
                            offset: 10,
                            fill: "#9CA3AF",
                            fontSize: 12,
                            fontWeight: 600,
                            style: { textAnchor: "middle" },
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(val: number | undefined) => [`${val ?? ""} ${activeSensor.unitOfMeasure}`, activeSensor.sensorTypeName]}
                        />
                        <ReferenceArea y1={thresholds.min} y2={thresholds.max} fill="#10B981" fillOpacity={0.08} stroke="#10B981" strokeOpacity={0.3} strokeDasharray="3 3" />
                        <Line
                          name={activeSensor.sensorTypeName}
                          type="monotone"
                          dataKey="value"
                          stroke={chartColor}
                          strokeWidth={2}
                          connectNulls
                          dot={(props: unknown) =>
                            renderCustomDot({
                              ...(props as CustomDotProps),
                              safeMin: thresholds.min,
                              safeMax: thresholds.max,
                              defaultColor: chartColor,
                            })
                          }
                          activeDot={{ r: 8 }}
                        />
                        {/* Brush scroll — chỉ cho 10s/1m/1h (data tích lũy), không cần cho 1d/1w */}
                        {(timeFilter === "10s" || timeFilter === "1m" || timeFilter === "1h") && displayChartData.length > 12 && (
                          <Brush
                            dataKey="time"
                            height={24}
                            startIndex={Math.max(0, displayChartData.length - 12)}
                            endIndex={displayChartData.length - 1}
                            stroke="#10B981"
                            fill="#F0FDF4"
                            travellerWidth={8}
                            gap={1}
                            tickFormatter={() => ""}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                {displayChartData.length === 0 && !chartLoading && (
                  <Typography variant="body2" sx={{ textAlign: "center", color: theme.palette.text.secondary, mb: 2 }}>
                    Chưa có dữ liệu trong khoảng thời gian này.
                  </Typography>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Stats row: Ngưỡng an toàn | Ghi nhận hiện tại | Thấp nhất hôm nay | Cao nhất hôm nay */}
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                  {/* 1 — Ngưỡng an toàn */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                      Ngưỡng an toàn
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {thresholds.min} – {thresholds.max}
                      <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary" }}>
                        {activeSensor.unitOfMeasure}
                      </Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                      Mức tối ưu
                    </Typography>
                  </Box>

                  {/* 2 — Ghi nhận hiện tại */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                      Ghi nhận hiện tại
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: isCurrentDanger ? theme.palette.error.main : theme.palette.success.main,
                      }}
                    >
                      {currentValue.toFixed(2)}
                      <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}>
                        {activeSensor.unitOfMeasure}
                      </Typography>
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: isCurrentDanger ? theme.palette.error.main : theme.palette.success.main,
                      }}
                    >
                      {isCurrentDanger ? "Vượt ngưỡng" : "Bình thường"}
                    </Typography>
                  </Box>

                  {/* 3 — Chỉ số thấp nhất hôm nay (chỉ hiện nếu có dữ liệu) */}
                  {dailyMin != null && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                        Thấp nhất hôm nay
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.info.main }}>
                        {dailyMin.toFixed(2)}
                        <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}>
                          {activeSensor.unitOfMeasure}
                        </Typography>
                      </Typography>
                    </Box>
                  )}

                  {/* 4 — Chỉ số cao nhất hôm nay (chỉ hiện nếu có dữ liệu) */}
                  {dailyMax != null && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                        Cao nhất hôm nay
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.warning.main }}>
                        {dailyMax.toFixed(2)}
                        <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}>
                          {activeSensor.unitOfMeasure}
                        </Typography>
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}

            {/* CONTROL DEVICES */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
              Trạng thái thiết bị điều khiển
            </Typography>
            <Box
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "16px",
                p: 3,
                bgcolor: "white",
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {devices.map((device) => (
                    <Paper
                      key={device.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: "12px",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: device.state ? theme.palette.success.light : theme.palette.action.hover,
                            color: device.state ? theme.palette.success.main : theme.palette.text.secondary,
                          }}
                        >
                          {device.state ? <BoltIcon /> : <PowerOffIcon />}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {device.controlDeviceTypeName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: device.state ? theme.palette.success.main : "text.secondary",
                            }}
                          >
                            {device.state ? "Đang hoạt động" : "Đã tắt"}
                          </Typography>
                        </Box>
                      </Box>
                      <Button size="small" variant={device.state ? "outlined" : "contained"} color={device.state ? "error" : "primary"} onClick={() => setDeviceToToggle(device)}>
                        {device.state ? "Tắt" : "Bật"}
                      </Button>
                    </Paper>
                  ))}
                  {devices.length === 0 && <Typography variant="body2">Không tìm thấy thiết bị điều khiển nào cho bể này.</Typography>}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* DEVICE TOGGLE DIALOG */}
      <Dialog
        open={Boolean(deviceToToggle)}
        onClose={() => {
          if (!isToggling) setDeviceToToggle(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.text.primary, pb: 1 }}>{deviceToToggle?.state ? "Xác nhận TẮT thiết bị" : "Xác nhận BẬT thiết bị"}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Thiết bị{" "}
            <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {deviceToToggle?.controlDeviceTypeName}
            </Box>
            {selectedTank ? ` tại ${selectedTank.name}` : ""} hiện đang{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: deviceToToggle?.state ? theme.palette.success.main : theme.palette.text.secondary,
              }}
            >
              {deviceToToggle?.state ? "BẬT" : "TẮT"}
            </Box>
            . Sau khi xác nhận, thiết bị sẽ chuyển sang trạng thái{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: deviceToToggle?.state ? theme.palette.error.main : theme.palette.success.main,
              }}
            >
              {deviceToToggle?.state ? "TẮT" : "BẬT"}
            </Box>
            .
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              bgcolor: "#FFF7ED",
              border: "1px solid #FFEDD5",
              borderRadius: "12px",
              p: 2,
            }}
          >
            <ErrorOutlineIcon sx={{ color: "#EA580C", fontSize: 22, mt: "2px" }} />
            <Typography variant="body2" sx={{ color: "#9A3412", lineHeight: 1.6 }}>
              Đây là thiết bị đang vận hành trực tiếp trong môi trường bể nuôi. Bật/tắt sai thời điểm có thể làm thay đổi đột ngột điều kiện nước (oxy, nhiệt độ, dòng chảy...) và gây nguy hiểm cho vật
              nuôi. Vui lòng kiểm tra kỹ tình trạng bể và các chỉ số cảm biến trước khi xác nhận.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeviceToToggle(null)} disabled={isToggling} sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: "none" }}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmToggle}
            variant="contained"
            color={deviceToToggle?.state ? "error" : "primary"}
            disabled={isToggling}
            sx={{ borderRadius: "8px", fontWeight: 600, boxShadow: "none", textTransform: "none" }}
          >
            {isToggling ? "Đang xử lý..." : deviceToToggle?.state ? "Xác nhận tắt" : "Xác nhận bật"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealTimeSensors;

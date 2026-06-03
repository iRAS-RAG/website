import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, Typography, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
import { getMasterBoardsByTank } from "../../api/masterboards";
import { simulationApi } from "../../api/simulationApi";
import { useToast } from "../../components/common/toastContext";
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry";
import { useRealTimeTanks } from "../../hooks/useRealTimeTanks";

// Icons
import AirIcon from "@mui/icons-material/Air";
import BoltIcon from "@mui/icons-material/Bolt";
import DangerousIcon from "@mui/icons-material/Dangerous";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScienceIcon from "@mui/icons-material/Science";
import SensorOccupiedIcon from "@mui/icons-material/SensorOccupied";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

// --- TYPES ---
type TimeFilter = "10s" | "1m" | "1h" | "1d" | "1w";

interface ChartPoint {
  time: string;
  value: number | null;
  ts?: number;
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
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("10s");
  const [tankSlide, setTankSlide] = useState(0);
  const [sensorSlide, setSensorSlide] = useState(0);
  const ITEMS_PER_SLIDE = 4;
  const [countdown, setCountdown] = useState(10);
  const [sensorChartData, setSensorChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [deviceToToggle, setDeviceToToggle] = useState<(typeof devices)[number] | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const [accumulatedLive, setAccumulatedLive] = useState<ChartPoint[]>([]);
  const lastAccumulatedTsRef = useRef<number>(0);

  // ── Simulation (disconnect + fake dangerous data) ──
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatingMac, setSimulatingMac] = useState<string | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [masterBoardMac, setMasterBoardMac] = useState<string | null>(null);

  // Fetch masterboard MAC for the selected tank
  useEffect(() => {
    if (!selectedTank) {
      setMasterBoardMac(null);
      setIsSimulating(false);
      setSimulatingMac(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const boards = await getMasterBoardsByTank(selectedTank.id);
        const mac = boards.find((b: { macAddress?: string }) => b.macAddress)?.macAddress ?? null;
        if (!cancelled) setMasterBoardMac(mac);
        if (!cancelled && mac) {
          // Check simulation status
          try {
            const status = await simulationApi.getSimulationStatus(mac);
            if (!cancelled) {
              setIsSimulating(status.isSimulating);
              if (status.isSimulating) setSimulatingMac(mac);
            }
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [selectedTank]);

  const handleSimulationToggle = async () => {
    if (!masterBoardMac) return;
    setSimulationLoading(true);
    try {
      if (isSimulating) {
        await simulationApi.stopSimulation(masterBoardMac);
        setIsSimulating(false);
        setSimulatingMac(null);
        toast.success("Đã dừng mô phỏng. Dữ liệu thực sẽ được xử lý lại.");
      } else {
        await simulationApi.startSimulation(masterBoardMac);
        setIsSimulating(true);
        setSimulatingMac(masterBoardMac);
        toast.warning("Đã kích hoạt mô phỏng dữ liệu nguy hiểm! Nhiệt độ đang được thay bằng giá trị ngẫu nhiên 50-60°C. Biểu đồ vẫn cập nhật bình thường.");
      }
      // Refetch latest data to refresh UI
      refetch(true);
    } catch (err) {
      console.error(err);
      toast.error("Không thể chuyển đổi chế độ mô phỏng");
    } finally {
      setSimulationLoading(false);
    }
  };

  const currentSensorId = latestData.some((s) => s.sensorId === selectedSensorId) ? selectedSensorId : null;
  const activeSensor = latestData.find((s) => s.sensorId === currentSensorId);

  // Auto-select first sensor when latestData changes (e.g. tank switch)
  useEffect(() => {
    if (latestData.length === 0) return;
    setSelectedSensorId((prev) => {
      const stillValid = latestData.some((s) => s.sensorId === prev);
      return stillValid ? prev : latestData[0].sensorId;
    });
  }, [latestData]);

  const thresholds = useMemo(() => {
    if (!activeSensor) return { min: 0, max: 100 };
    if (activeSensor.minThreshold != null && activeSensor.maxThreshold != null) {
      return { min: activeSensor.minThreshold, max: activeSensor.maxThreshold };
    }
    return getDefaultThreshold(activeSensor.sensorTypeName);
  }, [activeSensor]);

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
          fromDate = now.subtract(2, "hour").toISOString();
          intervalMin = 1;
          timeFormat = "HH:mm";
          break;
        case "1h":
          fromDate = now.subtract(48, "hour").toISOString();
          intervalMin = 60;
          timeFormat = "DD/MM HH:mm";
          break;
        case "1d":
          fromDate = now.subtract(24, "hour").toISOString();
          intervalMin = 120;
          timeFormat = "HH:mm";
          break;
        case "1w":
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

  useEffect(() => {
    setAccumulatedLive([]);
    lastAccumulatedTsRef.current = 0;
  }, [currentSensorId]);

  const displayChartData: ChartPoint[] = timeFilter === "10s" ? accumulatedLive : sensorChartData;

  useEffect(() => {
    setSensorChartData([]);
    if (currentSensorId && timeFilter !== "10s") {
      fetchChartData();
    }
  }, [currentSensorId, timeFilter, fetchChartData]);

  useEffect(() => {
    const total = TIME_FILTERS.find((f) => f.value === timeFilter)?.seconds ?? 3600;
    setCountdown(total);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timeFilter !== "10s" && currentSensorId) fetchChartData();
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

  const yAxisTicks = useMemo(() => {
    const raw = [yDomain[0], thresholds.min, thresholds.max, yDomain[1]];
    return Array.from(new Set(raw.map((v) => Number(Number(v).toFixed(1))))).sort((a, b) => a - b);
  }, [yDomain, thresholds]);

  return (
    <Box sx={{ display: "flex", bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <OperatorSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <OperatorHeader />

        <Box sx={{ p: 3, flexGrow: 1 }}>
          {/* ── Title ── */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h1" sx={{ fontSize: "2rem", fontWeight: 600, color: theme.palette.text.primary }}>
              Giám sát cảm biến thời gian thực
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Theo dõi chi tiết thông số cảm biến và trạng thái thiết bị của từng bể
            </Typography>
          </Box>

          {/* ── Tank selector — slider ── */}
          {(() => {
            const totalTankPages = Math.ceil(tanks.length / ITEMS_PER_SLIDE);
            const visibleTanks = tanks.slice(tankSlide * ITEMS_PER_SLIDE, (tankSlide + 1) * ITEMS_PER_SLIDE);
            return (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 1, mb: 1, display: "block" }}>
                  Chọn bể nuôi
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {totalTankPages > 1 && (
                    <IconButton size="small" onClick={() => setTankSlide((p) => Math.max(0, p - 1))} disabled={tankSlide === 0}
                      sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "8px", width: 32, height: 32 }}>
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${ITEMS_PER_SLIDE}, 1fr)`, gap: 1.5, flex: 1 }}>
                    {visibleTanks.map((tank) => (
                      <Paper
                        key={tank.id}
                        onClick={() => setSelectedTank(tank)}
                        sx={{
                          p: 2, cursor: "pointer", borderRadius: "16px", position: "relative",
                          minHeight: 140, display: "flex", flexDirection: "column", justifyContent: "flex-end",
                          border: selectedTank?.id === tank.id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                          bgcolor: selectedTank?.id === tank.id ? theme.palette.primary.light + "20" : theme.palette.background.paper,
                          transition: "all 0.15s",
                          "&:hover": { borderColor: theme.palette.primary.light },
                        }}
                      >
                        <Box sx={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: "50%",
                          bgcolor: tank.hasOpenAlert ? theme.palette.error.main : theme.palette.success.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {tank.name}
                        </Typography>
                      </Paper>
                    ))}
                    {/* Fill empty slots to keep grid stable */}
                    {Array.from({ length: ITEMS_PER_SLIDE - visibleTanks.length }).map((_, i) => (
                      <Box key={`empty-tank-${i}`} />
                    ))}
                  </Box>
                  {totalTankPages > 1 && (
                    <IconButton size="small" onClick={() => setTankSlide((p) => Math.min(totalTankPages - 1, p + 1))} disabled={tankSlide >= totalTankPages - 1}
                      sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "8px", width: 32, height: 32 }}>
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                {tanks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Đang tải danh sách bể...
                  </Typography>
                )}
              </Box>
            );
          })()}

          {/* ── Simulation (disconnect) button ── */}
          {selectedTank && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: "16px",
                borderColor: isSimulating ? theme.palette.error.main : theme.palette.divider,
                bgcolor: isSimulating ? "#FEF2F2" : theme.palette.background.paper,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {isSimulating ? (
                    <DangerousIcon sx={{ color: theme.palette.error.main, fontSize: 28 }} />
                  ) : (
                    <SensorOccupiedIcon sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
                  )}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isSimulating ? theme.palette.error.main : theme.palette.text.primary }}>
                      {isSimulating ? "ĐANG MÔ PHỎNG DỮ LIỆU NGUY HIỂM" : "Công cụ mô phỏng"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {isSimulating
                        ? `Nhiệt độ đang được thay bằng giá trị ngẫu nhiên 50-60°C (nguy hiểm). Biểu đồ vẫn cập nhật bình thường. MAC: ${simulatingMac}`
                        : masterBoardMac
                          ? `Bấm "Mô phỏng dữ liệu nguy hiểm" để thay nhiệt độ thực bằng giá trị ngẫu nhiên 50-60°C. Biểu đồ vẫn chạy bình thường.`
                          : "Bể này chưa có MasterBoard với địa chỉ MAC để mô phỏng."}
                    </Typography>
                  </Box>
                </Box>
                {masterBoardMac && (
                  <Button
                    variant={isSimulating ? "outlined" : "contained"}
                    color={isSimulating ? "error" : "warning"}
                    onClick={handleSimulationToggle}
                    disabled={simulationLoading}
                    startIcon={isSimulating ? undefined : <DangerousIcon />}
                    sx={{ borderRadius: "8px", fontWeight: 700, textTransform: "none", boxShadow: "none", whiteSpace: "nowrap" }}
                  >
                    {simulationLoading
                      ? "Đang xử lý..."
                      : isSimulating
                        ? "Kết nối lại (dừng mô phỏng)"
                        : "Mô phỏng mất kết nối"}
                  </Button>
                )}
              </Stack>
            </Paper>
          )}

          {/* ── Sensor cards — slider ── */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            Chỉ số hiện tại{selectedTank ? ` — ${selectedTank.name}` : ""}
          </Typography>
          {loading ? (
            <CircularProgress sx={{ mb: 4 }} />
          ) : (() => {
            const totalSensorPages = Math.ceil(latestData.length / ITEMS_PER_SLIDE);
            const visibleSensors = latestData.slice(sensorSlide * ITEMS_PER_SLIDE, (sensorSlide + 1) * ITEMS_PER_SLIDE);
            return (
              <Stack direction="row" alignItems="stretch" spacing={1} sx={{ mb: 3 }}>
                {totalSensorPages > 1 && (
                  <IconButton size="small" onClick={() => setSensorSlide((p) => Math.max(0, p - 1))} disabled={sensorSlide === 0}
                    sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "8px", width: 32, alignSelf: "center" }}>
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                )}
                <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${ITEMS_PER_SLIDE}, 1fr)`, gap: 2.5, flex: 1 }}>
                  {visibleSensors.map((sensor) => (
                    <SensorCard
                      key={sensor.sensorId}
                      label={sensor.sensorTypeName}
                      value={sensor.latestData?.latestAvg?.toFixed(2) ?? "--"}
                      unit={sensor.unitOfMeasure}
                      status={sensor.latestData?.isWarning ? "Cảnh báo" : "An toàn"}
                      statusColor={sensor.latestData?.isWarning ? "error" : "success"}
                      icon={getSensorIcon(sensor.sensorTypeName)}
                      isSelected={currentSensorId === sensor.sensorId}
                      onClick={() => setSelectedSensorId(sensor.sensorId)}
                    />
                  ))}
                  {Array.from({ length: ITEMS_PER_SLIDE - visibleSensors.length }).map((_, i) => (
                    <Box key={`empty-sensor-${i}`} />
                  ))}
                </Box>
                {totalSensorPages > 1 && (
                  <IconButton size="small" onClick={() => setSensorSlide((p) => Math.min(totalSensorPages - 1, p + 1))} disabled={sensorSlide >= totalSensorPages - 1}
                    sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "8px", width: 32, alignSelf: "center" }}>
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                )}
                {latestData.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedTank ? "Bể này chưa có dữ liệu cảm biến." : "Chọn một bể để xem chỉ số."}
                  </Typography>
                )}
              </Stack>
            );
          })()}

          {/* ── Chart — full width bên dưới ── */}
          {activeSensor && (
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: "16px", borderColor: theme.palette.divider, mb: 3 }}
            >
                {/* Chart header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Biểu đồ: {activeSensor.sensorTypeName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      icon={<RefreshIcon sx={{ fontSize: 14 }} />}
                      label={formatCountdown(countdown)}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.75rem", color: theme.palette.text.secondary }}
                    />
                    {TIME_FILTERS.map((f) => (
                      <Button
                        key={f.value}
                        size="small"
                        variant={timeFilter === f.value ? "contained" : "outlined"}
                        onClick={() => handleFilterChange(f.value)}
                        sx={{ minWidth: 0, px: 1.5, py: 0.4, textTransform: "none", fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px", boxShadow: "none" }}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>

                {/* Chart area */}
                <Box sx={{ height: 320, width: "100%", mb: 2 }}>
                  {chartLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <CircularProgress size={32} />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={displayChartData} margin={{ top: 32, right: 24, left: 0, bottom: 8 }}>
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
                              <text x={x} y={y} textAnchor="end" dominantBaseline="middle" fontSize={isThresholdTick ? 12 : 11} fontWeight={isThresholdTick ? 700 : 400} fill={isThresholdTick ? "#10B981" : "#6B7280"}>
                                {tickValue}
                              </text>
                            );
                          }}
                          label={{ value: activeSensor.unitOfMeasure, position: "top", offset: 8, fill: "#9CA3AF", fontSize: 12, fontWeight: 600, style: { textAnchor: "middle" } }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
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
                            renderCustomDot({ ...(props as CustomDotProps), safeMin: thresholds.min, safeMax: thresholds.max, defaultColor: chartColor })
                          }
                          activeDot={{ r: 8 }}
                        />
                        {(timeFilter === "10s" || timeFilter === "1m" || timeFilter === "1h") && displayChartData.length > 12 && (
                          <Brush dataKey="time" height={22} startIndex={Math.max(0, displayChartData.length - 12)} endIndex={displayChartData.length - 1} stroke="#10B981" fill="#F0FDF4" travellerWidth={8} gap={1} tickFormatter={() => ""} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                {displayChartData.length === 0 && !chartLoading && (
                  <Typography variant="body2" sx={{ textAlign: "center", color: theme.palette.text.secondary, mb: 1.5 }}>
                    Chưa có dữ liệu trong khoảng thời gian này.
                  </Typography>
                )}

                <Divider sx={{ mb: 1.5 }} />

                {/* Stats row */}
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Ngưỡng an toàn</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {thresholds.min} – {thresholds.max}
                      <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary" }}>{activeSensor.unitOfMeasure}</Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>Mức tối ưu</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Ghi nhận hiện tại</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: isCurrentDanger ? theme.palette.error.main : theme.palette.success.main }}>
                      {currentValue.toFixed(2)}
                      <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}>{activeSensor.unitOfMeasure}</Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: isCurrentDanger ? theme.palette.error.main : theme.palette.success.main }}>
                      {isCurrentDanger ? "Vượt ngưỡng" : "Bình thường"}
                    </Typography>
                  </Box>
                  {dailyMin != null && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Thấp nhất hôm nay</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.info.main }}>
                        {dailyMin.toFixed(2)}
                        <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}>{activeSensor.unitOfMeasure}</Typography>
                      </Typography>
                    </Box>
                  )}
                  {dailyMax != null && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Cao nhất hôm nay</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.warning.main }}>
                        {dailyMax.toFixed(2)}
                        <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary", fontWeight: 500 }}>{activeSensor.unitOfMeasure}</Typography>
                      </Typography>
                    </Box>
                  )}
                </Box>
            </Paper>
          )}

          {/* ── Device section ── */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quản lý thiết bị chuyên dụng
          </Typography>
          <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "16px", p: 3, bgcolor: "white" }}>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {devices.map((device) => (
                  <Paper
                    key={device.id}
                    variant="outlined"
                    sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "12px" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 40, height: 40, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                          bgcolor: device.state ? theme.palette.success.light : theme.palette.action.hover,
                          color: device.state ? theme.palette.success.main : theme.palette.text.secondary,
                        }}
                      >
                        {device.state ? <BoltIcon /> : <PowerOffIcon />}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{device.controlDeviceTypeName}</Typography>
                        <Typography variant="caption" sx={{ color: device.state ? theme.palette.success.main : "text.secondary" }}>
                          {device.state ? "Đang hoạt động" : "Đã tắt"}
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" variant={device.state ? "outlined" : "contained"} color={device.state ? "error" : "primary"} onClick={() => setDeviceToToggle(device)}>
                      {device.state ? "Tắt" : "Bật"}
                    </Button>
                  </Paper>
                ))}
                {devices.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Không tìm thấy thiết bị điều khiển nào cho bể này.</Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Device toggle dialog ── */}
      <Dialog open={Boolean(deviceToToggle)} onClose={() => { if (!isToggling) setDeviceToToggle(null); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{deviceToToggle?.state ? "Xác nhận TẮT thiết bị" : "Xác nhận BẬT thiết bị"}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Thiết bị{" "}
            <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{deviceToToggle?.controlDeviceTypeName}</Box>
            {selectedTank ? ` tại ${selectedTank.name}` : ""} hiện đang{" "}
            <Box component="span" sx={{ fontWeight: 700, color: deviceToToggle?.state ? theme.palette.success.main : theme.palette.text.secondary }}>
              {deviceToToggle?.state ? "BẬT" : "TẮT"}
            </Box>
            . Sau khi xác nhận, thiết bị sẽ chuyển sang trạng thái{" "}
            <Box component="span" sx={{ fontWeight: 700, color: deviceToToggle?.state ? theme.palette.error.main : theme.palette.success.main }}>
              {deviceToToggle?.state ? "TẮT" : "BẬT"}
            </Box>
            .
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, bgcolor: "#FFF7ED", border: "1px solid #FFEDD5", borderRadius: "12px", p: 2 }}>
            <ErrorOutlineIcon sx={{ color: "#EA580C", fontSize: 22, mt: "2px" }} />
            <Typography variant="body2" sx={{ color: "#9A3412", lineHeight: 1.6 }}>
              Đây là thiết bị đang vận hành trực tiếp trong môi trường bể nuôi. Bật/tắt sai thời điểm có thể làm thay đổi đột ngột điều kiện nước (oxy, nhiệt độ, dòng chảy...) và gây nguy hiểm cho vật nuôi. Vui lòng kiểm tra kỹ tình trạng bể và các chỉ số cảm biến trước khi xác nhận.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeviceToToggle(null)} disabled={isToggling} sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: "none" }}>Hủy</Button>
          <Button onClick={handleConfirmToggle} variant="contained" color={deviceToToggle?.state ? "error" : "primary"} disabled={isToggling} sx={{ borderRadius: "8px", fontWeight: 600, boxShadow: "none", textTransform: "none" }}>
            {isToggling ? "Đang xử lý..." : deviceToToggle?.state ? "Xác nhận tắt" : "Xác nhận bật"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealTimeSensors;

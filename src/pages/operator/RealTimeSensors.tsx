import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
} from "recharts";

// Components
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { SensorCard } from "../../components/operator/SensorCard";
import { LiveSensorChart } from "../../components/operator/LiveSensorChart";

// Hooks & API
import { useRealTimeTanks } from "../../hooks/useRealTimeTanks";
import { useLiveTelemetry } from "../../hooks/useLiveTelemetry";
import { realtimeApi } from "../../api/realtimeApi";
import { useToast } from "../../components/common/toastContext";

// Icons
import AirIcon from "@mui/icons-material/Air";
import BoltIcon from "@mui/icons-material/Bolt";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import ScienceIcon from "@mui/icons-material/Science";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// --- RECHARTS CUSTOM DOT ---
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
  return (
    <circle
      cx={cx}
      cy={cy}
      // Tăng bán kính (r) lên 7 và 5 (cũ là 5 và 3)
      r={isOut ? 7 : 5}
      fill={isOut ? "#EF4444" : defaultColor}
      stroke={isOut ? "#FEE2E2" : "#ffffff"} // Thêm viền trắng cho chấm an toàn để dễ nhìn
      // Tăng độ dày viền
      strokeWidth={isOut ? 4 : 2}
    />
  );
};

// --- MAIN COMPONENT ---
const RealTimeSensors = () => {
  const theme = useTheme();
  const toast = useToast();

  const {
    tanks,
    selectedTank,
    setSelectedTank,
    latestData,
    devices,
    chartData,
    loading,
    refetch,
  } = useRealTimeTanks();

  const liveSeries = useLiveTelemetry(selectedTank?.id ?? null);

  // State quản lý Sensor đang được chọn (Master-Detail)
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);

  // State xác nhận bật/tắt thiết bị điều khiển
  const [deviceToToggle, setDeviceToToggle] = useState<
    (typeof devices)[number] | null
  >(null);
  const [isToggling, setIsToggling] = useState(false);

  const currentSensorId = latestData.some(
    (s) => s.sensorId === selectedSensorId,
  )
    ? selectedSensorId
    : latestData.length > 0
      ? latestData[0].sensorId
      : null;

  // // Tự động chọn cảm biến đầu tiên khi load xong dữ liệu hoặc khi đổi bể
  // useEffect(() => {
  //   if (
  //     latestData.length > 0 &&
  //     !latestData.some((s) => s.sensorId === selectedSensorId)
  //   ) {
  //     setSelectedSensorId(latestData[0].sensorId);
  //   }
  // }, [latestData, selectedSensorId]);

  const handleConfirmToggle = async () => {
    if (!deviceToToggle) return;
    setIsToggling(true);
    try {
      await realtimeApi.toggleDevice(deviceToToggle.id, !deviceToToggle.state);
      refetch(true);
      toast.success(
        deviceToToggle.state ? "Đã tắt thiết bị" : "Đã bật thiết bị",
      );
    } catch (err) {
      console.error(err);
      toast.error("Không thể chuyển trạng thái thiết bị");
    } finally {
      setIsToggling(false);
      setDeviceToToggle(null);
    }
  };

  const getSensorIcon = (name: string) => {
    const lower = name?.toLowerCase() || "";
    if (lower.includes("nhiệt độ")) return ThermostatIcon;
    if (lower.includes("ph")) return ScienceIcon;
    if (lower.includes("oxy") || lower.includes("do")) return AirIcon;
    if (lower.includes("ammonia") || lower.includes("nh3"))
      return WaterDropIcon;
    return ScienceIcon;
  };

  // Helper: Xác định Key dữ liệu, Màu sắc và Ngưỡng an toàn dựa vào loại cảm biến
  const getChartConfig = (sensorTypeName: string) => {
    const lower = sensorTypeName?.toLowerCase() || "";
    if (lower.includes("nhiệt độ") || lower.includes("temp")) {
      return { key: "temp", color: "#3B82F6", min: 24, max: 28 };
    }
    if (lower.includes("ph")) {
      return { key: "ph", color: "#8B5CF6", min: 6.5, max: 8.5 };
    }
    if (lower.includes("oxy") || lower.includes("do")) {
      return { key: "do", color: "#10B981", min: 4, max: 8 };
    }
    return { key: "temp", color: "#64748B", min: 0, max: 100 };
  };

  const activeSensor = latestData.find((s) => s.sensorId === currentSensorId);
  const chartConfig = activeSensor
    ? getChartConfig(activeSensor.sensorTypeName)
    : null;

  // Tính toán số liệu thống kê 24h
  let min24h = 0;
  let max24h = 0;
  let currentValue = 0;
  let isCurrentDanger = false;

  // Thêm 3 biến này để cấu hình trục Y
  let yDomainMin = 0;
  let yDomainMax = 100;
  let yAxisTicks: number[] = [];

  if (chartConfig && activeSensor) {
    const currentChartData = chartData as Array<
      Record<string, number | string | null>
    >;
    const values = currentChartData
      .map((d) => d[chartConfig.key])
      .filter((v): v is number => typeof v === "number" && v !== null);

    min24h = values.length > 0 ? Math.min(...values) : 0;
    max24h = values.length > 0 ? Math.max(...values) : 0;
    currentValue = activeSensor.latestData?.latestAvg || 0;
    isCurrentDanger =
      currentValue < chartConfig.min || currentValue > chartConfig.max;

    // --- XÁC ĐỊNH DOMAIN VÀ CÁC MỐC TRỤC Y ---
    // Mở rộng lề trên và dưới 1 đơn vị để biểu đồ thoáng hơn
    yDomainMin = Math.floor(Math.min(min24h, chartConfig.min) - 1);
    yDomainMax = Math.ceil(Math.max(max24h, chartConfig.max) + 1);

    // Ép buộc trục Y phải hiển thị Điểm Min, Max của ngưỡng an toàn
    const rawTicks = [
      yDomainMin,
      chartConfig.min, // Ngưỡng an toàn Min (vd: 24)
      (chartConfig.min + chartConfig.max) / 2, // Điểm chính giữa
      chartConfig.max, // Ngưỡng an toàn Max (vd: 28)
      yDomainMax,
    ];

    // Lọc các giá trị trùng lặp và sắp xếp tăng dần
    yAxisTicks = Array.from(
      new Set(rawTicks.map((t) => Number(t.toFixed(1)))),
    ).sort((a, b) => a - b);
  }

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <OperatorSidebar />
      <Box
        sx={{
          flexGrow: 1,
          ml: "240px", // Chừa chỗ cho Sidebar theo logic UI của bạn
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <OperatorHeader />

        <Box sx={{ display: "flex", flexGrow: 1, p: 3, gap: 4 }}>
          {/* CỘT TRÁI */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* TIÊU ĐỀ */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Giám sát cảm biến thời gian thực
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
              >
                Theo dõi chi tiết thông số cảm biến và trạng thái thiết bị
                của từng bể
              </Typography>
            </Box>

            {/* CHỌN BỂ NUÔI */}
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}
            >
              CHỌN BỂ NUÔI
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mb: 4,
              }}
            >
              {tanks.map((tank) => (
                <Paper
                  key={tank.id}
                  onClick={() => {
                    setSelectedTank(tank);
                    setSelectedSensorId(null); // Reset view biểu đồ khi đổi bể
                  }}
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    borderRadius: "16px",
                    position: "relative",
                    width: "calc((100% - 48px) / 4)", // Chia 4 cột
                    minWidth: "160px",
                    border:
                      selectedTank?.id === tank.id
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.divider}`,
                    bgcolor:
                      selectedTank?.id === tank.id
                        ? theme.palette.primary.light + "20"
                        : theme.palette.background.paper,
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
                      bgcolor: tank.hasOpenAlert
                        ? theme.palette.error.main
                        : theme.palette.success.main,
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {tank.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    Mã: {tank.topicCode || "N/A"}
                  </Typography>
                </Paper>
              ))}
              {tanks.length === 0 && (
                <Typography variant="body2">
                  Đang tải danh sách bể...
                </Typography>
              )}
            </Box>

            {/* MASTER: DANH SÁCH THẺ CẢM BIẾN */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2.5,
                color: theme.palette.text.primary,
              }}
            >
              Chỉ số hiện tại {selectedTank ? `- ${selectedTank.name}` : ""}
            </Typography>
            {loading ? (
              <CircularProgress sx={{ mb: 4 }} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  mb: 5,
                }}
              >
                {latestData.map((sensor) => {
                  return (
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
                        trend="Cập nhật real-time"
                        status={
                          sensor.latestData?.isWarning ? "Cảnh báo" : "An toàn"
                        }
                        statusColor={
                          sensor.latestData?.isWarning ? "error" : "success"
                        }
                        icon={getSensorIcon(sensor.sensorTypeName)}
                        // SỬA DÒNG NÀY:
                        isSelected={currentSensorId === sensor.sensorId}
                        onClick={() => setSelectedSensorId(sensor.sensorId)}
                      />
                    </Box>
                  );
                })}
                {latestData.length === 0 && (
                  <Typography variant="body2" sx={{ width: "100%" }}>
                    Bể này chưa có dữ liệu cảm biến.
                  </Typography>
                )}
              </Box>
            )}

            {/* BIỂU ĐỒ TRỰC TIẾP 10 GIÂY */}
            {latestData.length > 0 && (
              <>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2.5, color: theme.palette.text.primary }}
                >
                  Biểu đồ trực tiếp (10 giây gần nhất)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(560px, 1fr))",
                    gap: 3,
                    mb: 5,
                  }}
                >
                  {latestData.map((sensor) => {
                    const cfg = getChartConfig(sensor.sensorTypeName);
                    return (
                      <LiveSensorChart
                        key={sensor.sensorId}
                        sensorName={sensor.sensorName}
                        sensorTypeName={sensor.sensorTypeName}
                        unitOfMeasure={sensor.unitOfMeasure}
                        points={liveSeries.get(sensor.sensorId) ?? []}
                        color={cfg.color}
                        safeMin={cfg.min}
                        safeMax={cfg.max}
                      />
                    );
                  })}
                </Box>
              </>
            )}

            {/* DETAIL: BIỂU ĐỒ & THỐNG KÊ CHI TIẾT CẢM BIẾN */}
            {activeSensor && chartConfig && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 5,
                  borderRadius: "16px",
                  borderColor: theme.palette.divider,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Biểu đồ lịch sử 24h: {activeSensor.sensorName}
                  </Typography>
                </Stack>

                {/* Vùng Biểu Đồ */}
                <Box sx={{ height: 320, width: "100%", mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData as Array<Record<string, unknown>>}
                      // 1. Tăng margin top và bottom để có chỗ hiển thị chữ đơn vị
                      margin={{ top: 25, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        dy={10}
                        // 2. Thêm Label đơn vị cho trục X (Thời gian)
                        label={{
                          value: "Giờ",
                          position: "insideBottomRight",
                          offset: -15,
                          fill: "#9CA3AF",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#6B7280",
                          fontWeight: 600,
                        }}
                        domain={[yDomainMin, yDomainMax]}
                        ticks={yAxisTicks}
                        // 3. Thêm Label đơn vị cho trục Y (Lấy động theo cảm biến)
                        label={{
                          value: activeSensor.unitOfMeasure, // Tự động hiển thị Độ C, pH, ppm...
                          position: "top", // Đặt ngay trên đỉnh của trục dọc
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
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      {/* Vùng an toàn mờ */}
                      <ReferenceArea
                        y1={chartConfig.min}
                        y2={chartConfig.max}
                        fill="#10B981"
                        fillOpacity={0.08}
                        stroke="#10B981"
                        strokeOpacity={0.3}
                        strokeDasharray="3 3"
                      />
                      <Line
                        connectNulls={true}
                        name={activeSensor.sensorTypeName}
                        type="monotone"
                        dataKey={chartConfig.key}
                        stroke={chartConfig.color}
                        strokeWidth={2}
                        dot={(props: unknown) =>
                          renderCustomDot({
                            ...(props as CustomDotProps),
                            safeMin: chartConfig.min,
                            safeMax: chartConfig.max,
                            defaultColor: chartConfig.color,
                          })
                        }
                        activeDot={{ r: 9 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Vùng Thống kê */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ngưỡng an toàn
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {chartConfig.min} - {chartConfig.max}{" "}
                      {activeSensor.unitOfMeasure}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Thấp nhất (24h)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {min24h.toFixed(2)} {activeSensor.unitOfMeasure}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cao nhất (24h)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {max24h.toFixed(2)} {activeSensor.unitOfMeasure}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" color="text.secondary">
                      Hiện tại
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: isCurrentDanger
                          ? theme.palette.error.main
                          : theme.palette.success.main,
                      }}
                    >
                      {currentValue.toFixed(2)} {activeSensor.unitOfMeasure}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* TRẠNG THÁI THIẾT BỊ ĐIỀU KHIỂN */}
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
                      {/* Trái: icon + name + trạng thái */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: device.state
                              ? theme.palette.success.light
                              : theme.palette.action.hover,
                            color: device.state
                              ? theme.palette.success.main
                              : theme.palette.text.secondary,
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
                              color: device.state
                                ? theme.palette.success.main
                                : "text.secondary",
                            }}
                          >
                            {device.state ? "Đang hoạt động" : "Đã tắt"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Phải: nút bật/tắt */}
                      <Button
                        size="small"
                        variant={device.state ? "outlined" : "contained"}
                        color={device.state ? "error" : "primary"}
                        onClick={() => setDeviceToToggle(device)}
                      >
                        {device.state ? "Tắt" : "Bật"}
                      </Button>
                    </Paper>
                  ))}
                  {devices.length === 0 && (
                    <Typography variant="body2">
                      Không tìm thấy thiết bị điều khiển nào cho bể này.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* DIALOG XÁC NHẬN BẬT/TẮT THIẾT BỊ ĐIỀU KHIỂN */}
      <Dialog
        open={Boolean(deviceToToggle)}
        onClose={() => {
          if (!isToggling) setDeviceToToggle(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, color: theme.palette.text.primary, pb: 1 }}
        >
          Xác nhận {deviceToToggle?.state ? "tắt" : "bật"} thiết bị
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Bạn sắp{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: deviceToToggle?.state
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              }}
            >
              {deviceToToggle?.state ? "TẮT" : "BẬT"}
            </Box>{" "}
            thiết bị{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
            >
              {deviceToToggle?.controlDeviceTypeName}
            </Box>
            {selectedTank ? ` tại ${selectedTank.name}` : ""}.
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
            <ErrorOutlineIcon
              sx={{ color: "#EA580C", fontSize: 22, mt: "2px" }}
            />
            <Typography
              variant="body2"
              sx={{ color: "#9A3412", lineHeight: 1.6 }}
            >
              Đây là thiết bị đang vận hành trực tiếp trong môi trường bể nuôi.
              Bật/tắt sai thời điểm có thể làm thay đổi đột ngột điều kiện nước
              (oxy, nhiệt độ, dòng chảy...) và gây nguy hiểm cho vật nuôi. Vui
              lòng kiểm tra kỹ tình trạng bể và các chỉ số cảm biến trước khi
              xác nhận.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeviceToToggle(null)}
            disabled={isToggling}
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmToggle}
            variant="contained"
            color={deviceToToggle?.state ? "error" : "primary"}
            disabled={isToggling}
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
              boxShadow: "none",
              textTransform: "none",
            }}
          >
            {isToggling
              ? "Đang xử lý..."
              : deviceToToggle?.state
                ? "Xác nhận tắt"
                : "Xác nhận bật"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealTimeSensors;

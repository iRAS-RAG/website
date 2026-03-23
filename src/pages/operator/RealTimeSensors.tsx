import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
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
} from "recharts";
import { ConfirmActionModal } from "../../components/operator/ConfirmActionModal";
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { SensorCard } from "../../components/operator/SensorCard";
import { useRealTimeTanks } from "../../hooks/useRealTimeTanks";
import { realtimeApi } from "../../api/realtimeApi";

// --- ICONS ---
import AirIcon from "@mui/icons-material/Air";
import BoltIcon from "@mui/icons-material/Bolt";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import ScienceIcon from "@mui/icons-material/Science";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const RealTimeSensors = () => {
  const theme = useTheme();

  const {
    tanks,
    selectedTank,
    setSelectedTank,
    latestData,
    devices,
    recommendations,
    chartData,
    loading,
    refetch,
  } = useRealTimeTanks();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");

  const handleOpenModal = (title: string) => {
    setSelectedAction(title);
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    setModalOpen(false);
  };

  const handleToggleDevice = async (id: string, currentState: boolean) => {
    try {
      await realtimeApi.toggleDevice(id, !currentState);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Không thể chuyển trạng thái thiết bị");
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
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <OperatorHeader />

        <Box sx={{ display: "flex", flexGrow: 1, p: 3, gap: 4 }}>
          {/* CỘT TRÁI */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                Theo dõi chi tiết từng bể và nhận hướng dẫn can thiệp từ AI
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
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 2,
                mb: 4,
              }}
            >
              {tanks.map((tank) => (
                <Paper
                  key={tank.id}
                  onClick={() => setSelectedTank(tank)}
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    borderRadius: "16px",
                    position: "relative",
                    border:
                      selectedTank?.id === tank.id
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.divider}`,
                    bgcolor:
                      selectedTank?.id === tank.id
                        ? theme.palette.primary.light
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

            {/* CHỈ SỐ CẢM BIẾN */}
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
              <CircularProgress />
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 5,
                  mb: 5,
                }}
              >
                {latestData.map((sensor, idx) => {
                  // Đã xóa phần tính toán min, max và rangeText ở đây

                  return (
                    <SensorCard
                      key={idx}
                      label={sensor.sensorName}
                      value={sensor.latestData?.latestValue?.toString() || "--"}
                      unit={sensor.unitOfMeasure}
                      trend="Cập nhật real-time"
                      status={
                        sensor.latestData?.isWarning ? "Cảnh báo" : "An toàn"
                      }
                      statusColor={
                        sensor.latestData?.isWarning ? "error" : "success"
                      }
                      icon={getSensorIcon(sensor.sensorTypeName)}
                      // Đã xóa prop optimalRange
                    />
                  );
                })}
                {latestData.length === 0 && (
                  <Typography variant="body2">
                    Bể này chưa có dữ liệu cảm biến.
                  </Typography>
                )}
              </Box>
            )}

            {/* BIỂU ĐỒ 3 CỘT */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Biểu đồ thời gian thực (24 giờ qua)
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 3,
                }}
              >
                {/* Chart 1: Nhiệt độ */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Nhiệt độ (°C)
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {/* Bóc tách chartData ép kiểu thành mảng các object cụ thể */}
                      <LineChart
                        data={
                          chartData as Array<{
                            time: string;
                            temp: number | null;
                          }>
                        }
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          domain={["auto", "auto"]}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Line
                          connectNulls={true}
                          name="Nhiệt độ"
                          type="monotone"
                          dataKey="temp"
                          stroke="#EF4444"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                {/* Chart 2: pH */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Độ pH
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          chartData as Array<{
                            time: string;
                            ph: number | null;
                          }>
                        }
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          domain={["auto", "auto"]}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Line
                          connectNulls={true}
                          name="pH"
                          type="monotone"
                          dataKey="ph"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                {/* Chart 3: DO */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Oxy hòa tan (mg/L)
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          chartData as Array<{
                            time: string;
                            do: number | null;
                          }>
                        }
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          domain={["auto", "auto"]}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Line
                          connectNulls={true}
                          name="DO"
                          type="monotone"
                          dataKey="do"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>
            </Box>

            {/* TRẠNG THÁI THIẾT BỊ */}
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
                        justifyContent: "space-between", // tách trái – phải
                        borderRadius: "12px",
                        width: "100%", // item full width
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
                            {device.name}
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
                        onClick={() =>
                          handleToggleDevice(device.id, device.state)
                        }
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

          {/* CỘT PHẢI: AI ADVISOR */}
          <Box
            sx={{
              width: 340,
              p: 3,
              bgcolor: "white",
              borderLeft: `1px solid ${theme.palette.divider}`,
              height: "100vh",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: theme.palette.text.primary,
              }}
            >
              <CloudQueueIcon fontSize="small" color="primary" /> AI Advisor -
              Khuyến nghị
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SmartToyIcon />}
              sx={{ mb: 3, borderRadius: "8px" }}
            >
              Phân tích AI ngay
            </Button>

            {loading ? (
              <CircularProgress size={23} />
            ) : (
              <Stack spacing={2}>
                {recommendations.map((rec) => (
                  <DetailedActionCard
                    key={rec.id}
                    title={rec.documentTitle || "Khuyến nghị tự động"}
                    risk={rec.suggestionText}
                    method="Tham khảo chi tiết SOP để xử lý"
                    onAction={() => handleOpenModal(rec.documentTitle)}
                  />
                ))}
                {recommendations.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    mt={5}
                  >
                    Hệ thống đang hoạt động ổn định. Không có khuyến nghị AI
                    nào.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      <ConfirmActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        actionTitle={selectedAction}
      />
    </Box>
  );
};

interface DetailedActionCardProps {
  title: string;
  risk: string;
  method: string;
  onAction: () => void;
}

const DetailedActionCard = ({
  title,
  risk,
  method,
  onAction,
}: DetailedActionCardProps) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "12px",
        borderColor: theme.palette.warning.light,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, bgcolor: "#FFFBEB" }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <ErrorOutlineIcon
            sx={{ color: theme.palette.warning.main, fontSize: 20, mt: 0.2 }}
          />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.3,
                display: "block",
                mt: 0.5,
              }}
            >
              {risk}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: "8px" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#94A3B8",
              fontSize: "0.65rem",
              textTransform: "uppercase",
            }}
          >
            GHI CHÚ HỆ THỐNG
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: theme.palette.text.primary, mt: 0.5 }}
          >
            {method}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            fullWidth
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={onAction}
            sx={{
              bgcolor: "#2563EB",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              py: "1px",
              minHeight: 30,
              whiteSpace: "nowrap", // 🟢 Fix: Không cho xuống dòng
            }}
          >
            Áp dụng
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<DescriptionOutlinedIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              py: "4px",
              minHeight: 30,
              whiteSpace: "nowrap",
            }}
          >
            Xem SOP
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RealTimeSensors;

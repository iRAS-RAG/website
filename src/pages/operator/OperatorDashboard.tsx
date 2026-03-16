import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as BarTooltip,
  XAxis,
  YAxis,
} from "recharts";

// Components & Icons
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { SensorCard } from "../../components/operator/SensorCard";
import AirIcon from "@mui/icons-material/Air";
// import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScienceIcon from "@mui/icons-material/Science";
// import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
// import WaterDropIcon from "@mui/icons-material/WaterDrop";

// Hooks & APIs
import useRealTimeTanks from "../../hooks/useRealTimeTanks";
import type { TankWithSensors } from "../../hooks/useRealTimeTanks";
import { getStatusColor, getStatusText } from "../../utils/statusMapper";
import { recommendationApi } from "../../api/recommendations";
import type { Recommendation } from "../../types/recommendation";
import { TrendLineChart } from "../../components/operator/TrendLineChart";

// Component con hiển thị từng Bể nuôi
const TankCard = ({ tank }: { tank: TankWithSensors }) => {
  const theme = useTheme();
  const statusKey = getStatusColor(tank.status);

  const getSensor = (type: string) =>
    tank.latestData.find((s) => s.sensorType === type);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: "12px",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
          {tank.name}
        </Typography>
        <Chip
          label={getStatusText(tank.status)}
          sx={{
            height: 18,
            fontSize: "9px",
            bgcolor: theme.palette[statusKey].light,
            color: theme.palette[statusKey].main,
            borderRadius: "8px",
            fontWeight: 600,
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
        {/* <LocationOnIcon
          sx={{ fontSize: 12, color: theme.palette.primary.main }}
        /> */}
        {/* <Typography
          sx={{ fontSize: "11px", color: theme.palette.text.secondary }}
        >
          ID: {tank.id.substring(0, 8)}...
        </Typography> */}
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ThermostatIcon
            sx={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
            {getSensor("Temperature")?.value ?? "--"}°C
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ScienceIcon
            sx={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
            {getSensor("pH")?.value ?? "--"} pH
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AirIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
            {getSensor("DO")?.value ?? "--"} DO
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const OperatorDashboard = () => {
  const theme = useTheme();
  const { loading, tanksData } = useRealTimeTanks();
  const [advice, setAdvice] = useState<Recommendation | null>(null);

  // Dữ liệu mẫu (Sau này kết nối API AnalyticsController/Compare)
  const mockTrendData = [
    { time: "00:00", do: 5.2, ph: 7.1 },
    { time: "04:00", do: 5.8, ph: 7.4 },
    { time: "08:00", do: 4.8, ph: 7.0 },
    { time: "12:00", do: 5.1, ph: 7.3 },
    { time: "16:00", do: 6.0, ph: 7.2 },
    { time: "20:00", do: 5.5, ph: 7.1 },
  ];

  const mockCompareData = [
    { name: "Nhiệt độ", beA: 28.5, beB: 30.2, toiUu: 28.0 },
    { name: "Độ pH", beA: 7.2, beB: 6.5, toiUu: 7.5 },
    { name: "DO", beA: 5.4, beB: 4.2, toiUu: 6.0 },
  ];

  // Tính toán trạng thái hệ thống dựa trên ngưỡng tối ưu
  const getSystemStatus = (type: string, avg: string) => {
    const value = parseFloat(avg);
    if (isNaN(value)) return { status: "Ngoại tuyến", color: "error" as const };

    switch (type) {
      case "Temperature":
        return value >= 26 && value <= 29
          ? { status: "Hệ thống", color: "success" as const, trend: "Ổn định" }
          : {
              status: "Cảnh báo",
              color: "warning" as const,
              trend: "Biến động",
            };
      case "pH":
        return value >= 7.0 && value <= 7.5
          ? { status: "Hệ thống", color: "success" as const, trend: "Ổn định" }
          : {
              status: "Cảnh báo",
              color: "warning" as const,
              trend: "Cần điều chỉnh",
            };
      case "DO":
        return value >= 5.0
          ? {
              status: "Hệ thống",
              color: "success" as const,
              trend: "Đạt chuẩn",
            }
          : {
              status: "Cảnh báo",
              color: "warning" as const,
              trend: "Giảm thấp",
            };
      default:
        return {
          status: "Hệ thống",
          color: "success" as const,
          trend: "Ổn định",
        };
    }
  };
  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const res = await recommendationApi.getAll({ page: 1, pageSize: 1 });
        if (res.data && res.data.length > 0) setAdvice(res.data[0]);
      } catch (err) {
        console.error("Lỗi khi lấy khuyến nghị AI:", err);
      }
    };
    fetchAdvice();
  }, []);
  const getAvg = (type: string): string => {
    // Thêm định nghĩa kiểu trả về là string
    if (!tanksData || tanksData.length === 0) return "--";

    const vals = tanksData
      .flatMap((t) => t.latestData || []) // Bảo vệ nếu latestData bị undefined
      .filter((s) => s.sensorType === type);

    return vals.length > 0
      ? (vals.reduce((a, b) => a + b.value, 0) / vals.length).toFixed(1)
      : "--";
  };

  if (loading && tanksData.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "#F8FAFC", minHeight: "100vh" }}>
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

        <Box component="main" sx={{ p: 4 }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#1E293B" }}>
              Bảng điều khiển
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
            >
              Dữ liệu thực tế từ hệ thống giám sát iRAS-RAG
            </Typography>
          </Box>

          {/* 1. Chỉ số cảm biến hệ thống */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                type: "Temperature",
                label: "Nhiệt độ TB",
                unit: "°C",
                range: "26-29°C",
                icon: ThermostatIcon,
              },
              {
                type: "pH",
                label: "Độ pH TB",
                unit: "pH",
                range: "7.0-7.5",
                icon: ScienceIcon,
              },
              {
                type: "DO",
                label: "Oxy hòa tan",
                unit: "mg/L",
                range: "> 5.0 mg/L",
                icon: AirIcon,
              },
            ].map((sensor) => {
              const avgValue = getAvg(sensor.type) ?? "--"; // Sử dụng Nullish coalescing để bảo vệ
              const systemStatus = getSystemStatus(sensor.type, avgValue);

              // Đảm bảo các giá trị không bị undefined trước khi truyền vào component
              const statusLabel = systemStatus?.status ?? "Ngoại tuyến";
              const statusColor = systemStatus?.color ?? "error";
              const trendText = systemStatus?.trend ?? "Đang kiểm tra";

              return (
                <Box key={sensor.type} sx={{ flex: "1 1 200px" }}>
                  <SensorCard
                    label={sensor.label}
                    value={avgValue}
                    unit={sensor.unit}
                    status={statusLabel}
                    statusColor={statusColor}
                    icon={sensor.icon}
                    trend={trendText}
                    optimalRange={sensor.range}
                  />
                </Box>
              );
            })}
          </Box>
          {/* 3. Danh sách bể nuôi */}
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
            Danh sách bể nuôi ({tanksData.length})
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              mb: 6,
            }}
          >
            {tanksData.map((tank) => (
              <Box key={tank.id} sx={{ flex: "1 1 320px" }}>
                <TankCard tank={tank} />
              </Box>
            ))}
          </Box>

          {/* 2. Biểu đồ xu hướng */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ flex: "1 1 400px" }}>
              <TrendLineChart
                title="Xu hướng Oxy hòa tan (DO) - 24h"
                data={mockTrendData}
                dataKey="do"
                color="#10B981"
              />
            </Box>

            <Box sx={{ flex: "1 1 400px" }}>
              <TrendLineChart
                title="Xu hướng độ pH - 24h"
                data={mockTrendData}
                dataKey="ph"
                color="#3B82F6"
              />
            </Box>
          </Box>

          {/* 4. So sánh & AI Advisory */}
          <Paper variant="outlined" sx={{ p: 4, borderRadius: "16px", mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>
              So sánh chỉ số giữa các bể
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCompareData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <BarTooltip cursor={{ fill: "transparent" }} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar
                    dataKey="beA"
                    name="Bể A"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="beB"
                    name="Bể B"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="toiUu"
                    name="Tối ưu"
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ p: 2, borderRadius: "8px", bgcolor: "#F9FAFB", mt: 3 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>
                  Trợ lý iRAS Advisory:{" "}
                </Box>
                {advice
                  ? advice.content
                  : "Đang phân tích dữ liệu từ bể nuôi để đưa ra khuyến nghị..."}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;

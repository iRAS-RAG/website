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
import ScienceIcon from "@mui/icons-material/Science";
import ThermostatIcon from "@mui/icons-material/Thermostat";

// APIs & Types
import { getStatusColor, getStatusText } from "../../utils/statusMapper";
import { recommendationApi } from "../../api/recommendations";
import type { Recommendation } from "../../types/recommendation";
import { TrendLineChart } from "../../components/operator/TrendLineChart";
import { realtimeApi } from "../../api/realtimeApi";
import { extractArray } from "../../api/client";
import type { ITank, ILatestSensorData } from "../../types/realtime";

// Định nghĩa kiểu dữ liệu mở rộng cho Dashboard
export interface TankWithSensors extends ITank {
  latestData: ILatestSensorData[];
  status: "Normal" | "Warning" | "Danger";
}

// Component con hiển thị từng Bể nuôi
const TankCard = ({ tank }: { tank: TankWithSensors }) => {
  const theme = useTheme();
  const statusKey = getStatusColor(tank.status);

  // Hàm lấy giá trị cảm biến linh hoạt dựa vào tên (để không bị lỗi type)
  const getSensorValue = (type: "Temperature" | "pH" | "DO") => {
    const sensor = tank.latestData.find((s: ILatestSensorData) => {
      const lower = s.sensorTypeName?.toLowerCase() || "";
      if (type === "Temperature") return lower.includes("nhiệt độ");
      if (type === "pH") return lower.includes("ph");
      if (type === "DO") return lower.includes("oxy") || lower.includes("do");
      return false;
    });
    return sensor?.latestData?.latestValue ?? "--";
  };

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
        {/* Placeholder cho thông tin phụ */}
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ThermostatIcon
            sx={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
            {getSensorValue("Temperature")}°C
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ScienceIcon
            sx={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
            {getSensorValue("pH")} pH
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AirIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
            {getSensorValue("DO")} mg/L
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const OperatorDashboard = () => {
  const theme = useTheme();
  const [advice, setAdvice] = useState<Recommendation | null>(null);

  // State độc lập cho Dashboard
  const [loading, setLoading] = useState<boolean>(true);
  const [tanksData, setTanksData] = useState<TankWithSensors[]>([]);

  // Lấy dữ liệu Dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await realtimeApi.getTanks();
        const tanks = extractArray(res) as ITank[];

        const detailedTanks = await Promise.all(
          tanks.map(async (tank) => {
            try {
              const dataRes = await realtimeApi.getTankLatestData(tank.id);
              const dataResObj = dataRes as { data?: ILatestSensorData[] };
              const sensors = Array.isArray(dataRes)
                ? dataRes
                : dataResObj?.data || [];

              const overallStatus = sensors.some((s) => s.latestData?.isWarning)
                ? "Danger"
                : "Normal";

              return {
                ...tank,
                latestData: sensors as ILatestSensorData[],
                status: overallStatus as "Normal" | "Warning" | "Danger",
              };
            } catch (err) {
              console.error(`Lỗi tải dữ liệu bể ${tank.id}:`, err);
              return { ...tank, latestData: [], status: "Normal" as const };
            }
          }),
        );
        setTanksData(detailedTanks);
      } catch (error) {
        console.error("Lỗi đồng bộ Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // 30s update 1 lần
    return () => clearInterval(interval);
  }, []);

  // Lấy khuyến nghị AI
  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const res = await recommendationApi.getAll({ page: 1, pageSize: 1 });
        const resObj = res as { data?: Recommendation[] };
        if (resObj?.data && resObj.data.length > 0) setAdvice(resObj.data[0]);
      } catch (err) {
        console.error("Lỗi khi lấy khuyến nghị AI:", err);
      }
    };
    fetchAdvice();
  }, []);

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

  // Tính trung bình cho một loại cảm biến trên toàn bộ các bể
  const getAvg = (type: string): string => {
    if (!tanksData || tanksData.length === 0) return "--";

    const vals = tanksData
      .flatMap((t: TankWithSensors) => t.latestData || [])
      .filter((s: ILatestSensorData) => {
        const lower = s.sensorTypeName?.toLowerCase() || "";
        if (type === "Temperature") return lower.includes("nhiệt độ");
        if (type === "pH") return lower.includes("ph");
        if (type === "DO") return lower.includes("oxy") || lower.includes("do");
        return false;
      })
      .map((s: ILatestSensorData) => s.latestData?.latestValue)
      .filter((val): val is number => val !== undefined && val !== null); // Đảm bảo chỉ lấy số hợp lệ

    return vals.length > 0
      ? (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(
          1,
        )
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
          <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
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
              const avgValue = getAvg(sensor.type) ?? "--";
              const systemStatus = getSystemStatus(sensor.type, avgValue);

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

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 6 }}>
            {tanksData.map((tank) => (
              <Box key={tank.id} sx={{ flex: "1 1 320px" }}>
                <TankCard tank={tank} />
              </Box>
            ))}
          </Box>

          {/* 2. Biểu đồ xu hướng */}
          <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
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
                  ? advice.suggestionText
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

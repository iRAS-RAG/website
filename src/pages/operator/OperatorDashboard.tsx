import { Box, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { SensorCard } from "../../components/operator/SensorCard";

// import SmartToyIcon from "@mui/icons-material/SmartToy";
import AirIcon from "@mui/icons-material/Air";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScienceIcon from "@mui/icons-material/Science";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Mock Data
const trendData = [
  { time: "00:00", do: 5.2, ph: 7.1 },
  { time: "04:00", do: 5.8, ph: 7.4 },
  { time: "08:00", do: 4.8, ph: 7.0 },
  { time: "12:00", do: 5.1, ph: 7.3 },
  { time: "16:00", do: 5.9, ph: 7.2 },
  { time: "20:00", do: 5.3, ph: 7.1 },
];

const comparisonData = [
  { name: "Nhiệt độ", beA: 28.5, beB: 29.2, toiUu: 28.0 },
  { name: "Độ pH", beA: 7.2, beB: 6.8, toiUu: 7.5 },
  { name: "Oxy (DO)", beA: 5.4, beB: 4.2, toiUu: 6.0 },
];

// Tank Card component
const TankCard = ({ id, area }: { id: string; area: string }) => {
  const theme = useTheme();

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
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1rem",
            color: theme.palette.text.primary,
          }}
        >
          Bể {id}
        </Typography>

        <Chip
          label="Bình thường"
          sx={{
            height: 18,
            fontSize: "9px",
            bgcolor: theme.palette.success.light,
            color: theme.palette.success.main,
            borderRadius: "8px",
            fontWeight: 600,
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
        <LocationOnIcon sx={{ fontSize: 12, color: theme.palette.primary.main }} />
        <Typography
          sx={{
            fontSize: "11px",
            color: theme.palette.text.secondary,
            fontWeight: 500,
          }}
        >
          Khu vực: {area}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ThermostatIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>28.5°C</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ScienceIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>7.2 pH</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AirIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>5.4 DO</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const OperatorDashboard = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        width: "100%",
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

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Bảng điều khiển
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5, mb: 2 }}>
              Tổng quan chỉ số nuôi trồng thủy sản hệ thống iRAS-RAG
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                borderBottom: `2px solid ${theme.palette.primary.light}`,
                display: "inline-block",
                pb: 0.5,
                textTransform: "uppercase",
              }}
            >
              Chỉ số cảm biến
            </Typography>
          </Box>

          {/* Sensor Cards */}
          {/* Sensor Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 2,
              mb: 6,
            }}
          >
            {/* Card 1: Nhiệt độ */}
            <SensorCard
              label="Nhiệt độ"
              value="28.5"
              unit="°C"
              trend="+2.1% so với hôm qua"
              status="An toàn"
              statusColor="success"
              icon={ThermostatIcon}
              optimalRange="26-29°C" // Added purely to match the component interface, though not explicitly in the specific screenshot, it's good practice based on previous designs.
            />

            {/* Card 2: Độ pH */}
            <SensorCard label="Độ pH" value="7.2" unit="pH" trend="-0.3% so với hôm qua" status="An toàn" statusColor="success" icon={ScienceIcon} optimalRange="7.0-7.5" />

            {/* Card 3: Oxy hòa tan */}
            <SensorCard label="Oxy hòa tan" value="5.8" unit="mg/L" trend="-5.2% so với hôm qua" status="Cảnh báo" statusColor="warning" icon={AirIcon} optimalRange="> 5.0 mg/L" />

            {/* Card 4: Ammonia */}
            <SensorCard label="Ammonia" value="0.8" unit="ppm" trend="+12.5% so với hôm qua" status="Nguy hiểm" statusColor="error" icon={WaterDropIcon} optimalRange="< 0.5 ppm" />

            {/* Card 5: Tốc độ động cơ */}
            <SensorCard label="Tốc độ động cơ" value="1,450" unit="RPM" trend="+0.5% so với hôm qua" status="An toàn" statusColor="success" icon={SpeedIcon} optimalRange="1400-1500 RPM" />
          </Box>

          {/* Tank List */}
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600 }}>
            Danh sách bể nuôi
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2.5,
              mb: 6,
            }}
          >
            {["A-01", "A-02", "A-03", "A-04", "A-05", "A-06"].map((id) => (
              <TankCard key={id} id={id} area="Phân khu Ươm thủy sản" />
            ))}
          </Box>

          {/* Line Charts */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              mb: 6,
            }}
          >
            {/* DO Chart */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: "16px",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                }}
              >
                Xu hướng DO (24 giờ)
              </Typography>

              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E5E7EB" />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="do"
                      stroke="#10B981" // Xanh ngọc
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            {/* pH Chart */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: "16px",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                }}
              >
                Xu hướng pH (24 giờ)
              </Typography>

              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E5E7EB" />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ph"
                      stroke="#3B82F6" // Xanh dương
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>

          {/* Comparison Chart + AI Advisory */}
          {/* Comparison Chart + AI Advisory */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            }}
          >
            <Typography variant="body1" sx={{ mb: 4, fontWeight: 500, color: theme.palette.text.primary }}>
              So sánh chỉ số giữa các bể (Bể A vs Bể B)
            </Typography>

            {/* Bar chart */}
            <Box sx={{ height: 320, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} barCategoryGap="25%" barGap={6} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="square"
                    iconSize={10}
                    formatter={(value) => (
                      <span
                        style={{
                          color: "#6B7280",
                          fontSize: "12px",
                          fontWeight: 500,
                          marginLeft: "4px",
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />

                  <Bar
                    dataKey="beA"
                    name="Bể A"
                    fill="#3B82F6" // Xanh dương (Blue-500)
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    dataKey="beB"
                    name="Bể B"
                    fill="#10B981" // Xanh ngọc (Emerald-500) - Khớp với ảnh mẫu hơn
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    dataKey="toiUu"
                    name="Tối ưu"
                    fill="#34D399" // Xanh lá nhạt (Emerald-400)
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* AI Analysis Box - Style tối giản như ảnh mẫu */}
            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                bgcolor: "#F9FAFB", // Nền xám rất nhạt
                mt: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.85rem", lineHeight: 1.6 }}>
                <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
                  Phân tích:{" "}
                </Box>
                Bể B đang có nhiều chỉ số vượt mức tối ưu. Cần kiểm tra và điều chỉnh DO và pH ngay lập tức để đảm bảo môi trường nuôi trồng ổn định.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;

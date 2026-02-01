import { Box, Typography, Paper, Stack, Chip, useTheme } from "@mui/material";
import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";
import { SensorCard } from "../../components/technician/SensorCard";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ScienceIcon from "@mui/icons-material/Science";
import AirIcon from "@mui/icons-material/Air";
import SpeedIcon from "@mui/icons-material/Speed";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

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
        <LocationOnIcon
          sx={{ fontSize: 12, color: theme.palette.primary.main }}
        />
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
          <ThermostatIcon
            sx={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
            28.5°C
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ScienceIcon
            sx={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
          <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
            7.2 pH
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AirIcon sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>5.4 DO</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const TechnicianDashboard = () => {
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
      <TechnicianSidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <TechnicianHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Bảng điều khiển
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 0.5, mb: 2 }}
            >
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 2,
              mb: 6,
            }}
          >
            <SensorCard
              label="Nhiệt độ"
              value="28.5"
              unit="°C"
              trend="+1.2%"
              status="An toàn"
              statusColor="success"
              icon={ThermostatIcon}
            />

            <SensorCard
              label="Độ pH"
              value="7.2"
              unit="pH"
              trend="-0.5%"
              status="An toàn"
              statusColor="success"
              icon={ScienceIcon}
            />

            <SensorCard
              label="Oxy hòa tan"
              value="5.1"
              unit="mg/L"
              trend="-2.1%"
              status="Cảnh báo"
              statusColor="warning"
              icon={AirIcon}
            />

            <SensorCard
              label="Ammonia"
              value="0.01"
              unit="mg/L"
              trend="+10%"
              status="Nguy hiểm"
              statusColor="error"
              icon={WaterDropIcon}
            />

            <SensorCard
              label="Tốc độ máy"
              value="1450"
              unit="rpm"
              trend="+0.0%"
              status="An toàn"
              statusColor="success"
              icon={SpeedIcon}
            />
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
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                Xu hướng Oxy hòa tan (DO) - 24h
              </Typography>

              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                    />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="do"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: theme.palette.secondary.main }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            {/* pH Chart */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                Xu hướng nồng độ pH - 24h
              </Typography>

              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                    />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="ph"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: theme.palette.primary.main }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>

          {/* Comparison Chart + AI Advisory */}
          <Paper
            sx={{
              p: 3,
              borderRadius: "20px",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 4, fontWeight: 700 }}>
              So sánh hiệu suất và chỉ số tối ưu
            </Typography>

            {/* Bar chart */}
            <Box sx={{ height: 380, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  barGap={10}
                  barCategoryGap="20%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="beA"
                    name="Bể A"
                    fill={theme.palette.primary.main}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="beB"
                    name="Bể B"
                    fill={theme.palette.secondary.main}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="toiUu"
                    name="Mức tối ưu"
                    fill={theme.palette.success.main}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* AI Advisory */}
            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                bgcolor: theme.palette.primary.light,
                border: `1px solid ${theme.palette.primary.main}33`,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box
                  sx={{
                    p: 0.8,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: "8px",
                    display: "flex",
                  }}
                >
                  <SmartToyIcon sx={{ color: "white", fontSize: 20 }} />
                </Box>

                <Typography
                  variant="subtitle1"
                  color={theme.palette.primary.dark}
                  fontWeight={600}
                >
                  Phân tích và tư vấn từ AI iRAS-RAG
                </Typography>
              </Stack>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      textTransform: "uppercase",
                    }}
                  >
                    Tình trạng nhận diện
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.7 }}>
                    Dựa trên truy xuất dữ liệu <b>RAG</b>, bể <b>A-03</b> có
                    nồng độ Oxy giảm nhẹ…
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.error.main,
                      textTransform: "uppercase",
                    }}
                  >
                    Hành động đề xuất
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.7 }}>
                    Kích hoạt thêm <b>máy sục khí dự phòng</b> tại phân khu Ươm…
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default TechnicianDashboard;

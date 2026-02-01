import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  LinearProgress,
  Divider,
  useTheme,
} from "@mui/material";
import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";
import { SensorCard } from "../../components/technician/SensorCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from "recharts";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ScienceIcon from "@mui/icons-material/Science";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import SpeedIcon from "@mui/icons-material/Speed";
import VibrationIcon from "@mui/icons-material/Vibration";
import CompressIcon from "@mui/icons-material/Compress";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Dữ liệu mô phỏng 30 phút gần nhất
const trendData = [
  { time: "10:00", temp: 28.5, ph: 7.2, do: 5.4, nh3: 0.2 },
  { time: "10:05", temp: 28.8, ph: 7.1, do: 5.2, nh3: 0.3 },
  { time: "10:10", temp: 29.5, ph: 6.9, do: 4.8, nh3: 0.5 },
  { time: "10:15", temp: 30.1, ph: 6.7, do: 4.5, nh3: 0.7 },
  { time: "10:20", temp: 30.2, ph: 6.7, do: 4.3, nh3: 0.8 },
  { time: "10:25", temp: 30.1, ph: 6.7, do: 4.2, nh3: 0.9 },
];

const RealTimeSensors = () => {
  const theme = useTheme();
  const [selectedTank, setSelectedTank] = useState("B-02");

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
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

        <Box sx={{ display: "flex", flexGrow: 1, p: 3, gap: 4 }}>
          {/* MAIN CONTENT AREA */}
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

            {/* KHU VỰC CHỌN BỂ NUÔI */}
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}
            >
              CHỌN BỂ NUÔI
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                mb: 4,
              }}
            >
              {["A-01", "A-02", "B-01", "B-02", "C-01", "C-02"].map((id) => (
                <Paper
                  key={id}
                  onClick={() => setSelectedTank(id)}
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    borderRadius: "16px",
                    border:
                      selectedTank === id
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.divider}`,
                    bgcolor:
                      selectedTank === id
                        ? theme.palette.primary.light
                        : theme.palette.background.paper,
                    position: "relative",
                  }}
                >
                  <Box
                    className={id === "B-02" ? "pulse-red" : "pulse-green"}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor:
                        id === "B-02"
                          ? theme.palette.error.main
                          : theme.palette.success.main,
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Bể {id}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    Phân khu nuôi {id.startsWith("A") ? "Ươm 1" : "Vỗ béo"}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 5 }}>
              <Button
                variant="contained"
                startIcon={<SmartToyIcon />}
                sx={{ borderRadius: "12px", px: 3, fontWeight: 600 }}
              >
                Chạy chẩn đoán AI
              </Button>
            </Stack>

            {/* CHỈ SỐ CẢM BIẾN HIỆN TẠI */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2.5,
                color: theme.palette.text.primary,
              }}
            >
              Chỉ số hiện tại - Bể {selectedTank}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 2.5,
                mb: 5,
              }}
            >
              <SensorCard
                label="Nhiệt độ"
                value="30.1"
                unit="°C"
                trend="+1.5° trong 30p"
                status="Cảnh báo"
                statusColor="warning"
                icon={ThermostatIcon}
                optimalRange="26-29°C"
              />
              <SensorCard
                label="Độ pH"
                value="6.7"
                unit="pH"
                trend="-0.2 trong 30p"
                status="Cảnh báo"
                statusColor="warning"
                icon={ScienceIcon}
                optimalRange="7.0-7.5"
              />
              <SensorCard
                label="Oxy hòa tan"
                value="4.2"
                unit="mg/L"
                trend="-2.3 trong 30p"
                status="Nguy hiểm"
                statusColor="error"
                icon={AirIcon}
                optimalRange="> 5.5 mg/L"
              />
              <SensorCard
                label="Ammonia"
                value="0.9"
                unit="ppm"
                trend="+0.5 trong 30p"
                status="Nguy hiểm"
                statusColor="error"
                icon={WaterDropIcon}
                optimalRange="< 0.5 ppm"
              />
            </Box>

            {/* BIỂU ĐỒ THỜI GIAN THỰC */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2.5,
                color: theme.palette.text.primary,
              }}
            >
              Biểu đồ thời gian thực - Bể {selectedTank} (30 phút gần nhất)
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                mb: 5,
              }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3 }}>
                  Nhiệt độ & pH (30 phút gần nhất)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ bottom: 10 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: theme.palette.text.secondary,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: theme.palette.text.secondary,
                        }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                      <ReferenceArea
                        y1={26}
                        y2={29}
                        fill={theme.palette.success.main}
                        fillOpacity={0.06}
                      />
                      <ReferenceArea
                        y1={7.0}
                        y2={7.5}
                        fill={theme.palette.primary.main}
                        fillOpacity={0.06}
                      />
                      <Line
                        name="Nhiệt độ (°C)"
                        type="monotone"
                        dataKey="temp"
                        stroke={theme.palette.warning.main}
                        strokeWidth={3}
                        dot={{ r: 4, fill: theme.palette.warning.main }}
                        // tension={0.4}
                      />
                      <Line
                        name="pH"
                        type="monotone"
                        dataKey="ph"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={{ r: 4, fill: theme.palette.primary.main }}
                        // tension={0.4}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3 }}>
                  DO & Ammonia (30 phút gần nhất)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ bottom: 10 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: theme.palette.text.secondary,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: theme.palette.text.secondary,
                        }}
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                      <ReferenceArea
                        y1={5.5}
                        y2={8.0}
                        fill={theme.palette.secondary.main}
                        fillOpacity={0.06}
                      />
                      <Line
                        name="DO (mg/L)"
                        type="monotone"
                        dataKey="do"
                        stroke={theme.palette.secondary.main}
                        strokeWidth={3}
                        dot={{ r: 4, fill: theme.palette.secondary.main }}
                        // tension={0.4}
                      />
                      <Line
                        name="NH3 (ppm)"
                        type="monotone"
                        dataKey="nh3"
                        stroke={theme.palette.error.main}
                        strokeWidth={3}
                        dot={{ r: 4, fill: theme.palette.error.main }}
                        // tension={0.4}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>

            {/* TRẠNG THÁI THIẾT BỊ */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2.5,
                color: theme.palette.text.primary,
              }}
            >
              Trạng thái thiết bị
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 2,
              }}
            >
              {[
                {
                  label: "Tốc độ RPM",
                  value: "1450",
                  icon: <SpeedIcon />,
                  sub: "1500 RPM",
                  color: theme.palette.primary.main,
                },
                {
                  label: "Rung động",
                  value: "2.3",
                  icon: <VibrationIcon />,
                  sub: "Ổn định",
                  color: theme.palette.success.main,
                },
                {
                  label: "Áp suất",
                  value: "2.4 bar",
                  icon: <CompressIcon />,
                  sub: "bar",
                  color: theme.palette.warning.main,
                },
                {
                  label: "Công suất",
                  value: "85%",
                  icon: <BoltIcon />,
                  sub: "Tải ưu tiên",
                  color: theme.palette.primary.main,
                },
                {
                  label: "Trạng thái",
                  value: "OK",
                  icon: <CheckCircleIcon />,
                  sub: "Đang chạy",
                  color: theme.palette.success.main,
                },
              ].map((item, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "10px",
                        bgcolor: theme.palette.background.default,
                        color: item.color,
                        display: "flex",
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 700,
                          display: "block",
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* AI ADVISOR */}
          <Box sx={{ width: 340 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "20px",
                border: `1px solid ${theme.palette.error.light}`,
                background: `linear-gradient(180deg, ${theme.palette.error.light} 0%, ${theme.palette.background.paper} 100%)`,
                position: "sticky",
                top: 94,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  className="pulse-red"
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: theme.palette.error.main,
                    borderRadius: "50%",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.error.main }}
                >
                  RỦI RO CAO
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={85}
                sx={{
                  height: 8,
                  borderRadius: 6,
                  mb: 1.5,
                  bgcolor: theme.palette.background.paper,
                  "& .MuiLinearProgress-bar": {
                    background: `linear-gradient(90deg, ${theme.palette.error.main} 0%, #B42318 100%)`,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
              >
                Nghiêm trọng: DO thấp (4.2), NH3 cao (0.9)
              </Typography>
              <Divider sx={{ my: 3 }} />
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
                <SmartToyIcon color="primary" /> GỢI Ý CAN THIỆP TỪ AI
              </Typography>
              <Stack spacing={2.5}>
                <ActionCard
                  title="Xử lý khẩn cấp DO thấp"
                  desc="Tăng công suất sục khí lên 100% tại Bể B-02."
                  type="error"
                />
                <ActionCard
                  title="Xử lý Ammonia cao"
                  desc="Thay nước 30% và bổ sung vi sinh Bacillus."
                  type="warning"
                />
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// COMPONENT ACTION CARD ĐÃ GIẢM CHIỀU CAO BUTTON
const ActionCard = ({
  title,
  desc,
  type,
}: {
  title: string;
  desc: string;
  type: "error" | "warning";
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: theme.palette[type].light,
        border: `1px solid ${theme.palette[type].main}33`,
        borderRadius: "16px",
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "0.85rem",
          color: theme.palette.text.primary,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          display: "block",
          my: 1,
          lineHeight: 1.5,
        }}
      >
        {desc}
      </Typography>
      <Stack direction="row" spacing={1.5} mt={1.5}>
        <Button
          size="small"
          variant="contained"
          color={type === "error" ? "error" : "primary"}
          startIcon={
            <PlayCircleOutlineIcon sx={{ fontSize: "1rem !important" }} />
          }
          sx={{
            borderRadius: "8px",
            fontWeight: 600,
            flex: 1,
            py: 0.5, // Giảm chiều cao qua padding-y
            minHeight: "32px", // Cố định chiều cao tối thiểu thấp hơn
            fontSize: "0.75rem", // Giảm font size để cân đối
          }}
        >
          Thực hiện
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DescriptionIcon sx={{ fontSize: "1rem !important" }} />}
          sx={{
            borderRadius: "8px",
            fontWeight: 600,
            flex: 1,
            py: 0.5, // Giảm chiều cao qua padding-y
            minHeight: "32px", // Cố định chiều cao tối thiểu thấp hơn
            fontSize: "0.75rem", // Giảm font size để cân đối
          }}
        >
          SOP
        </Button>
      </Stack>
    </Box>
  );
};

export default RealTimeSensors;

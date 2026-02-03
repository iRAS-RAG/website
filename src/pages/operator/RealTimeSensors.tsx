import { Box, Button, IconButton, LinearProgress, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ConfirmActionModal } from "../../components/operator/ConfirmActionModal";
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { SensorCard } from "../../components/operator/SensorCard";

// --- ICONS ---
import AirIcon from "@mui/icons-material/Air";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CompressIcon from "@mui/icons-material/Compress";
import ScienceIcon from "@mui/icons-material/Science";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import VibrationIcon from "@mui/icons-material/Vibration";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
// Icons cho AI Advisor
import AdjustIcon from "@mui/icons-material/Adjust";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// --- DATA MẪU ---
const trendData = [
  { time: "10:00", temp: 28.5, ph: 7.2, do: 5.4, nh3: 0.2 },
  { time: "10:05", temp: 28.8, ph: 7.1, do: 5.2, nh3: 0.3 },
  { time: "10:10", temp: 29.5, ph: 6.9, do: 4.8, nh3: 0.5 },
  { time: "10:15", temp: 30.1, ph: 6.7, do: 4.5, nh3: 0.7 },
  { time: "10:20", temp: 30.2, ph: 6.7, do: 4.3, nh3: 0.8 },
  { time: "10:25", temp: 30.1, ph: 6.7, do: 4.2, nh3: 0.9 },
];

// --- INTERFACES ---
interface DetailedActionCardProps {
  title: string;
  risk: string;
  method: string;
  methodNote: string;
  goal: string;
  type: "error" | "warning";
  onAction: () => void;
}

const RealTimeSensors = () => {
  const theme = useTheme();
  const [selectedTank, setSelectedTank] = useState("B-02");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");

  const handleOpenModal = (title: string) => {
    setSelectedAction(title);
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    console.log("Đã kích hoạt hành động:", selectedAction);
    setModalOpen(false);
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
          {/* ================= CỘT TRÁI: DỮ LIỆU CẢM BIẾN (Flex Grow) ================= */}
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
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                Theo dõi chi tiết từng bể và nhận hướng dẫn can thiệp từ AI
              </Typography>
            </Box>

            {/* CHỌN BỂ NUÔI */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
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
                    border: selectedTank === id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                    bgcolor: selectedTank === id ? theme.palette.primary.light : theme.palette.background.paper,
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
                      bgcolor: id === "B-02" ? theme.palette.error.main : theme.palette.success.main,
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
              <Button variant="contained" startIcon={<SmartToyIcon />} sx={{ borderRadius: "12px", px: 3, fontWeight: 600 }}>
                Chạy chẩn đoán AI
              </Button>
            </Stack>

            {/* CHỈ SỐ CẢM BIẾN */}
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
              <SensorCard label="Nhiệt độ" value="28.5" unit="°C" trend="+2.1% so với hôm qua" status="An toàn" statusColor="success" icon={ThermostatIcon} optimalRange="26-29°C" />
              <SensorCard label="Độ pH" value="7.2" unit="pH" trend="-0.3% so với hôm qua" status="An toàn" statusColor="success" icon={ScienceIcon} optimalRange="7.0-7.5" />
              <SensorCard label="Oxy hòa tan" value="5.8" unit="mg/L" trend="-5.2% so với hôm qua" status="Cảnh báo" statusColor="warning" icon={AirIcon} optimalRange="> 5.0 mg/L" />
              <SensorCard label="Ammonia" value="0.8" unit="ppm" trend="+12.5% so với hôm qua" status="Nguy hiểm" statusColor="error" icon={WaterDropIcon} optimalRange="< 0.5 ppm" />
            </Box>

            {/* BIỂU ĐỒ - Chiều cao 240px */}
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.text.primary,
                }}
              >
                Biểu đồ thời gian thực (30 phút gần đây)
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 3,
                }}
              >
                {/* 1. Nhiệt độ & pH */}
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
                    Nhiệt độ & pH
                  </Typography>
                  <Box sx={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} domain={["auto", "auto"]} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          formatter={(value) => (
                            <span
                              style={{
                                color: "#6B7280",
                                fontSize: "12px",
                                fontWeight: 500,
                              }}
                            >
                              {value}
                            </span>
                          )}
                        />
                        <Line
                          name="Nhiệt độ (°C)"
                          type="monotone"
                          dataKey="temp"
                          stroke="#EF4444" // Đỏ
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#EF4444", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          name="pH"
                          type="monotone"
                          dataKey="ph"
                          stroke="#3B82F6" // Xanh dương
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                {/* 2. DO & Ammonia */}
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
                    DO & Ammonia
                  </Typography>
                  <Box sx={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          formatter={(value) => (
                            <span
                              style={{
                                color: "#6B7280",
                                fontSize: "12px",
                                fontWeight: 500,
                              }}
                            >
                              {value}
                            </span>
                          )}
                        />
                        <Line
                          name="DO (mg/L)"
                          type="monotone"
                          dataKey="do"
                          stroke="#10B981" // Xanh ngọc
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          name="NH3 (ppm)"
                          type="monotone"
                          dataKey="nh3"
                          stroke="#F59E0B" // Cam
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#F59E0B", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>
            </Box>

            {/* TRẠNG THÁI THIẾT BỊ - Bố cục ngang */}
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
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "16px",
                p: 3,
                bgcolor: "white",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 3,
                }}
              >
                {[
                  {
                    label: "Tốc độ RPM",
                    value: "1450",
                    subLabel: "Mục tiêu: 1500",
                    icon: <SpeedIcon />,
                    color: theme.palette.primary.main,
                    bgColor: theme.palette.primary.light,
                  },
                  {
                    label: "Rung động",
                    value: "2.3",
                    subLabel: "Bình thường",
                    subLabelColor: theme.palette.success.main,
                    icon: <VibrationIcon />,
                    color: theme.palette.success.main,
                    bgColor: theme.palette.success.light,
                  },
                  {
                    label: "Áp suất",
                    value: "2.4",
                    subLabel: "bar",
                    icon: <CompressIcon />,
                    color: theme.palette.warning.main,
                    bgColor: theme.palette.warning.light,
                  },
                  {
                    label: "Công suất",
                    value: "85%",
                    subLabel: "Tối ưu",
                    icon: <BoltIcon />,
                    color: theme.palette.warning.main,
                    bgColor: theme.palette.warning.light,
                  },
                  {
                    label: "Trạng thái",
                    value: "OK",
                    subLabel: "Hoạt động tốt",
                    icon: <CheckCircleIcon />,
                    color: theme.palette.success.main,
                    bgColor: theme.palette.success.light,
                  },
                ].map((item, idx) => (
                  <Stack key={idx} direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        bgcolor: item.bgColor,
                        color: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                          display: "block",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.25rem",
                          color: theme.palette.text.primary,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: item.subLabelColor || theme.palette.text.secondary,
                          fontSize: "0.7rem",
                          display: "block",
                        }}
                      >
                        {item.subLabel}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Box>
            </Box>
          </Box>

          {/* ================= CỘT PHẢI: AI ADVISOR (340px) ================= */}
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
            {/* 1. Mức độ rủi ro hiện tại */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WarningAmberIcon fontSize="small" sx={{ color: "text.secondary" }} /> Mức độ rủi ro hiện tại
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "12px",
                borderColor: theme.palette.error.light,
                bgcolor: "#FEF2F2", // Nền đỏ rất nhạt
                mb: 4,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                  Rủi ro Cao
                </Typography>
                <IconButton size="small" sx={{ color: theme.palette.error.main }}>
                  <HighlightOffIcon />
                </IconButton>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={85}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#FECACA", // Đỏ nhạt
                  "& .MuiLinearProgress-bar": {
                    bgcolor: theme.palette.error.main, // Đỏ đậm
                    borderRadius: 4,
                  },
                  mb: 1,
                }}
              />
              <Typography variant="caption" sx={{ color: theme.palette.error.main, fontSize: "0.75rem" }}>
                Nghiêm trọng - DO thấp, NH3 cao
              </Typography>
            </Paper>

            {/* 2. Gợi ý hành động từ AI */}
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
              <CloudQueueIcon fontSize="small" color="primary" /> Gợi ý hành động từ AI
            </Typography>

            <Stack spacing={2}>
              {/* Card 1: Xử lý DO */}
              <DetailedActionCard
                title="Xử lý khẩn cấp DO thấp"
                risk="Mức DO giảm xuống 4.2 mg/L - dưới ngưỡng an toàn (5.5 mg/L)"
                method="Tăng công suất sục khí lên 100%"
                methodNote="Ngay lập tức"
                goal="Mục tiêu: Đạt DO ≥ 5.5 mg/L trong 30 phút"
                type="error"
                onAction={() => handleOpenModal("Xử lý khẩn cấp DO thấp")}
              />

              {/* Card 2: Xử lý Ammonia */}
              <DetailedActionCard
                title="Xử lý Ammonia cao"
                risk="NH3 vượt ngưỡng (0.9 ppm > 0.5 ppm) - nguy cơ nhiễm độc"
                method="Thay nước 30% và thêm vi sinh Bacillus"
                methodNote="Liều lượng: 5g/m³ nước"
                goal="Mục tiêu: Giảm NH3 xuống < 0.5 ppm trong 4-6 giờ"
                type="error"
                onAction={() => handleOpenModal("Xử lý Ammonia cao")}
              />

              {/* Card 3: Điều chỉnh pH */}
              <DetailedActionCard
                title="Điều chỉnh pH"
                risk="pH giảm xuống 6.7 - dưới mức tối ưu (7.0-7.5)"
                method="Thêm vôi CaCO3"
                methodNote="Liều lượng: 500 gram/m³"
                goal="Mục tiêu: Đạt pH 7.0 - 7.5 trong 2 giờ"
                type="warning"
                onAction={() => handleOpenModal("Điều chỉnh pH")}
              />

              {/* Card 4: Giảm nhiệt độ */}
              <DetailedActionCard
                title="Giảm nhiệt độ nước"
                risk="Nhiệt độ tăng lên 30.1°C - cao hơn mức tối ưu"
                method="Tăng lưu lượng nước tuần hoàn"
                methodNote="Tăng 20% lưu lượng"
                goal="Mục tiêu: Giảm nhiệt độ xuống 28-29°C trong 1 giờ"
                type="warning"
                onAction={() => handleOpenModal("Giảm nhiệt độ nước")}
              />
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* MODAL XÁC NHẬN */}
      <ConfirmActionModal open={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmAction} actionTitle={selectedAction} />
    </Box>
  );
};

// Component thẻ hành động chi tiết
const DetailedActionCard: React.FC<DetailedActionCardProps> = ({ title, risk, method, methodNote, goal, type, onAction }) => {
  const theme = useTheme();
  const isError = type === "error";
  const lightBg = isError ? "#FEF2F2" : "#FFFBEB";

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "16px",
        borderColor: isError ? theme.palette.error.light : theme.palette.warning.light,
        overflow: "hidden",
      }}
    >
      {/* Header Card */}
      <Box sx={{ p: 2, bgcolor: lightBg }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {isError ? (
            <AdjustIcon
              sx={{
                color: theme.palette.error.main,
                fontSize: 20,
                mt: 0.2,
              }}
            />
          ) : (
            <ErrorOutlineIcon
              sx={{
                color: theme.palette.warning.main,
                fontSize: 20,
                mt: 0.2,
              }}
            />
          )}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
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

      {/* Body Card */}
      <Box sx={{ p: 2 }}>
        {/* Phương pháp - Tăng padding lên p: 2 */}
        <Box sx={{ mb: 2, p: 2, bgcolor: "#F8FAFC", borderRadius: "8px" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#94A3B8",
              fontSize: "0.65rem",
              textTransform: "uppercase",
            }}
          >
            PHƯƠNG PHÁP & LIỀU LƯỢNG
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mt: 0.5,
            }}
          >
            {method}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {methodNote}
          </Typography>
        </Box>

        {/* Mục tiêu - Tăng padding lên p: 2 */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: "#ECFDF5",
            borderRadius: "8px",
            border: "1px solid #D1FAE5",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#94A3B8",
              fontSize: "0.65rem",
              textTransform: "uppercase",
            }}
          >
            MỤC TIÊU
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#065F46",
              mt: 0.5,
              fontSize: "0.8rem",
            }}
          >
            {goal}
          </Typography>
        </Box>

        {/* Actions - Button 36px, no-wrap, padding nhỏ */}
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
              fontSize: "0.8rem",
              boxShadow: "none",
              height: 36,
              whiteSpace: "nowrap",
              px: 1,
              "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
            }}
          >
            Thực hiện
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
              fontSize: "0.8rem",
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              height: 36,
              whiteSpace: "nowrap",
              px: 1,
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

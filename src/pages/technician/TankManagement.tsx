import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  type SvgIconProps,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SetMealIcon from "@mui/icons-material/SetMeal";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ScienceIcon from "@mui/icons-material/Science";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
// Import thêm các icon cho phần thông tin hồ
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SpeedIcon from "@mui/icons-material/Speed";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";

// --- Interfaces ---
interface Tank {
  id: string;
  species: string;
  status: string;
  phase: string;
  density: number;
  days: number;
  volume: number;
  alert: "success" | "warning" | "error" | "info";
}

interface KPICardProps {
  label: string;
  value: string;
  color: string;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: "success" | "warning" | "error";
}

// Bổ sung interface cho InfoBlock để hỗ trợ icon
interface InfoBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface DeviceItemProps {
  name: string;
  status: "Online" | "Offline";
}

interface MaintenanceLogProps {
  date: string;
  tech: string;
  task: string;
}

// Danh sách các bước cho vòng đời nuôi trồng
const lifecycleSteps = [
  "Thả giống",
  "Giai đoạn 1",
  "Giai đoạn 2",
  "Vỗ béo",
  "Thu hoạch",
];

// --- Mock Data ---
const tankList: Tank[] = [
  {
    id: "A-01",
    species: "Tôm Thẻ Chân Trắng",
    status: "Đang nuôi",
    phase: "Giai đoạn 2",
    density: 85,
    days: 45,
    volume: 500,
    alert: "success",
  },
  {
    id: "A-02",
    species: "Cá Chẽm",
    status: "Đang nuôi",
    phase: "Vỗ béo",
    density: 92,
    days: 120,
    volume: 800,
    alert: "warning",
  },
  {
    id: "B-01",
    species: "Tôm Sú",
    status: "Trống",
    phase: "Chuẩn bị ao",
    density: 0,
    days: 0,
    volume: 500,
    alert: "info",
  },
];

const TankManagement = () => {
  const theme = useTheme();
  const [selectedTank, setSelectedTank] = useState<Tank>(tankList[0]);
  const [tabValue, setTabValue] = useState(0);

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

        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            p: 2,
            gap: 2,
            height: "calc(100vh - 70px)",
          }}
        >
          {/* COL 1: TANK LIST (Tỉ lệ 5) */}
          <Box
            sx={{ flex: 5, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Paper
              sx={{
                p: 2,
                borderRadius: "16px",
                boxShadow: "none",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm hồ, loài cá..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    defaultValue="active"
                    label="Trạng thái"
                  >
                    <MenuItem value="active">Đang nuôi</MenuItem>
                    <MenuItem value="empty">Trống</MenuItem>
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    defaultValue="all"
                    label="Loài cá"
                  >
                    <MenuItem value="all">Tất cả loài</MenuItem>
                    <MenuItem value="shrimp">Tôm thẻ</MenuItem>
                  </TextField>
                </Stack>
              </Stack>
            </Paper>

            <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 0.5 }}>
              <Stack spacing={1.5}>
                {tankList.map((tank: Tank) => (
                  <Paper
                    key={tank.id}
                    onClick={() => setSelectedTank(tank)}
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      cursor: "pointer",
                      border:
                        selectedTank.id === tank.id
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: theme.palette.background.paper },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.main,
                        }}
                      >
                        <SetMealIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="subtitle2" fontWeight={700}>
                            Bể {tank.id}
                          </Typography>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor:
                                tank.alert === "success"
                                  ? theme.palette.success.main
                                  : tank.alert === "warning"
                                    ? theme.palette.warning.main
                                    : tank.alert === "error"
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                            }}
                          />
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ my: 0.5 }}>
                          <Chip
                            label={tank.status}
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: "10px" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {tank.species}
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ mb: 0.5, display: "block" }}
                          >
                            Mật độ: {tank.density}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={tank.density}
                            color={tank.density > 90 ? "warning" : "primary"}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 1,
                            display: "block",
                            color: "text.secondary",
                          }}
                        >
                          Ngày tuổi: {tank.days} ngày | Thể tích: {tank.volume}
                          m³
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* COL 2: TANK DETAIL (Tỉ lệ 7) */}
          <Box sx={{ flex: 7 }}>
            <Paper
              sx={{
                height: "100%",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, v: number) => setTabValue(v)}
                >
                  <Tab
                    label="Tổng quan (Overview)"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                  <Tab
                    label="Thiết bị & Bảo trì"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  />
                </Tabs>
              </Box>

              <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
                {tabValue === 0 ? (
                  <Stack spacing={4}>
                    {/* CẬP NHẬT: THÔNG TIN HỒ CÓ ICON */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                      }}
                    >
                      <InfoBlock
                        icon={<CalendarMonthIcon fontSize="small" />}
                        label="Ngày thả giống"
                        value="12/12/2025"
                      />
                      <InfoBlock
                        icon={<SpeedIcon fontSize="small" />}
                        label="Mật độ hiện tại"
                        value={`${selectedTank.density}%`}
                      />
                      <InfoBlock
                        icon={<ViewInArIcon fontSize="small" />}
                        label="Tổng thể tích"
                        value={`${selectedTank.volume} m³`}
                      />
                    </Box>

                    <Stack direction="row" spacing={3}>
                      <KPICard
                        label="Lượng cám tiêu thụ"
                        value="1,240 kg"
                        color={theme.palette.primary.main}
                      />
                      <KPICard
                        label="Chi phí điện năng"
                        value="5,420,000đ"
                        color={theme.palette.warning.main}
                      />
                    </Stack>

                    <Typography variant="subtitle2" fontWeight={700}>
                      TÌNH TRẠNG MÔI TRƯỜNG
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 2,
                      }}
                    >
                      <MetricCard
                        icon={<ThermostatIcon />}
                        label="Nhiệt độ"
                        value="28.5°C"
                        status="success"
                      />
                      <MetricCard
                        icon={<ScienceIcon />}
                        label="pH"
                        value="7.2"
                        status="success"
                      />
                      <MetricCard
                        icon={<AirIcon />}
                        label="Oxy (DO)"
                        value="5.4 mg/L"
                        status="warning"
                      />
                      <MetricCard
                        icon={<WaterDropIcon />}
                        label="NH3"
                        value="0.85 mg/L"
                        status="error"
                      />
                    </Box>

                    {/* CẬP NHẬT: VÒNG ĐỜI NUÔI TRỒNG DẠNG NGANG (STEPPER) */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ mb: 3 }}
                      >
                        VÒNG ĐỜI NUÔI TRỒNG
                      </Typography>
                      <Stepper
                        activeStep={2}
                        alternativeLabel
                        sx={{
                          "& .MuiStepLabel-label": {
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          },
                        }}
                      >
                        {lifecycleSteps.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={4}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      THIẾT BỊ LIÊN KẾT
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <DeviceItem name="Máy bơm P102" status="Online" />
                      <DeviceItem name="Máy sục khí Oxy" status="Online" />
                      <DeviceItem name="Bộ lọc tuần hoàn" status="Offline" />
                    </Box>

                    <Typography variant="subtitle2" fontWeight={700}>
                      LỊCH SỬ BẢO TRÌ
                    </Typography>
                    <Stack spacing={1}>
                      <MaintenanceLog
                        date="20/01/2026"
                        tech="Nguyễn Văn A"
                        task="Vệ sinh màng lọc"
                      />
                      <MaintenanceLog
                        date="15/01/2026"
                        tech="Trần Văn B"
                        task="Thay dầu máy sục"
                      />
                    </Stack>
                  </Stack>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// --- Sub-components ---
// Cập nhật InfoBlock để nhận icon trực quan
const InfoBlock = ({ icon, label, value }: InfoBlockProps) => (
  <Box
    sx={{
      p: 2,
      bgcolor: "#F8FAFC",
      borderRadius: "12px",
      textAlign: "center",
      border: "1px solid #E2E8F0",
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      justifyContent="center"
      alignItems="center"
      sx={{ color: "text.secondary", mb: 0.5 }}
    >
      {React.isValidElement(icon) &&
        React.cloneElement(icon as React.ReactElement<SvgIconProps>, {
          sx: { fontSize: 16 },
        })}
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ textTransform: "uppercase" }}
      >
        {label}
      </Typography>
    </Stack>
    <Typography variant="body1" fontWeight={700}>
      {value}
    </Typography>
  </Box>
);

const KPICard = ({ label, value, color }: KPICardProps) => (
  <Paper
    sx={{
      p: 3,
      flex: 1,
      borderRadius: "16px",
      borderLeft: `6px solid ${color}`,
      bgcolor: "#F8FAFC",
    }}
  >
    <Typography variant="caption" fontWeight={700} color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
      {value}
    </Typography>
  </Paper>
);

const MetricCard = ({ icon, label, value, status }: MetricCardProps) => {
  const theme = useTheme();
  const color =
    status === "error"
      ? theme.palette.error.main
      : status === "warning"
        ? theme.palette.warning.main
        : theme.palette.success.main;
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "12px",
        border: `1px solid ${color}44`,
        bgcolor: `${color}11`,
        textAlign: "center",
      }}
    >
      <Box
        sx={{ color: color, mb: 1, display: "flex", justifyContent: "center" }}
      >
        {icon}
      </Box>
      <Typography variant="caption" display="block" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={700} color={color}>
        {value}
      </Typography>
    </Box>
  );
};

const DeviceItem = ({ name, status }: DeviceItemProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography variant="body2" fontWeight={600}>
      {name}
    </Typography>
    <Chip
      label={status}
      size="small"
      color={status === "Online" ? "success" : "default"}
    />
  </Paper>
);

const MaintenanceLog = ({ date, tech, task }: MaintenanceLogProps) => (
  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: "12px" }}>
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="caption" fontWeight={700}>
        {date}
      </Typography>
      <Typography variant="caption" color="primary.main">
        {tech}
      </Typography>
    </Stack>
    <Typography variant="body2">{task}</Typography>
  </Paper>
);

export default TankManagement;

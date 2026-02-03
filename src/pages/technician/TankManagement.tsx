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
  Button,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";

// --- ICONS ---
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import SetMealIcon from "@mui/icons-material/SetMeal";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import OpacityIcon from "@mui/icons-material/Opacity";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import BoltIcon from "@mui/icons-material/Bolt";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ScienceIcon from "@mui/icons-material/Science";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BuildIcon from "@mui/icons-material/Build";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TimelineIcon from "@mui/icons-material/Timeline";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";

// --- INTERFACES ---
interface Tank {
  id: string;
  code: string;
  species: string;
  status: "active" | "empty";
  healthStatus: "good" | "warning" | "critical";
  phase: string;
  density: number;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendColor: "success" | "error" | "warning";
}

interface EnvironmentCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  statusColor: "success" | "warning" | "error";
}

interface StepItemProps {
  title: string;
  desc: string;
  date: string;
  status: "completed" | "upcoming" | string;
  isLast?: boolean;
}

interface TankListItemProps {
  data: Tank;
  selected: boolean;
  onClick: () => void;
}

interface DeviceRowProps {
  name: string;
  code: string;
  type: string;
  status: "active" | "maintenance" | string;
  lastMaintenance: string;
  isLast?: boolean;
}

interface MaintenanceItemProps {
  title: string;
  desc: string;
  device: string;
  tech: string;
  date: string;
  type: "repair" | "check";
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}

// --- MOCK DATA ---
const tankList: Tank[] = [
  {
    id: "Bể A1",
    code: "TANK-001",
    species: "Cá Rô Phi",
    status: "active",
    healthStatus: "good",
    phase: "Giai đoạn 2/3",
    density: 85,
  },
  {
    id: "Bể A2",
    code: "TANK-002",
    species: "Tôm Thẻ Chân Trắng",
    status: "active",
    healthStatus: "warning",
    phase: "Giai đoạn 1/3",
    density: 120,
  },
  {
    id: "Bể B1",
    code: "TANK-003",
    species: "Cá Chẽm",
    status: "active",
    healthStatus: "critical",
    phase: "Giai đoạn 3/3",
    density: 65,
  },
  {
    id: "Bể B2",
    code: "TANK-004",
    species: "Bể đang trống",
    status: "empty",
    healthStatus: "good",
    phase: "---",
    density: 0,
  },
  {
    id: "Bể C1",
    code: "TANK-005",
    species: "Cá Rô Phi",
    status: "active",
    healthStatus: "good",
    phase: "Giai đoạn 2/3",
    density: 90,
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

        {/* MAIN CONTENT AREA */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // Đổi thành column để Header nằm trên
            flexGrow: 1,
            p: 3,
            gap: 3,
            height: "calc(100vh - 80px)",
          }}
        >
          {/* --- PAGE HEADER MỚI --- */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                Quản lý bể nuôi
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
              >
                Giám sát và quản lý vòng đời tài sản
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                bgcolor: theme.palette.primary.main,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: "none",
                },
              }}
            >
              Thêm bể mới
            </Button>
          </Stack>

          {/* --- CONTENT 2 COLUMNS --- */}
          <Box sx={{ display: "flex", gap: 3, flexGrow: 1, minHeight: 0 }}>
            {/* ================= COL 1: DANH SÁCH BỂ (35%) ================= */}
            <Box
              sx={{
                flex: 3.5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 320,
              }}
            >
              {/* Filter Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm bể..."
                  sx={{ mb: 1.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          fontSize="small"
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    defaultValue="all"
                    sx={{ "& .MuiSelect-select": { fontSize: "0.85rem" } }}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value="active">Đang nuôi</MenuItem>
                    <MenuItem value="warning">Cảnh báo</MenuItem>
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    defaultValue="all"
                    sx={{ "& .MuiSelect-select": { fontSize: "0.85rem" } }}
                  >
                    <MenuItem value="all">Tất cả loài</MenuItem>
                    <MenuItem value="shrimp">Tôm</MenuItem>
                    <MenuItem value="fish">Cá</MenuItem>
                  </TextField>
                </Stack>
              </Paper>

              {/* List Tanks */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: theme.palette.divider,
                    borderRadius: "4px",
                  },
                }}
              >
                <Stack spacing={2}>
                  {tankList.map((tank) => (
                    <TankListItem
                      key={tank.code}
                      data={tank}
                      selected={selectedTank.code === tank.code}
                      onClick={() => setSelectedTank(tank)}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* ================= COL 2: CHI TIẾT BỂ (65%) ================= */}
            <Box sx={{ flex: 6.5, display: "flex", flexDirection: "column" }}>
              <Paper
                elevation={0}
                sx={{
                  flexGrow: 1,
                  borderRadius: "16px",
                  border: `1px solid ${theme.palette.divider}`,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Header Details */}
                <Box
                  sx={{
                    p: 3,
                    pb: 0,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {selectedTank.id}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          textTransform: "uppercase",
                        }}
                      >
                        {selectedTank.code}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      size="small"
                      sx={{
                        textTransform: "none",
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: theme.palette.text.secondary,
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Stack>

                  <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{ mt: 2 }}
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    <Tab
                      label="Tổng quan"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      }}
                    />
                    <Tab
                      label="Thiết bị & Bảo trì"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      }}
                    />
                  </Tabs>
                </Box>

                {/* Body Content */}
                <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto" }}>
                  {tabValue === 0 ? (
                    // --- TAB 1: TỔNG QUAN ---
                    <Stack spacing={4}>
                      {/* KPI Section */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: theme.palette.text.primary,
                          }}
                        >
                          KPI Tóm tắt (Tháng này)
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <KPICard
                            icon={
                              <Inventory2OutlinedIcon
                                sx={{ color: theme.palette.primary.main }}
                              />
                            }
                            label="Lượng cám tiêu thụ"
                            value="450 kg"
                            trend="+12% so với tháng trước"
                            trendColor="success"
                          />
                          <KPICard
                            icon={
                              <BoltIcon
                                sx={{ color: theme.palette.warning.main }}
                              />
                            }
                            label="Chi phí điện"
                            value="2500.0K VND"
                            trend="+5% so với tháng trước"
                            trendColor="error"
                          />
                        </Stack>
                      </Box>

                      {/* Environment Section */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: theme.palette.text.primary,
                          }}
                        >
                          Tình trạng Môi trường (Trung bình 24h)
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 2,
                          }}
                        >
                          <EnvironmentCard
                            icon={<ThermostatIcon fontSize="small" />}
                            label="Nhiệt độ"
                            value="28.5°C"
                            statusColor="success"
                          />
                          <EnvironmentCard
                            icon={<ScienceIcon fontSize="small" />}
                            label="pH"
                            value="7.2"
                            statusColor="success"
                          />
                          <EnvironmentCard
                            icon={<AirIcon fontSize="small" />}
                            label="DO"
                            value="6.8 mg/L"
                            statusColor="success"
                          />
                          <EnvironmentCard
                            icon={<WaterDropIcon fontSize="small" />}
                            label="NH3"
                            value="0.02 mg/L"
                            statusColor="success"
                          />
                        </Box>
                      </Box>

                      {/* Lifecycle Section */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: theme.palette.text.primary,
                          }}
                        >
                          Vòng đời Bể nuôi
                        </Typography>

                        <LinearProgress
                          variant="determinate"
                          value={60}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: theme.palette.action.hover,
                            mb: 3,
                            "& .MuiLinearProgress-bar": {
                              bgcolor: theme.palette.primary.main,
                            },
                          }}
                        />

                        <Stack spacing={0}>
                          <StepItem
                            title="Giai đoạn 1: Thả giống"
                            desc="Giai đoạn cá/tôm còn nhỏ, cần chăm sóc đặc biệt"
                            date="Ngày 0-50"
                            status="completed"
                          />
                          <StepItem
                            title="Giai đoạn 2: Phát triển"
                            desc="Giai đoạn tăng trưởng nhanh, tăng cường cho ăn"
                            date="Ngày 51-100"
                            status="completed"
                          />
                          <StepItem
                            title="Giai đoạn 3: Thu hoạch"
                            desc="Cá/tôm đạt kích thước thương phẩm, chuẩn bị thu hoạch"
                            date="Ngày 101-150"
                            status="upcoming"
                          />
                          <StepItem
                            title="Thu hoạch hoàn tất"
                            desc="Kết thúc vụ nuôi, làm sạch bể và chuẩn bị cho vụ mới"
                            date="Ngày 150"
                            status="upcoming"
                            isLast
                          />
                        </Stack>

                        <Box
                          sx={{
                            mt: 3,
                            p: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            border: `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.2,
                            )}`,
                            borderRadius: "12px",
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: theme.palette.background.paper,
                              borderRadius: "8px",
                              color: theme.palette.primary.main,
                              display: "flex",
                            }}
                          >
                            <TimelineIcon />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: theme.palette.primary.main,
                              }}
                            >
                              Trạng thái hiện tại
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.primary.main,
                                fontSize: "0.85rem",
                              }}
                            >
                              Ngày 80 - Giai đoạn 2/3 - Dự kiến thu hoạch sau 70
                              ngày
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Stack>
                  ) : (
                    // --- TAB 2: THIẾT BỊ & BẢO TRÌ ---
                    <Stack spacing={4}>
                      {/* 1. Danh sách thiết bị */}
                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                            }}
                          >
                            Danh sách Thiết bị
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: "8px",
                              boxShadow: "none",
                              bgcolor: theme.palette.primary.main,
                            }}
                          >
                            Gán cảm biến
                          </Button>
                        </Stack>

                        {/* Header Row */}
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr 0.5fr",
                            p: 1.5,
                            bgcolor: theme.palette.action.hover,
                            borderRadius: "8px 8px 0 0",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          {[
                            "Thiết bị",
                            "Loại",
                            "Trạng thái",
                            "Bảo trì cuối",
                            "Hành động",
                          ].map((h) => (
                            <Typography
                              key={h}
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: theme.palette.text.secondary,
                              }}
                            >
                              {h}
                            </Typography>
                          ))}
                        </Box>

                        {/* Device List */}
                        <Stack
                          spacing={0}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "0 0 8px 8px",
                          }}
                        >
                          <DeviceRow
                            name="Máy bơm chính #1"
                            code="PUMP-001"
                            type="Water Pump"
                            status="active"
                            lastMaintenance="2026-01-15"
                          />
                          <DeviceRow
                            name="Quạt sục khí #1"
                            code="AERATOR-001"
                            type="Aerator"
                            status="active"
                            lastMaintenance="2026-01-20"
                          />
                          <DeviceRow
                            name="Bộ lọc sinh học"
                            code="FILTER-001"
                            type="Bio Filter"
                            status="maintenance"
                            lastMaintenance="2026-01-25"
                          />
                          <DeviceRow
                            name="Cảm biến DO"
                            code="SENSOR-001"
                            type="DO Sensor"
                            status="active"
                            lastMaintenance="2026-01-10"
                            isLast
                          />
                        </Stack>
                      </Box>

                      {/* 2. Lịch sử bảo trì */}
                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                            }}
                          >
                            Lịch sử Bảo trì
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: "8px",
                              color: theme.palette.text.primary,
                              borderColor: theme.palette.divider,
                            }}
                          >
                            Xem tất cả
                          </Button>
                        </Stack>

                        <Stack spacing={1.5}>
                          <MaintenanceItem
                            title="Thay thế bộ lọc sinh học"
                            desc="Bộ lọc cũ đã sử dụng 6 tháng, thay thế theo lịch định kỳ."
                            device="FILTER-001"
                            tech="Nguyễn Văn A"
                            date="25/01/2026"
                            type="repair"
                          />
                          <MaintenanceItem
                            title="Hiệu chuẩn cảm biến DO"
                            desc="Hiệu chuẩn định kỳ để đảm bảo độ chính xác của cảm biến."
                            device="SENSOR-001"
                            tech="Trần Thị B"
                            date="20/01/2026"
                            type="check"
                          />
                          <MaintenanceItem
                            title="Bảo dưỡng máy bơm"
                            desc="Kiểm tra và bôi trơn các bộ phận cơ khí của máy bơm."
                            device="PUMP-001"
                            tech="Lê Văn C"
                            date="15/01/2026"
                            type="check"
                          />
                        </Stack>
                      </Box>

                      {/* 3. Thống kê Thiết bị */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 2,
                          }}
                        >
                          Thống kê Thiết bị
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 2,
                          }}
                        >
                          <StatCard
                            icon={
                              <CheckCircleOutlineIcon
                                sx={{ color: theme.palette.success.main }}
                              />
                            }
                            label="Hoạt động"
                            value="3/4"
                            bg={alpha(theme.palette.success.main, 0.05)}
                          />
                          <StatCard
                            icon={
                              <BuildIcon
                                sx={{
                                  color: theme.palette.warning.main,
                                  fontSize: 20,
                                }}
                              />
                            }
                            label="Bảo trì"
                            value="1/4"
                            bg={alpha(theme.palette.warning.main, 0.05)}
                          />
                          <StatCard
                            icon={
                              <CalendarTodayIcon
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontSize: 20,
                                }}
                              />
                            }
                            label="Bảo trì gần nhất"
                            value="25/01/2026"
                            bg={alpha(theme.palette.primary.main, 0.05)}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  )}
                </Box>

                {/* Footer Actions */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<VisibilityIcon />}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      textTransform: "none",
                      fontWeight: 600,
                      height: 44,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                        boxShadow: "none",
                      },
                    }}
                  >
                    Giám sát Real-time
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<BuildIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      height: 44,
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider,
                      "&:hover": {
                        borderColor: theme.palette.text.secondary,
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    Tạo nhật ký bảo trì
                  </Button>
                </Paper>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// --- SUB COMPONENTS ---

// 1. Tank List Item (Cột trái)
const TankListItem = ({ data, selected, onClick }: TankListItemProps) => {
  const theme = useTheme();

  // Icon trạng thái
  let statusIcon = (
    <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
  );
  if (data.healthStatus === "warning") {
    statusIcon = (
      <WarningIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
    );
  } else if (data.healthStatus === "critical") {
    statusIcon = (
      <ErrorIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
    );
  }

  // Style cho trạng thái Active/Empty
  const isActive = data.status === "active";
  const statusLabel = isActive ? "Đang nuôi" : "Trống";
  const statusChipBg = isActive
    ? theme.palette.success.light
    : theme.palette.action.selected;
  const statusChipText = isActive
    ? theme.palette.success.main
    : theme.palette.text.secondary;

  const borderColor = selected
    ? theme.palette.primary.main
    : theme.palette.divider;
  const bgColor = selected
    ? alpha(theme.palette.primary.main, 0.08)
    : theme.palette.background.paper;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: "12px",
        border: `1px solid ${borderColor}`,
        bgcolor: bgColor,
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" mb={1}>
        <Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: theme.palette.text.primary,
              }}
            >
              {data.id}
            </Typography>
            {isActive && statusIcon}
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            {data.code}
          </Typography>
        </Box>
        <Chip
          label={statusLabel}
          size="small"
          sx={{
            bgcolor: statusChipBg,
            color: statusChipText,
            fontWeight: 600,
            fontSize: "0.65rem",
            height: 20,
            borderRadius: "6px",
          }}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SetMealIcon
            sx={{ fontSize: 14, color: theme.palette.text.secondary }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary }}
          >
            {data.species}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TrendingUpIcon
            sx={{ fontSize: 14, color: theme.palette.text.secondary }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary }}
          >
            {data.phase}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <OpacityIcon
            sx={{ fontSize: 14, color: theme.palette.text.secondary }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary }}
          >
            Mật độ: {data.density}%
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

// 2. KPI Card (Cột phải)
const KPICard = ({ icon, label, value, trend, trendColor }: KPICardProps) => {
  const theme = useTheme();
  const trendTextColor =
    trendColor === "success"
      ? theme.palette.success.main
      : theme.palette.error.main;

  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        p: 2,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon}
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: theme.palette.text.primary }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: trendTextColor, fontWeight: 500 }}
      >
        {trend}
      </Typography>
    </Paper>
  );
};

// 3. Environment Card (Cột phải)
const EnvironmentCard = ({
  icon,
  label,
  value,
  statusColor,
}: EnvironmentCardProps) => {
  const theme = useTheme();
  const color = theme.palette[statusColor].main;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: 100,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ color: theme.palette.text.secondary }}
      >
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>

      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}
        >
          {value}
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: 4,
            bgcolor: theme.palette.divider,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: "70%",
              height: "100%",
              bgcolor: color,
              borderRadius: 2,
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

// 4. Vertical Step Item
const StepItem = ({ title, desc, date, status, isLast }: StepItemProps) => {
  const theme = useTheme();
  const isCompleted = status === "completed";
  const circleColor = isCompleted
    ? theme.palette.success.main
    : theme.palette.divider;
  const titleColor = isCompleted
    ? theme.palette.text.primary
    : theme.palette.text.secondary;

  return (
    <Box sx={{ display: "flex", minHeight: 60 }}>
      {/* Left Timeline */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mr: 2,
          width: 24,
        }}
      >
        {isCompleted ? (
          <CheckCircleIcon sx={{ color: circleColor, fontSize: 24 }} />
        ) : (
          <RadioButtonUncheckedIcon sx={{ color: circleColor, fontSize: 24 }} />
        )}
        {!isLast && (
          <Box
            sx={{
              width: 2,
              flexGrow: 1,
              bgcolor: isCompleted
                ? theme.palette.success.main
                : theme.palette.divider,
              my: 0.5,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, pb: isLast ? 0 : 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: titleColor }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: "block",
                mt: 0.5,
                maxWidth: 300,
              }}
            >
              {desc}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
          >
            {date}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

// --- NEW COMPONENTS FOR DEVICE TAB (Typed) ---

const DeviceRow = ({
  name,
  code,
  type,
  status,
  lastMaintenance,
  isLast,
}: DeviceRowProps) => {
  const theme = useTheme();
  const isActive = status === "active";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr 0.5fr",
        alignItems: "center",
        p: 2,
        borderBottom: isLast ? "none" : `1px solid ${theme.palette.divider}`,
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
      }}
    >
      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem" }}
        >
          {code}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        {type}
      </Typography>
      <Box>
        <Chip
          label={isActive ? "Hoạt động" : "Bảo trì"}
          size="small"
          icon={
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isActive
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
              }}
            />
          }
          sx={{
            bgcolor: isActive
              ? theme.palette.success.light
              : theme.palette.warning.light,
            color: isActive
              ? theme.palette.success.main
              : theme.palette.warning.main,
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 24,
            "& .MuiChip-label": { px: 1 },
            "& .MuiChip-icon": { ml: 1, mr: -0.5 },
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        {lastMaintenance}
      </Typography>
      <Stack direction="row">
        <Tooltip title="Cài đặt">
          <IconButton size="small">
            <SettingsIcon fontSize="small" sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bật/Tắt">
          <IconButton size="small" color="error">
            <PowerSettingsNewIcon fontSize="small" sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

const MaintenanceItem = ({
  title,
  desc,
  device,
  tech,
  date,
  type,
}: MaintenanceItemProps) => {
  const theme = useTheme();
  const isRepair = type === "repair";
  // Dùng màu Primary cho sửa chữa, Success cho kiểm tra
  const iconColor = isRepair
    ? theme.palette.primary.main
    : theme.palette.success.main;
  const iconBg = isRepair
    ? theme.palette.primary.light
    : theme.palette.success.light;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: "12px",
        display: "flex",
        gap: 2,
        borderColor: theme.palette.divider,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {isRepair ? (
          <BuildIcon fontSize="small" />
        ) : (
          <CheckCircleOutlineIcon fontSize="small" />
        )}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: theme.palette.text.primary }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            {date}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            mt: 0.5,
            mb: 1,
            fontSize: "0.85rem",
          }}
        >
          {desc}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            Thiết bị:{" "}
            <Box
              component="span"
              sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
            >
              {device}
            </Box>
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            •
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            Kỹ thuật viên:{" "}
            <Box
              component="span"
              sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
            >
              {tech}
            </Box>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};

const StatCard = ({ icon, label, value, bg }: StatCardProps) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "12px",
        bgcolor: bg,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ color: theme.palette.text.secondary }}
      >
        {icon}
        <Typography variant="caption" fontWeight={600}>
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: theme.palette.text.primary }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export default TankManagement;

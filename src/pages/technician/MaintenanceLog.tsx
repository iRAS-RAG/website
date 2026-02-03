import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  useTheme,
  alpha,
  type PaletteColor,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";

// --- Interfaces ---
interface MaintenanceEntry {
  id: number;
  time: string;
  device: string;
  deviceId: string;
  issue: string;
  reason: string;
  parts: string[];
  technician: string;
  status: "Hoàn thành" | "Đang thực hiện" | "Chờ xử lý";
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorType: "primary" | "success" | "warning" | "info" | "error"; // Dùng key của palette thay vì mã màu
}

// --- Mock Data ---
const maintenanceData: MaintenanceEntry[] = [
  {
    id: 1,
    time: "13/01/2024 10:30",
    device: "Hệ thống sục khí Bể A-01",
    deviceId: "MC-001",
    issue: "Blower quá nhiệt và rung bất thường",
    reason: "Bạc đạn bị mòn, hệ thống làm mát kém",
    parts: ["Bạc đạn Blower", "Quạt làm mát"],
    technician: "Nguyễn Văn A",
    status: "Hoàn thành",
  },
  {
    id: 2,
    time: "12/01/2024 14:15",
    device: "Máy bơm tuần hoàn Bể B-02",
    deviceId: "MC-003",
    issue: "Áp suất nước giảm, có tiếng kêu lạ",
    reason: "Impeller bị mòn, đường ống có rò rỉ nhỏ",
    parts: ["Impeller", "Đệm cao su đường ống"],
    technician: "Trần Thị B",
    status: "Hoàn thành",
  },
  {
    id: 3,
    time: "12/01/2024 09:00",
    device: "Cảm biến DO Bể A-02",
    deviceId: "SEN-005",
    issue: "Hiển thị giá trị không chính xác",
    reason: "Đầu cảm biến bị bám bẩn, cần hiệu chuẩn",
    parts: ["Màng cảm biến DO"],
    technician: "Lê Văn C",
    status: "Hoàn thành",
  },
  {
    id: 4,
    time: "11/01/2024 15:45",
    device: "Hệ thống lọc sinh học Bể C-01",
    deviceId: "MC-004",
    issue: "Lưu lượng nước giảm đột ngột",
    reason: "Vật liệu lọc bị tắc nghẽn",
    parts: ["Vật liệu lọc sinh học"],
    technician: "Nguyễn Văn A",
    status: "Hoàn thành",
  },
  {
    id: 5,
    time: "11/01/2024 08:30",
    device: "Máy bơm tuần hoàn Bể A-01",
    deviceId: "MC-002",
    issue: "Rò rỉ nước ở phớt trục",
    reason: "Phớt cơ khí bị hỏng",
    parts: ["Phớt cơ khí", "Vòng đệm"],
    technician: "Trần Thị B",
    status: "Đang thực hiện",
  },
  {
    id: 6,
    time: "10/01/2024 16:20",
    device: "Đầu sục khí Bể B-01",
    deviceId: "CP-008",
    issue: "Một số đầu sục bị tắc",
    reason: "Cặn bẩn tích tụ lâu ngày",
    parts: ["Đầu sục khí (x3)"],
    technician: "Lê Văn C",
    status: "Hoàn thành",
  },
  {
    id: 7,
    time: "10/01/2024 10:00",
    device: "Van điện từ Bể A-03",
    deviceId: "VLV-012",
    issue: "Van không đóng mở",
    reason: "Cuộn dây điện từ bị cháy",
    parts: ["Cuộn dây điện từ"],
    technician: "Nguyễn Văn A",
    status: "Chờ xử lý",
  },
];

const MaintenanceLog: React.FC = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState("Tất cả");

  // Helper function for status styling sử dụng theme
  const getStatusStyle = (status: MaintenanceEntry["status"]) => {
    switch (status) {
      case "Hoàn thành":
        return {
          bgcolor: theme.palette.success.light, // Hoặc alpha(theme.palette.success.main, 0.1)
          color: theme.palette.success.main,
          borderColor: alpha(theme.palette.success.main, 0.3),
        };
      case "Đang thực hiện":
        return {
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.main,
          borderColor: alpha(theme.palette.warning.main, 0.3),
        };
      case "Chờ xử lý":
        return {
          bgcolor: theme.palette.info.light, // Hoặc primary.light tùy theme
          color: theme.palette.info.main,
          borderColor: alpha(theme.palette.info.main, 0.3),
        };
      default:
        return {
          bgcolor: theme.palette.action.hover,
          color: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
        };
    }
  };

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
        }}
      >
        <TechnicianHeader />

        <Box sx={{ p: 3 }}>
          {/* 1. Header Section */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                }}
              >
                Nhật ký bảo trì
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
              >
                Quản lý và theo dõi lịch sử bảo trì thiết bị
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.background.paper,
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                    borderColor: theme.palette.text.secondary,
                  },
                }}
              >
                Xuất báo cáo
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: theme.palette.primary.main,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: "none",
                  },
                }}
              >
                Thêm nhật ký bảo trì
              </Button>
            </Stack>
          </Stack>

          {/* 2. Summary Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 3,
              mb: 4,
            }}
          >
            <SummaryCard
              label="Tổng số nhật ký"
              value="7"
              icon={<AssignmentIcon />}
              colorType="primary"
            />
            <SummaryCard
              label="Hoàn thành"
              value="5"
              icon={<CheckCircleOutlineIcon />}
              colorType="success"
            />
            <SummaryCard
              label="Đang thực hiện"
              value="1"
              icon={<AccessTimeIcon />}
              colorType="warning"
            />
            <SummaryCard
              label="Chờ xử lý"
              value="1"
              icon={<ErrorOutlineIcon />}
              colorType="info"
            />
          </Box>

          {/* 3. Filter Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              px: 2,
              mb: 3,
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ color: theme.palette.text.secondary }}
            >
              <FilterListIcon fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                Lọc theo trạng thái:
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              {["Tất cả", "Hoàn thành", "Đang thực hiện", "Chờ xử lý"].map(
                (item) => {
                  const isActive = filter === item;
                  return (
                    <Button
                      key={item}
                      onClick={() => setFilter(item)}
                      size="small"
                      sx={{
                        textTransform: "none",
                        borderRadius: "6px",
                        fontWeight: isActive ? 600 : 500,
                        bgcolor: isActive
                          ? theme.palette.primary.main
                          : "transparent",
                        color: isActive
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.secondary,
                        "&:hover": {
                          bgcolor: isActive
                            ? theme.palette.primary.dark
                            : alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {item}
                    </Button>
                  );
                },
              )}
            </Stack>
          </Paper>

          {/* 4. Details Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                <TableRow>
                  {[
                    "Thời gian",
                    "Thiết bị",
                    "Lỗi",
                    "Nguyên nhân",
                    "Linh kiện thay thế",
                    "Người sửa",
                    "Trạng thái",
                  ].map((head) => (
                    <TableCell
                      key={head}
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenanceData.map((row) => (
                  <TableRow key={row.id} hover>
                    {/* Thời gian */}
                    <TableCell
                      sx={{
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon fontSize="inherit" />
                        <Typography variant="body2" fontSize="0.85rem">
                          {row.time}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Thiết bị */}
                    <TableCell>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: theme.palette.text.primary,
                          }}
                        >
                          {row.device}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.deviceId}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Lỗi */}
                    <TableCell
                      sx={{
                        fontSize: "0.85rem",
                        maxWidth: 200,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {row.issue}
                    </TableCell>

                    {/* Nguyên nhân */}
                    <TableCell
                      sx={{
                        fontSize: "0.85rem",
                        maxWidth: 200,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {row.reason}
                    </TableCell>

                    {/* Linh kiện */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {row.parts.map((part) => (
                          <Chip
                            key={part}
                            label={part}
                            size="small"
                            sx={{
                              fontSize: "0.75rem",
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 500,
                              borderRadius: "6px",
                              height: 24,
                              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            }}
                          />
                        ))}
                      </Stack>
                    </TableCell>

                    {/* Người sửa */}
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.75rem",
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          }}
                        >
                          {row.technician.charAt(0)}
                        </Avatar>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {row.technician}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "16px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "1px solid",
                          ...getStatusStyle(row.status),
                        }}
                      >
                        {row.status}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  colorType,
}) => {
  const theme = useTheme();
  // Lấy màu từ theme dựa trên colorType (primary, success, etc.)
  const colorMain = (theme.palette[colorType] as PaletteColor).main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            fontSize: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mt: 1, color: theme.palette.text.primary }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          bgcolor: alpha(colorMain, 0.1), // Dùng alpha để tạo nền nhạt
          color: colorMain,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

export default MaintenanceLog;

import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  // TextField,
  // MenuItem,
  type Palette,
  type PaletteColor,
} from "@mui/material";
import { useState } from "react";
import { AlertDetailModal } from "../../components/operator/AlertDetailModal";
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";

// Icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { JSX } from "react";

// 1. CẬP NHẬT INTERFACE: Thêm id, đổi tên trường cho khớp với code JSX
export interface AlertData {
  id: number;
  time: string;
  sensorCode: string; // Đã sửa từ 'sensor'
  sensorName: string; // Đã sửa từ 'type'
  value: string;
  limit: string;
  level: "Nghiêm trọng" | "Cao" | "Trung bình" | "Thấp";
  tank: string;
  staff: string;
  status: "Đang xử lý" | "Chờ xử lý" | "Đã xử lý";
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: JSX.Element;
  color: keyof Palette;
}

const AlertCenter = () => {
  const theme = useTheme();

  // 2. THÊM STATE & HÀM XỬ LÝ MODAL (Fix lỗi handleOpenDetail undefined)
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  const handleOpenDetail = (alert: AlertData) => {
    setSelectedAlert(alert);
    setDetailOpen(true);
  };

  // 3. CẬP NHẬT DỮ LIỆU MẪU: Có id và đúng tên trường
  const alerts: AlertData[] = [
    {
      id: 1,
      time: "2024-01-13 10:30:25",
      sensorCode: "DO-B02-01",
      sensorName: "Oxy hòa tan",
      value: "4.2 mg/L",
      limit: "≥ 5.5 mg/L",
      level: "Nghiêm trọng",
      tank: "Bể B-02",
      staff: "Nguyễn Văn A",
      status: "Đang xử lý",
    },
    {
      id: 2,
      time: "2024-01-13 10:25:18",
      sensorCode: "NH3-B02-01",
      sensorName: "Ammonia",
      value: "0.9 ppm",
      limit: "≤ 0.5 ppm",
      level: "Nghiêm trọng",
      tank: "Bể B-02",
      staff: "Nguyễn Văn A",
      status: "Đang xử lý",
    },
    {
      id: 3,
      time: "2024-01-13 10:20:42",
      sensorCode: "PH-B02-01",
      sensorName: "Độ pH",
      value: "6.7 pH",
      limit: "7.0 - 7.5 pH",
      level: "Cao",
      tank: "Bể B-02",
      staff: "Nguyễn Văn A",
      status: "Đang xử lý",
    },
    {
      id: 4,
      time: "2024-01-13 10:15:33",
      sensorCode: "TEMP-B02-01",
      sensorName: "Nhiệt độ",
      value: "30.1°C",
      limit: "28-29°C",
      level: "Cao",
      tank: "Bể B-02",
      staff: "Nguyễn Văn A",
      status: "Đang xử lý",
    },
    {
      id: 5,
      time: "2024-01-13 09:45:12",
      sensorCode: "DO-B01-01",
      sensorName: "Oxy hòa tan",
      value: "5.0 mg/L",
      limit: "≥ 6.0 mg/L",
      level: "Trung bình",
      tank: "Bể B-01",
      staff: "Trần Thị B",
      status: "Chờ xử lý",
    },
    {
      id: 6,
      time: "2024-01-13 09:30:45",
      sensorCode: "RPM-A01-01",
      sensorName: "Tốc độ máy bơm",
      value: "1,350 RPM",
      limit: "1,400-1,500 RPM",
      level: "Trung bình",
      tank: "Bể A-01",
      staff: "Chưa phân công",
      status: "Chờ xử lý",
    },
    {
      id: 7,
      time: "2024-01-13 09:15:20",
      sensorCode: "NH3-A02-01",
      sensorName: "Ammonia",
      value: "0.6 ppm",
      limit: "≤ 0.5 ppm",
      level: "Trung bình",
      tank: "Bể A-02",
      staff: "Trần Thị B",
      status: "Đã xử lý",
    },
    {
      id: 8,
      time: "2024-01-13 08:50:17",
      sensorCode: "TEMP-C01-01",
      sensorName: "Nhiệt độ",
      value: "27.5°C",
      limit: "28-29°C",
      level: "Thấp",
      tank: "Bể C-01",
      staff: "Chưa phân công",
      status: "Chờ xử lý",
    },
  ];

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
        }}
      >
        <OperatorHeader />

        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: "2rem",
              }}
            >
              Trung tâm cảnh báo
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Quản lý và xử lý các cảnh báo từ hệ thống
            </Typography>
          </Box>

          {/* 1. SUMMARY CARDS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 3,
              mb: 4,
            }}
          >
            <SummaryCard label="Tổng cảnh báo" value="8" icon={<NotificationsActiveIcon />} color="primary" />
            <SummaryCard label="Nghiêm trọng" value="2" icon={<ErrorOutlineIcon />} color="error" />
            <SummaryCard label="Chờ xử lý" value="3" icon={<PendingActionsIcon />} color="warning" />
            <SummaryCard label="Đã xử lý" value="1" icon={<CheckCircleOutlineIcon />} color="success" />
          </Box>

          {/* 2. FILTERS & EXPORT - Cập nhật theo thiết kế mới */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "white",
            }}
          >
            {/* Nút Bộ lọc đơn giản bên trái */}
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                height: 40,
                px: 2,
                "&:hover": {
                  borderColor: theme.palette.text.secondary,
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              Bộ lọc
            </Button>

            {/* Nút Xuất báo cáo bên phải */}
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              color="success" // Màu xanh lá từ theme
              sx={{
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                height: 40,
                boxShadow: "none",
                px: 2,
              }}
            >
              Xuất báo cáo
            </Button>
          </Paper>

          {/* 3. ALERT LOG TABLE */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              mt: 3,
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#fff" }}>
                <TableRow>
                  {["Thời gian", "Cảm biến", "Giá trị", "Ngưỡng", "Mức độ", "Bể ảnh hưởng", "Kỹ thuật viên", "Trạng thái", "Hành động"].map((head, index) => (
                    <TableCell
                      key={index}
                      align="left"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary, // Dùng theme text secondary
                        fontSize: "0.8rem",
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        textTransform: "capitalize",
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": { bgcolor: theme.palette.action.hover },
                    }}
                  >
                    {/* Thời gian */}
                    <TableCell
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon
                          sx={{
                            fontSize: 16,
                            color: theme.palette.text.secondary,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                          {row.time}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Cảm biến */}
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            fontSize: "0.85rem",
                          }}
                        >
                          {row.sensorCode}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                          }}
                        >
                          {row.sensorName}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Giá trị */}
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: "0.85rem",
                      }}
                    >
                      {row.value}
                    </TableCell>

                    {/* Ngưỡng */}
                    <TableCell
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.85rem",
                      }}
                    >
                      {row.limit}
                    </TableCell>

                    {/* Mức độ */}
                    <TableCell>
                      <LevelChip level={row.level} />
                    </TableCell>

                    {/* Bể ảnh hưởng */}
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontSize: "0.85rem",
                      }}
                    >
                      {row.tank}
                    </TableCell>

                    {/* Kỹ thuật viên */}
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: "0.85rem",
                      }}
                    >
                      {row.staff || "Chưa phân công"}
                    </TableCell>

                    {/* Trạng thái - Đã có component StatusChip */}
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>

                    {/* Hành động */}
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: "16px !important" }} />}
                        onClick={() => handleOpenDetail(row)}
                        sx={{
                          textTransform: "none",
                          bgcolor: theme.palette.primary.main, // Dùng theme primary
                          boxShadow: "none",
                          borderRadius: "6px",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          minWidth: 80,
                          height: 32,
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                            boxShadow: "none",
                          },
                        }}
                      >
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 4. PAGINATION */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Hiển thị 8 / 8 cảnh báo
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 60,
                  height: 32,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                Trước
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: "none",
                  borderRadius: "8px",
                }}
              >
                1
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  borderRadius: "8px",
                }}
              >
                2
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 60,
                  height: 32,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                Sau
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Modal chi tiết */}
      <AlertDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} data={selectedAlert} />
    </Box>
  );
};

// --- Sub-components ---

const SummaryCard = ({ label, value, icon, color }: SummaryCardProps) => {
  const theme = useTheme();
  // Map color key to palette color
  const paletteColor = theme.palette[color] as PaletteColor;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: "16px",
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.text.primary }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: paletteColor.light, // Sử dụng màu light từ theme
          color: paletteColor.main, // Sử dụng màu main từ theme
          display: "flex",
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

const LevelChip = ({ level }: { level: AlertData["level"] }) => {
  const theme = useTheme();

  const getStyle = () => {
    switch (level) {
      case "Nghiêm trọng":
        // Dùng error light làm nền, error main làm chữ
        return {
          bgcolor: theme.palette.error.light,
          color: theme.palette.error.main,
        };
      case "Cao":
        return {
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.main,
        };
      case "Trung bình":
        return {
          bgcolor: theme.palette.warning.light, // Hoặc một màu vàng nhạt khác nếu có
          color: theme.palette.warning.main,
        };
      default:
        return {
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.secondary,
        };
    }
  };

  const style = getStyle();

  return (
    <Chip
      label={level}
      size="small"
      sx={{
        fontWeight: 700,
        borderRadius: "6px",
        fontSize: "0.75rem",
        bgcolor: style.bgcolor,
        color: style.color,
      }}
    />
  );
};

// 4. THÊM COMPONENT StatusChip (Fix lỗi StatusChip not defined)
const StatusChip = ({ status }: { status: AlertData["status"] }) => {
  const theme = useTheme();

  const getStyle = () => {
    switch (status) {
      case "Đang xử lý":
        return {
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.main,
        };
      case "Chờ xử lý":
        return {
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.main,
        };
      case "Đã xử lý":
        return {
          bgcolor: theme.palette.success.light,
          color: theme.palette.success.main,
        };
      default:
        return {
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.secondary,
        };
    }
  };

  const style = getStyle();

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 600,
        borderRadius: "12px", // Bo tròn kiểu pill
        fontSize: "0.75rem",
        bgcolor: style.bgcolor,
        color: style.color,
        border: "none",
      }}
    />
  );
};

export default AlertCenter;

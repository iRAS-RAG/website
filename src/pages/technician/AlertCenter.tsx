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
  Pagination,
  useTheme,
  TextField,
  MenuItem,
  //   InputAdornment,
  type Palette,
} from "@mui/material";
import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import SearchIcon from "@mui/icons-material/Search";
import type { JSX } from "react";

// 1. Định nghĩa Interface cho dữ liệu Cảnh báo
interface AlertData {
  time: string;
  sensor: string;
  type: string;
  value: string;
  limit: string;
  level: "Nghiêm trọng" | "Cao" | "Trung bình" | "Thấp";
  tank: string;
  staff: string;
  status: string;
  levelColor: "error" | "warning" | "info" | "success" | "primary";
}

// 2. Định nghĩa Interface cho Props của SummaryCard
interface SummaryCardProps {
  label: string;
  value: string;
  icon: JSX.Element;
  color: keyof Palette;
}

const AlertCenter = () => {
  const theme = useTheme();

  const alerts: AlertData[] = [
    {
      time: "2024-01-13 10:30:25",
      sensor: "DO-B02-01",
      type: "Oxy hòa tan",
      value: "4.2 mg/L",
      limit: "≥ 5.5 mg/L",
      level: "Nghiêm trọng",
      tank: "Bể B-02",
      staff: "Nguyễn Văn A",
      status: "Đang xử lý",
      levelColor: "error",
    },
    {
      time: "2024-01-13 10:25:18",
      sensor: "NH3-B02-01",
      type: "Ammonia",
      value: "0.9 ppm",
      limit: "≤ 0.5 ppm",
      level: "Nghiêm trọng",
      tank: "Bể B-02",
      staff: "Nguyễn Văn A",
      status: "Đang xử lý",
      levelColor: "error",
    },
    {
      time: "2024-01-13 10:20:42",
      sensor: "PH-B02-01",
      type: "Độ pH",
      value: "6.7 pH",
      limit: "7.0 - 7.5 pH",
      level: "Cao",
      tank: "Bể B-02",
      staff: "Nguyễn Văn A",
      status: "Đang xử lý",
      levelColor: "warning",
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
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              Quản lý và xử lý các cảnh báo từ hệ thống
            </Typography>
          </Box>

          {/* 1. SUMMARY CARDS - Cải thiện màu sắc icon/nền nhận diện nhanh */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 3,
              mb: 4,
            }}
          >
            <SummaryCard
              label="Tổng cảnh báo"
              value="8"
              icon={<NotificationsActiveIcon />}
              color="primary"
            />
            <SummaryCard
              label="Nghiêm trọng"
              value="2"
              icon={<ErrorOutlineIcon />}
              color="error"
            />
            <SummaryCard
              label="Chờ xử lý"
              value="3"
              icon={<PendingActionsIcon />}
              color="warning"
            />
            <SummaryCard
              label="Đã xử lý"
              value="1"
              icon={<CheckCircleOutlineIcon />}
              color="success"
            />
          </Box>

          {/* 2. FILTERS & EXPORT - Nâng cấp Toolbar UX */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  size="small"
                  defaultValue="all"
                  sx={{ width: 150, bgcolor: "white" }}
                >
                  <MenuItem value="all">Tất cả bể</MenuItem>
                  <MenuItem value="b02">Bể B-02</MenuItem>
                </TextField>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  sx={{
                    borderRadius: "10px",
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Lọc nâng cao
                </Button>
              </Stack>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  borderRadius: "10px",
                  fontWeight: 600,
                  "&:hover": { bgcolor: theme.palette.secondary.dark },
                }}
              >
                Xuất báo cáo
              </Button>
            </Stack>
          </Paper>

          {/* 3. ALERT LOG TABLE - Cải thiện Bold dữ liệu chính và Căn lề số */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "16px",
              boxShadow: "none",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  {[
                    "Thời gian",
                    "Cảm biến",
                    "Giá trị",
                    "Ngưỡng",
                    "Mức độ",
                    "Bể ảnh hưởng",
                    "Kỹ thuật viên",
                    "Trạng thái",
                    "Hành động",
                  ].map((head, idx) => (
                    <TableCell
                      key={head}
                      align={idx === 2 || idx === 3 ? "center" : "left"}
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.secondary,
                        fontSize: "0.85rem",
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell
                      sx={{
                        fontSize: "0.85rem",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {row.time}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {row.sensor}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {row.type}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {row.value}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      {row.limit}
                    </TableCell>
                    <TableCell>
                      <LevelChip level={row.level} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.tank}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {row.staff || "Chưa phân công"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={
                          <VisibilityIcon
                            sx={{ fontSize: "16px !important" }}
                          />
                        }
                        sx={{
                          borderRadius: "6px",
                          textTransform: "none",
                          fontWeight: 600,
                          px: 2,
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

          {/* 4. PAGINATION - Thêm thông tin quy mô dữ liệu */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 3 }}
          >
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              Hiển thị 1 - 3 trong tổng số 42 cảnh báo
            </Typography>
            <Pagination count={5} color="primary" shape="rounded" />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

// --- Sub-components ---

const SummaryCard = ({ label, value, icon, color }: SummaryCardProps) => {
  const theme = useTheme();

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
        <Typography variant="h4" sx={{ fontWeight: 600, mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: `${color}.light`,
          color: `${color}.main`,
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
        return { bgcolor: theme.palette.error.main, color: "#FFFFFF" };
      case "Cao":
        return { bgcolor: theme.palette.warning.main, color: "#FFFFFF" };
      case "Trung bình":
        return {
          bgcolor: theme.palette.warning.light,
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

export default AlertCenter;

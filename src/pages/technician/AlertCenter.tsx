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
  Pagination,
  useTheme,
  TextField,
  MenuItem,
  //   InputAdornment,
  type Palette,
} from "@mui/material";
import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";
import { AlertDetailModal } from "../../components/technician/AlertDetailModal";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import SearchIcon from "@mui/icons-material/Search";

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

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactElement;
  color: keyof Palette;
}

const AlertCenter: React.FC = () => {
  const theme = useTheme();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  const handleOpenDetail = (alert: AlertData) => {
    setSelectedAlert(alert);
    setDetailOpen(true);
  };

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
          minWidth: 0,
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
              Quản lý và xử lý các cảnh báo từ hệ thống iRAS-RAG
            </Typography>
          </Box>

          {/* 1. Summary Cards */}
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

          {/* 2. Toolbar */}
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
                {/* <TextField
                  size="small"
                  placeholder="Mã cảm biến..."
                  sx={{ width: 220, bgcolor: "white" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                /> */}
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
                }}
              >
                Xuất báo cáo
              </Button>
            </Stack>
          </Paper>

          {/* 3. Table */}
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
                    "Bể",
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
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                        {row.sensor}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {row.type}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      {row.value}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {row.limit}
                    </TableCell>
                    <TableCell>
                      <LevelChip level={row.level} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.tank}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {row.staff}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleOpenDetail(row)}
                        startIcon={
                          <VisibilityIcon
                            sx={{ fontSize: "16px !important" }}
                          />
                        }
                        sx={{
                          borderRadius: "6px",
                          textTransform: "none",
                          fontWeight: 600,
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

          {/* 4. Pagination */}
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

      {/* Modal chi tiết */}
      <AlertDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={selectedAlert}
      />
    </Box>
  );
};

// --- Sub-components ---
const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  color,
}) => {
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
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 700,
            textTransform: "uppercase",
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

const LevelChip: React.FC<{ level: AlertData["level"] }> = ({ level }) => {
  const theme = useTheme();
  const getStyle = () => {
    switch (level) {
      case "Nghiêm trọng":
        return { bgcolor: theme.palette.error.main, color: "#FFF" };
      case "Cao":
        return { bgcolor: theme.palette.warning.main, color: "#FFF" };
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

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
  CircularProgress,
  type Palette,
  type PaletteColor,
} from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import { AlertDetailModal } from "../../components/operator/AlertDetailModal";
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { useAlerts } from "../../hooks/useAlerts";
import type { IAlert } from "../../types/alert";

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

// Định nghĩa dữ liệu truyền vào Modal và Bảng (Sửa id thành string | number)
export interface AlertData {
  id: string | number;
  time: string;
  sensorCode: string;
  sensorName: string;
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

// Hàm hỗ trợ map trạng thái từ Backend (Số/Chuỗi) sang UI Text
// Đã dùng 'unknown' thay cho 'any' để ESLint không báo lỗi
const getStatusLabel = (
  status: unknown,
): "Đang xử lý" | "Chờ xử lý" | "Đã xử lý" => {
  const s = String(status).toLowerCase();
  if (s === "1" || s === "processing") return "Đang xử lý";
  if (s === "2" || s === "resolved") return "Đã xử lý";
  return "Chờ xử lý"; // Default (0 hoặc pending)
};

// Hàm giả lập mức độ cảnh báo (Vì BE hiện không trả về Level)
const getAlertLevel = (
  value: number,
): "Nghiêm trọng" | "Cao" | "Trung bình" | "Thấp" => {
  if (value > 50) return "Nghiêm trọng";
  if (value > 30) return "Cao";
  if (value > 10) return "Trung bình";
  return "Thấp";
};

const AlertCenter = () => {
  const theme = useTheme();

  // 1. GỌI HOOK LẤY DỮ LIỆU THẬT
  const {
    data: alerts,
    loading,
    error,
    page,
    setPage,
    totalCount,
  } = useAlerts(1, 10);

  // State Modal (Sử dụng interface AlertData chuẩn)
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  const handleOpenDetail = (alert: IAlert) => {
    // Map dữ liệu IAlert từ Backend sang format UI của Modal
    setSelectedAlert({
      id: alert.id,
      time: dayjs(alert.raisedAt).format("DD/MM/YYYY HH:mm:ss"),
      sensorCode: alert.sensorTypeName,
      sensorName: "ID: " + alert.sensorTypeId.substring(0, 8),
      value: `${alert.value}`,
      limit: `ID: ${alert.speciesThresholdId.substring(0, 8)}`,
      level: getAlertLevel(alert.value),
      tank: alert.fishTankName,
      staff: "Chưa phân công",
      status: getStatusLabel(alert.status),
    });
    setDetailOpen(true);
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
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              Quản lý và xử lý các cảnh báo từ hệ thống
            </Typography>
          </Box>

          {/* SUMMARY CARDS */}
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
              value={totalCount.toString()}
              icon={<NotificationsActiveIcon />}
              color="primary"
            />
            <SummaryCard
              label="Nghiêm trọng"
              value="-"
              icon={<ErrorOutlineIcon />}
              color="error"
            />
            <SummaryCard
              label="Chờ xử lý"
              value="-"
              icon={<PendingActionsIcon />}
              color="warning"
            />
            <SummaryCard
              label="Đã xử lý"
              value="-"
              icon={<CheckCircleOutlineIcon />}
              color="success"
            />
          </Box>

          {/* FILTERS & EXPORT */}
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
              }}
            >
              Bộ lọc
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              color="success"
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

          {/* ALERT LOG TABLE */}
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
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, color: "error.main", textAlign: "center" }}>
                {error}
              </Box>
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: "#fff" }}>
                  <TableRow>
                    {[
                      "Thời gian",
                      "Cảm biến",
                      "Giá trị",
                      "Ngưỡng",
                      "Mức độ",
                      "Bể ảnh hưởng",
                      "Trạng thái",
                      "Hành động",
                    ].map((head, index) => (
                      <TableCell
                        key={index}
                        align="left"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
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
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
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
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            {dayjs(row.raisedAt).format("DD/MM/YYYY HH:mm")}
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
                            {row.sensorTypeName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontFamily: "monospace",
                            }}
                          >
                            {row.sensorTypeId.substring(0, 8)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Giá trị */}
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.error.main,
                          fontSize: "0.85rem",
                        }}
                      >
                        {row.value}
                      </TableCell>

                      {/* Ngưỡng */}
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                        }}
                      >
                        ID: {row.speciesThresholdId.substring(0, 8)}
                      </TableCell>

                      {/* Mức độ (Tính toán giả lập) */}
                      <TableCell>
                        <LevelChip level={getAlertLevel(row.value)} />
                      </TableCell>

                      {/* Bể ảnh hưởng */}
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          fontSize: "0.85rem",
                        }}
                      >
                        {row.fishTankName}
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell>
                        <StatusChip status={getStatusLabel(row.status)} />
                      </TableCell>

                      {/* Hành động */}
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            <VisibilityIcon
                              sx={{ fontSize: "16px !important" }}
                            />
                          }
                          onClick={() => handleOpenDetail(row)}
                          sx={{
                            textTransform: "none",
                            bgcolor: theme.palette.primary.main,
                            boxShadow: "none",
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            minWidth: 80,
                            height: 32,
                          }}
                        >
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {alerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        Chưa có cảnh báo nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* PAGINATION */}
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
              Trang {page} / Tổng số {totalCount}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outlined"
                size="small"
                sx={{ minWidth: 60, height: 32, borderRadius: "8px" }}
              >
                Trước
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: "8px",
                  boxShadow: "none",
                }}
              >
                {page}
              </Button>
              <Button
                onClick={() => setPage((p: number) => p + 1)}
                disabled={alerts.length < 10}
                variant="outlined"
                size="small"
                sx={{ minWidth: 60, height: 32, borderRadius: "8px" }}
              >
                Sau
              </Button>
            </Stack>
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
const SummaryCard = ({ label, value, icon, color }: SummaryCardProps) => {
  const theme = useTheme();
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
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.text.primary }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: paletteColor.light,
          color: paletteColor.main,
          display: "flex",
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

const LevelChip = ({
  level,
}: {
  level: "Nghiêm trọng" | "Cao" | "Trung bình" | "Thấp";
}) => {
  const theme = useTheme();
  const getStyle = () => {
    switch (level) {
      case "Nghiêm trọng":
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

const StatusChip = ({
  status,
}: {
  status: "Đang xử lý" | "Chờ xử lý" | "Đã xử lý";
}) => {
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
        borderRadius: "12px",
        fontSize: "0.75rem",
        bgcolor: style.bgcolor,
        color: style.color,
        border: "none",
      }}
    />
  );
};

export default AlertCenter;

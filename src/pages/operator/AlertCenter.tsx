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
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  type Palette,
  type PaletteColor,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AlertDetailModal } from "../../components/operator/AlertDetailModal";
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { useAlerts } from "../../hooks/useAlerts";
import { alertApi } from "../../api/alerts";
import { useAlertSignalR } from "../../hooks/useAlertSignalR";
import type { IAlert } from "../../types/alert";

// Icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import type { JSX } from "react";

// Định nghĩa dữ liệu truyền vào Modal (Đã xóa trường level)
export interface AlertData {
  id: string | number;
  time: string;
  sensorCode: string;
  sensorName: string;
  value: string;
  limit: string;
  tank: string;
  tankId: string;
  staff: string;
  status: "Đang xử lý" | "Chờ xử lý" | "Đóng sự cố" | "Đã bỏ qua";
  hasCorrectiveAction: boolean;
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: JSX.Element;
  color: keyof Palette;
}

// Hàm hỗ trợ map trạng thái từ Backend (Số/Chuỗi) sang UI Text
const getStatusLabel = (
  status: unknown,
): "Đang xử lý" | "Chờ xử lý" | "Đóng sự cố" | "Đã bỏ qua" => {
  const s = String(status).toUpperCase();
  if (s === "ACKNOWLEDGED") return "Đang xử lý";
  if (s === "RESOLVED") return "Đóng sự cố";
  if (s === "DISMISSED") return "Đã bỏ qua";
  return "Chờ xử lý";
};

const AlertCenter = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>("OPEN");

  const filterStatuses = statusFilter === "ALL" ? undefined : [statusFilter];

  // 1. GỌI HOOK LẤY DỮ LIỆU THẬT
  const {
    data: alerts,
    loading,
    error,
    page,
    setPage,
    totalCount,
    statusCounts,
    refetch,
  } = useAlerts(1, 10, filterStatuses);

  useAlertSignalR({ onAlertCreated: () => refetch() });

  const handleStatusFilterChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  const handleOpenDetail = (alert: IAlert) => {
    setSelectedAlert({
      id: alert.id,
      time: dayjs(alert.raisedAt).format("DD/MM/YYYY HH:mm:ss"),
      sensorCode: alert.sensorTypeName,
      sensorName: alert.sensorTypeName, // Truyền Tên cảm biến thật vào thay vì ID
      value: `${alert.triggerValue} ${alert.unitOfMeasure}`,
      limit: `${alert.minThreshold} - ${alert.maxThreshold} ${alert.unitOfMeasure}`,
      tank: alert.fishTankName,
      tankId: alert.fishTankId,
      staff: "Chưa phân công",
      status: getStatusLabel(alert.status),
      hasCorrectiveAction: alert.hasCorrectiveAction,
    });
    setDetailOpen(true);
  };

  const openAlertId: string | undefined = (location.state as { openAlertId?: string } | null)?.openAlertId;

  useEffect(() => {
    if (!openAlertId) return;
    alertApi.getById(openAlertId).then((alert: IAlert) => {
      handleOpenDetail(alert);
      // Clear the nav state so it doesn't retrigger on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- openAlertId is the only trigger; navigate/location are stable
  }, [openAlertId]);

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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", // Đổi lại thành 4 cột cho 4 trạng thái
              gap: 3,
              mb: 4,
            }}
          >
            <SummaryCard
              label="Tổng cảnh báo"
              value={statusCounts.total.toString()}
              icon={<NotificationsActiveIcon />}
              color="primary"
            />
            <SummaryCard
              label="Chờ xử lý"
              value={statusCounts.open.toString()}
              icon={<ErrorOutlineIcon />}
              color="error"
            />
            <SummaryCard
              label="Đang xử lý"
              value={statusCounts.acknowledged.toString()}
              icon={<PendingActionsIcon />}
              color="warning"
            />
            <SummaryCard
              label="Đóng sự cố"
              value={statusCounts.resolved.toString()}
              icon={<CheckCircleOutlineIcon />}
              color="success"
            />
          </Box>

          {/* FILTER BAR */}
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3, mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="ALL">Tất cả</MenuItem>
                <MenuItem value="OPEN">Chờ xử lý</MenuItem>
                <MenuItem value="ACKNOWLEDGED">Đang xử lý</MenuItem>
                <MenuItem value="RESOLVED">Đóng sự cố</MenuItem>
                <MenuItem value="DISMISSED">Đã bỏ qua</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* ALERT LOG TABLE */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
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
                      "Bể ảnh hưởng", // Đã xóa cột Mức độ
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

                      {/* Cảm biến (Đã xóa ID dài ngoằng bên dưới) */}
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
                        {row.triggerValue}
                      </TableCell>

                      {/* Ngưỡng */}
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {row.minThreshold} - {row.maxThreshold}{" "}
                        {row.unitOfMeasure}
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
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StatusChip status={getStatusLabel(row.status)} />
                          {getStatusLabel(row.status) !== "Đã bỏ qua" && (
                            <Tooltip
                              title={
                                row.hasCorrectiveAction
                                  ? "Đã có nhật kí bảo trì"
                                  : "Chưa có nhật kí bảo trì"
                              }
                            >
                              {row.hasCorrectiveAction ? (
                                <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                              ) : (
                                <BuildCircleIcon sx={{ fontSize: 16, color: "warning.main" }} />
                              )}
                            </Tooltip>
                          )}
                        </Stack>
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
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
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
        onStatusChange={refetch}
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

const StatusChip = ({
  status,
}: {
  status: "Đang xử lý" | "Chờ xử lý" | "Đóng sự cố" | "Đã bỏ qua";
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
      case "Đóng sự cố":
        return {
          bgcolor: theme.palette.success.light,
          color: theme.palette.success.main,
        };
      case "Đã bỏ qua":
        return {
          bgcolor: theme.palette.grey[200],
          color: theme.palette.text.secondary,
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

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  type PaletteColor,
  alpha,
  Chip,
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";

import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { useCorrectiveActions } from "../../hooks/useCorrectiveActions";
import { correctiveActionApi } from "../../api/correctiveActions";
import { apiFetch, isApiError } from "../../api/client";

interface IAlertOption {
  id: string;
  sensorTypeName: string;
  fishTankName: string;
  raisedAt: string;
}

const MaintenanceLog: React.FC = () => {
  const theme = useTheme();

  // 1. Lấy danh sách Nhật ký (từ hook)
  const { data: logs, loading, error, refetch } = useCorrectiveActions();

  // 2. State quản lý danh sách Cảnh báo (Alerts) dùng chung cho cả Bảng và Modal
  const [alertsList, setAlertsList] = useState<IAlertOption[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Gọi API lấy danh sách Alerts ngay khi load trang
  useEffect(() => {
    const fetchAllAlerts = async () => {
      setLoadingAlerts(true);
      try {
        const res = await apiFetch<unknown>("/alerts?page=1&pageSize=100", {
          method: "GET",
        });
        const resObj = res as { data?: IAlertOption[] };
        const alertsData = Array.isArray(res) ? res : resObj?.data || [];

        // Console log để kiểm tra xem danh sách cảnh báo tải về có bị rỗng không
        console.log("Danh sách Alerts lấy về để map:", alertsData);

        setAlertsList(alertsData as IAlertOption[]);
      } catch (err) {
        console.error("Lỗi khi tải danh sách cảnh báo:", err);
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchAllAlerts();
  }, []);

  // 3. Tạo "Từ điển" (Map) để tra cứu nhanh tên Cảnh báo từ ID
  // Xử lý luôn trường hợp ID khác biệt chữ hoa/thường (toLowerCase)
  const alertMap = useMemo(() => {
    const map: Record<string, string> = {};
    alertsList.forEach((alert) => {
      if (alert && alert.id) {
        map[alert.id.toLowerCase()] =
          `${alert.fishTankName || "Bể ẩn"} - ${alert.sensorTypeName || "Cảm biến"}`;
      }
    });
    return map;
  }, [alertsList]);

  // --- State cho Modal Thêm Nhật Ký ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    alertId: "",
    actionTaken: "",
    notes: "",
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ alertId: "", actionTaken: "", notes: "" });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.alertId || !formData.actionTaken) {
      alert("Vui lòng điền đầy đủ Mã cảnh báo và Hành động khắc phục!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Định nghĩa kiểu dữ liệu mong đợi (không dùng any nữa)
      type UserProfileResponse = {
        id?: string;
        data?: {
          id?: string;
        };
      };

      // 2. Truyền kiểu dữ liệu vào apiFetch
      const userProfileRes = await apiFetch<UserProfileResponse>("/users/me", {
        method: "GET",
      });

      console.log("Dữ liệu User Profile tải về:", userProfileRes);

      // 3. Lấy ID an toàn, TypeScript sẽ không báo lỗi vì đã biết trước cấu trúc
      const currentUserId = userProfileRes?.id || userProfileRes?.data?.id;

      if (!currentUserId) {
        alert(
          "Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.",
        );
        return;
      }

      // 2. Gửi API lưu nhật ký
      await correctiveActionApi.create({
        alertId: formData.alertId,
        userId: currentUserId,
        actionTaken: formData.actionTaken,
        notes: formData.notes,
      });

      // 3. Đóng Modal và làm mới bảng
      handleCloseModal();
      refetch();
    } catch (err: unknown) {
      console.error("Lỗi khi gửi form:", err);
      if (isApiError(err)) {
        const errorData = err.data as { message?: string };
        alert(errorData?.message || "Có lỗi xảy ra khi lưu nhật ký.");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Có lỗi xảy ra khi lưu nhật ký.");
      }
    } finally {
      setIsSubmitting(false);
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
                Nhật ký bảo trì & Khắc phục
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
              >
                Quản lý và theo dõi lịch sử xử lý cảnh báo hệ thống
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              {/* <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                Xuất báo cáo
              </Button> */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenModal}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
              >
                Thêm nhật ký
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)", // đúng số card
              gap: 3,
              mb: 4,
              justifyItems: "center", // căn giữa từng card
            }}
          >
            <SummaryCard
              label="Tổng số lần xử lý"
              value={logs.length.toString()}
              icon={<AssignmentIcon />}
              colorType="primary"
            />
            <SummaryCard
              label="Đã hoàn thành"
              value={logs.length.toString()}
              icon={<CheckCircleOutlineIcon />}
              colorType="success"
            />
            <SummaryCard
              label="Đang thực hiện"
              value="0"
              icon={<AccessTimeIcon />}
              colorType="warning"
            />
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
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
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    {[
                      "Cảnh báo xử lý",
                      "Thời gian",
                      "Người thực hiện",
                      "Hành động khắc phục",
                      "Ghi chú",
                    ].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((row) => (
                    <TableRow key={row.id} hover>
                      {/* 1. Cảnh báo xử lý */}
                      <TableCell>
                        {alertMap[(row.alertId || "").toLowerCase()] ? (
                          <Chip
                            label={alertMap[(row.alertId || "").toLowerCase()]}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 500, borderRadius: "6px" }}
                          />
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              color: "text.disabled",
                            }}
                          >
                            ID: {row.alertId.substring(0, 8)}...
                          </Typography>
                        )}
                      </TableCell>

                      {/* 2. Thời gian */}
                      <TableCell
                        sx={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarTodayIcon
                            fontSize="inherit"
                            color="action"
                          />
                          <Typography variant="body2" fontSize="0.85rem">
                            {dayjs(row.timestamp).format("DD/MM/YYYY HH:mm")}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* 3. Người thực hiện */}
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: "0.75rem",
                              bgcolor: theme.palette.primary.main,
                            }}
                          >
                            {row.performedBy
                              ? row.performedBy.charAt(0).toUpperCase()
                              : "U"}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{ fontSize: "0.85rem", fontWeight: 500 }}
                            >
                              {row.performedBy || "Chưa rõ"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.userEmail}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* 4. Hành động khắc phục */}
                      <TableCell
                        sx={{
                          fontSize: "0.85rem",
                          maxWidth: 250,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {row.actionTaken}
                      </TableCell>

                      {/* 5. Ghi chú */}
                      <TableCell
                        sx={{
                          fontSize: "0.85rem",
                          maxWidth: 200,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {row.notes || "Không có ghi chú"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      </Box>

      {/* Modal Thêm Nhật Ký */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Thêm nhật ký khắc phục
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Chọn cảnh báo (Alert) *</InputLabel>
              <Select
                value={formData.alertId}
                label="Chọn cảnh báo (Alert) *"
                onChange={(e) => handleFormChange("alertId", e.target.value)}
                disabled={loadingAlerts}
              >
                {loadingAlerts ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                  </MenuItem>
                ) : alertsList.length === 0 ? (
                  <MenuItem disabled>Không có cảnh báo nào</MenuItem>
                ) : (
                  alertsList.map((alert) => (
                    <MenuItem key={alert.id} value={alert.id}>
                      {alert.fishTankName} - {alert.sensorTypeName} (
                      {dayjs(alert.raisedAt).format("DD/MM HH:mm")})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              label="Hành động đã thực hiện *"
              placeholder="VD: Đã thay màng lọc, vệ sinh cảm biến..."
              fullWidth
              multiline
              rows={3}
              value={formData.actionTaken}
              onChange={(e) => handleFormChange("actionTaken", e.target.value)}
            />

            <TextField
              label="Ghi chú thêm (Không bắt buộc)"
              placeholder="Nhập nguyên nhân hoặc lưu ý..."
              fullWidth
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseModal}
            color="inherit"
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Lưu nhật ký"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Component SummaryCard
interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorType: "primary" | "success" | "warning" | "info" | "error";
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  colorType,
}) => {
  const theme = useTheme();
  const colorMain = (theme.palette[colorType] as PaletteColor).main;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
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
          sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          bgcolor: alpha(colorMain, 0.1),
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

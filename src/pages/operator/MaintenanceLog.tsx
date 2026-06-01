import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
  IconButton,
  Tooltip,
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { useToast } from "../../components/common/toastContext";
import { useCorrectiveActions } from "../../hooks/useCorrectiveActions";
import { correctiveActionApi } from "../../api/correctiveActions";
import { apiFetch, isApiError } from "../../api/client";
// Bạn cần import interface này từ file types của bạn để tránh dùng 'any'
import type { ICorrectiveAction } from "../../types/corrective-action";

interface IAlertOption {
  id: string;
  sensorTypeName: string;
  fishTankName: string;
  raisedAt: string;
  hasCorrectiveAction: boolean;
  status: string;
}

const MaintenanceLog: React.FC = () => {
  const theme = useTheme();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Lấy danh sách Nhật ký
  const { data: logs, loading, error, refetch } = useCorrectiveActions();

  // 2. State quản lý danh sách Cảnh báo
  const [alertsList, setAlertsList] = useState<IAlertOption[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    const fetchAllAlerts = async () => {
      setLoadingAlerts(true);
      try {
        const res = await apiFetch<unknown>("/alerts?page=1&pageSize=100", {
          method: "GET",
        });
        const resObj = res as { data?: IAlertOption[] };
        const alertsData = Array.isArray(res) ? res : resObj?.data || [];
        setAlertsList(alertsData as IAlertOption[]);
      } catch (err) {
        console.error("Lỗi khi tải danh sách cảnh báo:", err);
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchAllAlerts();
  }, []);

  // 3. Map để tra cứu tên cảnh báo
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

  // --- State cho Modal Thêm/Sửa Nhật Ký ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    alertId: "",
    actionTaken: "",
    notes: "",
  });

  // --- State cho Modal Xác nhận Xóa ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // LOGIC LỌC DROPDOWN: Chỉ hiện những Alert chưa có hành động khắc phục (hoặc alert đang được edit)
  const availableAlerts = useMemo(() => {
    return alertsList.filter((alert) => {
      // Nếu đang ở chế độ sửa, cho phép giữ lại Alert của bản ghi đang sửa
      if (
        isEditMode &&
        formData.alertId.toLowerCase() === alert.id.toLowerCase()
      ) {
        return true;
      }
      return !alert.hasCorrectiveAction && String(alert.status).toUpperCase() !== "DISMISSED";
    });
  }, [alertsList, isEditMode, formData.alertId]);

  // Auto-open create modal when navigated from AlertDetailModal
  const navState = location.state as { openCreate?: boolean; alertId?: string } | null;
  useEffect(() => {
    if (!navState?.openCreate || !navState.alertId) return;
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ alertId: navState.alertId, actionTaken: "", notes: "" });
    setIsModalOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [navState?.openCreate, navState?.alertId]);

  // Handlers mở modal Thêm/Sửa
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ alertId: "", actionTaken: "", notes: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: ICorrectiveAction) => {
    setIsEditMode(true);
    setEditingId(log.id);
    setFormData({
      alertId: log.alertId,
      actionTaken: log.actionTaken,
      notes: log.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ alertId: "", actionTaken: "", notes: "" });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit Form (Dùng chung cho cả Thêm và Sửa)
  const handleSubmit = async () => {
    if (!formData.alertId || !formData.actionTaken) {
      toast.error("Vui lòng điền đầy đủ Mã cảnh báo và Hành động khắc phục!");
      return;
    }

    setIsSubmitting(true);
    try {
      type UserProfileResponse = { id?: string; data?: { id?: string } };
      const userProfileRes = await apiFetch<UserProfileResponse>("/users/me", {
        method: "GET",
      });
      const currentUserId = userProfileRes?.id || userProfileRes?.data?.id;

      if (!currentUserId) {
        toast.error(
          "Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.",
        );
        return;
      }

      if (isEditMode && editingId) {
        // Cập nhật
        await correctiveActionApi.update(editingId, {
          alertId: formData.alertId,
          userId: currentUserId,
          actionTaken: formData.actionTaken,
          notes: formData.notes,
        });
      } else {
        // Thêm mới
        await correctiveActionApi.create({
          alertId: formData.alertId,
          userId: currentUserId,
          actionTaken: formData.actionTaken,
          notes: formData.notes,
        });
      }

      handleCloseModal();
      refetch();
      toast.success(
        isEditMode ? "Cập nhật nhật ký thành công" : "Thêm nhật ký thành công",
      );
    } catch (err: unknown) {
      console.error("Lỗi khi gửi form:", err);
      if (isApiError(err)) {
        const errorData = err.data as { message?: string };
        toast.error(errorData?.message || "Có lỗi xảy ra khi lưu nhật ký.");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Có lỗi xảy ra khi lưu nhật ký.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers mở modal Xóa
  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await correctiveActionApi.delete(deleteId);
      handleCloseDeleteConfirm();
      refetch();
      toast.success("Xóa nhật ký thành công");
    } catch (err: unknown) {
      console.error("Lỗi khi xóa:", err);
      toast.error("Có lỗi xảy ra khi xóa nhật ký.");
    } finally {
      setIsDeleting(false);
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal}
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

          {/* ... Summary Cards giữ nguyên ... */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
              mb: 4,
              justifyItems: "center",
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
                      "Thao tác",
                    ].map((head) => (
                      <TableCell
                        key={head}
                        align={head === "Thao tác" ? "center" : "left"}
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
                      <TableCell
                        sx={{
                          fontSize: "0.85rem",
                          maxWidth: 250,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {row.actionTaken}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "0.85rem",
                          maxWidth: 200,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {row.notes || "Không có ghi chú"}
                      </TableCell>

                      {/* CỘT THAO TÁC MỚI THÊM */}
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditModal(row)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteConfirm(row.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      </Box>

      {/* Modal Thêm/Sửa Nhật Ký */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {isEditMode ? "Cập nhật nhật ký khắc phục" : "Thêm nhật ký khắc phục"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Chọn cảnh báo (Alert) *</InputLabel>
              <Select
                value={formData.alertId}
                label="Chọn cảnh báo (Alert) *"
                onChange={(e) => handleFormChange("alertId", e.target.value)}
                disabled={loadingAlerts || isEditMode} // Không cho đổi Alert khi đang Edit
              >
                {loadingAlerts ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                  </MenuItem>
                ) : availableAlerts.length === 0 ? (
                  <MenuItem disabled>Không có cảnh báo nào chờ xử lý</MenuItem>
                ) : (
                  // Dùng mảng availableAlerts đã được lọc
                  availableAlerts.map((alert) => (
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

      {/* Modal Xác nhận Xóa */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle sx={{ fontWeight: 600 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Chị có chắc chắn muốn xóa nhật ký này không? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            color="inherit"
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Xóa"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Component SummaryCard (Giữ nguyên)
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

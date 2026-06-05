import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { isSupervisor } from "../../api/auth";
import { isApiError } from "../../api/client";
import { createOperator } from "../../api/users";
import type { Column } from "../../components/common/DataTable";
import DataTable from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import { useToast } from "../../components/common/toastContext";
import OperatorFormDialog from "../../components/supervisor/operators/OperatorFormDialog";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import useUserManagement from "../../hooks/useUserManagement";
import type { User } from "../../types/user";

// Hàm tạo màu Pastel ngẫu nhiên cho Avatar
const stringToPastelColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    const pastel = Math.floor((value + 255) / 2);
    color += `00${pastel.toString(16)}`.slice(-2);
  }
  return color;
};

const OperatorManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [openDisable, setOpenDisable] = useState(false);
  const [disablingId, setDisablingId] = useState<string | null>(null);
  const [openRestore, setOpenRestore] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const {
    tableParams,
    setTableParamsLocal,
    data,
    meta,
    loading,
    error,
    updateUrlWithParams,
    load,
    createOrUpdate,
    disable,
    restore,
  } = useUserManagement();

  const operatorsOnly = useMemo(() => {
    return data.filter(
      (user) =>
        user.role.toLowerCase() === "operator" ||
        user.role.toLowerCase() === "kỹ thuật viên",
    );
  }, [data]);

  const toast = useToast();

  React.useEffect(() => {
    // ĐÃ SỬA CHỖ NÀY: Gỡ bỏ logic tự động điền "Operator" vào thanh tìm kiếm
    // Để hệ thống load toàn bộ danh sách nhân viên mặc định
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setOpenForm(true);
  }, []);

  const openEdit = useCallback((user: User) => {
    setEditing(user);
    setOpenForm(true);
  }, []);

  const confirmDisable = useCallback((id: string) => {
    setDisablingId(id);
    setOpenDisable(true);
  }, []);

  const confirmRestore = useCallback((id: string) => {
    setRestoringId(id);
    setOpenRestore(true);
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          field: "name",
          label: "Nhân viên",
          sortable: true,
          sortKey: "lastName",
          render: (r: User) => {
            const userExt = r as User & {
              firstName?: string;
              lastName?: string;
            };
            const displayName =
              userExt.name ||
              `${userExt.firstName || ""} ${userExt.lastName || ""}`.trim() ||
              "Unknown";
            const initial = displayName.charAt(0).toUpperCase();

            return (
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: stringToPastelColor(displayName),
                    color: "#0F172A",
                    fontWeight: 600,
                    width: 40,
                    height: 40,
                  }}
                >
                  {initial}
                </Avatar>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#0F172A",
                      fontSize: "0.95rem",
                    }}
                  >
                    {displayName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    {r.email}
                  </Typography>
                </Box>
              </Stack>
            );
          },
        },
        {
          field: "role",
          label: "Vai trò",
          render: (r: User) => (
            <Typography
              variant="body2"
              sx={{ color: "#334155", fontWeight: 500 }}
            >
              {r.role || "Operator"}
            </Typography>
          ),
        },
        {
          field: "actions",
          label: "Hành động",
          render: (r: User) => (
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <IconButton
                size="small"
                onClick={() => openEdit(r)}
                sx={{
                  color: "#64748B",
                  "&:hover": { color: "#2A85FF", bgcolor: "#EFF6FF" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              {tableParams?.isDeleted ? (
                <IconButton
                  size="small"
                  onClick={() => confirmRestore(r.id)}
                  sx={{
                    color: "#64748B",
                    "&:hover": { color: "#10B981", bgcolor: "#ECFDF5" },
                  }}
                >
                  <RestoreFromTrashIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => confirmDisable(r.id)}
                  sx={{
                    color: "#64748B",
                    "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" },
                  }}
                >
                  <BlockIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ),
        },
      ] as Column<User>[],
    [openEdit, confirmDisable, confirmRestore, tableParams?.isDeleted],
  );

  if (!isSupervisor()) return <Navigate to="/" replace />;

  async function handleSave(values: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
  }) {
    try {
      if (!editing) {
        await createOperator(values);
      } else {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: editing?.role ?? "Operator",
          ...(values.password ? { password: values.password } : {}),
        };
        await createOrUpdate(
          editing?.id ?? null,
          payload,
          editing as User | null,
        );
      }
      setOpenForm(false);
      if (editing) toast.success("Cập nhật nhân viên thành công");
      else toast.success("Thêm nhân viên thành công");
    } catch (e: unknown) {
      if (
        isApiError(e) &&
        e.data &&
        (e.data as Record<string, unknown>).errors
      ) {
        throw e;
      }
      toast.error("Lưu nhân viên thất bại");
    }
  }

  async function handleDisable() {
    if (!disablingId) return;
    try {
      await disable(disablingId);
      setOpenDisable(false);
      toast.success("Vô hiệu hóa tài khoản thành công");
    } catch (e) {
      console.error("Vô hiệu hóa thất bại", e);
      toast.error("Vô hiệu hóa thất bại");
    }
  }

  async function handleRestoreConfirm() {
    if (!restoringId) return;
    try {
      await restore(restoringId);
      setOpenRestore(false);
      setRestoringId(null);
      toast.success("Khôi phục tài khoản thành công");
    } catch (e) {
      console.error("Khôi phục thất bại", e);
      toast.error("Khôi phục thất bại");
    }
  }

  const editingWithRaw = editing as
    | (User & { rawFirstName?: string; rawLastName?: string })
    | null;

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <SupervisorSidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <SupervisorHeader />

        <Box
          component="main"
          sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, width: "100%" }}
        >
          {/* HEADER */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
              >
                Quản lý nhân viên
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                Quản lý danh sách và quyền truy cập của các Kỹ thuật viên
                (Operator) vận hành hệ thống.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={load}
                disabled={loading}
                sx={{
                  borderRadius: "8px",
                  color: "#475569",
                  borderColor: "#CBD5E1",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#F1F5F9", borderColor: "#94A3B8" },
                }}
              >
                Làm mới
              </Button>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={openCreate}
                sx={{
                  borderRadius: "8px",
                  bgcolor: "#2A85FF",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1F6FDB" },
                }}
              >
                Thêm nhân viên
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Typography color="error" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* THANH CÔNG CỤ VÀ BẢNG */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
            }}
          >
            <TableToolbar
              searchPlaceholder="Tìm kiếm theo tên, vai trò ..." // ĐÃ THÊM: Câu Placeholder chuyên nghiệp
              searchTerm={String(tableParams.searchTerm ?? "")}
              onSearchTermChange={(v) => {
                setTableParamsLocal({
                  ...(tableParams ?? {}),
                  searchTerm: v,
                  page: 1,
                });
                updateUrlWithParams({ searchTerm: v, page: 1 });
              }}
              pageSize={tableParams.pageSize}
              onPageSizeChange={(n) => {
                setTableParamsLocal({
                  ...(tableParams ?? {}),
                  pageSize: n,
                  page: 1,
                });
                updateUrlWithParams({ pageSize: n, page: 1 });
              }}
              filters={
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(tableParams.isDeleted)}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setTableParamsLocal({
                          ...(tableParams ?? {}),
                          isDeleted: val,
                          page: 1,
                        });
                        updateUrlWithParams({ isDeleted: val, page: 1 });
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: "#475569", fontWeight: 500 }}
                    >
                      Hiển thị tài khoản vô hiệu hóa
                    </Typography>
                  }
                />
              }
            />

            <DataTable
              columns={columns}
              rows={operatorsOnly}
              sortBy={tableParams.sortBy as string | undefined}
              sortDir={tableParams.sortDir as "asc" | "desc" | undefined}
              onSort={(s, d) => {
                setTableParamsLocal({
                  ...(tableParams ?? {}),
                  sortBy: s,
                  sortDir: d,
                  page: 1,
                });
                updateUrlWithParams({ sortBy: s, sortDir: d, page: 1 });
              }}
            />

            <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
              <PaginationControls
                page={meta?.page ?? 1}
                totalPages={meta?.totalPages ?? 1}
                onPageChange={(p) => {
                  setTableParamsLocal({ ...(tableParams ?? {}), page: p });
                  updateUrlWithParams({ page: p });
                }}
              />
            </Box>
          </Paper>

          {/* DIALOGS */}
          <OperatorFormDialog
            key={openForm ? (editing?.id ?? "new") : "closed"}
            open={openForm}
            onClose={() => setOpenForm(false)}
            onSave={handleSave}
            initial={editing}
            initialFirstName={editingWithRaw?.rawFirstName ?? null}
            initialLastName={editingWithRaw?.rawLastName ?? null}
          />

          <Dialog
            open={openDisable}
            onClose={() => setOpenDisable(false)}
            PaperProps={{ sx: { borderRadius: "12px", p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
              Vô hiệu hóa tài khoản
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: "#475569" }}>
                Bạn có chắc chắn muốn vô hiệu hóa nhân viên này? Họ sẽ không thể
                đăng nhập vào hệ thống.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenDisable(false)}
                sx={{ color: "#64748B", fontWeight: 600 }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDisable}
                sx={{ borderRadius: "8px", fontWeight: 600, boxShadow: "none" }}
              >
                Vô hiệu hóa
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openRestore}
            onClose={() => setOpenRestore(false)}
            PaperProps={{ sx: { borderRadius: "12px", p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
              Khôi phục tài khoản
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: "#475569" }}>
                Bạn có chắc chắn muốn khôi phục quyền truy cập cho nhân viên
                này?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenRestore(false)}
                sx={{ color: "#64748B", fontWeight: 600 }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRestoreConfirm}
                sx={{ borderRadius: "8px", fontWeight: 600, boxShadow: "none" }}
              >
                Khôi phục
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorManagement;

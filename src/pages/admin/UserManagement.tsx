import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin, roles } from "../../api/auth";
import { isApiError } from "../../api/client";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserFormDialog from "../../components/admin/users/UserFormDialog";
import type { Column } from "../../components/common/DataTable";
import DataTable from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import { useToast } from "../../components/common/toastContext";
import useUserManagement from "../../hooks/useUserManagement";
import type { User } from "../../types/user";
import { translateRole } from "../../utils/roles";

// Hàm tạo màu Pastel ngẫu nhiên cho Avatar
const stringToPastelColor = (str: string) => {
  if (!str) return "#E2E8F0";
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    const pastel = Math.floor((value + 255) / 2);
    color += `00${pastel.toString(16)}`.slice(-2);
  }
  return color;
};

const UserManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    remove,
    disable,
    restore,
  } = useUserManagement();
  const toast = useToast();
  const [roleFilter, setRoleFilter] = useState<string | "">("");

  const openCreate = useCallback(() => {
    setEditing(null);
    setOpenForm(true);
  }, []);

  const openEdit = useCallback((user: User) => {
    setEditing(user);
    setOpenForm(true);
  }, []);

  const confirmDelete = useCallback((id: string) => {
    setDeletingId(id);
    setOpenDelete(true);
  }, []);

  const confirmDisable = useCallback((id: string) => {
    setDisablingId(id);
    setOpenDisable(true);
  }, []);

  const confirmRestore = useCallback((id: string) => {
    setRestoringId(id);
    setOpenRestore(true);
  }, []);

  // UI NÂNG CẤP: Gộp cột, Thêm Avatar, Thêm Chip Vai trò, Đổi màu Hover Hành động
  const columns = useMemo(
    () =>
      [
        {
          field: "name",
          label: "Người dùng",
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
              "Người dùng ẩn danh";
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
          sortable: true,
          sortKey: "roleName",
          render: (r: User) => {
            let bgcolor = "#ECFDF5";
            let color = "#10B981"; // Mặc định cho Operator

            if (r.role === "Admin") {
              bgcolor = "#F3E8FF";
              color = "#9333EA";
            } else if (r.role === "Supervisor") {
              bgcolor = "#EFF6FF";
              color = "#2A85FF";
            }

            return (
              <Chip
                label={translateRole(r.role)}
                size="small"
                sx={{
                  bgcolor,
                  color,
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                }}
              />
            );
          },
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
                  color: "#94A3B8",
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
                    color: "#94A3B8",
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
                    color: "#94A3B8",
                    "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" },
                  }}
                >
                  <BlockIcon fontSize="small" />
                </IconButton>
              )}

              <IconButton
                size="small"
                onClick={() => confirmDelete(r.id)}
                sx={{
                  color: "#94A3B8",
                  "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ),
        },
      ] as Column<User>[],
    [
      openEdit,
      confirmDelete,
      confirmDisable,
      confirmRestore,
      tableParams?.isDeleted,
    ],
  );

  const displayed = React.useMemo(() => {
    if (!roleFilter) return data;
    return (data || []).filter((u) => u.role === roleFilter);
  }, [data, roleFilter]);

  if (!isAdmin()) return <Navigate to="/" replace />;

  async function handleSave(values: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password?: string;
  }) {
    try {
      await createOrUpdate(editing?.id ?? null, values, editing as User | null);
      setOpenForm(false);
      if (editing) toast.success("Cập nhật người dùng thành công");
      else toast.success("Tạo người dùng thành công");
    } catch (e: unknown) {
      if (
        isApiError(e) &&
        e.data &&
        (e.data as Record<string, unknown>).errors
      ) {
        throw e;
      }
      toast.error("Lưu người dùng thất bại");
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await remove(deletingId);
      setOpenDelete(false);
      toast.success("Xóa người dùng thành công");
    } catch (e) {
      console.error("Xóa người dùng thất bại", e);
      toast.error("Xóa người dùng thất bại");
    }
  }

  async function handleDisable() {
    if (!disablingId) return;
    try {
      await disable(disablingId);
      setOpenDisable(false);
      toast.success("Vô hiệu hóa người dùng thành công");
    } catch (e) {
      console.error("Vô hiệu hóa người dùng thất bại", e);
      toast.error("Vô hiệu hóa người dùng thất bại");
    }
  }

  async function handleRestoreConfirm() {
    if (!restoringId) return;
    try {
      await restore(restoringId);
      setOpenRestore(false);
      setRestoringId(null);
      toast.success("Khôi phục người dùng thành công");
    } catch (e) {
      console.error("Khôi phục người dùng thất bại", e);
      toast.error("Khôi phục người dùng thất bại");
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
      <AdminSidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AdminHeader />

        <Box
          component="main"
          sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, width: "100%" }}
        >
          {/* HEADER KHU VỰC NỘI DUNG */}
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
                Quản lý người dùng
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Quản lý tài khoản, vai trò và thiết lập lại mật khẩu.
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
                Thêm người dùng
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Typography color="error" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* KHỐI QUẢN LÝ DỮ LIỆU (MAIN PAPER) */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
              bgcolor: "#FFFFFF",
            }}
          >
            {/* THANH CÔNG CỤ (TOOLBAR) */}
            <TableToolbar
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
                <Stack direction="row" alignItems="center" spacing={2}>
                  {/* Chuyển Checkbox sang Switch cho hiện đại */}
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
                        Đã vô hiệu hóa
                      </Typography>
                    }
                  />

                  <TextField
                    size="small"
                    select
                    value={roleFilter}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRoleFilter(v as string);
                      setTableParamsLocal({ ...(tableParams ?? {}), page: 1 });
                      updateUrlWithParams({ page: 1 });
                    }}
                    sx={{
                      minWidth: 160,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#F8FAFC",
                      },
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (val) =>
                        val ? (
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: "#334155" }}
                          >
                            {translateRole(val as string)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                            Tất cả vai trò
                          </Typography>
                        ),
                    }}
                  >
                    <MenuItem value="">Tất cả vai trò</MenuItem>
                    {roles.map((r) => (
                      <MenuItem key={r} value={r}>
                        {translateRole(r)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              }
            />

            {/* BẢNG DỮ LIỆU */}
            <DataTable
              columns={columns}
              rows={displayed}
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

            {/* PHÂN TRANG (PAGINATION) */}
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

          {/* DIALOGS GIỮ NGUYÊN */}
          <UserFormDialog
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
              Vô hiệu hóa người dùng
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: "#475569" }}>
                Bạn có chắc chắn muốn vô hiệu hóa người dùng này? Họ sẽ không
                thể đăng nhập vào hệ thống.
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
                color="warning"
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
              Khôi phục người dùng
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: "#475569" }}>
                Bạn có chắc chắn muốn khôi phục người dùng này?
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

          <Dialog
            open={openDelete}
            onClose={() => setOpenDelete(false)}
            PaperProps={{ sx: { borderRadius: "12px", p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
              Xóa người dùng
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: "#475569" }}>
                Bạn có chắc chắn muốn xóa người dùng này khỏi hệ thống? Hành
                động này không thể hoàn tác.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenDelete(false)}
                sx={{ color: "#64748B", fontWeight: 600 }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                sx={{ borderRadius: "8px", fontWeight: 600, boxShadow: "none" }}
              >
                Xóa
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default UserManagement;

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Navigate } from "react-router-dom";
import { isAdmin, roles } from "../../api/auth";
import type { User } from "../../api/users";
import { createUser, deleteUser, resetPassword, toUiUser, updateUser } from "../../api/users";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { Column } from "../../components/common/DataTable";
import DataTable from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import useTableData from "../../hooks/useTableData";
import type { TableParams } from "../../types/table";

function translateRole(r: string) {
  switch (r) {
    case "Admin":
      return "Quản trị viên";
    case "Supervisor":
      return "Quản lý";
    case "Operator":
      return "Kỹ thuật viên";
    default:
      return r;
  }
}

const UserManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function parseSearchParams(): TableParams {
    const p: TableParams = {};
    const sp = searchParams;
    const page = sp.get("page");
    const pageSize = sp.get("pageSize");
    const q = sp.get("q");
    const sortBy = sp.get("sortBy");
    const sortDir = sp.get("sortDir");
    if (page) p.page = Number(page);
    if (pageSize) p.pageSize = Number(pageSize);
    if (q) p.q = q;
    if (sortBy) p.sortBy = sortBy;
    if (sortDir) p.sortDir = sortDir as TableParams["sortDir"];
    return p;
  }

  const initialParams = useMemo(
    () => ({ page: 1, pageSize: 10, ...parseSearchParams() }), // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString()],
  );

  const [tableParams, setTableParamsLocal] = useState<TableParams>(initialParams);

  const { rows, meta, loading: hookLoading, error: hookError, reload } = useTableData<Record<string, unknown>>("/users", tableParams);
  const data = (rows ?? []).map((r) => toUiUser(r));
  useEffect(() => {
    if (hookError) setError(hookError);
    // keep local loading state in sync
    setLoading(hookLoading);
  }, [hookError, hookLoading]);

  useEffect(() => {
    // keep page params in sync when URL changes (back/forward/shareable links)
    const fromUrl = parseSearchParams();
    // shallow compare
    const same =
      JSON.stringify({ page: tableParams.page, pageSize: tableParams.pageSize, q: tableParams.q, sortBy: tableParams.sortBy, sortDir: tableParams.sortDir }) ===
      JSON.stringify({ page: fromUrl.page, pageSize: fromUrl.pageSize, q: fromUrl.q, sortBy: fromUrl.sortBy, sortDir: fromUrl.sortDir });
    if (!same) {
      setTableParamsLocal(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function updateUrlWithParams(next: Partial<TableParams>) {
    const merged: TableParams = { ...(tableParams ?? {}), ...next };
    const sp = new URLSearchParams();
    if (merged.page !== undefined) sp.set("page", String(merged.page));
    if (merged.pageSize !== undefined) sp.set("pageSize", String(merged.pageSize));
    if (merged.q !== undefined && merged.q !== "") sp.set("q", String(merged.q));
    if (merged.sortBy !== undefined) sp.set("sortBy", String(merged.sortBy));
    if (merged.sortDir !== undefined) sp.set("sortDir", String(merged.sortDir));
    setSearchParams(sp, { replace: true });
  }
  if (!isAdmin()) return <Navigate to="/" replace />;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      await reload();
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setOpenForm(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setOpenForm(true);
  }

  async function handleSave(values: { firstName: string; lastName: string; email: string; role: string; password?: string }) {
    setLoading(true);
    try {
      if (editing) {
        await updateUser(editing.id, values as Partial<{ firstName: string; lastName: string; email: string; role: string; password?: string }>);
      } else {
        await createUser(values as { firstName: string; lastName: string; email: string; role: string; password: string });
      }
      await load();
      setOpenForm(false);
    } catch {
      setError("Save failed");
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setOpenDelete(true);
  }

  async function handleDelete() {
    if (!deletingId) return;
    setLoading(true);
    try {
      await deleteUser(deletingId);
      await load();
      setOpenDelete(false);
    } catch {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(id: string) {
    setLoading(true);
    try {
      await resetPassword(id);
      // In a real app we'd notify the user; here it's mocked
      await load();
    } catch {
      setError("Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <div>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Quản lý người dùng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý tài khoản, vai trò và đặt lại mật khẩu.
              </Typography>
            </div>

            <Stack direction="row" spacing={1}>
              <Button startIcon={<RefreshIcon />} variant="outlined" onClick={load} disabled={loading}>
                Làm mới
              </Button>
              <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
                Thêm người dùng
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Typography color="error" sx={{ mt: 1, mb: 1 }}>
              {error}
            </Typography>
          )}

          <Paper sx={{ p: 2 }}>
            <TableToolbar
              q={String(tableParams.q ?? "")}
              onQChange={(v) => {
                setTableParamsLocal({ ...(tableParams ?? {}), q: v, page: 1 });
                updateUrlWithParams({ q: v, page: 1 });
              }}
              pageSize={tableParams.pageSize}
              onPageSizeChange={(n) => {
                setTableParamsLocal({ ...(tableParams ?? {}), pageSize: n, page: 1 });
                updateUrlWithParams({ pageSize: n, page: 1 });
              }}
            />

            <DataTable
              columns={
                [
                  { field: "name", label: "Họ và tên" },
                  { field: "email", label: "Email" },
                  { field: "role", label: "Vai trò", render: (r: User) => translateRole(r.role) },
                  {
                    field: "actions",
                    label: "Hành động",
                    render: (r) => (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => openEdit(r as User)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleReset((r as User).id)}>
                          <RefreshIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => confirmDelete((r as User).id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ),
                  },
                ] as Column<User>[]
              }
              rows={data}
            />

            <PaginationControls
              page={meta?.page ?? 1}
              totalPages={meta?.totalPages ?? 1}
              onPageChange={(p) => {
                setTableParamsLocal({ ...(tableParams ?? {}), page: p });
                updateUrlWithParams({ page: p });
              }}
            />
          </Paper>

          <UserFormDialog key={openForm ? (editing?.id ?? "new") : "closed"} open={openForm} onClose={() => setOpenForm(false)} onSave={handleSave} initial={editing} />

          <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
            <DialogTitle>Xóa người dùng</DialogTitle>
            <DialogContent>Bạn có chắc chắn muốn xóa người dùng này?</DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
              <Button color="error" onClick={handleDelete}>
                Xóa
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

const UserFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: { firstName: string; lastName: string; email: string; role: string; password?: string }) => void;
  initial: User | null;
}> = ({ open, onClose, onSave, initial }) => {
  const parts = (initial?.name || "").trim().split(/\s+/);
  const inferredFirst = parts.length ? parts[parts.length - 1] : "";
  const inferredLast = parts.length > 1 ? parts.slice(0, parts.length - 1).join(" ") : "";
  const [firstName, setFirstName] = useState(inferredFirst);
  const [lastName, setLastName] = useState(inferredLast);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<string>(initial?.role ?? "Operator");

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? "Chỉnh sửa người dùng" : "Thêm người dùng"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField label="Họ" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
            <TextField label="Tên" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
          </Stack>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth helperText={initial ? "Để trống nếu không đổi" : undefined} />
          <TextField select label="Vai trò" value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {translateRole(r)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={() => onSave({ firstName, lastName, email, role, password: password || undefined })}
          variant="contained"
          disabled={!firstName || !lastName || !email || (!initial && !password)}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserManagement;

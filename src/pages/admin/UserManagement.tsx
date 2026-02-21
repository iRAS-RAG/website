import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Navigate } from "react-router-dom";
import { isAdmin } from "../../api/auth";
import { isApiError } from "../../api/client";
import type { User } from "../../api/users";
import { createUser, deleteUser, toUiUser, updateUser } from "../../api/users";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserFormDialog from "../../components/admin/UserFormDialog";
import type { Column } from "../../components/common/DataTable";
import DataTable from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import useTableData from "../../hooks/useTableData";
import type { TableParams } from "../../types/table";
import { translateRole } from "../../utils/roles";

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
    } catch (e: unknown) {
      // If API returned validation errors, rethrow so the form can display them
      if (isApiError(e) && e.data && (e.data as Record<string, unknown>).errors) {
        throw e;
      }
      setError((isApiError(e) && e.message) || "Save failed");
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
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => openEdit(r as User)}>
                          <EditIcon />
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

export default UserManagement;

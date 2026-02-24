import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Stack, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../../api/auth";
import { isApiError } from "../../api/client";
import type { User } from "../../api/users";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import UserFormDialog from "../../components/admin/users/UserFormDialog";
import type { Column } from "../../components/common/DataTable";
import DataTable from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import useUserManagement from "../../hooks/useUserManagement";
import { translateRole } from "../../utils/roles";

const UserManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { tableParams, setTableParamsLocal, data, meta, loading, error, updateUrlWithParams, load, createOrUpdate, remove } = useUserManagement();

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

  const columns = useMemo(
    () =>
      [
        { field: "name", label: "Họ và tên", sortable: true, sortKey: "lastName" },
        { field: "email", label: "Email", sortable: true, sortKey: "email" },
        { field: "role", label: "Vai trò", sortable: true, sortKey: "roleName", render: (r: User) => translateRole(r.role) },
        {
          field: "actions",
          label: "Hành động",
          render: (r: User) => (
            <Stack direction="row" spacing={1}>
              <IconButton size="small" aria-label="edit-user" onClick={() => openEdit(r)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" aria-label="delete-user" onClick={() => confirmDelete(r.id)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ),
        },
      ] as Column<User>[],
    [openEdit, confirmDelete],
  );

  if (!isAdmin()) return <Navigate to="/" replace />;

  async function handleSave(values: { firstName: string; lastName: string; email: string; role: string; password?: string }) {
    try {
      await createOrUpdate(editing?.id ?? null, values);
      setOpenForm(false);
    } catch (e: unknown) {
      if (isApiError(e) && e.data && (e.data as Record<string, unknown>).errors) {
        throw e;
      }
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await remove(deletingId);
      setOpenDelete(false);
    } catch (e) {
      console.error("Xóa người dùng thất bại", e);
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
              searchTerm={String(tableParams.searchTerm ?? "")}
              onSearchTermChange={(v) => {
                setTableParamsLocal({ ...(tableParams ?? {}), searchTerm: v, page: 1 });
                updateUrlWithParams({ searchTerm: v, page: 1 });
              }}
              pageSize={tableParams.pageSize}
              onPageSizeChange={(n) => {
                setTableParamsLocal({ ...(tableParams ?? {}), pageSize: n, page: 1 });
                updateUrlWithParams({ pageSize: n, page: 1 });
              }}
              filters={
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(tableParams.isDeleted)}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setTableParamsLocal({ ...(tableParams ?? {}), isDeleted: val, page: 1 });
                        updateUrlWithParams({ isDeleted: val, page: 1 });
                      }}
                      size="small"
                    />
                  }
                  label="Đã xóa"
                />
              }
            />

            <DataTable
              columns={columns}
              rows={data}
              sortBy={tableParams.sortBy as string | undefined}
              sortDir={tableParams.sortDir as "asc" | "desc" | undefined}
              onSort={(s, d) => {
                setTableParamsLocal({ ...(tableParams ?? {}), sortBy: s, sortDir: d, page: 1 });
                updateUrlWithParams({ sortBy: s, sortDir: d, page: 1 });
              }}
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

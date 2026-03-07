import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Stack, Typography } from "@mui/material";
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

const OperatorManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [openDisable, setOpenDisable] = useState(false);
  const [disablingId, setDisablingId] = useState<string | null>(null);
  const [openRestore, setOpenRestore] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const { tableParams, setTableParamsLocal, data, meta, loading, error, updateUrlWithParams, load, createOrUpdate, disable, restore } = useUserManagement();
  const toast = useToast();

  // Ensure this page filters to operators by default
  React.useEffect(() => {
    if (tableParams?.searchTerm !== "Operator") {
      setTableParamsLocal({ ...(tableParams ?? {}), searchTerm: "Operator", page: 1 });
      updateUrlWithParams({ searchTerm: "Operator", page: 1 });
    }
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          label: (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <PersonIcon fontSize="small" />
              Họ và tên
            </span>
          ),
          sortable: true,
          sortKey: "lastName",
        },
        {
          field: "email",
          label: (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <EmailIcon fontSize="small" />
              Email
            </span>
          ),
          sortable: true,
          sortKey: "email",
        },
        {
          field: "actions",
          label: (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MoreHorizIcon fontSize="small" />
              Hành động
            </span>
          ),
          render: (r: User) => (
            <Stack direction="row" spacing={1}>
              <IconButton size="small" aria-label="edit-user" onClick={() => openEdit(r)}>
                <EditIcon />
              </IconButton>
              {tableParams?.isDeleted ? (
                <IconButton size="small" aria-label="restore-user" onClick={() => confirmRestore(r.id)}>
                  <RestoreFromTrashIcon />
                </IconButton>
              ) : (
                <IconButton size="small" aria-label="disable-user" onClick={() => confirmDisable(r.id)}>
                  <BlockIcon />
                </IconButton>
              )}
            </Stack>
          ),
        },
      ] as Column<User>[],

    [openEdit, confirmDisable, confirmRestore, tableParams?.isDeleted],
  );

  if (!isSupervisor()) return <Navigate to="/" replace />;

  async function handleSave(values: { firstName: string; lastName: string; email: string; password?: string }) {
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
        await createOrUpdate(editing?.id ?? null, payload, editing as User | null);
      }
      setOpenForm(false);
      if (editing) toast.success("Cập nhật người dùng thành công");
      else toast.success("Tạo người dùng thành công");
    } catch (e: unknown) {
      if (isApiError(e) && e.data && (e.data as Record<string, unknown>).errors) {
        throw e;
      }
      toast.error("Lưu người dùng thất bại");
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

  const editingWithRaw = editing as (User & { rawFirstName?: string; rawLastName?: string }) | null;

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <SupervisorSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <SupervisorHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <div>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Quản lý nhân viên
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý tài khoản operator và đặt lại mật khẩu.
              </Typography>
            </div>

            <Stack direction="row" spacing={1}>
              <Button startIcon={<RefreshIcon />} variant="outlined" onClick={load} disabled={loading}>
                Làm mới
              </Button>
              <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
                Thêm nhân viên
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
                <>
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
                    label="Đã vô hiệu hóa"
                  />
                </>
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

          <OperatorFormDialog
            key={openForm ? (editing?.id ?? "new") : "closed"}
            open={openForm}
            onClose={() => setOpenForm(false)}
            onSave={handleSave}
            initial={editing}
            initialFirstName={editingWithRaw?.rawFirstName ?? null}
            initialLastName={editingWithRaw?.rawLastName ?? null}
          />

          <Dialog open={openDisable} onClose={() => setOpenDisable(false)}>
            <DialogTitle>Vô hiệu hóa người dùng</DialogTitle>
            <DialogContent>Bạn có chắc chắn muốn vô hiệu hóa người dùng này?</DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDisable(false)}>Hủy</Button>
              <Button color="warning" onClick={handleDisable}>
                Vô hiệu hóa
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openRestore} onClose={() => setOpenRestore(false)}>
            <DialogTitle>Khôi phục người dùng</DialogTitle>
            <DialogContent>Bạn có chắc chắn muốn khôi phục người dùng này?</DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRestore(false)}>Hủy</Button>
              <Button color="primary" onClick={handleRestoreConfirm}>
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

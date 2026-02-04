import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";
import { isAdmin, roles } from "../../api/auth";
import type { User } from "../../api/users";
import { createUser, deleteUser, fetchUsers, resetPassword, updateUser } from "../../api/users";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

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
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  if (!isAdmin()) return <Navigate to="/" replace />;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const users = await fetchUsers();
      setData(users);
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
        await createUser(values as { firstName: string; lastName: string; email: string; role: string; password?: string });
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

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Họ và tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{translateRole(u.role)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => openEdit(u)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleReset(u.id)}>
                            <RefreshIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(u.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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

import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import type { Role } from "../../../api/auth";
import { roles } from "../../../api/auth";
import type { ApiError } from "../../../api/client";
import type { User } from "../../../types/user";
import { translateRole } from "../../../utils/roles";

const UserFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password?: string;
  }) => Promise<void>;
  initial: User | null;
  initialFirstName?: string | null;
  initialLastName?: string | null;
}> = ({
  open,
  onClose,
  onSave,
  initial,
  initialFirstName = null,
  initialLastName = null,
}) => {
  const parts = (initial?.name || "").trim().split(/\s+/);
  const inferredFirst =
    initialFirstName ?? (parts.length ? parts[parts.length - 1] : "");
  const inferredLast =
    initialLastName ??
    (parts.length > 1 ? parts.slice(0, parts.length - 1).join(" ") : "");
  const [firstName, setFirstName] = useState(inferredFirst);
  const [lastName, setLastName] = useState(inferredLast);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<string>(initial?.role ?? "Operator");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {initial ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      </DialogTitle>
      <DialogContent>
        {formError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {formError}
          </Typography>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <PersonIcon fontSize="small" />
                  Họ
                </span>
              }
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              error={Boolean(fieldErrors.lastName)}
              helperText={fieldErrors.lastName}
            />
            <TextField
              label={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <PersonIcon fontSize="small" />
                  Tên
                </span>
              }
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              error={Boolean(fieldErrors.firstName)}
              helperText={fieldErrors.firstName}
            />
          </Stack>
          <TextField
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <EmailIcon fontSize="small" />
                Email
              </span>
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
          />
          <TextField
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <LockIcon fontSize="small" />
                Mật khẩu
              </span>
            }
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            helperText={
              fieldErrors.password ??
              (initial ? "Để trống nếu không đổi" : undefined)
            }
            error={Boolean(fieldErrors.password)}
          />
          <TextField
            select
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <BadgeIcon fontSize="small" />
                Vai trò
              </span>
            }
            value={role}
            onChange={(e) => setRole(e.target.value)}
            error={Boolean(fieldErrors.role)}
          >
            {roles.map((r: Role) => (
              <MenuItem key={r} value={r}>
                {translateRole(r)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Hủy
        </Button>
        <Button
          onClick={async () => {
            setSaving(true);
            setFormError(null);
            setFieldErrors({});
            try {
              await onSave({
                firstName,
                lastName,
                email,
                role,
                password: password || undefined,
              });
            } catch (e) {
              const err = e as ApiError;
              if (err && err.data) {
                const data = err.data as Record<string, unknown>;

                // Xử lý lỗi 400 (Validation Form từ DTO)
                if (data.errors) {
                  const errs = data.errors as Record<string, string[]>;
                  const mapped: Record<string, string> = {};

                  for (const k of Object.keys(errs)) {
                    const key = k.toLowerCase();
                    const rawMsg = errs[k].join(" ");

                    // Dịch sang Tiếng Việt
                    let vnMsg = rawMsg;
                    if (
                      rawMsg.toLowerCase().includes("exist") ||
                      rawMsg.toLowerCase().includes("taken")
                    )
                      vnMsg = "Đã tồn tại trong hệ thống";
                    else if (
                      rawMsg.toLowerCase().includes("format") ||
                      rawMsg.toLowerCase().includes("invalid")
                    )
                      vnMsg = "Định dạng không hợp lệ";
                    else if (rawMsg.toLowerCase().includes("required"))
                      vnMsg = "Trường này là bắt buộc";
                    else if (rawMsg.toLowerCase().includes("password"))
                      vnMsg = "Mật khẩu không hợp lệ";

                    if (key.includes("password")) mapped.password = vnMsg;
                    else if (key.includes("first")) mapped.firstName = vnMsg;
                    else if (key.includes("last")) mapped.lastName = vnMsg;
                    else if (key.includes("email")) mapped.email = vnMsg;
                    else if (key.includes("role")) mapped.role = vnMsg;
                    else mapped[k] = vnMsg;
                  }
                  setFieldErrors(mapped);
                }
                // Xử lý lỗi 409 (Conflict - Ví dụ: Email đã được sử dụng)
                else if (data.message) {
                  const msg = String(data.message);
                  if (
                    msg.toLowerCase().includes("email") ||
                    msg.toLowerCase().includes("exist") ||
                    msg.toLowerCase().includes("taken")
                  ) {
                    setFieldErrors({
                      email: "Email này đã tồn tại trong hệ thống",
                    });
                  } else {
                    setFormError(msg);
                  }
                } else {
                  setFormError("Lưu thất bại.");
                }
              } else {
                setFormError("Lưu thất bại.");
              }
            } finally {
              setSaving(false);
            }
          }}
          variant="contained"
          disabled={
            !firstName ||
            !lastName ||
            !email ||
            (!initial && !password) ||
            saving
          }
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;

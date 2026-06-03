import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { ControlDeviceType } from "../../../types/control-device-type";
import type { SensorType, SensorTypeCreate } from "../../../types/sensor-type";

// Cấu hình UI chung cho ô nhập liệu
const textFieldProps = {
  fullWidth: true,
  InputProps: { sx: { borderRadius: "8px" } },
};

export function SensorTypeDialog(props: {
  open: boolean;
  onClose: () => void;
  initial?: SensorType | null;
  onCreate?: (payload: SensorTypeCreate) => Promise<SensorType>;
  onUpdate?: (
    id: string,
    payload: Partial<SensorTypeCreate>,
  ) => Promise<SensorType | null>;
  onCreated?: (created: SensorType) => void;
  existingNames?: string[]; // <--- BỔ SUNG DÒNG NÀY
}) {
  const { open, onClose, initial, onCreate, onUpdate, onCreated } = props;
  const [name, setName] = useState("");
  const [measureType, setMeasureType] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial && onUpdate);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setMeasureType(initial?.measureType ?? "");
    setUnitOfMeasure(
      (initial as unknown as Record<string, string>)?.unitOfMeasure ?? "",
    );
    setCode(initial?.code ?? "");
  }, [open, initial]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
        {isEdit ? "Chỉnh sửa loại cảm biến" : "Thêm loại cảm biến"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            {...textFieldProps}
            label="Tên loại"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            {...textFieldProps}
            label="Loại đo"
            value={measureType}
            onChange={(e) => setMeasureType(e.target.value)}
          />
          <TextField
            {...textFieldProps}
            label="Đơn vị"
            value={unitOfMeasure}
            onChange={(e) => setUnitOfMeasure(e.target.value)}
          />
          <TextField
            {...textFieldProps}
            label="Mã code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ color: "#64748B", fontWeight: 600, textTransform: "none" }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={!name || !code || saving}
          sx={{
            borderRadius: "8px",
            fontWeight: 600,
            boxShadow: "none",
            textTransform: "none",
            bgcolor: "#2A85FF",
          }}
          onClick={async () => {
            setSaving(true);
            try {
              if (isEdit && initial && onUpdate) {
                await onUpdate(initial.id, {
                  name,
                  measureType,
                  unitOfMeasure,
                  code,
                });
                onClose();
              } else if (onCreate) {
                const created = await onCreate({
                  name,
                  measureType,
                  unitOfMeasure,
                  code,
                });
                if (onCreated) onCreated(created);
                onClose();
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ControlDeviceTypeDialog(props: {
  open: boolean;
  onClose: () => void;
  initial?: ControlDeviceType | null;
  onCreate?: (payload: {
    name: string;
    description?: string;
  }) => Promise<ControlDeviceType>;
  onUpdate?: (
    id: string,
    payload: Partial<{ name: string; description?: string }>,
  ) => Promise<ControlDeviceType | null>;
  onCreated?: (created: ControlDeviceType) => void;
  existingNames?: string[]; // <--- BỔ SUNG DÒNG NÀY
}) {
  const { open, onClose, initial, onCreate, onUpdate, onCreated } = props;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial && onUpdate);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
  }, [open, initial]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
        {isEdit ? "Chỉnh sửa loại thiết bị" : "Thêm loại thiết bị"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            {...textFieldProps}
            label="Tên loại"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            {...textFieldProps}
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ color: "#64748B", fontWeight: 600, textTransform: "none" }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={!name || saving}
          sx={{
            borderRadius: "8px",
            fontWeight: 600,
            boxShadow: "none",
            textTransform: "none",
            bgcolor: "#2A85FF",
          }}
          onClick={async () => {
            setSaving(true);
            try {
              if (isEdit && initial && onUpdate) {
                // FIX: Gửi thẳng description thay vì || undefined
                await onUpdate(initial.id, { name, description });
                onClose();
              } else if (onCreate) {
                // FIX: Gửi thẳng description thay vì || undefined
                const created = await onCreate({ name, description });
                if (onCreated) onCreated(created);
                onClose();
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default {};

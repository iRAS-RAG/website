import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import type { ControlDeviceType } from "../../../types/control-device-type";
import type { SensorType, SensorTypeCreate } from "../../../types/sensor-type";

export function SensorTypeDialog(props: {
  open: boolean;
  onClose: () => void;
  initial?: SensorType | null;
  onCreate?: (payload: SensorTypeCreate) => Promise<SensorType>;
  onUpdate?: (id: string, payload: Partial<SensorTypeCreate>) => Promise<SensorType | null>;
  onCreated?: (created: SensorType) => void;
}) {
  const { open, onClose, initial, onCreate, onUpdate, onCreated } = props;
  const [name, setName] = useState("");
  const [measureType, setMeasureType] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial && onUpdate);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setMeasureType(initial?.measureType ?? "");
    setUnitOfMeasure((initial as any)?.unitOfMeasure ?? "");
  }, [open, initial]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Chỉnh sửa loại cảm biến" : "Thêm loại cảm biến"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên loại" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
          <TextField label="Loại đo" value={measureType} onChange={(e) => setMeasureType(e.target.value)} fullWidth />
          <TextField label="Đơn vị" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={!name || saving}
          onClick={async () => {
            setSaving(true);
            try {
              if (isEdit && initial && onUpdate) {
                await onUpdate(initial.id, { name, measureType: measureType || undefined, unitOfMeasure: unitOfMeasure || undefined });
                onClose();
              } else if (onCreate) {
                const created = await onCreate({ name, measureType: measureType || undefined, unitOfMeasure: unitOfMeasure || undefined });
                if (onCreated) onCreated(created);
                onClose();
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ControlDeviceTypeDialog(props: {
  open: boolean;
  onClose: () => void;
  initial?: ControlDeviceType | null;
  onCreate?: (payload: { name: string; description?: string }) => Promise<ControlDeviceType>;
  onUpdate?: (id: string, payload: Partial<{ name: string; description?: string }>) => Promise<ControlDeviceType | null>;
  onCreated?: (created: ControlDeviceType) => void;
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Chỉnh sửa loại thiết bị" : "Thêm loại thiết bị"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên loại" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus />
          <TextField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={!name || saving}
          onClick={async () => {
            setSaving(true);
            try {
              if (isEdit && initial && onUpdate) {
                await onUpdate(initial.id, { name, description: description || undefined });
                onClose();
              } else if (onCreate) {
                const created = await onCreate({ name, description: description || undefined });
                if (onCreated) onCreated(created);
                onClose();
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default null as any;

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { ApiError } from "../../../api/client";
import * as hardwareApi from "../../../api/hardware";
import type { Sensor } from "../../../types/hardware";

const SensorFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: { name: string; pinCode?: number; sensorTypeId?: string | null; masterBoardId?: string | null }) => Promise<void>;
  initial: Sensor | null;
}> = ({ open, onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [pinCode, setPinCode] = useState(initial?.pinCode != null ? String(initial.pinCode) : "");
  const [sensorTypeId, setSensorTypeId] = useState<string | null>(null);
  const [masterBoardId, setMasterBoardId] = useState<string | null>(null);
  const [sensorTypes, setSensorTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [masterBoards, setMasterBoards] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sts = await hardwareApi.getSensorTypes();
        const mbs = await hardwareApi.getMasterBoards();
        if (!mounted) return;
        setSensorTypes(sts.map((s) => ({ id: s.id, name: s.name })));
        setMasterBoards(mbs.map((m) => ({ id: m.id, name: m.name })));
        if (initial) {
          setSensorTypeId(undefined as unknown as string | null);
          setMasterBoardId(undefined as unknown as string | null);
        }
      } catch (e) {
        console.error("Failed to load sensor types or masterboards for sensor form", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initial]);

  useEffect(() => {
    setName(initial?.name ?? "");
    setPinCode(initial?.pinCode != null ? String(initial.pinCode) : "");
    setSensorTypeId(null);
    setMasterBoardId(initial?.masterBoardId ?? null);
    setFieldErrors({});
    setFormError(null);
  }, [initial, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? "Chỉnh sửa cảm biến" : "Thêm cảm biến"}</DialogTitle>
      <DialogContent>
        {formError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {formError}
          </Typography>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên" value={name} onChange={(e) => setName(e.target.value)} fullWidth error={Boolean(fieldErrors.name)} helperText={fieldErrors.name} />
          <TextField label="Pin" value={pinCode} onChange={(e) => setPinCode(e.target.value)} fullWidth error={Boolean(fieldErrors.pinCode)} helperText={fieldErrors.pinCode} />
          <TextField select label="Loại cảm biến" value={sensorTypeId ?? ""} onChange={(e) => setSensorTypeId(e.target.value || null)}>
            <MenuItem value="">(Chọn loại)</MenuItem>
            {sensorTypes.map((st) => (
              <MenuItem key={st.id} value={st.id}>
                {st.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Masterboard" value={masterBoardId ?? ""} onChange={(e) => setMasterBoardId(e.target.value || null)}>
            <MenuItem value="">(Chọn board)</MenuItem>
            {masterBoards.map((mb) => (
              <MenuItem key={mb.id} value={mb.id}>
                {mb.name}
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
              await onSave({ name, pinCode: pinCode ? parseInt(pinCode, 10) : undefined, sensorTypeId: sensorTypeId ?? undefined, masterBoardId: masterBoardId ?? undefined });
            } catch (e) {
              const err = e as ApiError;
              if (err && err.data && (err.data as Record<string, unknown>).errors) {
                const errs = (err.data as Record<string, unknown>).errors as Record<string, string[]>;
                const mapped: Record<string, string> = {};
                for (const k of Object.keys(errs)) {
                  const key = k.toLowerCase();
                  const msg = errs[k].join(" ");
                  if (key.includes("pin")) mapped.pinCode = msg;
                  else if (key.includes("name")) mapped.name = msg;
                  else mapped[k] = msg;
                }
                setFieldErrors(mapped);
              } else {
                setFormError((err && err.message) || String(e) || "Save failed");
              }
            } finally {
              setSaving(false);
            }
          }}
          variant="contained"
          disabled={!name || saving}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SensorFormDialog;

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { ApiError } from "../../../api/client";
import * as hardwareApi from "../../../api/hardware";
import type { ControlDevice } from "../../../types/hardware";

const ControlDeviceFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: { name: string; pinCode?: number; masterBoardId?: string | null; controlDeviceTypeName?: string; state?: boolean; commandOn?: string; commandOff?: string }) => Promise<void>;
  initial: ControlDevice | null;
}> = ({ open, onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [pinCode, setPinCode] = useState(initial?.pinCode != null ? String(initial.pinCode) : "");
  const [masterBoardId, setMasterBoardId] = useState<string | null>(initial?.masterBoardId ?? null);
  const [typeName, setTypeName] = useState(initial?.controlDeviceTypeName ?? "");
  const [state, setState] = useState(initial?.state ?? false);
  const [commandOn, setCommandOn] = useState(initial?.commandOn ?? "");
  const [commandOff, setCommandOff] = useState(initial?.commandOff ?? "");
  const [masterBoards, setMasterBoards] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mbs = await hardwareApi.getMasterBoards();
        if (!mounted) return;
        setMasterBoards(mbs.map((m) => ({ id: m.id, name: m.name })));
      } catch (e) {
        console.error("Failed to load masterboards for control device form", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initial]);

  useEffect(() => {
    setName(initial?.name ?? "");
    setPinCode(initial?.pinCode != null ? String(initial.pinCode) : "");
    setMasterBoardId(initial?.masterBoardId ?? null);
    setTypeName(initial?.controlDeviceTypeName ?? "");
    setState(initial?.state ?? false);
    setCommandOn(initial?.commandOn ?? "");
    setCommandOff(initial?.commandOff ?? "");
    setFieldErrors({});
    setFormError(null);
  }, [initial, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? "Chỉnh sửa thiết bị điều khiển" : "Thêm thiết bị điều khiển"}</DialogTitle>
      <DialogContent>
        {formError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {formError}
          </Typography>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên" value={name} onChange={(e) => setName(e.target.value)} fullWidth error={Boolean(fieldErrors.name)} helperText={fieldErrors.name} />
          <TextField label="Pin" value={pinCode} onChange={(e) => setPinCode(e.target.value)} fullWidth error={Boolean(fieldErrors.pinCode)} helperText={fieldErrors.pinCode} />
          <TextField select label="Masterboard" value={masterBoardId ?? ""} onChange={(e) => setMasterBoardId(e.target.value || null)}>
            <MenuItem value="">(Chọn board)</MenuItem>
            {masterBoards.map((mb) => (
              <MenuItem key={mb.id} value={mb.id}>
                {mb.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Loại" value={typeName} onChange={(e) => setTypeName(e.target.value)} fullWidth />
          <TextField
            label="Lệnh bật"
            value={commandOn}
            onChange={(e) => setCommandOn(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.commandOn)}
            helperText={fieldErrors.commandOn}
            inputProps={{ style: { fontFamily: "Monospace" } }}
          />
          <TextField
            label="Lệnh tắt"
            value={commandOff}
            onChange={(e) => setCommandOff(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.commandOff)}
            helperText={fieldErrors.commandOff}
            inputProps={{ style: { fontFamily: "Monospace" } }}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Trạng thái</Typography>
            <Switch checked={state} onChange={(e) => setState(e.target.checked)} />
          </Stack>
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
                name,
                pinCode: pinCode ? parseInt(pinCode, 10) : undefined,
                masterBoardId: masterBoardId ?? undefined,
                controlDeviceTypeName: typeName || undefined,
                state,
                commandOn: commandOn || undefined,
                commandOff: commandOff || undefined,
              });
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

export default ControlDeviceFormDialog;

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { ApiError } from "../../../api/client";
import { getTanks } from "../../../api/tanks";
import type { MasterBoard, Tank } from "../../../types/hardware";

const MasterBoardFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: { name: string; macAddress?: string; fishTankId?: string | null }) => Promise<void>;
  initial: MasterBoard | null;
}> = ({ open, onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [macAddress, setMacAddress] = useState(initial?.macAddress ?? "");
  const [fishTankId, setFishTankId] = useState<string | undefined>(undefined);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await getTanks();
        if (!mounted) return;
        setTanks(t);
        if (initial && initial.fishTankName) {
          const found = t.find((x) => x.name === initial.fishTankName);
          if (found) setFishTankId(found.id);
        }
      } catch (e) {
        console.error("Failed to load tanks for masterboard form", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initial]);

  useEffect(() => {
    setName(initial?.name ?? "");
    setMacAddress(initial?.macAddress ?? "");
  }, [initial]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? "Chỉnh sửa bảng mạch" : "Thêm bảng mạch"}</DialogTitle>
      <DialogContent>
        {formError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {formError}
          </Typography>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên" value={name} onChange={(e) => setName(e.target.value)} fullWidth error={Boolean(fieldErrors.name)} helperText={fieldErrors.name} />
          <TextField label="MAC Address" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} fullWidth error={Boolean(fieldErrors.macAddress)} helperText={fieldErrors.macAddress} />
          <TextField select label="Bể" value={fishTankId ?? ""} onChange={(e) => setFishTankId(e.target.value)} error={Boolean(fieldErrors.fishTankId)}>
            <MenuItem value="">(Chọn bể)</MenuItem>
            {tanks.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
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
            setFormError(null);
            setFieldErrors({});

            if (macAddress) {
              const mac = macAddress.trim();
              const macRegex = /^([0-9A-Fa-f]{2}([-:])){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$/;
              if (!macRegex.test(mac)) {
                setFieldErrors({ macAddress: "Địa chỉ MAC không hợp lệ" });
                return;
              }
            }

            setSaving(true);
            try {
              await onSave({ name, macAddress: macAddress || undefined, fishTankId: fishTankId || null });
            } catch (e) {
              const err = e as ApiError;
              if (err && err.data && (err.data as Record<string, unknown>).errors) {
                const errs = (err.data as Record<string, unknown>).errors as Record<string, string[]>;
                const mapped: Record<string, string> = {};
                for (const k of Object.keys(errs)) {
                  const key = k.toLowerCase();
                  const msg = errs[k].join(" ");
                  if (key.includes("mac")) mapped.macAddress = msg;
                  else if (key.includes("name")) mapped.name = msg;
                  else if (key.includes("tank") || key.includes("fish")) mapped.fishTankId = msg;
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

export default MasterBoardFormDialog;

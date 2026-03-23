import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CodeIcon from "@mui/icons-material/Code";
import HeightIcon from "@mui/icons-material/Height";
import PoolIcon from "@mui/icons-material/Pool";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import type { ApiError } from "../../../api/client";
import type { Tank } from "../../../types/tank";

const TankFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: {
    name: string;
    height?: number;
    radius?: number;
    farmId?: string;
    topicCode?: string;
    cameraUrl?: string;
  }) => Promise<void>;
  initial: Tank | null;
}> = ({ open, onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [height, setHeight] = useState(
    initial?.height != null ? String(initial.height) : "",
  );
  const [radius, setRadius] = useState(
    initial?.radius != null ? String(initial.radius) : "",
  );
  const [topicCode, setTopicCode] = useState(initial?.topicCode ?? "");
  const [cameraUrl, setCameraUrl] = useState(initial?.cameraUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? "");
    setHeight(initial?.height != null ? String(initial.height) : "");
    setRadius(initial?.radius != null ? String(initial.radius) : "");
    setTopicCode(initial?.topicCode ?? "");
    setCameraUrl(initial?.cameraUrl ?? "");
    setFieldErrors({});
    setFormError(null);
  }, [initial, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? "Chỉnh sửa bể" : "Thêm bể"}</DialogTitle>
      <DialogContent>
        {formError && (
          <Typography color="error" sx={{ mb: 1 }}>
            {formError}
          </Typography>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <PoolIcon fontSize="small" />
                Tên
              </span>
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
          />
          <TextField
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <HeightIcon fontSize="small" />
                Chiều cao (cm)
              </span>
            }
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.height)}
            helperText={fieldErrors.height}
          />
          <TextField
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <StraightenIcon fontSize="small" />
                Bán kính (cm)
              </span>
            }
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.radius)}
            helperText={fieldErrors.radius}
          />
          <TextField
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <CodeIcon fontSize="small" />
                Mã chủ đề
              </span>
            }
            value={topicCode}
            onChange={(e) => setTopicCode(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.topicCode)}
            helperText={fieldErrors.topicCode}
          />
          <TextField
            label={
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <CameraAltIcon fontSize="small" />
                Camera URL
              </span>
            }
            value={cameraUrl}
            onChange={(e) => setCameraUrl(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.cameraUrl)}
            helperText={fieldErrors.cameraUrl}
          />
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
              const payload: {
                name: string;
                height?: number;
                radius?: number;
                farmId?: string;
                topicCode?: string;
                cameraUrl?: string;
              } = {
                name: name,
                height: height ? parseFloat(height) : undefined,
                radius: radius ? parseFloat(radius) : undefined,
                farmId: initial?.farmId ?? undefined,
                topicCode: topicCode || undefined,
                cameraUrl: cameraUrl || undefined,
              };
              await onSave(payload);
            } catch (e) {
              const err = e as ApiError;
              if (
                err &&
                err.data &&
                (err.data as Record<string, unknown>).errors
              ) {
                const errs = (err.data as Record<string, unknown>)
                  .errors as Record<string, string[]>;
                const mapped: Record<string, string> = {};
                for (const k of Object.keys(errs)) {
                  const key = k.toLowerCase();
                  const msg = errs[k].join(" ");
                  if (key.includes("name")) mapped.name = msg;
                  else if (key.includes("height")) mapped.height = msg;
                  else if (key.includes("radius")) mapped.radius = msg;
                  else if (key.includes("topic")) mapped.topicCode = msg;
                  else if (key.includes("camera") || key.includes("url"))
                    mapped.cameraUrl = msg;
                  else mapped[k] = msg;
                }
                setFieldErrors(mapped);
              } else {
                setFormError(
                  (err && err.message) || String(e) || "Save failed",
                );
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

export default TankFormDialog;

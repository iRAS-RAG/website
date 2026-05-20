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
    if (open) {
      setName(initial?.name ?? "");
      setHeight(initial?.height != null ? String(initial.height) : "");
      setRadius(initial?.radius != null ? String(initial.radius) : "");
      setTopicCode(initial?.topicCode ?? "");
      setCameraUrl(initial?.cameraUrl ?? "");
      setFieldErrors({});
      setFormError(null);
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {initial ? "Chỉnh sửa bể cá" : "Thêm bể cá mới"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {formError && (
            <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
              {formError}
            </Typography>
          )}

          {/* Tên bể */}
          <TextField
            fullWidth
            label="Tên bể *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            InputProps={{
              startAdornment: (
                <PoolIcon sx={{ color: "action.active", mr: 1 }} />
              ),
              sx: { borderRadius: "8px" },
            }}
          />

          {/* Chiều cao */}
          <TextField
            fullWidth
            label="Chiều cao (m)"
            type="number"
            inputProps={{ step: "0.1", min: "0" }}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            error={Boolean(fieldErrors.height)}
            helperText={fieldErrors.height}
            InputProps={{
              startAdornment: (
                <HeightIcon sx={{ color: "action.active", mr: 1 }} />
              ),
              sx: { borderRadius: "8px" },
            }}
          />

          {/* Bán kính */}
          <TextField
            fullWidth
            label="Bán kính (m)"
            type="number"
            inputProps={{ step: "0.1", min: "0" }}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            error={Boolean(fieldErrors.radius)}
            helperText={fieldErrors.radius}
            InputProps={{
              startAdornment: (
                <StraightenIcon sx={{ color: "action.active", mr: 1 }} />
              ),
              sx: { borderRadius: "8px" },
            }}
          />

          {/* Mã Topic MQTT */}
          <TextField
            fullWidth
            label="Mã Topic MQTT"
            value={topicCode}
            onChange={(e) => setTopicCode(e.target.value)}
            error={Boolean(fieldErrors.topicCode)}
            helperText={fieldErrors.topicCode}
            InputProps={{
              startAdornment: (
                <CodeIcon sx={{ color: "action.active", mr: 1 }} />
              ),
              sx: { borderRadius: "8px" },
            }}
          />

          {/* URL Camera Stream */}
          <TextField
            fullWidth
            label="Luồng Camera (URL RTSP/HTTP)"
            value={cameraUrl}
            onChange={(e) => setCameraUrl(e.target.value)}
            error={Boolean(fieldErrors.cameraUrl)}
            helperText={fieldErrors.cameraUrl}
            InputProps={{
              startAdornment: (
                <CameraAltIcon sx={{ color: "action.active", mr: 1 }} />
              ),
              sx: { borderRadius: "8px" },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          Hủy
        </Button>
        <Button
          onClick={async () => {
            setSaving(true);
            setFormError(null);
            setFieldErrors({});
            try {
              // ÉP KIỂU SANG NUMBER TRƯỚC KHI GỬI ĐỂ BACKEND NHẬN ĐƯỢC ĐÚNG ĐỊNH DẠNG double/float
              const parsedHeight =
                height && !isNaN(parseFloat(height))
                  ? parseFloat(height)
                  : undefined;
              const parsedRadius =
                radius && !isNaN(parseFloat(radius))
                  ? parseFloat(radius)
                  : undefined;

              await onSave({
                name,
                height: parsedHeight,
                radius: parsedRadius,
                topicCode: topicCode || undefined,
                cameraUrl: cameraUrl || undefined,
              });
              onClose();
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
                  (err && err.message) || String(e) || "Lưu thất bại",
                );
              }
            } finally {
              setSaving(false);
            }
          }}
          variant="contained"
          disabled={!name || saving}
          sx={{ borderRadius: "8px", fontWeight: 600, boxShadow: "none" }}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TankFormDialog;

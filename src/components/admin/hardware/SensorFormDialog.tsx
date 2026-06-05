import { Add as AddIcon, List as ListIcon } from "@mui/icons-material";
import CategoryIcon from "@mui/icons-material/Category";
// LabelIcon removed — name field hidden
import PinDropIcon from "@mui/icons-material/PinDrop";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { ApiError } from "../../../api/client";
import useSensorTypes from "../../../hooks/useSensorTypes";
import type { Sensor } from "../../../types/sensor";
import type { SensorType, SensorTypeCreate } from "../../../types/sensor-type";
import { useToast } from "../../common/toastContext";
import ManageTypesDialog from "./ManageTypesDialog";
import { SensorTypeDialog } from "./TypeDialogs";

const SensorFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: { name: string; pinCode?: number; sensorTypeId?: string | null; masterBoardId?: string | null }) => Promise<void>;
  initial: Sensor | null;
  defaultMasterBoardId?: string | null;
  existingSensors?: Sensor[]; // ĐÃ THÊM PROP NÀY
}> = ({ open, onClose, onSave, initial, defaultMasterBoardId, existingSensors }) => {
  const [pinCode, setPinCode] = useState(initial?.pinCode != null ? String(initial.pinCode) : "");
  const [sensorTypeId, setSensorTypeId] = useState<string | null>(null);
  const { items: sensorTypes, createItem: createSensorType, updateItem: updateSensorType, deleteItem: deleteSensorType } = useSensorTypes();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createTypeDialogOpen, setCreateTypeDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const toast = useToast();
  const currentBoardId = defaultMasterBoardId ?? initial?.masterBoardId ?? null;

  const usedSensorTypeIds = React.useMemo(() => {
    if (!existingSensors || !currentBoardId) return new Set<string>();
    const set = new Set<string>();
    for (const s of existingSensors) {
      if (s.masterBoardId === currentBoardId && s.id !== initial?.id && s.sensorTypeId) {
        set.add(s.sensorTypeId);
      }
    }
    return set;
  }, [existingSensors, currentBoardId, initial?.id]);

  const parsedPin = pinCode ? parseInt(pinCode, 10) : NaN;
  const pinInUse = Boolean(
    !Number.isNaN(parsedPin) && existingSensors && currentBoardId && existingSensors.some((s) => s.masterBoardId === currentBoardId && s.id !== initial?.id && s.pinCode === parsedPin),
  );

  useEffect(() => {
    setPinCode(initial?.pinCode != null ? String(initial.pinCode) : "");
    if (initial) {
      const byId = initial.sensorTypeId ?? null;
      const byName = sensorTypes.find((st) => st.name === initial.sensorTypeName)?.id ?? null;
      setSensorTypeId(byId ?? byName);
    } else {
      setSensorTypeId(null);
    }
    setFieldErrors({});
    setFormError(null);
  }, [initial, open, defaultMasterBoardId, sensorTypes]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>{initial ? "Chỉnh sửa cảm biến" : "Thêm cảm biến"}</DialogTitle>
        <DialogContent>
          {formError && (
            <Typography color="error" sx={{ mb: 1 }}>
              {formError}
            </Typography>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* name is hidden — app uses type only */}
            <TextField
              label={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <PinDropIcon fontSize="small" />
                  Pin
                </span>
              }
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              fullWidth
              error={Boolean(fieldErrors.pinCode) || pinInUse}
              helperText={fieldErrors.pinCode ?? (pinInUse ? "Mã pin đã được sử dụng trên bảng mạch này." : undefined)}
            />
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField
                select
                label={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CategoryIcon fontSize="small" />
                    Loại cảm biến
                  </span>
                }
                value={sensorTypeId ?? ""}
                onChange={(e) => setSensorTypeId(e.target.value || null)}
                error={Boolean(fieldErrors.sensorTypeId)} // ĐÃ THÊM ĐỂ HIỂN THỊ LỖI
                helperText={fieldErrors.sensorTypeId} // ĐÃ THÊM ĐỂ HIỂN THỊ LỖI
                sx={{ flex: 1 }}
              >
                <MenuItem value="">(Chọn loại)</MenuItem>
                {sensorTypes.map((st) => (
                  <MenuItem key={st.id} value={st.id} disabled={usedSensorTypeIds.has(st.id)}>
                    {st.name}
                  </MenuItem>
                ))}
              </TextField>
              <Tooltip title="Thêm loại cảm biến mới">
                <IconButton onClick={() => setCreateTypeDialogOpen(true)} size="small" sx={{ mt: 1, color: "primary.main" }}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Quản lý loại">
                <IconButton onClick={() => setManageDialogOpen(true)} size="small" sx={{ mt: 1, color: "text.primary" }}>
                  <ListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button
            onClick={async () => {
              // --- VALIDATE FRONTEND CHỐNG TRÙNG LẶP ---
              const currentBoardId = defaultMasterBoardId || initial?.masterBoardId;
              if (existingSensors && currentBoardId) {
                const isDuplicateType = sensorTypeId && existingSensors.some((s) => s.masterBoardId === currentBoardId && s.id !== initial?.id && s.sensorTypeId === sensorTypeId);

                if (isDuplicateType) {
                  setFieldErrors({ sensorTypeId: "Loại cảm biến này đã tồn tại trên bảng mạch này." });
                  return; // Chặn gọi API
                }
              }

              setSaving(true);
              setFormError(null);
              setFieldErrors({});
              try {
                await onSave({
                  name: "Cảm biến (tự động)",
                  pinCode: pinCode ? parseInt(pinCode, 10) : undefined,
                  sensorTypeId: sensorTypeId ?? undefined,
                  masterBoardId: defaultMasterBoardId ?? undefined,
                });
              } catch (e) {
                const err = e as ApiError;
                const errorData = err?.data as Record<string, unknown> | undefined;

                if (errorData?.errors) {
                  const errs = errorData.errors as Record<string, string[]>;
                  const mapped: Record<string, string> = {};
                  for (const k of Object.keys(errs)) {
                    const key = k.toLowerCase();
                    const msg = errs[k].join(" ");
                    if (key.includes("pin")) mapped.pinCode = msg;
                    else if (key.includes("name")) mapped.name = msg;
                    else if (key.includes("type"))
                      mapped.sensorTypeId = msg; // Đã thêm bắt trường type
                    else mapped[k] = msg;
                  }
                  setFieldErrors(mapped);
                } else if (errorData?.message && typeof errorData.message === "string") {
                  const apiMessage = errorData.message;
                  const lowerMsg = apiMessage.toLowerCase();

                  if (lowerMsg.includes("mã chân") || lowerMsg.includes("pin")) {
                    setFieldErrors({ pinCode: apiMessage });
                  } else if (lowerMsg.includes("tên") || lowerMsg.includes("name")) {
                    setFieldErrors({ name: apiMessage });
                  } else {
                    setFormError(apiMessage);
                  }
                } else {
                  setFormError((err && err.message) || String(e) || "Lưu thất bại");
                }
              } finally {
                setSaving(false);
              }
            }}
            variant="contained"
            disabled={saving || pinInUse}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <SensorTypeDialog
        open={createTypeDialogOpen}
        onClose={() => setCreateTypeDialogOpen(false)}
        onCreate={createSensorType}
        onCreated={(created) => {
          setSensorTypeId(created.id);
          toast.success("Loại cảm biến đã được tạo");
        }}
        existingNames={sensorTypes.map((st) => st.name)}
      />

      <ManageTypesDialog<SensorType, Partial<SensorTypeCreate>>
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        title="Quản lý loại cảm biến"
        items={sensorTypes}
        updateItem={updateSensorType}
        deleteItem={deleteSensorType}
        DialogComponent={SensorTypeDialog}
        renderSecondary={(it) => `${it.measureType ?? ""} ${(it.unitOfMeasure && `· ${it.unitOfMeasure}`) || ""}`.trim()}
        onDeleted={(id) => {
          if (sensorTypeId === id) {
            setSensorTypeId(null);
            toast.info("Loại vừa xóa đã được bỏ chọn. Vui lòng chọn loại khác.");
          }
        }}
      />
    </>
  );
};

export default SensorFormDialog;

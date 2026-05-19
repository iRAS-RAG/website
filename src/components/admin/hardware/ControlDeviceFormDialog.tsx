import { Add as AddIcon, List as ListIcon } from "@mui/icons-material";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import type { ApiError } from "../../../api/client";
import useControlDeviceTypes from "../../../hooks/useControlDeviceTypes";
import type { ControlDevice } from "../../../types/control-device";
import type { ControlDeviceType } from "../../../types/control-device-type";
import { useToast } from "../../common/toastContext";
import ManageTypesDialog from "./ManageTypesDialog";
import { ControlDeviceTypeDialog } from "./TypeDialogs";

const ControlDeviceFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (v: {
    name: string;
    pinCode?: number;
    masterBoardId?: string | null;
    controlDeviceTypeId?: string | null;
    state?: boolean;
    commandOn?: string;
    commandOff?: string;
  }) => Promise<void>;
  initial: ControlDevice | null;
  defaultMasterBoardId?: string | null;
}> = ({ open, onClose, onSave, initial, defaultMasterBoardId }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [pinCode, setPinCode] = useState(
    initial?.pinCode != null ? String(initial.pinCode) : "",
  );
  const [controlDeviceTypeId, setControlDeviceTypeId] = useState<string | null>(
    null,
  );
  const [commandOn, setCommandOn] = useState(initial?.commandOn ?? "");
  const [commandOff, setCommandOff] = useState(initial?.commandOff ?? "");
  const {
    items: controlDeviceTypes,
    createItem: createControlDeviceType,
    updateItem: updateControlDeviceType,
    deleteItem: deleteControlDeviceType,
  } = useControlDeviceTypes();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createTypeDialogOpen, setCreateTypeDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setName(initial?.name ?? "");
    setPinCode(initial?.pinCode != null ? String(initial.pinCode) : "");
    if (initial) {
      const byId = initial.controlDeviceTypeId ?? null;
      const byName =
        controlDeviceTypes.find((t) => t.name === initial.controlDeviceTypeName)
          ?.id ?? null;
      setControlDeviceTypeId(byId ?? byName);
    } else {
      setControlDeviceTypeId(null);
    }
    setCommandOn(initial?.commandOn ?? "");
    setCommandOff(initial?.commandOff ?? "");
    setFieldErrors({});
    setFormError(null);
  }, [initial, open, defaultMasterBoardId, controlDeviceTypes]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>
          {initial
            ? "Chỉnh sửa thiết bị điều khiển"
            : "Thêm thiết bị điều khiển"}
        </DialogTitle>
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
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <LabelIcon fontSize="small" />
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
              error={Boolean(fieldErrors.pinCode)}
              helperText={fieldErrors.pinCode}
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
                    Loại thiết bị
                  </span>
                }
                value={controlDeviceTypeId ?? ""}
                onChange={(e) => setControlDeviceTypeId(e.target.value || null)}
                error={Boolean(fieldErrors.controlDeviceTypeId)}
                helperText={fieldErrors.controlDeviceTypeId}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">(Chọn loại)</MenuItem>
                {controlDeviceTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>
              <Tooltip title="Thêm loại thiết bị mới">
                <IconButton
                  onClick={() => setCreateTypeDialogOpen(true)}
                  size="small"
                  sx={{ mt: 1, color: "primary.main" }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Quản lý loại">
                <IconButton
                  onClick={() => setManageDialogOpen(true)}
                  size="small"
                  sx={{ mt: 1, color: "text.primary" }}
                >
                  <ListIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              label={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <PowerSettingsNewIcon fontSize="small" />
                  Lệnh bật
                </span>
              }
              value={commandOn}
              onChange={(e) => setCommandOn(e.target.value)}
              fullWidth
              error={Boolean(fieldErrors.commandOn)}
              helperText={fieldErrors.commandOn}
              inputProps={{ style: { fontFamily: "Monospace" } }}
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
                  <PowerSettingsNewIcon fontSize="small" />
                  Lệnh tắt
                </span>
              }
              value={commandOff}
              onChange={(e) => setCommandOff(e.target.value)}
              fullWidth
              error={Boolean(fieldErrors.commandOff)}
              helperText={fieldErrors.commandOff}
              inputProps={{ style: { fontFamily: "Monospace" } }}
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
                await onSave({
                  name,
                  pinCode: pinCode ? parseInt(pinCode, 10) : undefined,
                  masterBoardId: defaultMasterBoardId ?? undefined,
                  controlDeviceTypeId: controlDeviceTypeId ?? undefined,
                  state: initial?.state ?? false, // Giữ lại state cũ
                  commandOn: commandOn || undefined,
                  commandOff: commandOff || undefined,
                });
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
                    if (key.includes("pin")) mapped.pinCode = msg;
                    else if (key.includes("name")) mapped.name = msg;
                    else if (key.includes("type"))
                      mapped.controlDeviceTypeId = msg;
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

      <ControlDeviceTypeDialog
        open={createTypeDialogOpen}
        onClose={() => setCreateTypeDialogOpen(false)}
        onCreate={createControlDeviceType}
        onCreated={(created) => {
          setControlDeviceTypeId(created.id);
          toast.success("Loại thiết bị đã được tạo");
        }}
        existingNames={controlDeviceTypes.map((t) => t.name)}
      />

      <ManageTypesDialog<
        ControlDeviceType,
        Partial<{ name: string; description?: string }>
      >
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        title="Quản lý loại thiết bị"
        items={controlDeviceTypes}
        updateItem={updateControlDeviceType}
        deleteItem={deleteControlDeviceType}
        DialogComponent={ControlDeviceTypeDialog}
        renderSecondary={(it) => it.description ?? ""}
        onDeleted={(id) => {
          if (controlDeviceTypeId === id) {
            setControlDeviceTypeId(null);
            toast.info(
              "Loại vừa xóa đã được bỏ chọn. Vui lòng chọn loại khác.",
            );
          }
        }}
      />
    </>
  );
};

export default ControlDeviceFormDialog;

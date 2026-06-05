import Autocomplete from "@mui/material/Autocomplete";
import DescriptionIcon from "@mui/icons-material/Description";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import MedicationIcon from "@mui/icons-material/Medication";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { FeedType } from "../../../types/feed-type";

type Values = { name: string; protein: string; description?: string; manufacturer?: string };

type Props = {
  open: boolean;
  initial?: FeedType | null;
  onClose: () => void;
  onSave: (values: Values) => Promise<void> | void;
  manufacturerOptions?: string[];
};

const FeedFormDialog: React.FC<Props> = ({ open, initial = null, onClose, onSave, manufacturerOptions = [] }) => {
  const [form, setForm] = useState({ name: "", protein: "", description: "", manufacturer: "" });

  useEffect(() => {
    const next = initial
      ? {
          name: initial.name ?? "",
          protein: initial.protein ? String(parseFloat(String(initial.protein))) : "",
          description: initial.description ?? "",
          manufacturer: initial.manufacturer ?? "",
        }
      : { name: "", protein: "", description: "", manufacturer: "" };
    const t = setTimeout(() => setForm(next), 0);
    return () => clearTimeout(t);
  }, [initial, open]);

  const proteinNumber = form.protein === "" ? NaN : Number(form.protein);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? "Chỉnh sửa cám" : "Thêm cám"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <LocalDiningIcon fontSize="small" />
                Tên
              </span>
            }
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MedicationIcon fontSize="small" />
                Đạm
              </span>
            }
            type="number"
            inputProps={{ min: 1, max: 100 }}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            value={form.protein}
            onChange={(e) => setForm((p) => ({ ...p, protein: e.target.value }))}
            fullWidth
          />
          <TextField
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <DescriptionIcon fontSize="small" />
                Mô tả
              </span>
            }
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
          <Autocomplete
            freeSolo
            options={manufacturerOptions}
            inputValue={form.manufacturer}
            onInputChange={(_, val) => setForm((p) => ({ ...p, manufacturer: val }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FactoryIcon fontSize="small" />
                    Nhà sản xuất
                  </span>
                }
              />
            )}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSave({ name: form.name, protein: `${Number(form.protein)}%`, description: form.description || undefined, manufacturer: form.manufacturer || undefined })}
          disabled={!form.name || !(proteinNumber > 0 && proteinNumber <= 100)}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedFormDialog;

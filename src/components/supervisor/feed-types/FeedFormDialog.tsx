import FactoryIcon from "@mui/icons-material/Factory";
import MedicationIcon from "@mui/icons-material/Medication";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { FeedType } from "../../../api/feed-types";

type Values = { name: string; protein: string; description?: string; manufacturer?: string };

type Props = {
  open: boolean;
  initial?: FeedType | null;
  onClose: () => void;
  onSave: (values: Values) => Promise<void> | void;
};

const FeedFormDialog: React.FC<Props> = ({ open, initial = null, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [description, setDescription] = useState("");
  const [manufacturer, setManufacturer] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? "");
      setProtein(initial.protein ? String(parseFloat(String(initial.protein))) : "");
      setDescription(initial.description ?? "");
      setManufacturer(initial.manufacturer ?? "");
    } else {
      setName("");
      setProtein("");
      setDescription("");
      setManufacturer("");
    }
  }, [initial, open]);

  const proteinNumber = protein === "" ? NaN : Number(protein);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? "Chỉnh sửa thức ăn" : "Thêm thức ăn"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
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
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            fullWidth
          />
          <TextField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={2} />
          <TextField
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FactoryIcon fontSize="small" />
                Nhà sản xuất
              </span>
            }
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSave({ name, protein: `${Number(protein)}%`, description: description || undefined, manufacturer: manufacturer || undefined })}
          disabled={!name || !(proteinNumber > 0 && proteinNumber <= 100)}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedFormDialog;

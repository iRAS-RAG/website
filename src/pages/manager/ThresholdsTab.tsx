import AddIcon from "@mui/icons-material/Add";
import AirIcon from "@mui/icons-material/Air";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ScienceIcon from "@mui/icons-material/Science";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import type { Threshold as ThresholdType } from "../../mocks/thresholds";
import { createThreshold, deleteThreshold, fetchThresholds, updateThreshold } from "../../mocks/thresholds";

const ThresholdsTab: React.FC = () => {
  const theme = useTheme();

  const [thresholdsData, setThresholdsData] = useState<ThresholdType[]>([]);
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<ThresholdType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [thrSensor, setThrSensor] = useState("");
  const [thrMin, setThrMin] = useState<number | "">("");
  const [thrMax, setThrMax] = useState<number | "">("");
  const [thrUnit, setThrUnit] = useState("");

  useEffect(() => {
    fetchThresholds()
      .then(setThresholdsData)
      .catch(() => setThresholdsData([]));
  }, []);

  const openConfirm = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    try {
      await deleteThreshold(confirmId);
      setThresholdsData(await fetchThresholds());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveThreshold = async (values: { sensor: string; min: number; max: number; unit: string }) => {
    if (editingThreshold) await updateThreshold(editingThreshold.id, values);
    else await createThreshold(values);
    setThresholdDialogOpen(false);
    setEditingThreshold(null);
    setThresholdsData(await fetchThresholds());
    setThrSensor("");
    setThrMin("");
    setThrMax("");
    setThrUnit("");
  };

  const iconFor = (sensor: string) => {
    if (/pH/i.test(sensor)) return <ScienceIcon />;
    if (/DO/i.test(sensor)) return <AirIcon />;
    return <ScienceIcon />;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Ngưỡng cảm biến
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => {
            setEditingThreshold(null);
            setThrSensor("");
            setThrMin("");
            setThrMax("");
            setThrUnit("");
            setThresholdDialogOpen(true);
          }}
        >
          Thêm ngưỡng
        </Button>
      </Stack>

      <List sx={{ bgcolor: "background.paper", borderRadius: 2, p: 1, border: `1px solid ${theme.palette.divider}` }}>
        {thresholdsData.map((t, idx) => (
          <React.Fragment key={t.id}>
            <ListItem sx={{ alignItems: "center" }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>{iconFor(t.sensor)}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={t.sensor} secondary={`Khoảng: ${t.min} - ${t.max} ${t.unit}`} />
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingThreshold(t);
                    setThrSensor(t.sensor);
                    setThrMin(t.min);
                    setThrMax(t.max);
                    setThrUnit(t.unit);
                    setThresholdDialogOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => openConfirm(t.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Chip label={`${t.min} - ${t.max} ${t.unit}`} size="small" color="secondary" />
            </ListItem>
            {idx < thresholdsData.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>

      <Dialog open={thresholdDialogOpen} onClose={() => setThresholdDialogOpen(false)} fullWidth>
        <DialogTitle>{editingThreshold ? "Chỉnh sửa ngưỡng" : "Thêm ngưỡng"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Cảm biến" value={thrSensor} onChange={(e) => setThrSensor(e.target.value)} fullWidth />
            <Stack direction="row" spacing={1}>
              <TextField label="Min" value={thrMin === "" ? "" : String(thrMin)} onChange={(e) => setThrMin(e.target.value === "" ? "" : Number(e.target.value))} />
              <TextField label="Max" value={thrMax === "" ? "" : String(thrMax)} onChange={(e) => setThrMax(e.target.value === "" ? "" : Number(e.target.value))} />
              <TextField label="Đơn vị" value={thrUnit} onChange={(e) => setThrUnit(e.target.value)} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThresholdDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => handleSaveThreshold({ sensor: thrSensor, min: Number(thrMin), max: Number(thrMax), unit: thrUnit })}
            disabled={!thrSensor || thrMin === "" || thrMax === "" || !thrUnit}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa mục này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button color="error" onClick={handleDeleteConfirmed}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThresholdsTab;

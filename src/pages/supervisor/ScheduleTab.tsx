import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ScheduleIcon from "@mui/icons-material/Schedule";
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
import type { Schedule as ScheduleType } from "../../mocks/schedules";
import { createSchedule, deleteSchedule, fetchSchedules, updateSchedule } from "../../mocks/schedules";

const ScheduleTab: React.FC = () => {
  const theme = useTheme();

  const [schedulesData, setSchedulesData] = useState<ScheduleType[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [schTime, setSchTime] = useState("");
  const [schFeed, setSchFeed] = useState("");
  const [schAmount, setSchAmount] = useState("");

  useEffect(() => {
    fetchSchedules()
      .then(setSchedulesData)
      .catch(() => setSchedulesData([]));
  }, []);

  const openConfirm = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    try {
      await deleteSchedule(confirmId);
      setSchedulesData(await fetchSchedules());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSchedule = async (values: { time: string; feed: string; amount: string }) => {
    if (editingSchedule) await updateSchedule(editingSchedule.id, values);
    else await createSchedule(values);
    setScheduleDialogOpen(false);
    setEditingSchedule(null);
    setSchedulesData(await fetchSchedules());
    setSchTime("");
    setSchFeed("");
    setSchAmount("");
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Lịch cho ăn
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => {
            setEditingSchedule(null);
            setSchTime("");
            setSchFeed("");
            setSchAmount("");
            setScheduleDialogOpen(true);
          }}
        >
          Thêm lịch
        </Button>
      </Stack>

      <List sx={{ bgcolor: "background.paper", borderRadius: 2, p: 1, border: `1px solid ${theme.palette.divider}` }}>
        {schedulesData.map((s, idx) => (
          <React.Fragment key={s.id}>
            <ListItem secondaryAction={<Chip label={s.amount} size="small" />}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.main }}>
                  <ScheduleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={s.feed} secondary={`Thời gian: ${s.time}`} />
              <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingSchedule(s);
                    setSchTime(s.time);
                    setSchFeed(s.feed);
                    setSchAmount(s.amount);
                    setScheduleDialogOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => openConfirm(s.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Chip label={s.time} size="small" sx={{ ml: 2 }} />
            </ListItem>
            {idx < schedulesData.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>

      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} fullWidth>
        <DialogTitle>{editingSchedule ? "Chỉnh sửa lịch" : "Thêm lịch"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Thời gian" value={schTime} onChange={(e) => setSchTime(e.target.value)} fullWidth />
            <TextField label="Thức ăn" value={schFeed} onChange={(e) => setSchFeed(e.target.value)} fullWidth />
            <TextField label="Số lượng" value={schAmount} onChange={(e) => setSchAmount(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => handleSaveSchedule({ time: schTime, feed: schFeed, amount: schAmount })} disabled={!schTime || !schFeed || !schAmount}>
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

export default ScheduleTab;

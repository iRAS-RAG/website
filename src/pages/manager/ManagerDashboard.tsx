import AddIcon from "@mui/icons-material/Add";
import AirIcon from "@mui/icons-material/Air";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import PetsIcon from "@mui/icons-material/Pets";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ScienceIcon from "@mui/icons-material/Science";
import { Avatar, Box, Button, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
// icons for dialogs not required
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import ManagerHeader from "../../components/manager/ManagerHeader";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import { isManager } from "../../mocks/auth";
import type { FeedType as FeedTypeType } from "../../mocks/feeds";
import { createFeed, deleteFeed, fetchFeeds, updateFeed } from "../../mocks/feeds";
import type { Schedule as ScheduleType } from "../../mocks/schedules";
import { createSchedule, deleteSchedule, fetchSchedules, updateSchedule } from "../../mocks/schedules";
import type { Species as SpeciesType } from "../../mocks/species";
import { createSpecies, deleteSpecies, fetchSpecies, updateSpecies } from "../../mocks/species";
import type { Threshold as ThresholdType } from "../../mocks/thresholds";
import { createThreshold, deleteThreshold, fetchThresholds, updateThreshold } from "../../mocks/thresholds";
// (data loaded via fetch* mocks)

const ManagerDashboard: React.FC = () => {
  if (!isManager()) return <Navigate to="/" replace />;

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <ManagerSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <ManagerHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Stack spacing={2}>
            <SectionRenderer />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

const SectionRenderer: React.FC<{ section?: string }> = ({ section: propSection }) => {
  const theme = useTheme();
  const { hash } = useLocation();
  const section = propSection || (hash || "").replace("#", "") || "overview";

  // --- Local state for data + dialogs ---
  const [speciesData, setSpeciesData] = useState<SpeciesType[]>([]);
  const [feedsData, setFeedsData] = useState<FeedTypeType[]>([]);
  const [thresholdsData, setThresholdsData] = useState<ThresholdType[]>([]);
  const [schedulesData, setSchedulesData] = useState<ScheduleType[]>([]);

  const [speciesDialogOpen, setSpeciesDialogOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<SpeciesType | null>(null);

  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedTypeType | null>(null);

  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<ThresholdType | null>(null);

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleType | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState<{ type: string; id: string | null } | null>(null);

  useEffect(() => {
    // load data when section becomes active
    if (section === "species")
      fetchSpecies()
        .then(setSpeciesData)
        .catch(() => setSpeciesData([]));
    if (section === "feeds")
      fetchFeeds()
        .then(setFeedsData)
        .catch(() => setFeedsData([]));
    if (section === "thresholds")
      fetchThresholds()
        .then(setThresholdsData)
        .catch(() => setThresholdsData([]));
    if (section === "schedule")
      fetchSchedules()
        .then(setSchedulesData)
        .catch(() => setSchedulesData([]));
  }, [section]);

  const openConfirm = (type: string, id: string) => {
    setConfirmMeta({ type, id });
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmMeta) return;
    const { type, id } = confirmMeta;
    setConfirmOpen(false);
    try {
      if (type === "species") {
        await deleteSpecies(id!);
        setSpeciesData(await fetchSpecies());
      } else if (type === "feeds") {
        await deleteFeed(id!);
        setFeedsData(await fetchFeeds());
      } else if (type === "thresholds") {
        await deleteThreshold(id!);
        setThresholdsData(await fetchThresholds());
      } else if (type === "schedule") {
        await deleteSchedule(id!);
        setSchedulesData(await fetchSchedules());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSpecies = async (values: { name: string; optimalTemp: string }) => {
    if (editingSpecies) await updateSpecies(editingSpecies.id, values);
    else await createSpecies(values);
    setSpeciesDialogOpen(false);
    setEditingSpecies(null);
    setSpeciesData(await fetchSpecies());
  };

  const handleSaveFeed = async (values: { name: string; protein: string }) => {
    if (editingFeed) await updateFeed(editingFeed.id, values);
    else await createFeed(values);
    setFeedDialogOpen(false);
    setEditingFeed(null);
    setFeedsData(await fetchFeeds());
  };

  const handleSaveThreshold = async (values: { sensor: string; min: number; max: number; unit: string }) => {
    if (editingThreshold) await updateThreshold(editingThreshold.id, values);
    else await createThreshold(values);
    setThresholdDialogOpen(false);
    setEditingThreshold(null);
    setThresholdsData(await fetchThresholds());
  };

  const handleSaveSchedule = async (values: { time: string; feed: string; amount: string }) => {
    if (editingSchedule) await updateSchedule(editingSchedule.id, values);
    else await createSchedule(values);
    setScheduleDialogOpen(false);
    setEditingSchedule(null);
    setSchedulesData(await fetchSchedules());
  };

  // --- Dialog form state and effects ---
  const [spName, setSpName] = useState("");
  const [spOptimal, setSpOptimal] = useState("");

  const [feedName, setFeedName] = useState("");
  const [feedProtein, setFeedProtein] = useState("");

  const [thrSensor, setThrSensor] = useState("");
  const [thrMin, setThrMin] = useState<number | "">("");
  const [thrMax, setThrMax] = useState<number | "">("");
  const [thrUnit, setThrUnit] = useState("");
  const [schTime, setSchTime] = useState("");
  const [schFeed, setSchFeed] = useState("");
  const [schAmount, setSchAmount] = useState("");

  // --- Dialog components ---
  const SpeciesDialog = (
    <Dialog open={speciesDialogOpen} onClose={() => setSpeciesDialogOpen(false)} fullWidth>
      <DialogTitle>{editingSpecies ? "Chỉnh sửa loài" : "Thêm loài"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên loài" value={spName} onChange={(e) => setSpName(e.target.value)} fullWidth />
          <TextField label="Nhiệt tối ưu" value={spOptimal} onChange={(e) => setSpOptimal(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSpeciesDialogOpen(false)}>Hủy</Button>
        <Button variant="contained" onClick={() => handleSaveSpecies({ name: spName, optimalTemp: spOptimal })} disabled={!spName || !spOptimal}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );

  const FeedDialog = (
    <Dialog open={feedDialogOpen} onClose={() => setFeedDialogOpen(false)} fullWidth>
      <DialogTitle>{editingFeed ? "Chỉnh sửa thức ăn" : "Thêm thức ăn"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên" value={feedName} onChange={(e) => setFeedName(e.target.value)} fullWidth />
          <TextField label="Protein" value={feedProtein} onChange={(e) => setFeedProtein(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFeedDialogOpen(false)}>Hủy</Button>
        <Button variant="contained" onClick={() => handleSaveFeed({ name: feedName, protein: feedProtein })} disabled={!feedName || !feedProtein}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ThresholdDialog = (
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
  );

  const ScheduleDialog = (
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
  );

  const ConfirmDialog = (
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
  );

  if (section === "species") {
    return (
      <>
        {SpeciesDialog}
        {FeedDialog}
        {ThresholdDialog}
        {ScheduleDialog}
        {ConfirmDialog}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Loài
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => {
                setEditingSpecies(null);
                setSpeciesDialogOpen(true);
              }}
            >
              Thêm loài
            </Button>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
            {speciesData.map((s) => (
              <Paper key={s.id} sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
                  <PetsIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
                  <Chip label={`Nhiệt tối ưu: ${s.optimalTemp}`} size="small" sx={{ mt: 1 }} />
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingSpecies(s);
                      setSpName(s.name);
                      setSpOptimal(s.optimalTemp);
                      setSpeciesDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openConfirm("species", s.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Box>
      </>
    );
  }

  if (section === "feeds") {
    return (
      <>
        {SpeciesDialog}
        {FeedDialog}
        {ThresholdDialog}
        {ScheduleDialog}
        {ConfirmDialog}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Thức ăn
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => {
                setEditingFeed(null);
                setFeedDialogOpen(true);
              }}
            >
              Thêm thức ăn
            </Button>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
            {feedsData.map((f) => (
              <Paper key={f.id} sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.main }}>
                  <FastfoodIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{f.name}</Typography>
                  <Chip label={`Protein: ${f.protein}`} size="small" sx={{ mt: 1 }} color="info" />
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingFeed(f);
                      setFeedName(f.name);
                      setFeedProtein(f.protein);
                      setFeedDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openConfirm("feeds", f.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Box>
      </>
    );
  }

  if (section === "thresholds") {
    const iconFor = (sensor: string) => {
      if (/pH/i.test(sensor)) return <ScienceIcon />;
      if (/DO/i.test(sensor)) return <AirIcon />;
      return <ScienceIcon />;
    };

    return (
      <>
        {SpeciesDialog}
        {FeedDialog}
        {ThresholdDialog}
        {ScheduleDialog}
        {ConfirmDialog}
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
                    <IconButton size="small" onClick={() => openConfirm("thresholds", t.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Chip label={`${t.min} - ${t.max} ${t.unit}`} size="small" color="secondary" />
                </ListItem>
                {idx < thresholdsData.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </>
    );
  }

  if (section === "schedule") {
    return (
      <>
        {SpeciesDialog}
        {FeedDialog}
        {ThresholdDialog}
        {ScheduleDialog}
        {ConfirmDialog}
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
                    <IconButton size="small" onClick={() => openConfirm("schedule", s.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Chip label={s.time} size="small" sx={{ ml: 2 }} />
                </ListItem>
                {idx < schedulesData.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </>
    );
  }

  // Render dialogs and fallback panel together
  return (
    <>
      {SpeciesDialog}
      {FeedDialog}
      {ThresholdDialog}
      {ScheduleDialog}
      {ConfirmDialog}

      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">Chọn một mục từ menu bên trái để xem nội dung.</Typography>
      </Paper>
    </>
  );
};

export default ManagerDashboard;

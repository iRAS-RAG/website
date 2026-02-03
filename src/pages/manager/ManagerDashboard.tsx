import AirIcon from "@mui/icons-material/Air";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import PetsIcon from "@mui/icons-material/Pets";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ScienceIcon from "@mui/icons-material/Science";
import { Avatar, Box, Button, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ManagerHeader from "../../components/manager/ManagerHeader";
import ManagerSidebar from "../../components/manager/ManagerSidebar";
import { isManager } from "../../mocks/auth";
import { feeds } from "../../mocks/feeds";
import { schedules } from "../../mocks/schedules";
import { species } from "../../mocks/species";
import { thresholds } from "../../mocks/thresholds";

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

  // Mock data are imported from src/mocks/manager.ts

  if (section === "species") {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Loài
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
          {species.map((s) => (
            <Paper key={s.id} sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
                <PetsIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
                <Chip label={`Nhiệt tối ưu: ${s.optimalTemp}`} size="small" sx={{ mt: 1 }} />
              </Box>
              <Button size="small">Sửa</Button>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  if (section === "feeds") {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Thức ăn
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
          {feeds.map((f) => (
            <Paper key={f.id} sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.main }}>
                <FastfoodIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{f.name}</Typography>
                <Chip label={`Protein: ${f.protein}`} size="small" sx={{ mt: 1 }} color="info" />
              </Box>
              <Button size="small">Sửa</Button>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  if (section === "thresholds") {
    const iconFor = (sensor: string) => {
      if (/pH/i.test(sensor)) return <ScienceIcon />;
      if (/DO/i.test(sensor)) return <AirIcon />;
      return <ScienceIcon />;
    };

    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Ngưỡng cảm biến
        </Typography>
        <List sx={{ bgcolor: "background.paper", borderRadius: 2, p: 1, border: `1px solid ${theme.palette.divider}` }}>
          {thresholds.map((t, idx) => (
            <React.Fragment key={t.id}>
              <ListItem sx={{ alignItems: "center" }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>{iconFor(t.sensor)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={t.sensor} secondary={`Khoảng: ${t.min} - ${t.max} ${t.unit}`} />
                <Chip label={`${t.min} - ${t.max} ${t.unit}`} size="small" color="secondary" />
              </ListItem>
              {idx < thresholds.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  }

  if (section === "schedule") {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Lịch cho ăn
        </Typography>
        <List sx={{ bgcolor: "background.paper", borderRadius: 2, p: 1, border: `1px solid ${theme.palette.divider}` }}>
          {schedules.map((s, idx) => (
            <React.Fragment key={s.id}>
              <ListItem secondaryAction={<Chip label={s.amount} size="small" />}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.main }}>
                    <ScheduleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={s.feed} secondary={`Thời gian: ${s.time}`} />
                <Chip label={s.time} size="small" sx={{ ml: 2 }} />
              </ListItem>
              {idx < schedules.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body1">Chọn một mục từ menu bên trái để xem nội dung.</Typography>
    </Paper>
  );
};

export default ManagerDashboard;

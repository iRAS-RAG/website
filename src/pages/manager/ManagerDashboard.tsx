import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
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

const SectionRenderer: React.FC = () => {
  const { hash } = useLocation();
  const section = (hash || "").replace("#", "") || "overview";

  // Mock data are imported from src/mocks/manager.ts

  if (section === "species") {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Species
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Optimal Temp</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {species.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.optimalTemp}</TableCell>
                  <TableCell align="right">
                    <Button size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (section === "feeds") {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Feed Types
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Protein</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeds.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>{f.protein}</TableCell>
                  <TableCell align="right">
                    <Button size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (section === "thresholds") {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Thresholds
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sensor</TableCell>
                <TableCell>Min</TableCell>
                <TableCell>Max</TableCell>
                <TableCell>Unit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {thresholds.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.sensor}</TableCell>
                  <TableCell>{t.min}</TableCell>
                  <TableCell>{t.max}</TableCell>
                  <TableCell>{t.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (section === "schedule") {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Feeding Schedule
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Feed</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.time}</TableCell>
                  <TableCell>{s.feed}</TableCell>
                  <TableCell>{s.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body1">Chọn một mục từ menu bên trái để xem nội dung.</Typography>
    </Paper>
  );
};

export default ManagerDashboard;

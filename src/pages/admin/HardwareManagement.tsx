import { Alert, Box, CircularProgress, Divider, Paper, Snackbar, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ControlDeviceDetail from "../../components/admin/hardware/ControlDeviceDetail";
import ControlDeviceFormDialog from "../../components/admin/hardware/ControlDeviceFormDialog";
import MasterBoardDetail from "../../components/admin/hardware/MasterBoardDetail";
import MasterBoardFormDialog from "../../components/admin/hardware/MasterBoardFormDialog";
import SensorDetail from "../../components/admin/hardware/SensorDetail";
import SensorFormDialog from "../../components/admin/hardware/SensorFormDialog";
import StructureList from "../../components/admin/hardware/StructureList";
import TankDetail from "../../components/admin/hardware/TankDetail";
import TankFormDialog from "../../components/admin/hardware/TankFormDialog";
import useControlDevices from "../../hooks/useControlDevices";
import useMasterBoards from "../../hooks/useMasterBoards";
import useSensorTypes from "../../hooks/useSensorTypes";
import useSensors from "../../hooks/useSensors";
import useTanks from "../../hooks/useTanks";
import type { ControlDevice } from "../../types/control-device";
import type { MasterBoard } from "../../types/masterboard";
import type { Sensor } from "../../types/sensor";
import type { Tank } from "../../types/tank";

const HardwareManagement: React.FC = () => {
  const theme = useTheme();
  const { items: sensorTypes, loading: sensorTypesLoading } = useSensorTypes();
  const { loading: tanksLoading, tanks, handleUpdateTank } = useTanks();
  const { loading: masterBoardsLoading, masterBoards, handleSaveMasterBoard } = useMasterBoards(tanks);
  const { loading: sensorsLoading, sensors, handleSaveSensor } = useSensors();
  const { loading: controlDevicesLoading, controlDevices, handleSaveControl } = useControlDevices();

  const loading = sensorTypesLoading || tanksLoading || masterBoardsLoading || sensorsLoading || controlDevicesLoading;

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  const [expandedTanks, setExpandedTanks] = useState<Record<string, boolean>>({});
  const [expandedBoards, setExpandedBoards] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<{ type: "tank" | "board" | "sensor" | "control"; id: string | null }>({ type: "tank", id: null });
  const [mbDialogOpen, setMbDialogOpen] = useState(false);
  const [tankDialogOpen, setTankDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [editingBoard, setEditingBoard] = useState<MasterBoard | null>(null);
  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<ControlDevice | null>(null);

  useEffect(() => {
    if (!loading && tanks && tanks.length > 0 && selected.id == null) {
      const t = setTimeout(() => setSelected({ type: "tank", id: String(tanks[0].id) }), 0);
      return () => clearTimeout(t);
    }
    return;
  }, [loading, tanks, selected.id]);

  return (
    <Box sx={{ display: "flex", bgcolor: theme.palette.background.default, minHeight: "100vh", width: "100%" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Phần cứng & Cảm biến
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <StructureList
                tanks={tanks}
                masterBoards={masterBoards}
                sensors={sensors}
                controlDevices={controlDevices}
                expandedTanks={expandedTanks}
                setExpandedTanks={setExpandedTanks}
                expandedBoards={expandedBoards}
                setExpandedBoards={setExpandedBoards}
                setSelected={setSelected}
              />

              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 3, minHeight: "82vh" }}>
                  {selected.type === "tank" && selected.id ? (
                    (() => {
                      const t = tanks.find((x) => x.id === selected.id);
                      if (!t) return <Typography>Chọn một bể để xem chi tiết</Typography>;
                      const boards = masterBoards.filter((b) => b.fishTankName === t.name);
                      return (
                        <TankDetail
                          tank={t}
                          boards={boards}
                          sensors={sensors}
                          onEdit={(tn) => {
                            setEditingTank(tn);
                            setTankDialogOpen(true);
                          }}
                          onAddBoard={() => {
                            setEditingBoard(null);
                            setMbDialogOpen(true);
                          }}
                        />
                      );
                    })()
                  ) : selected.type === "board" && selected.id ? (
                    (() => {
                      const b = masterBoards.find((x) => x.id === selected.id);
                      if (!b) return <Typography>Chọn một board để xem chi tiết</Typography>;
                      const boardSensors = sensors.filter((s) => s.masterBoardId === b.id);
                      const boardControls = controlDevices.filter((c) => c.masterBoardId === b.id);
                      return (
                        <MasterBoardDetail
                          board={b}
                          sensors={boardSensors}
                          controls={boardControls}
                          onEdit={(bb) => {
                            setEditingTank(null);
                            setEditingBoard(bb);
                            setMbDialogOpen(true);
                          }}
                          onAddSensor={() => {
                            setEditingSensor(null);
                            setSensorDialogOpen(true);
                          }}
                          onAddControl={() => {
                            setEditingControl(null);
                            setControlDialogOpen(true);
                          }}
                        />
                      );
                    })()
                  ) : selected.type === "sensor" && selected.id ? (
                    (() => {
                      const s = sensors.find((x) => x.id === selected.id);
                      if (!s) return <Typography>Chọn một cảm biến để xem chi tiết</Typography>;
                      return (
                        <SensorDetail
                          sensor={s}
                          onEdit={(ss) => {
                            setEditingSensor(ss);
                            setSensorDialogOpen(true);
                          }}
                        />
                      );
                    })()
                  ) : selected.type === "control" && selected.id ? (
                    (() => {
                      const c = controlDevices.find((x) => x.id === selected.id);
                      if (!c) return <Typography>Chọn một thiết bị điều khiển để xem chi tiết</Typography>;
                      return (
                        <ControlDeviceDetail
                          control={c}
                          onEdit={(cc) => {
                            setEditingControl(cc);
                            setControlDialogOpen(true);
                          }}
                        />
                      );
                    })()
                  ) : (
                    <Box>
                      <Typography variant="h6">Tổng quan phần cứng</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)", lg: "repeat(4,1fr)" } }}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">Loại cảm biến</Typography>
                          <Typography variant="h6">{sensorTypes.length}</Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">Masterboards</Typography>
                          <Typography variant="h6">{masterBoards.length}</Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">Cảm biến</Typography>
                          <Typography variant="h6">{sensors.length}</Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">Thiết bị điều khiển</Typography>
                          <Typography variant="h6">{controlDevices.length}</Typography>
                        </Paper>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <MasterBoardFormDialog
        open={mbDialogOpen}
        onClose={() => {
          setMbDialogOpen(false);
          setEditingBoard(null);
        }}
        onSave={async (v) => {
          await handleSaveMasterBoard(v, editingBoard);
          setSnackMsg(editingBoard ? "Cập nhật masterboard thành công" : "Tạo masterboard thành công");
          setSnackOpen(true);
          setEditingBoard(null);
          setMbDialogOpen(false);
        }}
        initial={editingBoard}
      />
      <TankFormDialog
        open={tankDialogOpen}
        onClose={() => {
          setTankDialogOpen(false);
          setEditingTank(null);
        }}
        onSave={async (v) => {
          await handleUpdateTank(v, editingTank?.id);
          setSnackMsg("Cập nhật bể thành công");
          setSnackOpen(true);
          setEditingTank(null);
          setTankDialogOpen(false);
        }}
        initial={editingTank}
      />
      <SensorFormDialog
        open={sensorDialogOpen}
        onClose={() => {
          setSensorDialogOpen(false);
          setEditingSensor(null);
        }}
        onSave={async (v) => {
          await handleSaveSensor(v, editingSensor?.id);
          setSnackMsg(editingSensor ? "Cập nhật cảm biến thành công" : "Tạo cảm biến thành công");
          setSnackOpen(true);
          setEditingSensor(null);
          setSensorDialogOpen(false);
        }}
        initial={editingSensor}
      />
      <ControlDeviceFormDialog
        open={controlDialogOpen}
        onClose={() => {
          setControlDialogOpen(false);
          setEditingControl(null);
        }}
        onSave={async (v) => {
          await handleSaveControl(v, editingControl?.id);
          setSnackMsg(editingControl ? "Cập nhật thiết bị điều khiển thành công" : "Tạo thiết bị điều khiển thành công");
          setSnackOpen(true);
          setEditingControl(null);
          setControlDialogOpen(false);
        }}
        initial={editingControl}
      />
      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HardwareManagement;

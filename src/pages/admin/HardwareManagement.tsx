import AddIcon from "@mui/icons-material/Add";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SensorsIcon from "@mui/icons-material/Sensors";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
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
import { useToast } from "../../components/common/toastContext";
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
  const toast = useToast();
  const { items: sensorTypes, loading: sensorTypesLoading } = useSensorTypes();
  const {
    loading: tanksLoading,
    tanks,
    handleCreateTank,
    handleUpdateTank,
    handleDeleteTank,
  } = useTanks();
  const {
    loading: masterBoardsLoading,
    masterBoards,
    handleSaveMasterBoard,
    handleDeleteMasterBoard,
  } = useMasterBoards();
  const {
    loading: sensorsLoading,
    sensors,
    handleSaveSensor,
    handleDeleteSensor,
  } = useSensors();
  const {
    loading: controlDevicesLoading,
    controlDevices,
    handleSaveControl,
    handleDeleteControl,
  } = useControlDevices();

  const loading =
    sensorTypesLoading ||
    tanksLoading ||
    masterBoardsLoading ||
    sensorsLoading ||
    controlDevicesLoading;

  const [expandedTanks, setExpandedTanks] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedBoards, setExpandedBoards] = useState<Record<string, boolean>>(
    {},
  );
  const [selected, setSelected] = useState<{
    type: "tank" | "board" | "sensor" | "control";
    id: string | null;
  }>({ type: "tank", id: null });
  const [mbDialogOpen, setMbDialogOpen] = useState(false);
  const [selectedTankForBoard, setSelectedTankForBoard] = useState<
    string | null
  >(null);
  const [tankDialogOpen, setTankDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [editingBoard, setEditingBoard] = useState<MasterBoard | null>(null);
  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [selectedBoardForSensor, setSelectedBoardForSensor] = useState<
    string | null
  >(null);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [selectedBoardForControl, setSelectedBoardForControl] = useState<
    string | null
  >(null);
  const [editingControl, setEditingControl] = useState<ControlDevice | null>(
    null,
  );

  useEffect(() => {
    if (!loading && tanks && tanks.length > 0 && selected.id == null) {
      const t = setTimeout(
        () => setSelected({ type: "tank", id: String(tanks[0].id) }),
        0,
      );
      return () => clearTimeout(t);
    }
    return;
  }, [loading, tanks, selected.id]);

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <AdminSidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AdminHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <SensorsIcon fontSize="small" />
                Phần cứng & Cảm biến
              </span>
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingTank(null);
                setTankDialogOpen(true);
              }}
            >
              Thêm bể
            </Button>
          </Box>

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
                      if (!t)
                        return (
                          <Typography>Chọn một bể để xem chi tiết</Typography>
                        );
                      const boards = masterBoards.filter(
                        (b) => b.fishTankName === t.name,
                      );
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
                            setSelectedTankForBoard(t.id);
                            setMbDialogOpen(true);
                          }}
                          onDelete={async (tn) => {
                            const ok = window.confirm(
                              `Bạn có chắc muốn xóa bể "${tn.name}" không?`,
                            );
                            if (!ok) return;
                            const remaining = tanks.filter(
                              (x) => x.id !== tn.id,
                            );
                            await handleDeleteTank(tn.id);
                            if (
                              selected.type === "tank" &&
                              selected.id === tn.id
                            ) {
                              setSelected(
                                remaining.length > 0
                                  ? {
                                      type: "tank",
                                      id: String(remaining[0].id),
                                    }
                                  : { type: "tank", id: null },
                              );
                            }
                            toast.success("Xóa bể thành công");
                          }}
                        />
                      );
                    })()
                  ) : selected.type === "board" && selected.id ? (
                    (() => {
                      const b = masterBoards.find((x) => x.id === selected.id);
                      if (!b)
                        return (
                          <Typography>
                            Chọn một board để xem chi tiết
                          </Typography>
                        );
                      const boardSensors = sensors.filter(
                        (s) => s.masterBoardId === b.id,
                      );
                      const boardControls = controlDevices.filter(
                        (c) => c.masterBoardId === b.id,
                      );
                      return (
                        <MasterBoardDetail
                          board={b}
                          sensors={boardSensors}
                          controls={boardControls}
                          onEdit={(bb) => {
                            setEditingTank(null);
                            setEditingBoard(bb);
                            const parentTank = tanks.find(
                              (t) => t.name === bb.fishTankName,
                            );
                            setSelectedTankForBoard(parentTank?.id ?? null);
                            setMbDialogOpen(true);
                          }}
                          onDelete={async (bb) => {
                            const ok = window.confirm(
                              `Bạn có chắc muốn xóa bảng mạch "${bb.name}" không?`,
                            );
                            if (!ok) return;
                            await handleDeleteMasterBoard(bb.id);
                            const parentTank = tanks.find(
                              (t) => t.name === bb.fishTankName,
                            );
                            if (
                              selected.type === "board" &&
                              selected.id === bb.id
                            ) {
                              setSelected(
                                parentTank
                                  ? { type: "tank", id: String(parentTank.id) }
                                  : { type: "tank", id: null },
                              );
                            }
                            toast.success("Xóa bảng mạch thành công");
                          }}
                          onAddSensor={() => {
                            setEditingSensor(null);
                            setSelectedBoardForSensor(b.id);
                            setSensorDialogOpen(true);
                          }}
                          onAddControl={() => {
                            setEditingControl(null);
                            setSelectedBoardForControl(b.id);
                            setControlDialogOpen(true);
                          }}
                        />
                      );
                    })()
                  ) : selected.type === "sensor" && selected.id ? (
                    (() => {
                      const s = sensors.find((x) => x.id === selected.id);
                      if (!s)
                        return (
                          <Typography>
                            Chọn một cảm biến để xem chi tiết
                          </Typography>
                        );
                      return (
                        <SensorDetail
                          sensor={s}
                          onEdit={(ss) => {
                            setEditingSensor(ss);
                            setSelectedBoardForSensor(ss.masterBoardId ?? null);
                            setSensorDialogOpen(true);
                          }}
                          onDelete={async (ss) => {
                            const ok = window.confirm(
                              `Bạn có chắc muốn xóa cảm biến "${ss.name}" không?`,
                            );
                            if (!ok) return;
                            await handleDeleteSensor(ss.id);
                            if (
                              selected.type === "sensor" &&
                              selected.id === ss.id
                            ) {
                              setSelected(
                                ss.masterBoardId
                                  ? {
                                      type: "board",
                                      id: String(ss.masterBoardId),
                                    }
                                  : { type: "tank", id: null },
                              );
                            }
                            toast.success("Xóa cảm biến thành công");
                          }}
                        />
                      );
                    })()
                  ) : selected.type === "control" && selected.id ? (
                    (() => {
                      const c = controlDevices.find(
                        (x) => x.id === selected.id,
                      );
                      if (!c)
                        return (
                          <Typography>
                            Chọn một thiết bị điều khiển để xem chi tiết
                          </Typography>
                        );
                      return (
                        <ControlDeviceDetail
                          control={c}
                          onEdit={(cc) => {
                            setEditingControl(cc);
                            setSelectedBoardForControl(
                              cc.masterBoardId ?? null,
                            );
                            setControlDialogOpen(true);
                          }}
                          onDelete={async (cc) => {
                            const ok = window.confirm(
                              `Bạn có chắc muốn xóa thiết bị điều khiển "${cc.name}" không?`,
                            );
                            if (!ok) return;
                            await handleDeleteControl(cc.id);
                            if (
                              selected.type === "control" &&
                              selected.id === cc.id
                            ) {
                              setSelected(
                                cc.masterBoardId
                                  ? {
                                      type: "board",
                                      id: String(cc.masterBoardId),
                                    }
                                  : { type: "tank", id: null },
                              );
                            }
                            toast.success("Xóa thiết bị điều khiển thành công");
                          }}
                        />
                      );
                    })()
                  ) : (
                    <Box>
                      <Typography variant="h6">Tổng quan phần cứng</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(2,1fr)",
                            lg: "repeat(4,1fr)",
                          },
                        }}
                      >
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <SensorsIcon fontSize="small" />
                              Loại cảm biến
                            </span>
                          </Typography>
                          <Typography variant="h6">
                            {sensorTypes.length}
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <DeveloperBoardIcon fontSize="small" />
                              Masterboards
                            </span>
                          </Typography>
                          <Typography variant="h6">
                            {masterBoards.length}
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <ThermostatIcon fontSize="small" />
                              Cảm biến
                            </span>
                          </Typography>
                          <Typography variant="h6">{sensors.length}</Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle2">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <PowerSettingsNewIcon fontSize="small" />
                              Thiết bị điều khiển
                            </span>
                          </Typography>
                          <Typography variant="h6">
                            {controlDevices.length}
                          </Typography>
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
          setSelectedTankForBoard(null);
        }}
        onSave={async (v) => {
          await handleSaveMasterBoard(v, editingBoard);
          toast.success(
            editingBoard
              ? "Cập nhật bảng mạch thành công"
              : "Tạo bảng mạch thành công",
          );
          setEditingBoard(null);
          setSelectedTankForBoard(null);
          setMbDialogOpen(false);
        }}
        initial={editingBoard}
        defaultFishTankId={selectedTankForBoard}
      />
      <TankFormDialog
        open={tankDialogOpen}
        onClose={() => {
          setTankDialogOpen(false);
          setEditingTank(null);
        }}
        onSave={async (v) => {
          if (editingTank?.id) {
            await handleUpdateTank(v, editingTank.id);
          } else {
            await handleCreateTank(v);
          }
          toast.success(
            editingTank ? "Cập nhật bể thành công" : "Tạo bể thành công",
          );
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
          setSelectedBoardForSensor(null);
        }}
        onSave={async (v) => {
          await handleSaveSensor(v, editingSensor?.id);
          toast.success(
            editingSensor
              ? "Cập nhật cảm biến thành công"
              : "Tạo cảm biến thành công",
          );
          setEditingSensor(null);
          setSelectedBoardForSensor(null);
          setSensorDialogOpen(false);
        }}
        initial={editingSensor}
        defaultMasterBoardId={selectedBoardForSensor}
      />
      <ControlDeviceFormDialog
        open={controlDialogOpen}
        onClose={() => {
          setControlDialogOpen(false);
          setEditingControl(null);
          setSelectedBoardForControl(null);
        }}
        onSave={async (v) => {
          await handleSaveControl(v, editingControl?.id);
          toast.success(
            editingControl
              ? "Cập nhật thiết bị điều khiển thành công"
              : "Tạo thiết bị điều khiển thành công",
          );
          setEditingControl(null);
          setSelectedBoardForControl(null);
          setControlDialogOpen(false);
        }}
        initial={editingControl}
        defaultMasterBoardId={selectedBoardForControl}
      />
    </Box>
  );
};

export default HardwareManagement;

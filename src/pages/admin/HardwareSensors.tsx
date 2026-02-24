import EditIcon from "@mui/icons-material/Edit";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MemoryIcon from "@mui/icons-material/Memory";
import OpacityIcon from "@mui/icons-material/Opacity";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { Alert, Box, Button, CircularProgress, Collapse, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Snackbar, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ControlDeviceFormDialog from "../../components/admin/hardware/ControlDeviceFormDialog";
import MasterBoardFormDialog from "../../components/admin/hardware/MasterBoardFormDialog";
import SensorFormDialog from "../../components/admin/hardware/SensorFormDialog";
import TankFormDialog from "../../components/admin/hardware/TankFormDialog";
import useHardwareData from "../../hooks/useHardwareData";
import type { ControlDevice, MasterBoard, Sensor, Tank } from "../../types/hardware";

const HardwareSensors: React.FC = () => {
  const theme = useTheme();
  const { loading, sensorTypes, masterBoards, sensors, controlDevices, tanks, handleSaveMasterBoard, handleUpdateTank, handleSaveSensor, handleSaveControl, snackOpen, snackMsg, setSnackOpen } =
    useHardwareData();

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
              <Box sx={{ width: { xs: "100%", md: "320px" }, flexShrink: 0 }}>
                <Paper sx={{ p: 0, height: "86vh", overflow: "auto", width: "320px", ml: "-8px", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                  <Typography variant="subtitle1" sx={{ px: 2, pt: 1 }}>
                    Cấu trúc thiết bị
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <List disablePadding>
                    {tanks.map((tank) => {
                      const boards = masterBoards.filter((b) => b.fishTankName === tank.name);
                      return (
                        <Box key={tank.id}>
                          <ListItemButton
                            onClick={() => {
                              setExpandedTanks((p) => ({ ...p, [tank.id]: !p[tank.id] }));
                              setSelected({ type: "tank", id: tank.id });
                            }}
                            sx={{ pl: 2 }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <OpacityIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={tank.name} primaryTypographyProps={{ fontSize: "0.85rem" }} />
                            {expandedTanks[tank.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                          </ListItemButton>
                          <Collapse in={!!expandedTanks[tank.id]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {boards.map((b) => {
                                const boardSensors = sensors.filter((s) => s.masterBoardId === b.id);
                                const boardControls = controlDevices.filter((c) => c.masterBoardId === b.id);
                                return (
                                  <Box key={b.id} sx={{ pl: 2 }}>
                                    <ListItemButton
                                      onClick={() => {
                                        setExpandedBoards((p) => ({ ...p, [b.id]: !p[b.id] }));
                                        setSelected({ type: "board", id: b.id });
                                      }}
                                      sx={{ pl: 2 }}
                                    >
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <MemoryIcon sx={{ color: "#1976d2" }} fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={b.name} secondary={b.macAddress} primaryTypographyProps={{ fontSize: "0.82rem" }} secondaryTypographyProps={{ fontSize: "0.75rem" }} />
                                      {expandedBoards[b.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                    </ListItemButton>
                                    <Collapse in={!!expandedBoards[b.id]} timeout="auto" unmountOnExit>
                                      <List component="div" disablePadding sx={{ pl: 2 }}>
                                        <ListItem sx={{ pl: 1 }}>
                                          <ListItemIcon sx={{ minWidth: 28 }}>
                                            <ThermostatIcon fontSize="small" sx={{ color: "#fb8c00" }} />
                                          </ListItemIcon>
                                          <ListItemText primary="Cảm biến" primaryTypographyProps={{ fontSize: "0.78rem" }} />
                                        </ListItem>
                                        {boardSensors.map((s) => (
                                          <ListItemButton key={s.id} sx={{ pl: 4 }} onClick={() => setSelected({ type: "sensor", id: s.id })}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                              <FiberManualRecordIcon sx={{ color: "#fb8c00", fontSize: 10 }} />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={s.name}
                                              secondary={s.sensorTypeName ? `pin ${s.pinCode} · ${s.sensorTypeName}` : `pin ${s.pinCode}`}
                                              primaryTypographyProps={{ fontSize: "0.8rem" }}
                                              secondaryTypographyProps={{ fontSize: "0.72rem" }}
                                            />
                                          </ListItemButton>
                                        ))}
                                        <ListItem sx={{ pl: 1 }}>
                                          <ListItemIcon sx={{ minWidth: 28 }}>
                                            <PowerSettingsNewIcon fontSize="small" sx={{ color: "#d32f2f" }} />
                                          </ListItemIcon>
                                          <ListItemText primary="Thiết bị điều khiển" primaryTypographyProps={{ fontSize: "0.78rem" }} />
                                        </ListItem>
                                        {boardControls.map((c) => (
                                          <ListItemButton key={c.id} sx={{ pl: 4 }} onClick={() => setSelected({ type: "control", id: c.id })}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                              <FiberManualRecordIcon sx={{ color: "#388e3c", fontSize: 10 }} />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={c.name}
                                              secondary={c.controlDeviceTypeName ?? ""}
                                              primaryTypographyProps={{ fontSize: "0.8rem" }}
                                              secondaryTypographyProps={{ fontSize: "0.72rem" }}
                                            />
                                          </ListItemButton>
                                        ))}
                                      </List>
                                    </Collapse>
                                  </Box>
                                );
                              })}
                              {boards.length === 0 && (
                                <ListItem sx={{ pl: 2 }}>
                                  <ListItemText primary="(Không có masterboard)" />
                                </ListItem>
                              )}
                            </List>
                          </Collapse>
                        </Box>
                      );
                    })}
                    {tanks.length === 0 && (
                      <ListItem>
                        <ListItemText primary="Không có bể" />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 3, minHeight: "82vh" }}>
                  {selected.type === "tank" && selected.id ? (
                    (() => {
                      const t = tanks.find((x) => x.id === selected.id);
                      if (!t) return <Typography>Chọn một bể để xem chi tiết</Typography>;
                      const boards = masterBoards.filter((b) => b.fishTankName === t.name);
                      return (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h6">{t.name}</Typography>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setEditingTank(t);
                                setTankDialogOpen(true);
                              }}
                            >
                              Chỉnh sửa
                            </Button>
                          </Box>
                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)", lg: "repeat(4,1fr)" } }}>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                  CAMERA URL
                                </Typography>
                                {t.cameraUrl ? (
                                  <Typography component="a" href={t.cameraUrl} target="_blank" rel="noreferrer" color="primary" sx={{ mt: 1, display: "block", wordBreak: "break-all" }}>
                                    {t.cameraUrl}
                                  </Typography>
                                ) : (
                                  <Typography sx={{ mt: 1, display: "block" }}>—</Typography>
                                )}
                              </Box>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                MÃ CHỦ ĐỀ
                              </Typography>
                              <Typography sx={{ mt: 1 }}>{t.topicCode ?? "—"}</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                CHIỀU CAO (cm)
                              </Typography>
                              <Typography sx={{ mt: 1 }}>{typeof t.height === "number" ? t.height : "—"}</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                BÁN KÍNH (cm)
                              </Typography>
                              <Typography sx={{ mt: 1 }}>{typeof t.radius === "number" ? t.radius : "—"}</Typography>
                            </Paper>
                          </Box>

                          <Box sx={{ mt: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="subtitle1">Cảm biến liên kết ({sensors.filter((x) => boards.map((b) => b.id).includes(x.masterBoardId ?? "")).length})</Typography>
                              </Box>
                              <Box sx={{ mt: 2 }}>
                                {sensors
                                  .filter((x) => boards.map((b) => b.id).includes(x.masterBoardId ?? ""))
                                  .map((s) => (
                                    <Paper key={s.id} sx={{ p: 1, mb: 1 }}>
                                      <Typography variant="subtitle2">{s.name}</Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {s.sensorTypeName} · {s.pinCode} · {s.masterBoardName}
                                      </Typography>
                                    </Paper>
                                  ))}
                                {sensors.filter((x) => boards.map((b) => b.id).includes(x.masterBoardId ?? "")).length === 0 && (
                                  <Typography color="text.secondary">Không có cảm biến liên kết</Typography>
                                )}
                              </Box>
                            </Paper>
                          </Box>

                          <Box sx={{ mt: 3 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => {
                                setEditingBoard(null);
                                setMbDialogOpen(true);
                              }}
                            >
                              Thêm Board điều khiển chính
                            </Button>
                          </Box>
                        </Box>
                      );
                    })()
                  ) : selected.type === "board" && selected.id ? (
                    (() => {
                      const b = masterBoards.find((x) => x.id === selected.id);
                      if (!b) return <Typography>Chọn một board để xem chi tiết</Typography>;
                      const boardSensors = sensors.filter((s) => s.masterBoardId === b.id);
                      const boardControls = controlDevices.filter((c) => c.masterBoardId === b.id);
                      return (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box>
                              <Typography variant="h6">{b.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {b.fishTankName ? `Bể: ${b.fishTankName}` : "(Không liên kết bể)"}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setEditingTank(null);
                                setEditingBoard(b);
                                setMbDialogOpen(true);
                              }}
                            >
                              Chỉnh sửa
                            </Button>
                          </Box>
                          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => {
                                setEditingSensor(null);
                                setSensorDialogOpen(true);
                              }}
                            >
                              Thêm cảm biến
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => {
                                setEditingControl(null);
                                setControlDialogOpen(true);
                              }}
                            >
                              Thêm thiết bị điều khiển
                            </Button>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" } }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2">MAC Address</Typography>
                              <Typography sx={{ mt: 1 }}>{b.macAddress ?? "—"}</Typography>
                            </Paper>
                          </Box>

                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1">Cảm biến ({boardSensors.length})</Typography>
                            <List>
                              {boardSensors.map((s) => (
                                <ListItem key={s.id}>
                                  <ListItemText primary={s.name} secondary={s.sensorTypeName ?? ""} />
                                </ListItem>
                              ))}
                              {boardSensors.length === 0 && (
                                <ListItem>
                                  <ListItemText primary="Không có" />
                                </ListItem>
                              )}
                            </List>
                          </Box>

                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Thiết bị điều khiển ({boardControls.length})</Typography>
                            <List>
                              {boardControls.map((c) => (
                                <ListItem key={c.id}>
                                  <ListItemText primary={c.name} secondary={c.controlDeviceTypeName ?? ""} />
                                </ListItem>
                              ))}
                              {boardControls.length === 0 && (
                                <ListItem>
                                  <ListItemText primary="Không có" />
                                </ListItem>
                              )}
                            </List>
                          </Box>
                        </Box>
                      );
                    })()
                  ) : selected.type === "sensor" && selected.id ? (
                    (() => {
                      const s = sensors.find((x) => x.id === selected.id);
                      if (!s) return <Typography>Chọn một cảm biến để xem chi tiết</Typography>;
                      return (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box>
                              <Typography variant="h6">{s.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {s.sensorTypeName ?? "(Loại không xác định)"}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setEditingSensor(s);
                                setSensorDialogOpen(true);
                              }}
                            >
                              Chỉnh sửa
                            </Button>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                              <Typography variant="subtitle2">Board</Typography>
                              <Typography sx={{ mt: 1 }}>{s.masterBoardName ?? "—"}</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2">Pin</Typography>
                              <Typography sx={{ mt: 1 }}>{s.pinCode ?? "—"}</Typography>
                            </Paper>
                          </Box>
                        </Box>
                      );
                    })()
                  ) : selected.type === "control" && selected.id ? (
                    (() => {
                      const c = controlDevices.find((x) => x.id === selected.id);
                      if (!c) return <Typography>Chọn một thiết bị điều khiển để xem chi tiết</Typography>;
                      return (
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box>
                              <Typography variant="h6">{c.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {c.controlDeviceTypeName ?? "(Loại không xác định)"}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setEditingControl(c);
                                setControlDialogOpen(true);
                              }}
                            >
                              Chỉnh sửa
                            </Button>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                              <Typography variant="subtitle2">Board</Typography>
                              <Typography sx={{ mt: 1 }}>{c.masterBoardName ?? "—"}</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                              <Typography variant="subtitle2">Pin</Typography>
                              <Typography sx={{ mt: 1 }}>{c.pinCode ?? "—"}</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2">Trạng thái</Typography>
                              <Typography sx={{ mt: 1 }}>{c.state ? "Bật" : "Tắt"}</Typography>
                            </Paper>
                          </Box>
                        </Box>
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

export default HardwareSensors;

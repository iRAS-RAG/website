import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MemoryIcon from "@mui/icons-material/Memory";
import OpacityIcon from "@mui/icons-material/Opacity";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { Box, Collapse, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import React from "react";
import type { ControlDevice } from "../../../types/control-device";
import type { MasterBoard } from "../../../types/masterboard";
import type { Sensor } from "../../../types/sensor";
import type { Tank } from "../../../types/tank";

type Props = {
  tanks: Tank[];
  masterBoards: MasterBoard[];
  sensors: Sensor[];
  controlDevices: ControlDevice[];
  expandedTanks: Record<string, boolean>;
  setExpandedTanks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedBoards: Record<string, boolean>;
  setExpandedBoards: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setSelected: (s: { type: "tank" | "board" | "sensor" | "control"; id: string | null }) => void;
};

export default function StructureList({ tanks, masterBoards, sensors, controlDevices, expandedTanks, setExpandedTanks, expandedBoards, setExpandedBoards, setSelected }: Props) {
  return (
    <Box sx={{ width: { xs: "100%", md: "320px" }, flexShrink: 0 }}>
      <Paper sx={{ p: 0, height: "86vh", overflow: "auto", width: "320px", ml: "-8px", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
        <Box sx={{ px: 2, pt: 1 }}>
          <ListItemTextPrimary />
        </Box>
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
                  <ListItemText primary={<Typography sx={{ fontSize: "0.85rem" }}>{tank.name}</Typography>} />
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
                            <ListItemText
                              primary={<Typography sx={{ fontSize: "0.82rem" }}>{b.name}</Typography>}
                              secondary={b.macAddress ? <Typography sx={{ fontSize: "0.75rem" }}>{b.macAddress}</Typography> : undefined}
                            />
                            {expandedBoards[b.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                          </ListItemButton>
                          <Collapse in={!!expandedBoards[b.id]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 2 }}>
                              <ListItem sx={{ pl: 1 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  <ThermostatIcon fontSize="small" sx={{ color: "#fb8c00" }} />
                                </ListItemIcon>
                                <ListItemText primary={<Typography sx={{ fontSize: "0.78rem" }}>Cảm biến</Typography>} />
                              </ListItem>
                              {boardSensors.map((s) => (
                                <ListItemButton key={s.id} sx={{ pl: 4 }} onClick={() => setSelected({ type: "sensor", id: s.id })}>
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <FiberManualRecordIcon sx={{ color: "#fb8c00", fontSize: 10 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={<Typography sx={{ fontSize: "0.8rem" }}>{s.name}</Typography>}
                                    secondary={<Typography sx={{ fontSize: "0.72rem" }}>{s.sensorTypeName ? `pin ${s.pinCode} · ${s.sensorTypeName}` : `pin ${s.pinCode}`}</Typography>}
                                  />
                                </ListItemButton>
                              ))}
                              <ListItem sx={{ pl: 1 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  <PowerSettingsNewIcon fontSize="small" sx={{ color: "#d32f2f" }} />
                                </ListItemIcon>
                                <ListItemText primary={<Typography sx={{ fontSize: "0.78rem" }}>Thiết bị điều khiển</Typography>} />
                              </ListItem>
                              {boardControls.map((c) => (
                                <ListItemButton key={c.id} sx={{ pl: 4 }} onClick={() => setSelected({ type: "control", id: c.id })}>
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <FiberManualRecordIcon sx={{ color: "#388e3c", fontSize: 10 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={<Typography sx={{ fontSize: "0.8rem" }}>{c.name}</Typography>}
                                    secondary={<Typography sx={{ fontSize: "0.72rem" }}>{c.controlDeviceTypeName ?? ""}</Typography>}
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
  );
}

function ListItemTextPrimary() {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 500 }}>Cấu trúc thiết bị</div>
    </>
  );
}

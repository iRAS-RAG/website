import AirIcon from "@mui/icons-material/Air";
import BoltIcon from "@mui/icons-material/Bolt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MemoryIcon from "@mui/icons-material/Memory";
import OpacityIcon from "@mui/icons-material/Opacity";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ScienceIcon from "@mui/icons-material/Science";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
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
  setExpandedTanks: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  expandedBoards: Record<string, boolean>;
  setExpandedBoards: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setSelected: (s: {
    type: "tank" | "board" | "sensor" | "control";
    id: string | null;
  }) => void;
  // THÊM PROP NÀY ĐỂ XỬ LÝ ACTIVE STATE
  selected: {
    type: "tank" | "board" | "sensor" | "control";
    id: string | null;
  };
};

export default function StructureList({
  tanks,
  masterBoards,
  sensors,
  controlDevices,
  expandedTanks,
  setExpandedTanks,
  expandedBoards,
  setExpandedBoards,
  setSelected,
  selected,
}: Props) {
  const theme = useTheme();

  const sensorIcon = (typeName?: string) => {
    const t = typeName?.toLowerCase() || "";
    const sx = { fontSize: 14 };
    if (t.includes("công suất")) return <BoltIcon sx={{ ...sx, color: "#EC4899" }} />;
    if (t.includes("điện áp")) return <BoltIcon sx={{ ...sx, color: "#F97316" }} />;
    if (t.includes("dòng điện")) return <BoltIcon sx={{ ...sx, color: "#EF4444" }} />;
    if (t.includes("lưu lượng")) return <AirIcon sx={{ ...sx, color: "#06B6D4" }} />;
    if (t.includes("mực nước")) return <WaterDropIcon sx={{ ...sx, color: "#14B8A6" }} />;
    if (t.includes("nhiệt độ")) return <ThermostatIcon sx={{ ...sx, color: "#3B82F6" }} />;
    if (t.includes("ph")) return <ScienceIcon sx={{ ...sx, color: "#8B5CF6" }} />;
    if (t.includes("tds")) return <WaterDropIcon sx={{ ...sx, color: "#F59E0B" }} />;
    return <ThermostatIcon sx={{ ...sx, color: "#64748B" }} />;
  };

  const deviceIcon = (typeName?: string) => {
    const t = typeName?.toLowerCase() || "";
    const sx = { fontSize: 14, color: "#64748B" };
    if (t.includes("bơm") || t.includes("pump")) return <PowerSettingsNewIcon sx={{ ...sx, color: "#06B6D4" }} />;
    if (t.includes("quạt") || t.includes("fan")) return <AirIcon sx={{ ...sx, color: "#10B981" }} />;
    if (t.includes("đèn") || t.includes("light")) return <BoltIcon sx={{ ...sx, color: "#F59E0B" }} />;
    if (t.includes("van") || t.includes("valve")) return <OpacityIcon sx={{ ...sx, color: "#3B82F6" }} />;
    return <PowerSettingsNewIcon sx={sx} />;
  };

  // Hàm helper để tạo style cho Active State
  const getActiveStyle = (isSelected: boolean) => ({
    borderRadius: "0 8px 8px 0",
    borderLeft: isSelected
      ? `4px solid ${theme.palette.primary.main}`
      : "4px solid transparent",
    bgcolor: isSelected
      ? alpha(theme.palette.primary.main, 0.08)
      : "transparent",
    "&:hover": {
      bgcolor: isSelected
        ? alpha(theme.palette.primary.main, 0.12)
        : "action.hover",
    },
    mb: 0.5,
  });

  return (
    <Box sx={{ width: { xs: "100%", md: "320px" }, flexShrink: 0 }}>
      <Paper
        sx={{
          p: 0,
          height: "86vh",
          overflow: "auto",
          width: "320px",
          ml: "-8px",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Cấu trúc thiết bị
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <List disablePadding>
          {tanks.map((tank) => {
            const isTankSelected =
              selected.type === "tank" && selected.id === tank.id;
            // Ưu tiên lọc theo fishTankId (chính xác); fallback theo tên
            // cho dữ liệu cũ chưa có fishTankId.
            const boards = masterBoards.filter((b) =>
              b.fishTankId ? b.fishTankId === tank.id : b.fishTankName === tank.name,
            );
            const isTankExpanded = !!expandedTanks[tank.id];

            return (
              <Box key={tank.id}>
                {/* CẤP 1: BỂ NUÔI */}
                <ListItemButton
                  onClick={() => {
                    setExpandedTanks((p) => ({ ...p, [tank.id]: !p[tank.id] }));
                    setSelected({ type: "tank", id: tank.id });
                  }}
                  sx={{ ...getActiveStyle(isTankSelected), pl: 2, pr: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <OpacityIcon
                      color={isTankSelected ? "primary" : "action"}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: isTankSelected ? 700 : 600,
                          color: isTankSelected
                            ? "primary.main"
                            : "text.primary",
                        }}
                      >
                        {tank.name}
                      </Typography>
                    }
                  />
                  <ExpandMoreIcon
                    fontSize="small"
                    color="action"
                    sx={{
                      transition: "transform 0.3s ease",
                      transform: isTankExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)", // UX 4: Xoay mượt mà
                    }}
                  />
                </ListItemButton>

                <Collapse in={isTankExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mt: 1, mb: 2 }}>
                    {boards.map((b, bIndex) => {
                      const isBoardSelected =
                        selected.type === "board" && selected.id === b.id;
                      const isBoardExpanded = !!expandedBoards[b.id];
                      const boardSensors = sensors
                        .filter((s) => s.masterBoardId === b.id)
                        .sort((a, b) => (a.pinCode ?? 999) - (b.pinCode ?? 999));
                      const boardControls = controlDevices
                        .filter((c) => c.masterBoardId === b.id)
                        .sort((a, b) => (a.pinCode ?? 999) - (b.pinCode ?? 999));

                      return (
                        <Box
                          key={b.id}
                          sx={{ mb: bIndex !== boards.length - 1 ? 2 : 0 }}
                        >
                          {" "}
                          {/* UX 2: Khoảng cách giữa các Board */}
                          {/* CẤP 2: BẢNG MẠCH */}
                          <ListItemButton
                            onClick={() => {
                              setExpandedBoards((p) => ({
                                ...p,
                                [b.id]: !p[b.id],
                              }));
                              setSelected({ type: "board", id: b.id });
                            }}
                            sx={{
                              ...getActiveStyle(isBoardSelected),
                              pl: 4,
                              pr: 2,
                            }} // Indent sâu hơn
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <MemoryIcon
                                sx={{
                                  color: isBoardSelected
                                    ? "primary.main"
                                    : "primary.light",
                                }}
                                fontSize="small"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontSize: "0.88rem",
                                    fontWeight: 600,
                                    color: "text.primary",
                                  }}
                                >
                                  {b.name}
                                </Typography>
                              }
                              secondary={
                                b.macAddress ? (
                                  <Typography
                                    sx={{
                                      fontSize: "11px",
                                      color: "text.secondary",
                                      fontFamily: "monospace",
                                      mt: 0.2,
                                    }}
                                  >
                                    {b.macAddress}
                                  </Typography>
                                ) : undefined
                              }
                            />
                            <ExpandMoreIcon
                              fontSize="small"
                              color="action"
                              sx={{
                                transition: "transform 0.3s ease",
                                transform: isBoardExpanded
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              }}
                            />
                          </ListItemButton>
                          <Collapse
                            in={isBoardExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <List component="div" disablePadding sx={{ pl: 1 }}>
                              {/* --- HEADER CẢM BIẾN --- */}
                              {boardSensors.length > 0 && (
                                <ListItem sx={{ pl: 5, py: 0.5, mt: 1 }}>
                                  <Typography
                                    sx={{
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      color: "text.secondary",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Cảm biến
                                  </Typography>
                                </ListItem>
                              )}

                              {/* CẤP 3: CẢM BIẾN */}
                              {boardSensors.map((s) => {
                                const isSensorSelected =
                                  selected.type === "sensor" &&
                                  selected.id === s.id;
                                return (
                                  <ListItemButton
                                    key={s.id}
                                    sx={{
                                      ...getActiveStyle(isSensorSelected),
                                      pl: 5.5,
                                      pr: 2,
                                      py: 0.5,
                                    }}
                                    onClick={() =>
                                      setSelected({ type: "sensor", id: s.id })
                                    }
                                  >
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      {sensorIcon(s.sensorTypeName)}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          sx={{
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                            color: "text.primary",
                                          }}
                                        >
                                          {/* Ưu tiên hiển thị Loại cảm biến, xử lý an toàn nếu null */}
                                          {s.sensorTypeName ||
                                            "Cảm biến chưa phân loại"}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography
                                          sx={{
                                            fontSize: "11px",
                                            color: "text.secondary",
                                            mt: 0.2,
                                            fontWeight: 500,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                          }}
                                        >
                                          Pin:{" "}
                                          <span
                                            style={{
                                              fontFamily: "monospace",
                                              fontSize: "12px",
                                              color: "inherit",
                                            }}
                                          >
                                            {s.pinCode ?? "-"}
                                          </span>
                                        </Typography>
                                      }
                                    />
                                  </ListItemButton>
                                );
                              })}

                              {/* --- HEADER ĐIỀU KHIỂN --- */}
                              {boardControls.length > 0 && (
                                <ListItem sx={{ pl: 5, py: 0.5, mt: 1.5 }}>
                                  <Typography
                                    sx={{
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      color: "text.secondary",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Thiết bị điều khiển
                                  </Typography>
                                </ListItem>
                              )}

                              {/* CẤP 3: THIẾT BỊ ĐIỀU KHIỂN */}
                              {boardControls.map((c) => {
                                const isControlSelected =
                                  selected.type === "control" &&
                                  selected.id === c.id;
                                return (
                                  <ListItemButton
                                    key={c.id}
                                    sx={{
                                      ...getActiveStyle(isControlSelected),
                                      pl: 5.5,
                                      pr: 2,
                                      py: 0.5,
                                    }}
                                    onClick={() =>
                                      setSelected({ type: "control", id: c.id })
                                    }
                                  >
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      {deviceIcon(c.controlDeviceTypeName)}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          sx={{
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                            color: "text.primary",
                                          }}
                                        >
                                          {/* Ưu tiên hiển thị Loại thiết bị, xử lý an toàn nếu null */}
                                          {c.controlDeviceTypeName ||
                                            "Thiết bị chưa phân loại"}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography
                                          sx={{
                                            fontSize: "11px",
                                            color: "text.secondary",
                                            mt: 0.2,
                                            fontWeight: 500,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                          }}
                                        >
                                          Pin:{" "}
                                          <span
                                            style={{
                                              fontFamily: "monospace",
                                              fontSize: "12px",
                                              color: "inherit",
                                            }}
                                          >
                                            {c.pinCode ?? "-"}
                                          </span>
                                        </Typography>
                                      }
                                    />
                                  </ListItemButton>
                                );
                              })}
                            </List>
                          </Collapse>
                        </Box>
                      );
                    })}
                    {boards.length === 0 && (
                      <ListItem sx={{ pl: 5 }}>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontSize: "0.85rem",
                                color: "text.secondary",
                                fontStyle: "italic",
                              }}
                            >
                              (Chưa có bảng mạch)
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </Collapse>
              </Box>
            );
          })}
          {tanks.length === 0 && (
            <ListItem sx={{ justifyContent: "center", py: 4 }}>
              <ListItemText
                primary={
                  <Typography
                    sx={{ color: "text.secondary", textAlign: "center" }}
                  >
                    Không có bể nào
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

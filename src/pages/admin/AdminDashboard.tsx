import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

// Icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import RouterIcon from "@mui/icons-material/Router";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import type { AuditLog } from "../../types/audit-log";

// ─── Types ───────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  onClick,
}) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: "14px",
      border: "1px solid #E2E8F0",
      borderTop: `4px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.15s, box-shadow 0.15s",
      bgcolor: "#fff",
      height: "100%",
      "&:hover": onClick
        ? {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }
        : undefined,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1 }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{ color: "#94A3B8", mt: 0.5, display: "block" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <Avatar
        sx={{
          bgcolor: `${color}15`,
          color: color,
          width: 48,
          height: 48,
          borderRadius: "12px",
        }}
      >
        <Icon />
      </Avatar>
    </Stack>
  </Paper>
);

// ─── Helpers cho Audit Log feed ──────────────────────────────────────────────

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function getActionMeta(action: string): {
  color: string;
  bg: string;
  label: string;
  icon: React.ElementType;
} {
  const a = action.toUpperCase();
  if (a.includes("CREATE") || a.includes("ADD") || a.includes("INSERT"))
    return {
      color: "#10B981",
      bg: "#ECFDF5",
      label: "Tạo",
      icon: AddCircleOutlineIcon,
    };
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("MODIFY"))
    return {
      color: "#F59E0B",
      bg: "#FFFBEB",
      label: "Sửa",
      icon: EditOutlinedIcon,
    };
  if (a.includes("DELETE") || a.includes("REMOVE"))
    return {
      color: "#EF4444",
      bg: "#FEF2F2",
      label: "Xóa",
      icon: DeleteOutlineIcon,
    };
  if (a.includes("LOGIN"))
    return {
      color: "#2A85FF",
      bg: "#EFF6FF",
      label: "Đăng nhập",
      icon: LoginIcon,
    };
  if (a.includes("LOGOUT"))
    return {
      color: "#64748B",
      bg: "#F1F5F9",
      label: "Đăng xuất",
      icon: LogoutIcon,
    };
  return {
    color: "#64748B",
    bg: "#F1F5F9",
    label: action || "Khác",
    icon: HistoryIcon,
  };
}

function userDisplay(log: AuditLog): string {
  const full = `${log.lastName ?? ""} ${log.firstName ?? ""}`.trim();
  return full || log.email || "Người dùng";
}

function describeEntity(log: AuditLog): string {
  if (!log.entityType) return "";
  // Ẩn entity với action xác thực (Auth/User cho LOGIN/LOGOUT) — không hữu ích
  const action = log.action.toUpperCase();
  if (action.includes("LOGIN") || action.includes("LOGOUT")) return "";
  if (log.entityType.toUpperCase() === "AUTH") return "";
  const shortId = log.entityId ? log.entityId.slice(0, 8) : "";
  return shortId ? `${log.entityType} #${shortId}` : log.entityType;
}

const ACTION_FILTERS: { key: string; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "CREATE", label: "Tạo" },
  { key: "UPDATE", label: "Sửa" },
  { key: "DELETE", label: "Xóa" },
  { key: "LOGIN", label: "Đăng nhập" },
];

// ─── Activity Feed ───────────────────────────────────────────────────────────

const ActivityFeed: React.FC<{ logs: AuditLog[]; loading: boolean }> = ({
  logs,
  loading,
}) => {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    // Sắp xếp mới nhất lên đầu (BE có thể trả về thứ tự bất kỳ)
    const sorted = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    if (filter === "ALL") return sorted;
    return sorted.filter((l) => l.action.toUpperCase().includes(filter));
  }, [logs, filter]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "14px",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      {/* Header + filter chips */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
          mb={1.5}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon sx={{ color: "#475569", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
              Hoạt động hệ thống gần đây
            </Typography>
            <Chip
              size="small"
              label={filtered.length}
              sx={{
                bgcolor: "#F1F5F9",
                color: "#475569",
                fontWeight: 700,
                height: 20,
                fontSize: "0.7rem",
              }}
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {ACTION_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              onClick={() => setFilter(f.key)}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                bgcolor: filter === f.key ? "#0F172A" : "#F1F5F9",
                color: filter === f.key ? "#fff" : "#475569",
                "&:hover": {
                  bgcolor: filter === f.key ? "#0F172A" : "#E2E8F0",
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={26} />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: "#94A3B8", py: 4, textAlign: "center" }}
        >
          Chưa có hoạt động nào phù hợp bộ lọc
        </Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {filtered.map((log, idx) => {
            const meta = getActionMeta(log.action);
            const Icon = meta.icon;
            return (
              <React.Fragment key={log.id}>
                <ListItem sx={{ py: 1.75, px: 2.5, alignItems: "flex-start" }}>
                  <ListItemAvatar sx={{ minWidth: 52 }}>
                    <Avatar
                      sx={{
                        bgcolor: meta.bg,
                        color: meta.color,
                        width: 38,
                        height: 38,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Chip
                          size="small"
                          label={meta.label}
                          sx={{
                            bgcolor: meta.bg,
                            color: meta.color,
                            fontWeight: 700,
                            height: 20,
                            fontSize: "0.65rem",
                          }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#0F172A",
                            fontSize: "0.9rem",
                          }}
                        >
                          {userDisplay(log)}
                        </Typography>
                        {describeEntity(log) && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#475569",
                              bgcolor: "#F8FAFC",
                              px: 0.75,
                              py: 0.25,
                              borderRadius: "6px",
                              fontFamily: "monospace",
                            }}
                          >
                            {describeEntity(log)}
                          </Typography>
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748B", mt: 0.25, display: "block" }}
                      >
                        {log.email}
                      </Typography>
                    }
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94A3B8",
                      whiteSpace: "nowrap",
                      ml: 1,
                      mt: 0.5,
                    }}
                  >
                    {relativeTime(log.timestamp)}
                  </Typography>
                </ListItem>
                {idx < filtered.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

// ─── Phân bố vai trò ─────────────────────────────────────────────────────────

const RoleDistribution: React.FC<{
  usersByRole: Record<string, number>;
  total: number;
}> = ({ usersByRole, total }) => {
  const entries = Object.entries(usersByRole).sort((a, b) => b[1] - a[1]);
  const colorByRole: Record<string, string> = {
    Admin: "#EF4444",
    Supervisor: "#F59E0B",
    Operator: "#2A85FF",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: "1px solid #E2E8F0",
        bgcolor: "#fff",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <PeopleIcon sx={{ color: "#475569", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
          Phân bố vai trò
        </Typography>
      </Stack>

      {total === 0 ? (
        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
          Chưa có dữ liệu người dùng
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {entries.map(([role, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            const color = colorByRole[role] ?? "#64748B";
            return (
              <Box key={role}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.5}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#475569" }}
                  >
                    {role}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#0F172A" }}
                  >
                    {count}{" "}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: "#94A3B8", fontWeight: 500 }}
                    >
                      ({pct.toFixed(0)}%)
                    </Typography>
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: "100%",
                    height: 6,
                    bgcolor: "#F1F5F9",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${pct}%`,
                      height: "100%",
                      bgcolor: color,
                      borderRadius: "999px",
                      transition: "width 0.3s",
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { stats, recentActivity, loading } = useAdminDashboard();
  const navigate = useNavigate();

  const offlineDevices = Math.max(0, stats.totalDevices - stats.runningDevices);

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F8FAFC",
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

        <Box component="main" sx={{ p: { xs: 2.5, md: 3.5 }, flexGrow: 1 }}>
          {/* HEADER */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
            >
              Bảng điều khiển quản trị
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Theo dõi hoạt động hệ thống iRAS-RAG
            </Typography>
          </Box>

          {/* ZONE 1 — KPI BAR */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.5,
              mb: 3,
            }}
          >
            <KpiCard
              title="Hạ tầng IoT"
              value={`${stats.runningDevices}/${stats.totalDevices}`}
              subtitle={
                offlineDevices > 0
                  ? `⚠️ ${offlineDevices} thiết bị đang TẮT`
                  : "Tất cả thiết bị đang chạy"
              }
              icon={RouterIcon}
              color={offlineDevices > 0 ? "#EF4444" : "#10B981"}
              onClick={() => navigate("/admin/hardware")}
            />
            <KpiCard
              title="Người dùng hoạt động hôm nay"
              value={stats.activeUsersToday}
              subtitle={`trên tổng ${stats.totalUsers} tài khoản`}
              icon={HowToRegIcon}
              color="#2A85FF"
              onClick={() => navigate("/admin/users")}
            />
            <KpiCard
              title="Tổng người dùng"
              value={stats.totalUsers}
              subtitle={
                Object.entries(stats.usersByRole)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" • ") || "Chưa có"
              }
              icon={PeopleIcon}
              color="#9333EA"
              onClick={() => navigate("/admin/users")}
            />
            <KpiCard
              title="Tài liệu CSDL tri thức"
              value={stats.totalDocuments}
              subtitle={
                stats.totalDocuments > 0
                  ? "Đã ingest vào RAG"
                  : "Chưa có tài liệu"
              }
              icon={LibraryBooksIcon}
              color="#F59E0B"
              onClick={() => navigate("/admin/ai-knowledge")}
            />
          </Box>

          {/* ZONE 2+3 — Activity feed + Side panel */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
              gap: 2.5,
              alignItems: "start",
            }}
          >
            <ActivityFeed logs={recentActivity} loading={loading} />
            <Stack spacing={2.5}>
              <RoleDistribution
                usersByRole={stats.usersByRole}
                total={stats.totalUsers}
              />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

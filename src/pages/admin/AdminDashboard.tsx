import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";

// Icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryIcon from "@mui/icons-material/History";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import RouterIcon from "@mui/icons-material/Router";
import SearchIcon from "@mui/icons-material/Search";

import { auditLogApi } from "../../api/audit-logs";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import type { AuditLog } from "../../types/audit-log";
import { buildDescription, isSimpleLog, parseAuditJson } from "../../types/audit-log";

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
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
      "&:hover": onClick ? { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } : undefined,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: "#94A3B8", mt: 0.5, display: "block" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Avatar sx={{ bgcolor: `${color}15`, color, width: 48, height: 48, borderRadius: "12px" }}>
        <Icon />
      </Avatar>
    </Stack>
  </Paper>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Keys khớp với giá trị ToRoleName() của BE: "Quản trị viên", "Kỹ thuật viên", "Quản lý"
const ROLE_COLOR: Record<string, string> = {
  "Quản trị viên": "#EF4444",
  "Kỹ thuật viên": "#2A85FF",
  "Quản lý": "#F59E0B",
  // Fallback English (phòng khi BE trả về raw name)
  admin: "#EF4444",
  operator: "#2A85FF",
  supervisor: "#F59E0B",
  Admin: "#EF4444",
  Operator: "#2A85FF",
  Supervisor: "#F59E0B",
};

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
  return `${Math.floor(hours / 24)} ngày trước`;
}

function formatTimestamp(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return (
    d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " UTC"
  );
}

function getActionMeta(action: string): {
  color: string;
  bg: string;
  label: string;
  icon: React.ElementType;
} {
  switch (action) {
    case "Tạo":
      return { color: "#10B981", bg: "#ECFDF5", label: "Tạo", icon: AddCircleOutlineIcon };
    case "Sửa":
      return { color: "#F59E0B", bg: "#FFFBEB", label: "Sửa", icon: EditOutlinedIcon };
    case "Xóa":
      return { color: "#EF4444", bg: "#FEF2F2", label: "Xóa", icon: DeleteOutlineIcon };
    case "Đăng nhập":
      return { color: "#2A85FF", bg: "#EFF6FF", label: "Đăng nhập", icon: LoginIcon };
    case "Đăng xuất":
      return { color: "#64748B", bg: "#F1F5F9", label: "Đăng xuất", icon: LogoutIcon };
    case "Thu hoạch lô":
      return { color: "#8B5CF6", bg: "#F5F3FF", label: "Thu hoạch", icon: AgricultureIcon };
    case "Bật/tắt thiết bị":
      return { color: "#06B6D4", bg: "#ECFEFF", label: "Bật/Tắt", icon: PowerSettingsNewIcon };
    case "Xem báo cáo tổng quan":
    case "Xem báo cáo tuần":
      return { color: "#F59E0B", bg: "#FFFBEB", label: "Báo cáo", icon: AssessmentIcon };
    default:
      return { color: "#64748B", bg: "#F1F5F9", label: action || "Khác", icon: HistoryIcon };
  }
}

// ─── Action filters ───────────────────────────────────────────────────────────

const ACTION_FILTERS = [
  { key: "", label: "Tất cả" },
  { key: "Đăng nhập", label: "Đăng nhập" },
  { key: "Đăng xuất", label: "Đăng xuất" },
  { key: "Tạo", label: "Tạo" },
  { key: "Sửa", label: "Sửa" },
  { key: "Xóa", label: "Xóa" },
  { key: "Thu hoạch lô", label: "Thu hoạch" },
  { key: "Bật/tắt thiết bị", label: "Bật/Tắt TB" },
];

// ─── Aligned comparison (Update: old | new, same row per key) ─────────────────

const AlignedComparison: React.FC<{ oldRaw?: string | null; newRaw?: string | null }> = ({ oldRaw, newRaw }) => {
  const oldData = parseAuditJson(oldRaw) ?? {};
  const newData = parseAuditJson(newRaw) ?? {};
  const HIDDEN = new Set(["name", "Name"]);
  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)])).filter((k) => !HIDDEN.has(k));

  const fmt = (val: unknown): string => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
      {/* Header */}
      <Stack direction="row" sx={{ bgcolor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
        <Box sx={{ width: 130, flexShrink: 0, p: 1.25, borderRight: "1px solid #E2E8F0" }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569" }}>Trường</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 1.25, borderRight: "1px solid #FEE2E2", bgcolor: "#FEF9F9" }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#EF4444" }}>Giá trị cũ</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 1.25, bgcolor: "#F0FDF4" }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#10B981" }}>Giá trị mới</Typography>
        </Box>
      </Stack>

      {allKeys.length === 0 ? (
        <Typography sx={{ p: 2, fontSize: "0.75rem", color: "#94A3B8", fontStyle: "italic" }}>Không có thay đổi nào được ghi nhận</Typography>
      ) : (
        allKeys.map((key, idx) => {
          const oldVal = oldData[key];
          const newVal = newData[key];
          const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
          return (
            <Stack
              key={key}
              direction="row"
              sx={{
                borderBottom: idx < allKeys.length - 1 ? "1px solid #F1F5F9" : "none",
                bgcolor: changed ? "rgba(251,191,36,0.04)" : "transparent",
              }}
            >
              <Box sx={{ width: 130, flexShrink: 0, p: 1.25, borderRight: "1px solid #F1F5F9" }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", wordBreak: "break-word" }}>{key}</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 1.25, borderRight: "1px solid #FEE2E2", bgcolor: changed ? "#FEF2F2" : "transparent" }}>
                <Typography sx={{ fontSize: "0.72rem", color: changed ? "#DC2626" : "#64748B", wordBreak: "break-all" }}>{fmt(oldVal)}</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 1.25, bgcolor: changed ? "#ECFDF5" : "transparent" }}>
                <Typography sx={{ fontSize: "0.72rem", color: changed ? "#059669" : "#64748B", wordBreak: "break-all" }}>{fmt(newVal)}</Typography>
              </Box>
            </Stack>
          );
        })
      )}
    </Box>
  );
};

// ─── Single section (Create / Delete) ────────────────────────────────────────

const SingleSection: React.FC<{
  title: string;
  raw?: string | null;
  titleColor: string;
  borderColor: string;
  bgHeader: string;
}> = ({ title, raw, titleColor, borderColor, bgHeader }) => {
  const data = parseAuditJson(raw);
  const HIDDEN = new Set(["name", "Name"]);
  const entries = data ? Object.entries(data).filter(([k]) => !HIDDEN.has(k)) : [];

  return (
    <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: "10px", overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1, bgcolor: bgHeader, borderBottom: `1px solid ${borderColor}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: titleColor }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 1.5 }}>
        {entries.length > 0 ? (
          <Stack spacing={0.6}>
            {entries.map(([key, val]) => (
              <Stack key={key} direction="row" spacing={1} alignItems="flex-start">
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", minWidth: 130, flexShrink: 0 }}>{key}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#0F172A", wordBreak: "break-all" }}>
                  {val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : raw ? (
          <Typography sx={{ fontSize: "0.72rem", color: "#64748B", whiteSpace: "pre-wrap" }}>{raw}</Typography>
        ) : (
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontStyle: "italic" }}>Không có dữ liệu</Typography>
        )}
      </Box>
    </Box>
  );
};

// ─── Detail Dialog ────────────────────────────────────────────────────────────

const DetailDialog: React.FC<{ log: AuditLog | null; onClose: () => void }> = ({ log, onClose }) => {
  if (!log) return null;

  const meta = getActionMeta(log.action);
  const Icon = meta.icon;
  const isCreate = log.action === "Tạo" && !log.oldValue;
  const isDelete = log.action === "Xóa" && !log.newValue;
  const isUpdate = !!log.oldValue && !!log.newValue;
  const roleColor = log.role ? (ROLE_COLOR[log.role] ?? "#64748B") : "#64748B";

  return (
    <Dialog open={!!log} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: meta.bg, color: meta.color, width: 36, height: 36 }}>
              <Icon fontSize="small" />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Chi tiết hành động</Typography>
              <Typography variant="caption" sx={{ color: "#64748B" }}>
                {formatTimestamp(log.timestamp)}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Thông tin người dùng */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: "10px", mb: 2.5 }}>
          <Stack direction="row" spacing={3} flexWrap="wrap" gap={1.5}>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block", mb: 0.25 }}>
                Người thực hiện
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{log.fullName?.trim() || log.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block", mb: 0.25 }}>
                Email
              </Typography>
              <Typography sx={{ fontSize: "0.85rem" }}>{log.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block", mb: 0.25 }}>
                Vai trò
              </Typography>
              <Chip
                size="small"
                label={log.role || "Không xác định"}
                sx={{
                  bgcolor: `${roleColor}15`,
                  color: roleColor,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  mt: 0.25,
                }}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Mô tả hành động */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block", mb: 0.5 }}>
            Hành động
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#0F172A", mb: 0.75 }}>{buildDescription(log)}</Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            {log.entityType && log.entityType !== "Xác thực" && <Chip size="small" label={log.entityType} sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.68rem" }} />}
            <Chip size="small" label={meta.label} sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: "0.68rem" }} />
          </Stack>
        </Box>

        {/* Nội dung chi tiết */}
        {!isSimpleLog(log) && (isCreate || isDelete || isUpdate) && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#475569", mb: 1.5 }}>{isUpdate ? "Thay đổi nội dung" : isCreate ? "Nội dung được tạo" : "Nội dung bị xóa"}</Typography>

            {isUpdate ? (
              <AlignedComparison oldRaw={log.oldValue} newRaw={log.newValue} />
            ) : isCreate ? (
              <SingleSection title="Nội dung vừa tạo" raw={log.newValue} titleColor="#10B981" borderColor="#D1FAE5" bgHeader="#ECFDF5" />
            ) : (
              <SingleSection title="Nội dung bị xóa" raw={log.oldValue} titleColor="#EF4444" borderColor="#FEE2E2" bgHeader="#FEF2F2" />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Activity Feed ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const ActivityFeed: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // searchQuery chạy theo debounce của searchInput
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogApi.getAll({
        page,
        pageSize: PAGE_SIZE,
        action: actionFilter || undefined,
        searchQuery: searchQuery || undefined,
      });
      setLogs(res.items);
      setTotalItems(res.meta?.totalItems ?? res.items.length);
    } catch (err) {
      console.error("Lỗi tải audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E2E8F0", overflow: "hidden", bgcolor: "#fff" }}>
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: "1px solid #E2E8F0" }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <HistoryIcon sx={{ color: "#475569", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Hoạt động hệ thống gần đây</Typography>
          <Chip size="small" label={totalItems} sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 700, height: 20, fontSize: "0.7rem" }} />
        </Stack>

        {/* Search */}
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm theo tên hoặc email người dùng..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
              </InputAdornment>
            ),
            endAdornment: searchInput ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.85rem" } }}
        />

        {/* Filter chips */}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {ACTION_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              onClick={() => {
                setActionFilter(f.key);
                setPage(1);
              }}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                bgcolor: actionFilter === f.key ? "#0F172A" : "#F1F5F9",
                color: actionFilter === f.key ? "#fff" : "#475569",
                "&:hover": { bgcolor: actionFilter === f.key ? "#0F172A" : "#E2E8F0" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Progress bar — shown on top of existing list while loading */}
      {loading && <LinearProgress sx={{ height: 3 }} />}

      {/* List — always rendered to prevent layout shift */}
      {logs.length === 0 && !loading ? (
        <Typography variant="body2" sx={{ color: "#94A3B8", py: 4, textAlign: "center" }}>
          Chưa có hoạt động nào phù hợp
        </Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {logs.map((log, idx) => {
            const meta = getActionMeta(log.action);
            const Icon = meta.icon;
            const canShowDetail = !isSimpleLog(log) && (!!log.oldValue || !!log.newValue);
            const roleColor = log.role ? (ROLE_COLOR[log.role] ?? "#64748B") : null;

            return (
              <React.Fragment key={log.id || idx}>
                <Tooltip title={canShowDetail ? "Bấm để xem chi tiết thay đổi" : ""} placement="left" disableHoverListener={!canShowDetail}>
                  <ListItemButton
                    onClick={() => canShowDetail && setSelectedLog(log)}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      alignItems: "flex-start",
                      cursor: canShowDetail ? "pointer" : "default",
                      "&:hover": { bgcolor: canShowDetail ? "#F8FAFC" : "transparent" },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar sx={{ bgcolor: meta.bg, color: meta.color, width: 36, height: 36 }}>
                        <Icon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      disableTypography
                      primary={
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <Chip size="small" label={meta.label} sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, height: 18, fontSize: "0.62rem" }} />
                          {log.role && roleColor && <Chip size="small" label={log.role} sx={{ bgcolor: `${roleColor}18`, color: roleColor, fontWeight: 700, height: 18, fontSize: "0.62rem" }} />}
                          <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.875rem" }}>{buildDescription(log)}</Typography>
                        </Stack>
                      }
                    />
                    <Typography variant="caption" sx={{ color: "#94A3B8", whiteSpace: "nowrap", ml: 1, mt: 0.25, flexShrink: 0 }}>
                      {relativeTime(log.timestamp)}
                    </Typography>
                  </ListItemButton>
                </Tooltip>
                {idx < logs.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
          <Typography variant="caption" sx={{ color: "#64748B", mr: 0.5 }}>
            Trang {page} / {totalPages}
          </Typography>
          <IconButton size="small" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <DetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
    </Paper>
  );
};

// ─── Role Distribution ────────────────────────────────────────────────────────

const RoleDistribution: React.FC<{ usersByRole: Record<string, number>; total: number }> = ({ usersByRole, total }) => {
  const entries = Object.entries(usersByRole).sort((a, b) => b[1] - a[1]);
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", border: "1px solid #E2E8F0", bgcolor: "#fff" }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <PeopleIcon sx={{ color: "#475569", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Phân bố vai trò</Typography>
      </Stack>
      {total === 0 ? (
        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
          Chưa có dữ liệu người dùng
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {entries.map(([role, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            const color = ROLE_COLOR[role] ?? "#64748B";
            return (
              <Box key={role}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                    {role}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A" }}>
                    {count}{" "}
                    <Typography component="span" variant="caption" sx={{ color: "#94A3B8", fontWeight: 500 }}>
                      ({pct.toFixed(0)}%)
                    </Typography>
                  </Typography>
                </Stack>
                <Box sx={{ width: "100%", height: 6, bgcolor: "#F1F5F9", borderRadius: "999px", overflow: "hidden" }}>
                  <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: color, borderRadius: "999px", transition: "width 0.3s" }} />
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
  const { stats } = useAdminDashboard();
  const navigate = useNavigate();
  const offlineDevices = Math.max(0, stats.totalDevices - stats.runningDevices);

  return (
    <Box sx={{ display: "flex", bgcolor: "#F8FAFC", minHeight: "100vh", width: "100%" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box component="main" sx={{ p: { xs: 2.5, md: 3.5 }, flexGrow: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}>
              Bảng điều khiển quản trị
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Theo dõi hoạt động hệ thống iRAS-RAG
            </Typography>
          </Box>

          {/* KPI */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 2.5, mb: 3 }}>
            <KpiCard
              title="Hạ tầng IoT"
              value={`${stats.runningDevices}/${stats.totalDevices}`}
              subtitle={offlineDevices > 0 ? `⚠️ ${offlineDevices} thiết bị đang TẮT` : "Tất cả thiết bị đang chạy"}
              icon={RouterIcon}
              color={offlineDevices > 0 ? "#EF4444" : "#10B981"}
              onClick={() => navigate("/admin/hardware")}
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
            <KpiCard title="Cảm biến" value={stats.totalSensors} subtitle="Tổng cảm biến trong hệ thống" icon={AgricultureIcon} color="#2A85FF" />
            <KpiCard
              title="Tài liệu CSDL tri thức"
              value={stats.totalDocuments}
              subtitle={stats.totalDocuments > 0 ? "Đã ingest vào RAG" : "Chưa có tài liệu"}
              icon={LibraryBooksIcon}
              color="#F59E0B"
              onClick={() => navigate("/admin/ai-knowledge")}
            />
          </Box>

          {/* Feed + side */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2.5, alignItems: "start" }}>
            <ActivityFeed />
            <RoleDistribution usersByRole={stats.usersByRole} total={stats.totalUsers} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

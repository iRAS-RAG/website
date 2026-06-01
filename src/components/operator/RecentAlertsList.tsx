import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useNavigate } from "react-router-dom";
import { alertApi } from "../../api/alerts";
import type { IAlert } from "../../types/alert";

interface RecentAlertsListProps {
  tankId?: string;
  limit?: number;
}

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

interface AlertsResponse {
  items?: IAlert[];
  data?: IAlert[];
}

export const RecentAlertsList = ({
  tankId,
  limit = 5,
}: RecentAlertsListProps) => {
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await alertApi.getAll({
          page: 1,
          pageSize: limit,
          statuses: ["OPEN"],
          tankId,
        });
        if (!mounted) return;
        let list: IAlert[] = [];
        if (Array.isArray(res)) list = res as IAlert[];
        else if (res && typeof res === "object") {
          const r = res as AlertsResponse;
          list = r.items ?? r.data ?? [];
        }
        setAlerts(list);
      } catch {
        if (mounted) setAlerts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [tankId, limit]);

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
        <NotificationsActiveIcon sx={{ color: "#EF4444", fontSize: 20 }} />
        <Typography fontWeight={700} sx={{ color: "#0F172A" }}>
          Cảnh báo mới nhất
        </Typography>
        <Chip
          size="small"
          label={alerts.length}
          sx={{
            bgcolor: "#FEE2E2",
            color: "#B91C1C",
            fontWeight: 700,
            height: 20,
            fontSize: "0.7rem",
          }}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={22} />
        </Box>
      ) : alerts.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: "#94A3B8", py: 2, textAlign: "center" }}
        >
          Không có cảnh báo nào đang mở
        </Typography>
      ) : (
        <List dense disablePadding>
          {alerts.map((a) => (
            <ListItem
              key={a.id}
              onClick={() => navigate("/operator/alerts")}
              sx={{
                px: 1,
                py: 1,
                borderRadius: "8px",
                cursor: "pointer",
                mb: 0.5,
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#EF4444",
                  mr: 1.5,
                  flexShrink: 0,
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#0F172A" }}
                  >
                    {a.fishTankName || "Bể"} — {a.sensorTypeName}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Giá trị: {a.triggerValue} {a.unitOfMeasure} •{" "}
                    {relativeTime(a.raisedAt)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RecentAlertsList;

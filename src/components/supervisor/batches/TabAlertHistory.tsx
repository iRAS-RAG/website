import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { alertApi } from "../../../api/alerts";
import { extractArray, isApiError } from "../../../api/client";
import { correctiveActionApi } from "../../../api/correctiveActions";
import type { IAlert } from "../../../types/alert";
import type { ICorrectiveAction } from "../../../types/corrective-action";

const getStatusLabel = (status: unknown): string => {
  const s = String(status).toUpperCase();
  if (s === "ACKNOWLEDGED") return "Đang xử lý";
  if (s === "RESOLVED") return "Đóng sự cố";
  if (s === "DISMISSED") return "Đã bỏ qua";
  return "Chờ xử lý";
};

const getStatusColor = (status: string): "warning" | "primary" | "success" | "default" => {
  switch (status) {
    case "Đang xử lý":
      return "primary";
    case "Chờ xử lý":
      return "warning";
    case "Đóng sự cố":
      return "success";
    default:
      return "default";
  }
};

type Props = {
  batchId: string;
  batchName?: string;
  fishTankId?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
};

const TabAlertHistory: React.FC<Props> = ({ batchId, batchName, fishTankId, startDate, endDate }) => {
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Corrective action detail dialog
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDetail, setActionDetail] = useState<ICorrectiveAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const openCorrectiveAction = async (alertId: string) => {
    setActionLoading(true);
    setActionDialogOpen(true);
    try {
      // Fetch all corrective actions and find the one matching this alert
      const res = await correctiveActionApi.getAll(1, 100);
      const items: ICorrectiveAction[] = Array.isArray(res) ? (res as unknown as ICorrectiveAction[]) : ((res as { data?: ICorrectiveAction[] }).data ?? []);
      const match = items.find((ca) => ca.alertId === alertId) ?? null;
      setActionDetail(match);
    } catch {
      setActionDetail(null);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!fishTankId) return;
      setLoading(true);
      setError(null);
      try {
        const pageSize = 100; // server limit
        let page = 1;
        const maxPages = 20; // safety cap to avoid infinite loops
        const allItems: IAlert[] = [];

        while (page <= maxPages) {
          const res = await alertApi.getAll({ page, pageSize, tankId: fishTankId });
          const items = extractArray(res) as IAlert[];
          allItems.push(...items);

          // if server returned pagination meta, use it to decide
          type MetaShape = { meta?: { totalPages?: number } };
          const meta = (res as MetaShape).meta;
          if (meta && typeof meta.totalPages === "number") {
            if (page >= meta.totalPages) break;
            page += 1;
            continue;
          }

          // no pagination info: assume single page
          break;
        }

        const start = startDate ? dayjs(startDate) : dayjs("1970-01-01");
        const end = endDate ? dayjs(endDate) : dayjs();

        const filtered = allItems.filter((a) => {
          const d = dayjs(a.raisedAt);
          return !d.isBefore(start) && !d.isAfter(end);
        });

        if (!mounted) return;
        setAlerts(filtered);
      } catch (err: unknown) {
        console.error("Failed to load alerts:", err);
        if (isApiError(err)) {
          const data = err.data as { message?: string } | undefined;
          setError(data?.message || "Lỗi khi tải cảnh báo");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Lỗi không xác định khi tải cảnh báo");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fishTankId, startDate, endDate]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Lịch sử cảnh báo & khuyến nghị
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Lịch sử cảnh báo cho vụ nuôi {batchName ?? batchId}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Hiển thị cảnh báo cho ao/bể liên quan trong khoảng thời gian của vụ nuôi.
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : alerts.length === 0 ? (
          <Typography color="text.secondary">Chưa có cảnh báo trong khoảng thời gian này.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cảm biến</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Giá trị</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngưỡng</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((a) => {
                  const statusLabel = getStatusLabel(a.status);
                  const statusColor = getStatusColor(statusLabel);
                  return (
                    <TableRow key={a.id} hover>
                      <TableCell>{dayjs(a.raisedAt).format("DD-MM-YYYY HH:mm")}</TableCell>
                      <TableCell>{a.sensorTypeName || a.sensorId}</TableCell>
                      <TableCell>
                        {a.triggerValue} {a.unitOfMeasure}
                      </TableCell>
                      <TableCell>
                        {a.minThreshold ?? "—"} - {a.maxThreshold ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Chip label={statusLabel} size="small" color={statusColor} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={a.hasCorrectiveAction ? "Xem nhật ký bảo trì" : "Chưa có nhật ký bảo trì"}>
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={a.hasCorrectiveAction ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <BuildIcon sx={{ fontSize: 14 }} />}
                              disabled={!a.hasCorrectiveAction}
                              onClick={() => openCorrectiveAction(a.id)}
                              sx={{
                                textTransform: "none",
                                fontSize: "0.7rem",
                                minWidth: 0,
                                px: 1,
                                py: 0.3,
                              }}
                            >
                              {a.hasCorrectiveAction ? "Nhật ký" : "Chưa có"}
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Corrective action detail dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Nhật ký bảo trì
          <IconButton onClick={() => setActionDialogOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {actionLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : actionDetail ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                  Người thực hiện
                </Typography>
                <Typography variant="body2">{actionDetail.performedBy || actionDetail.userEmail || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                  Thời gian
                </Typography>
                <Typography variant="body2">{dayjs(actionDetail.timestamp).format("DD/MM/YYYY HH:mm")}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                  Hành động khắc phục
                </Typography>
                <Typography variant="body2">{actionDetail.actionTaken}</Typography>
              </Box>
              {actionDetail.notes && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                    Ghi chú
                  </Typography>
                  <Typography variant="body2">{actionDetail.notes}</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy nhật ký bảo trì cho cảnh báo này.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TabAlertHistory;

import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { alertApi } from "../../../api/alerts";
import { extractArray, isApiError } from "../../../api/client";
import type { IAlert } from "../../../types/alert";

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
          Lịch sử cảnh báo cho đợt nuôi {batchName ?? batchId}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Hiển thị cảnh báo cho ao/bể liên quan trong khoảng thời gian của đợt nuôi.
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
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{dayjs(a.raisedAt).format("DD-MM-YYYY HH:mm")}</TableCell>
                    <TableCell>{a.sensorTypeName || a.sensorId}</TableCell>
                    <TableCell>
                      {a.triggerValue} {a.unitOfMeasure}
                    </TableCell>
                    <TableCell>
                      {a.minThreshold ?? "—"} - {a.maxThreshold ?? "—"}
                    </TableCell>
                    <TableCell>{String(a.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default TabAlertHistory;

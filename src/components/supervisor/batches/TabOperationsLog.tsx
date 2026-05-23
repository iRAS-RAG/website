import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { extractArray } from "../../../api/client";
import { operatorBatchesApi } from "../../../api/operatorBatchesApi";
import type { Batch, BatchOperationLog } from "../../../types/batch";
import type { IOperatorFeedingLog, IOperatorMortalityLog } from "../../../types/operatorBatch";

type Props = {
  batch: Batch;
  logs: BatchOperationLog[];
  onCreateLog: (log: Omit<BatchOperationLog, "id" | "batchId" | "createdAt">) => Promise<BatchOperationLog | null>;
};

const operationTypeLabels: Record<BatchOperationLog["operationType"], string> = {
  feeding: "Cho ăn",
  sampling: "Lấy mẫu",
  mortality: "Hao hụt",
  treatment: "Xử lý",
  water_change: "Thay nước",
  other: "Khác",
};

const operationTypeColors: Record<BatchOperationLog["operationType"], "default" | "primary" | "error" | "warning" | "info"> = {
  feeding: "primary",
  sampling: "info",
  mortality: "error",
  treatment: "warning",
  water_change: "default",
  other: "default",
};

const TabOperationsLog: React.FC<Props> = ({ batch, logs }) => {
  const [feedingLogs, setFeedingLogs] = useState<IOperatorFeedingLog[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<IOperatorMortalityLog[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!batch?.id) return;
      try {
        const [feedRes, mortRes] = await Promise.all([operatorBatchesApi.getFeedingLogs(batch.id).catch(() => []), operatorBatchesApi.getMortalityLogs(batch.id).catch(() => [])]);
        if (!mounted) return;
        setFeedingLogs(extractArray(feedRes) as IOperatorFeedingLog[]);
        setMortalityLogs(extractArray(mortRes) as IOperatorMortalityLog[]);
      } catch (err) {
        console.error("Failed to load operator logs:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [batch?.id]);

  return (
    <Box>
      {/* Feeding History (operator logs) */}
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Lịch sử Dinh dưỡng
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại thức ăn</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Khối lượng
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedingLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    Chưa có dữ liệu.
                  </TableCell>
                </TableRow>
              ) : (
                feedingLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{dayjs(log.createdDate).format("DD/MM/YYYY HH:mm")}</TableCell>
                    <TableCell>
                      <Chip label={log.feedTypeName || "Đang cập nhật..."} size="small" sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.7rem", borderRadius: "6px" }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "success.main" }}>
                      +{log.amount} kg
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mortality History */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Theo dõi Hao hụt
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ngày ghi nhận</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Số lượng chết
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mortalityLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    Chưa có dữ liệu.
                  </TableCell>
                </TableRow>
              ) : (
                mortalityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{dayjs(log.date).format("DD/MM/YYYY HH:mm")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "error.main" }}>
                      - {log.quantity} {batch.unitOfMeasure}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default TabOperationsLog;

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import type { Batch, BatchOperationLog } from "../../../types/batch";
import { useToast } from "../../common/toastContext";

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

const TabOperationsLog: React.FC<Props> = ({ batch, logs, onCreateLog }) => {
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [operationType, setOperationType] = useState<BatchOperationLog["operationType"]>("feeding");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Mô tả là bắt buộc");
      return;
    }

    setSubmitting(true);
    try {
      await onCreateLog({
        operationType,
        description: description.trim(),
        quantity: quantity ? parseInt(quantity) : undefined,
        timestamp: new Date().toISOString(),
      });

      toast.success("Ghi nhận sự kiện thành công");
      setDialogOpen(false);
      setDescription("");
      setQuantity("");
      setOperationType("feeding");
    } catch (error) {
      console.error("Failed to create log:", error);
      toast.error("Không thể ghi nhận sự kiện");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Nhật ký vận hành
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} disabled={batch.status !== "ACTIVE"}>
          Ghi nhận sự kiện
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Ngày & giờ</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Số lượng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Người ghi nhận</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    Chưa có sự kiện nào được ghi nhận
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={operationTypeLabels[log.operationType]} color={operationTypeColors[log.operationType]} size="small" />
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.quantity !== undefined ? log.quantity : "—"}</TableCell>
                  <TableCell>{log.loggedByName || log.loggedBy || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Log Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ghi nhận sự kiện vận hành</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Loại sự kiện</InputLabel>
              <Select value={operationType} onChange={(e) => setOperationType(e.target.value as BatchOperationLog["operationType"])} label="Loại sự kiện">
                {Object.entries(operationTypeLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth label="Mô tả" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhập chi tiết về sự kiện này..." required />

            {operationType === "mortality" && (
              <TextField
                fullWidth
                type="number"
                label="Số lượng (số con cá)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputProps={{ min: 1 }}
                helperText="Thông tin này sẽ cập nhật số lượng hiện tại"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu nhật ký"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TabOperationsLog;

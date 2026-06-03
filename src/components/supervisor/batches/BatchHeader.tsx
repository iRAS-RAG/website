import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startBatch as apiStartBatch, terminateBatch as apiTerminateBatch } from "../../../api/batches";
import type { Batch } from "../../../types/batch";
import EditBatchDialog from "./EditBatchDialog";

type Props = {
  batch: Batch;
  onRefresh: () => void;
};

const BatchHeader: React.FC<Props> = ({ batch, onRefresh }) => {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Calculate current age
  const calculateAge = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    // If start date is in the future, age is 0
    if (start > now && batch.status !== "TERMINATED") return 0;
    const end = batch.status === "TERMINATED" && batch.actualHarvestDate ? new Date(batch.actualHarvestDate) : now;
    // If termination date is before start date, the batch was never active
    if (batch.status === "TERMINATED" && end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentAge = calculateAge(batch.startDate);

  const currentQty = batch.currentQuantity ?? batch.initialQuantity ?? 0;

  const handleStart = () => {
    setConfirmStartOpen(true);
  };

  const proceedWithStart = async () => {
    setConfirmStartOpen(false);
    setStarting(true);
    try {
      await apiStartBatch(batch.id);
      onRefresh();
      navigate(`/supervisor/batches/${batch.id}`);
    } catch (err) {
      console.error("Failed to start batch:", err);
    } finally {
      setStarting(false);
    }
  };

  const handleTerminate = () => {
    setConfirmTerminateOpen(true);
  };

  const proceedWithTerminate = async () => {
    setConfirmTerminateOpen(false);
    setTerminating(true);
    try {
      await apiTerminateBatch(batch.id);
      onRefresh();
      navigate(`/supervisor/batches/${batch.id}`);
    } catch (err) {
      console.error("Failed to terminate batch:", err);
    } finally {
      setTerminating(false);
    }
  };

  const statusConfig = {
    ACTIVE: { color: "success" as const, icon: <CheckCircleIcon /> },
    HARVESTED: { color: "default" as const, icon: <CheckCircleIcon /> },
    PAUSED: { color: "warning" as const, icon: <CheckCircleIcon /> },
    TERMINATED: { color: "error" as const, icon: <ErrorIcon /> },
  };

  const statusLabel = {
    ACTIVE: "Đang nuôi",
    HARVESTED: "Đã thu hoạch",
    PAUSED: "Chưa bắt đầu",
    TERMINATED: "Kết thúc",
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        {/* Left: Batch Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              {batch.name}
            </Typography>
            <Chip icon={statusConfig[batch.status].icon} label={statusLabel[batch.status]} color={statusConfig[batch.status].color} size="small" />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Loài
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {batch.speciesName || "—"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Bể nuôi
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {batch.fishTankName || batch.fishTankId}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {batch.status === "HARVESTED" ? "Số lượng thu hoạch" : batch.status === "TERMINATED" ? "Số lượng cuối cùng" : "Số lượng hiện tại"}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {currentQty} con
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Số ngày nuôi
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {batch.status === "PAUSED" || (batch.status === "TERMINATED" && (!batch.actualHarvestDate || new Date(batch.actualHarvestDate) < new Date(batch.startDate)))
                  ? "N/A"
                  : `${currentAge} ngày`}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {batch.status === "HARVESTED" ? "Ngày thu hoạch thực tế" : batch.status === "TERMINATED" ? "Ngày kết thúc" : "Ngày dự kiến thu hoạch"}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {batch.status === "HARVESTED" || batch.status === "TERMINATED"
                  ? batch.actualHarvestDate
                    ? dayjs(batch.actualHarvestDate).format("DD-MM-YYYY")
                    : batch.estimatedHarvestDate
                      ? dayjs(batch.estimatedHarvestDate).format("DD-MM-YYYY")
                      : "—"
                  : batch.estimatedHarvestDate
                    ? dayjs(batch.estimatedHarvestDate).format("DD-MM-YYYY")
                    : "—"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Right: Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%", justifyContent: "center" }}>
            <Button variant="outlined" startIcon={<EditIcon />} fullWidth onClick={() => setEditDialogOpen(true)} disabled={batch.status !== "ACTIVE" && batch.status !== "PAUSED"}>
              Chỉnh sửa thông tin
            </Button>
            {batch.status === "PAUSED" ? (
              <Button variant="contained" fullWidth onClick={handleStart} disabled={starting} color="success" startIcon={starting ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}>
                {starting ? "Đang bắt đầu..." : "Bắt đầu vụ nuôi"}
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate(`/supervisor/batches/${batch.id}/harvest`)}
                disabled={batch.status !== "ACTIVE"}
                color={batch.status === "ACTIVE" ? "primary" : "inherit"}
              >
                Thu hoạch vụ nuôi
              </Button>
            )}
            {(batch.status === "ACTIVE" || batch.status === "PAUSED") && (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleTerminate}
                disabled={terminating}
                color="error"
                startIcon={terminating ? <CircularProgress size={20} /> : <StopIcon />}
                sx={{ borderColor: "error.main", color: "error.main", "&:hover": { borderColor: "error.dark", bgcolor: "#FEF2F2" } }}
              >
                {terminating ? "Đang kết thúc..." : "Kết thúc vụ nuôi"}
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Confirmation dialog for starting a batch */}
      <Dialog open={confirmStartOpen} onClose={() => setConfirmStartOpen(false)}>
        <DialogTitle>Xác nhận bắt đầu vụ nuôi</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn bắt đầu vụ nuôi <strong>{batch.name}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmStartOpen(false)} disabled={starting}>
            Hủy
          </Button>
          <Button onClick={proceedWithStart} variant="contained" color="success" disabled={starting}>
            {starting ? "Đang bắt đầu..." : "Xác nhận bắt đầu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for terminating a batch */}
      <Dialog open={confirmTerminateOpen} onClose={() => setConfirmTerminateOpen(false)}>
        <DialogTitle>Xác nhận kết thúc vụ nuôi</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Hành động này sẽ kết thúc vụ nuôi <strong>{batch.name}</strong> ngay lập tức.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTerminateOpen(false)} disabled={terminating}>
            Hủy
          </Button>
          <Button onClick={proceedWithTerminate} variant="contained" color="error" disabled={terminating}>
            {terminating ? "Đang kết thúc..." : "Xác nhận kết thúc"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit batch dialog */}
      <EditBatchDialog
        batch={batch}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => {
          setEditDialogOpen(false);
          onRefresh();
        }}
      />
    </Paper>
  );
};

export default BatchHeader;

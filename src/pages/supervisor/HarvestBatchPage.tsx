import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LocalizedDateField from "../../components/common/LocalizedDateField";
import { useToast } from "../../components/common/toastContext";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import useBatches, { useBatchDetails } from "../../hooks/useBatches";

const HarvestBatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { harvestBatch } = useBatches({ autoLoad: false });
  const { batch, loading } = useBatchDetails(id || null);

  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [actualHarvestWeightKg, setActualHarvestWeightKg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
        <SupervisorSidebar />
        <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <SupervisorHeader />
          <Box component="main" sx={{ p: 3, flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
        <SupervisorSidebar />
        <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <SupervisorHeader />
          <Box component="main" sx={{ p: 3, flexGrow: 1, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy vụ nuôi
            </Typography>
            <Button onClick={() => navigate("/supervisor/batches")} sx={{ mt: 2 }}>
              Quay lại danh sách vụ nuôi
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (batch.status !== "ACTIVE") {
    return (
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
        <SupervisorSidebar />
        <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <SupervisorHeader />
          <Box component="main" sx={{ p: 3, flexGrow: 1, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Vụ nuôi này đã ở trạng thái {batch.status}
            </Typography>
            <Button onClick={() => navigate(`/supervisor/batches/${id}`)} sx={{ mt: 2 }}>
              Quay lại chi tiết vụ nuôi
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  const currentStock = batch.currentQuantity ?? batch.initialQuantity;

  const doHarvest = async (force: boolean) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const iso = new Date(harvestDate).toISOString();
      const weight = parseFloat(actualHarvestWeightKg);
      await harvestBatch(id, { harvestDate: iso, force, actualHarvestWeightKg: weight });
      toast.success("Thu hoạch vụ nuôi thành công");
      navigate(`/supervisor/batches/${id}`);
    } catch (err) {
      console.error("Failed to harvest batch:", err);
      const msg = err instanceof Error ? err.message : "Không thể thu hoạch vụ nuôi";
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const handleHarvestClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestDate) {
      toast.error("Vui lòng chọn ngày thu hoạch");
      return;
    }

    if (!actualHarvestWeightKg || isNaN(Number(actualHarvestWeightKg))) {
      toast.error("Vui lòng nhập trọng lượng thu hoạch hợp lệ");
      return;
    }

    if (batch.estimatedHarvestDate) {
      const chosen = new Date(harvestDate).getTime();
      const est = new Date(batch.estimatedHarvestDate).getTime();
      if (chosen < est) {
        setConfirmOpen(true);
        return;
      }
    }

    await doHarvest(false);
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <SupervisorSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <SupervisorHeader />
        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Box sx={{ maxWidth: 1000, mx: "auto" }}>
            <Box sx={{ mb: 4 }}>
              <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/supervisor/batches/${id}`)} sx={{ mb: 2 }}>
                Quay lại chi tiết vụ nuôi
              </Button>
              <Typography variant="h4" fontWeight={700}>
                Thu hoạch/Kết thúc vụ nuôi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Hoàn tất chu kỳ sản xuất cho {batch.name}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Tóm tắt vụ nuôi
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tên vụ nuôi
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {batch.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Số lượng hiện tại
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {currentStock.toLocaleString()} {batch.unitOfMeasure}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày thả giống
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {dayjs(batch.startDate).format("DD-MM-YYYY")}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày dự kiến thu hoạch
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {batch.estimatedHarvestDate ? dayjs(batch.estimatedHarvestDate).format("DD-MM-YYYY") : "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 4 }}>
                  <form onSubmit={handleHarvestClick}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                          Thông tin thu hoạch
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <LocalizedDateField label="Ngày thu hoạch" value={harvestDate} onChange={setHarvestDate} required />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Trọng lượng thu hoạch (kg)"
                          value={actualHarvestWeightKg}
                          onChange={(e) => setActualHarvestWeightKg(e.target.value)}
                          InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                          required
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                          <Button variant="outlined" onClick={() => navigate(`/supervisor/batches/${id}`)} disabled={submitting}>
                            Hủy
                          </Button>
                          <Button type="submit" variant="contained" color="success" startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />} disabled={submitting}>
                            {submitting ? "Đang thu hoạch..." : "Hoàn tất thu hoạch"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xác nhận thu hoạch sớm</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ngày thu hoạch bạn chọn ({dayjs(harvestDate).format("DD-MM-YYYY")}) sớm hơn ngày dự kiến ({batch.estimatedHarvestDate ? dayjs(batch.estimatedHarvestDate).format("DD-MM-YYYY") : "—"}).
          </Alert>
          <Typography>Bạn có chắc chắn muốn thu hoạch sớm không? Hành động này sẽ ghi đè hạn chế và có thể ảnh hưởng đến báo cáo.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={() => doHarvest(true)} variant="contained" color="error" disabled={submitting}>
            Xác nhận thu hoạch sớm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HarvestBatchPage;

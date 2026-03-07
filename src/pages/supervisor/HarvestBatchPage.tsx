import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Card, CardContent, CircularProgress, Grid, Paper, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const [submitting, setSubmitting] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split("T")[0]);
  const [finalQuantity, setFinalQuantity] = useState("");
  const [finalTotalWeight, setFinalTotalWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!harvestDate) newErrors.harvestDate = "Ngày thu hoạch là bắt buộc";

    const quantity = parseInt(finalQuantity);
    if (!finalQuantity || isNaN(quantity) || quantity < 0) {
      newErrors.finalQuantity = "Vui lòng nhập số lượng hợp lệ";
    }

    const weight = parseFloat(finalTotalWeight);
    if (!finalTotalWeight || isNaN(weight) || weight <= 0) {
      newErrors.finalTotalWeight = "Vui lòng nhập tổng khối lượng hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !batch) return;

    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }

    setSubmitting(true);
    try {
      const result = await harvestBatch(id, {
        actualHarvestDate: harvestDate,
        finalQuantity: parseInt(finalQuantity),
        notes: notes || undefined,
      });

      if (result) {
        toast.success("Thu hoạch vụ nuôi thành công");
        navigate(`/supervisor/batches/${id}`);
      }
    } catch (error) {
      console.error("Failed to harvest batch:", error);
      toast.error("Không thể thu hoạch vụ nuôi");
    } finally {
      setSubmitting(false);
    }
  };

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

  // Calculate metrics
  const currentStock = batch.currentQuantity ?? batch.initialQuantity;
  const survivalRate = ((parseInt(finalQuantity || "0") / batch.initialQuantity) * 100).toFixed(1);
  const cycleDuration = Math.ceil((new Date(harvestDate).getTime() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const avgFinalWeight = finalTotalWeight && finalQuantity ? ((parseFloat(finalTotalWeight) * 1000) / parseInt(finalQuantity)).toFixed(1) : "—";

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <SupervisorSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <SupervisorHeader />
        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Box sx={{ maxWidth: 1000, mx: "auto" }}>
            {/* Header */}
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
              {/* Left: Summary Info */}
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
                          Loài
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {batch.speciesName || "—"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Số lượng ban đầu
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {batch.initialQuantity.toLocaleString()} con
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Số lượng hiện tại
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {currentStock.toLocaleString()} con
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày thả giống
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {new Date(batch.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right: Harvest Form */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 4 }}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                          Thông tin thu hoạch
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Ngày thu hoạch"
                          value={harvestDate}
                          onChange={(e) => setHarvestDate(e.target.value)}
                          error={!!errors.harvestDate}
                          helperText={errors.harvestDate}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Số lượng thu hoạch thực tế"
                          value={finalQuantity}
                          onChange={(e) => setFinalQuantity(e.target.value)}
                          error={!!errors.finalQuantity}
                          helperText={errors.finalQuantity || "Số lượng cá thu hoạch"}
                          inputProps={{ min: 0, step: 1 }}
                          required
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Tổng khối lượng thu hoạch (kg)"
                          value={finalTotalWeight}
                          onChange={(e) => setFinalTotalWeight(e.target.value)}
                          error={!!errors.finalTotalWeight}
                          helperText={errors.finalTotalWeight || "Tổng khối lượng thu hoạch"}
                          inputProps={{ min: 0.1, step: 0.1 }}
                          required
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Ghi chú (tùy chọn)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Nhập ghi chú thêm về lần thu hoạch hoặc chu kỳ nuôi..."
                        />
                      </Grid>

                      {/* Calculated Metrics */}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ mt: 2, p: 2, backgroundColor: "action.hover", borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            Chỉ số tính toán
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <Typography variant="caption" color="text.secondary">
                                Tỷ lệ sống
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="primary.main">
                                {survivalRate}%
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <Typography variant="caption" color="text.secondary">
                                Thời gian chu kỳ
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {cycleDuration} ngày
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                              <Typography variant="caption" color="text.secondary">
                                Khối lượng TB cuối kỳ
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {avgFinalWeight}g
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>

                      {/* Actions */}
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
    </Box>
  );
};

export default HarvestBatchPage;

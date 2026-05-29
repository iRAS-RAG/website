import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Button, Chip, Grid, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Batch } from "../../../types/batch";

type Props = {
  batch: Batch;
  onRefresh: () => void;
};

const BatchHeader: React.FC<Props> = ({ batch }) => {
  const navigate = useNavigate();

  // Calculate current age
  const calculateAge = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentAge = calculateAge(batch.startDate);

  const currentQty = batch.currentQuantity ?? batch.initialQuantity ?? 0;

  const statusConfig = {
    ACTIVE: { color: "success" as const, icon: <CheckCircleIcon /> },
    HARVESTED: { color: "default" as const, icon: <CheckCircleIcon /> },
    PAUSED: { color: "warning" as const, icon: <CheckCircleIcon /> },
    TERMINATED: { color: "error" as const, icon: <ErrorIcon /> },
  };

  const statusLabel = {
    ACTIVE: "Đang nuôi",
    HARVESTED: "Đã thu hoạch",
    PAUSED: "Tạm dừng",
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
                Số lượng hiện tại
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {currentQty}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Số ngày nuôi
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {currentAge} ngày
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {batch.status === "HARVESTED" ? "Ngày thu hoạch thực tế" : "Ngày dự kiến thu hoạch"}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {batch.status === "HARVESTED"
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
            <Button variant="outlined" startIcon={<EditIcon />} fullWidth onClick={() => navigate(`/supervisor/batches/${batch.id}/edit`)} disabled={batch.status !== "ACTIVE"}>
              Chỉnh sửa thông tin
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(`/supervisor/batches/${batch.id}/harvest`)}
              disabled={batch.status !== "ACTIVE"}
              color={batch.status === "ACTIVE" ? "primary" : "inherit"}
            >
              Thu hoạch/Kết thúc đợt nuôi
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BatchHeader;

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Box, Button, Card, CardContent, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import { useBatchComparison } from "../../hooks/useBatches";

const CompareBatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, comparisons, error, compareBatches } = useBatchComparison();

  // Get batch IDs from URL query params
  const batchIds = searchParams.get("ids")?.split(",") || [];

  useEffect(() => {
    if (batchIds.length >= 2) {
      compareBatches(batchIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchIds.join(",")]);

  // Prepare chart data
  const survivalRateData = comparisons.map((c) => ({
    name: c.batchName,
    survivalRate: c.survivalRate,
  }));

  const waterQualityData = comparisons.map((c) => ({
    name: c.batchName,
    DO: c.averageDo,
    temp: c.averageTemp,
    pH: c.averagePh,
  }));

  const performanceData = comparisons.map((c) => ({
    name: c.batchName,
    incidents: c.incidentCount,
    duration: c.cycleDuration,
  }));

  if (batchIds.length < 2) {
    return (
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
        <SupervisorSidebar />
        <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <SupervisorHeader />
          <Box component="main" sx={{ p: 3, flexGrow: 1, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Vui lòng chọn ít nhất 2 đợt nuôi để so sánh
            </Typography>
            <Button onClick={() => navigate("/supervisor/batches")} sx={{ mt: 2 }}>
              Quay lại danh sách đợt nuôi
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

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

  if (error) {
    return (
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
        <SupervisorSidebar />
        <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <SupervisorHeader />
          <Box component="main" sx={{ p: 3, flexGrow: 1, textAlign: "center" }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
            <Button onClick={() => navigate("/supervisor/batches")} sx={{ mt: 2 }}>
              Quay lại danh sách đợt nuôi
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <SupervisorSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <SupervisorHeader />
        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/supervisor/batches")} sx={{ mb: 2 }}>
              Quay lại danh sách đợt nuôi
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CompareArrowsIcon sx={{ fontSize: 40, color: "primary.main" }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  So sánh đợt nuôi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang so sánh {comparisons.length} đợt nuôi
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Comparison Table */}
          <Paper sx={{ mb: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tên đợt nuôi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tỷ lệ sống</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DO TB (mg/L)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nhiệt độ TB (°C)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>pH TB</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sự cố</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Thời gian (ngày)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisons.map((batch) => (
                    <TableRow key={batch.batchId} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "primary.main",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() => navigate(`/supervisor/batches/${batch.batchId}`)}
                        >
                          {batch.batchName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: batch.survivalRate >= 90 ? "success.main" : batch.survivalRate >= 70 ? "warning.main" : "error.main",
                          }}
                        >
                          {batch.survivalRate.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>{batch.averageDo.toFixed(2)}</TableCell>
                      <TableCell>{batch.averageTemp.toFixed(1)}</TableCell>
                      <TableCell>{batch.averagePh.toFixed(2)}</TableCell>
                      <TableCell>{batch.incidentCount}</TableCell>
                      <TableCell>{batch.cycleDuration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Survival Rate Comparison */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    So sánh tỷ lệ sống
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={survivalRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="survivalRate" fill="#4CAF50" name="Tỷ lệ sống (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Water Quality Comparison */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Chất lượng nước trung bình
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={waterQualityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="DO" fill="#2196F3" name="Oxy hòa tan (mg/L)" />
                      <Bar dataKey="temp" fill="#FF9800" name="Nhiệt độ (°C)" />
                      <Bar dataKey="pH" fill="#9C27B0" name="pH" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Metrics */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Chỉ số vận hành
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="incidents" fill="#F44336" name="Số sự cố" />
                      <Bar dataKey="duration" fill="#00BCD4" name="Thời gian chu kỳ (ngày)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Summary Card */}
          <Card sx={{ mt: 4, backgroundColor: "primary.main", color: "white" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Nhận định chính
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tỷ lệ sống cao nhất
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {comparisons.length > 0 ? Math.max(...comparisons.map((c) => c.survivalRate)).toFixed(1) : "—"}%
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Số sự cố thấp nhất
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {comparisons.length > 0 ? Math.min(...comparisons.map((c) => c.incidentCount)) : "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Thời gian chu kỳ TB
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {comparisons.length > 0 ? (comparisons.reduce((sum, c) => sum + c.cycleDuration, 0) / comparisons.length).toFixed(0) : "—"} ngày
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CompareBatchesPage;

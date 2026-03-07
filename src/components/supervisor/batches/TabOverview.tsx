import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Batch, BatchPerformance } from "../../../types/batch";

type Props = {
  batch: Batch;
  performance: BatchPerformance[];
  onLoadPerformance: (days: number) => void;
};

const TabOverview: React.FC<Props> = ({ batch, performance }) => {
  // Calculate some basic metrics
  const currentStock = batch.currentQuantity ?? batch.initialQuantity;
  // Note: Biomass requires weight data which is not currently available
  // const estimatedBiomass = (currentStock * avgWeight) / 1000;

  // Format performance data for charts
  const chartData = performance.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    temperature: p.averageTemp,
    ph: p.averagePh,
    dissolvedOxygen: p.averageDo,
    biomass: p.estimatedBiomass,
  }));

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Tỷ lệ sống
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {batch.survivalRate ? `${batch.survivalRate.toFixed(1)}%` : "—"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Số lượng hiện tại
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {currentStock.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Khối lượng trung bình
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                —
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Chưa có dữ liệu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Sinh khối ước tính
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                —
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Chưa có dữ liệu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Water Quality Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Xu hướng chất lượng nước (7 ngày)
              </Typography>
              {performance.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dữ liệu hiệu suất
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#FF6B6B" name="Nhiệt độ (°C)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#4ECDC4" name="pH" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="dissolvedOxygen" stroke="#95E1D3" name="DO (mg/L)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Biomass Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Sinh khối ước tính theo thời gian
              </Typography>
              {performance.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dữ liệu hiệu suất
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="biomass" stroke="#6C5CE7" name="Biomass (kg)" strokeWidth={2} fill="#6C5CE7" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TabOverview;

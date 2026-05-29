import { Box, Stack, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import React from "react";
import useSupervisorMetrics from "../../hooks/useSupervisorMetrics";
import useSupervisorMetricsSignalR from "../../hooks/useSupervisorMetricsSignalR";
import TimeseriesChart from "../common/charts/TimeseriesChart";

function mapSeries(ts?: { series: { groupId?: string; groupName?: string; points: { timestamp: string; value: number }[] }[] } | null) {
  if (!ts || !ts.series) return [] as { name: string; points: { timestamp: string; value: number }[] }[];
  return ts.series.map((s) => ({ name: s.groupName || s.groupId || "series", points: s.points }));
}

const MetricsPanel: React.FC = () => {
  const { feedTimeseries, mortalityTimeseries, topBatches, refetch } = useSupervisorMetrics();

  // Debounced refetch to avoid spamming backend on many signalR events
  const refetchTimer = React.useRef<number | null>(null);
  const scheduleRefetch = React.useCallback(() => {
    if (refetchTimer.current) {
      window.clearTimeout(refetchTimer.current);
    }
    refetchTimer.current = window.setTimeout(() => {
      refetch();
      refetchTimer.current = null;
    }, 1500) as unknown as number;
  }, [refetch]);

  React.useEffect(() => {
    return () => {
      if (refetchTimer.current) window.clearTimeout(refetchTimer.current);
    };
  }, []);

  useSupervisorMetricsSignalR("aaaaaaaa-0000-0000-0000-000000000001", {
    onFeeding: scheduleRefetch,
    onMortality: scheduleRefetch,
  });

  const feedSeries = mapSeries(feedTimeseries);
  const mortalitySeries = mapSeries(mortalityTimeseries);

  return (
    <Box sx={{ mt: 4 }}>
      <Stack spacing={3}>
        <Box sx={{ width: "100%" }}>
          <TimeseriesChart title="Lượng thức ăn (30 ngày gần đây)" series={feedSeries} height={520} />
        </Box>

        <Box sx={{ width: "100%" }}>
          <TimeseriesChart title="Tử vong (30 ngày gần đây)" series={mortalitySeries} height={420} />
        </Box>

        <Box sx={{ width: "100%" }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
              Các lô hàng hàng đầu (theo lượng thức ăn)
            </Typography>
            <List dense>
              {(topBatches || []).map((b) => (
                <ListItem key={b.batchId} divider>
                  <ListItemText primary={b.batchName ?? b.batchId} secondary={`Thức ăn: ${b.totalFeedKg ?? "—"} kg • Hiện có: ${b.currentQuantity ?? "—"}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default MetricsPanel;

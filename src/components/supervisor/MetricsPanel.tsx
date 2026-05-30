import { Box, List, ListItem, ListItemText, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import useSupervisorMetrics from "../../hooks/useSupervisorMetrics";
import useSupervisorMetricsSignalR from "../../hooks/useSupervisorMetricsSignalR";
import FarmSummaryChart from "./FarmSummaryChart";
import FarmTimeseriesChart from "./FarmTimeseriesChart";

const MetricsPanel: React.FC = () => {
  const { topBatches, refetch } = useSupervisorMetrics();

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

  // farm timeseries charts fetch their own data via `useFarmTimeseries`

  return (
    <Box sx={{ mt: 4 }}>
      <Stack spacing={3}>
        <Box sx={{ width: "100%" }}>
          <FarmSummaryChart />
        </Box>

        <Box sx={{ width: "100%" }}>
          <FarmTimeseriesChart defaultMetric="feed" height={520} />
        </Box>

        <Box sx={{ width: "100%" }}>
          <FarmTimeseriesChart defaultMetric="mortality" height={420} />
        </Box>

        <Box sx={{ width: "100%" }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
              Các vụ nuôi hàng đầu (theo lượng cám)
            </Typography>
            <List dense>
              {(topBatches || []).map((b) => (
                <ListItem key={b.batchId} divider>
                  <ListItemText primary={b.batchName ?? b.batchId} secondary={`Cám: ${b.totalFeedKg ?? "—"} kg • Hiện có: ${b.currentQuantity ?? "—"}`} />
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

import { Stack } from "@mui/material";
import React from "react";
import useSupervisorMetrics from "../../hooks/useSupervisorMetrics";
import useSupervisorMetricsSignalR from "../../hooks/useSupervisorMetricsSignalR";
import FarmSummaryChart from "./FarmSummaryChart";
import FarmTimeseriesChart from "./FarmTimeseriesChart";

const MetricsPanel: React.FC = () => {
  const { refetch } = useSupervisorMetrics();

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
    <Stack spacing={3}>
      <FarmSummaryChart />
      <FarmTimeseriesChart defaultMetric="feed" height={520} />
    </Stack>
  );
};

export default MetricsPanel;

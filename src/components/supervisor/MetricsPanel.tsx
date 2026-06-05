import { Stack } from "@mui/material";
import React from "react";
import SupervisorMetricsProvider, { useSupervisorMetricsEvents } from "../../contexts/SupervisorMetricsContext";
import useSupervisorMetrics from "../../hooks/useSupervisorMetrics";
import FarmSummaryChart from "./FarmSummaryChart";
import FarmTimeseriesChart from "./FarmTimeseriesChart";

const MetricsPanelInner: React.FC = () => {
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

  // Subscribe to the single shared SignalR connection
  const { subscribe } = useSupervisorMetricsEvents();
  React.useEffect(() => {
    return subscribe(scheduleRefetch);
  }, [subscribe, scheduleRefetch]);

  return (
    <Stack spacing={3}>
      <FarmSummaryChart />
      <FarmTimeseriesChart defaultMetric="feed" height={520} />
    </Stack>
  );
};

/**
 * Orchestrator for the supervisor metrics section.
 * Wraps child chart components in a SINGLE shared SignalR connection
 * so that real-time events trigger data refreshes in all charts
 * without creating redundant WebSocket connections.
 */
const MetricsPanel: React.FC = () => {
  return (
    <SupervisorMetricsProvider>
      <MetricsPanelInner />
    </SupervisorMetricsProvider>
  );
};

export default MetricsPanel;

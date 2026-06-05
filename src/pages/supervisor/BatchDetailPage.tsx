import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BatchHeader from "../../components/supervisor/batches/BatchHeader";
import TabAlertHistory from "../../components/supervisor/batches/TabAlertHistory";
import TabBatchHistory from "../../components/supervisor/batches/TabBatchHistory";
import TabOperationsLog from "../../components/supervisor/batches/TabOperationsLog.tsx";
import TabOverview from "../../components/supervisor/batches/TabOverview";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import { useBatchDetails } from "../../hooks/useBatches";

type TabValue = "overview" | "operations" | "alerts" | "history";

const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  const { loading, batch, logs, performance, createLog, loadPerformance, loadBatchDetails } = useBatchDetails(id || null);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box
        sx={{
          display: "flex",
          bgcolor: "background.default",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <SupervisorSidebar />
        <Box
          sx={{
            flexGrow: 1,
            ml: "240px",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
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

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "background.default",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <SupervisorSidebar />
      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          {/* Back Button */}
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/supervisor/batches")} sx={{ mb: 2 }}>
            Quay lại danh sách vụ nuôi
          </Button>

          {/* Batch Header (Summary Bar) */}
          <BatchHeader batch={batch} onRefresh={() => id && loadBatchDetails(id)} />

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Tổng quan" value="overview" />
              <Tab label="Nhật ký vận hành" value="operations" />
              <Tab label="Lịch sử" value="history" />
              <Tab label="Lịch sử cảnh báo" value="alerts" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ mt: 3 }}>
            {activeTab === "overview" && <TabOverview batch={batch} performance={performance} onLoadPerformance={loadPerformance} />}
            {activeTab === "operations" && <TabOperationsLog batch={batch} logs={logs} onCreateLog={createLog} />}
            {activeTab === "history" && <TabBatchHistory batch={batch} />}
            {activeTab === "alerts" && (
              <TabAlertHistory
                batchId={batch.id}
                batchName={batch.name}
                fishTankId={batch.fishTankId}
                startDate={batch.startDate}
                endDate={batch.actualHarvestDate ?? batch.estimatedHarvestDate ?? undefined}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BatchDetailPage;

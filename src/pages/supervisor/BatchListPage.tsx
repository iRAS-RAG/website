import AddIcon from "@mui/icons-material/Add";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Box, Button, Chip, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "../../components/common/DataTable";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import useBatches from "../../hooks/useBatches";
import type { Batch, BatchStatus } from "../../types/batch";

const statusColors: Record<BatchStatus, "success" | "default" | "error" | "warning"> = {
  ACTIVE: "success",
  HARVESTED: "default",
  PAUSED: "warning",
  TERMINATED: "error",
};

const statusLabels: Record<BatchStatus, string> = {
  ACTIVE: "Đang nuôi",
  HARVESTED: "Đã thu hoạch",
  PAUSED: "Tạm dừng",
  TERMINATED: "Kết thúc",
};

const BatchListPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "all">("all");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  const { loading, batches } = useBatches({
    autoLoad: true,
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
  });

  // Filter batches based on selected tab
  const filteredBatches = statusFilter === "all" ? batches : batches.filter((b) => b.status === statusFilter);

  // Calculate current age in days
  const calculateAge = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Table columns
  const columns: Column<Batch>[] = [
    {
      field: "name",
      label: "Tên vụ nuôi",
      sortable: true,
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "primary.main",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => navigate(`/supervisor/batches/${row.id}`)}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      field: "speciesName",
      label: "Loài",
      sortable: true,
      render: (row) => row.speciesName || "—",
    },
    {
      field: "fishTankName",
      label: "Bể nuôi",
      sortable: true,
      render: (row) => row.fishTankName || row.fishTankId,
    },
    {
      field: "startDate",
      label: "Ngày bắt đầu",
      sortable: true,
      render: (row) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      field: "age",
      label: "Số ngày nuôi",
      sortable: false,
      render: (row) => `${calculateAge(row.startDate)} ngày`,
    },
    {
      field: "status",
      label: "Trạng thái",
      sortable: true,
      render: (row) => <Chip label={statusLabels[row.status]} color={statusColors[row.status]} size="small" />,
    },
    {
      field: "survivalRate",
      label: "Tỷ lệ sống",
      sortable: true,
      render: (row) => {
        if (!row.survivalRate && row.survivalRate !== 0) return "—";
        const rate = row.survivalRate;
        const color = rate >= 90 ? "success.main" : rate >= 70 ? "warning.main" : "error.main";
        return (
          <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
            {rate.toFixed(1)}%
          </Typography>
        );
      },
    },
    {
      field: "currentQuantity",
      label: "Số lượng hiện tại",
      sortable: true,
      render: (row) => {
        const current = row.currentQuantity ?? row.initialQuantity;
        return current.toLocaleString();
      },
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: BatchStatus | "all") => {
    setStatusFilter(newValue);
    setSelectedBatches([]); // Clear selection when changing tabs
  };

  const handleCompare = () => {
    if (selectedBatches.length >= 2) {
      const ids = selectedBatches.join(",");
      navigate(`/supervisor/batches/compare?ids=${ids}`);
    }
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <SupervisorSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <SupervisorHeader />
        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              Quản lý vụ nuôi
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              {selectedBatches.length >= 2 && (
                <Button variant="outlined" startIcon={<CompareArrowsIcon />} onClick={handleCompare}>
                  So sánh ({selectedBatches.length})
                </Button>
              )}
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/supervisor/batches/create")}>
                Tạo vụ nuôi mới
              </Button>
            </Box>
          </Box>

          {/* Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={statusFilter} onChange={handleTabChange}>
              <Tab label="Tất cả" value="all" />
              <Tab label="Đang nuôi" value="ACTIVE" />
              <Tab label="Đã thu hoạch" value="HARVESTED" />
              <Tab label="Tạm dừng" value="PAUSED" />
              <Tab label="Kết thúc" value="TERMINATED" />
            </Tabs>
          </Box>

          {/* Content */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredBatches.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Không tìm thấy vụ nuôi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {statusFilter === "all" ? "Hãy tạo vụ nuôi đầu tiên để bắt đầu" : `Không có vụ nuôi trạng thái ${statusLabels[statusFilter]}`}
              </Typography>
            </Box>
          ) : (
            <DataTable columns={columns} rows={filteredBatches} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BatchListPage;

import AddIcon from "@mui/icons-material/Add";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import useBatches from "../../hooks/useBatches";
import type { Batch, BatchStatus } from "../../types/batch";

const statusLabels: Record<BatchStatus, string> = {
  ACTIVE: "Đang nuôi",
  HARVESTED: "Đã thu hoạch",
  PAUSED: "Tạm dừng",
  TERMINATED: "Kết thúc",
};

// Định nghĩa màu chuẩn SaaS cho các Chip trạng thái
const chipStyles: Record<BatchStatus, { bgcolor: string; color: string }> = {
  ACTIVE: { bgcolor: "#ECFDF5", color: "#065F46" },
  HARVESTED: { bgcolor: "#F1F5F9", color: "#475569" },
  PAUSED: { bgcolor: "#FFFBEB", color: "#D97706" },
  TERMINATED: { bgcolor: "#FEF2F2", color: "#DC2626" },
};

const BatchListPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "all">("all");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  // Thêm State UI để điều khiển Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { loading, batches } = useBatches({
    autoLoad: true,
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
  });

  // Lọc dữ liệu theo Tab và Thanh tìm kiếm
  let filteredBatches =
    statusFilter === "all"
      ? batches
      : batches.filter((b) => b.status === statusFilter);

  if (searchTerm) {
    filteredBatches = filteredBatches.filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.speciesName &&
          b.speciesName.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }

  // Phân trang dữ liệu
  const totalPages = Math.ceil(filteredBatches.length / pageSize) || 1;
  const paginatedBatches = filteredBatches.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const calculateAge = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
            color: "#2A85FF", // Chuẩn màu Primary mới
            cursor: "pointer",
            textDecoration: "none",
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
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#334155", fontWeight: 500 }}>
          {row.speciesName || "—"}
        </Typography>
      ),
    },
    {
      field: "fishTankName",
      label: "Bể nuôi",
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#334155" }}>
          {row.fishTankName || row.fishTankId}
        </Typography>
      ),
    },
    {
      field: "startDate",
      label: "Ngày bắt đầu",
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          {new Date(row.startDate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "age",
      label: "Số ngày nuôi",
      sortable: false,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          {`${calculateAge(row.startDate)} ngày`}
        </Typography>
      ),
    },
    {
      field: "status",
      label: "Trạng thái",
      sortable: true,
      render: (row) => {
        const style = chipStyles[row.status] || {
          bgcolor: "#F1F5F9",
          color: "#475569",
        };
        return (
          <Chip
            label={statusLabels[row.status]}
            size="small"
            sx={{
              bgcolor: style.bgcolor,
              color: style.color,
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
            }}
          />
        );
      },
    },
    {
      field: "survivalRate",
      label: "Tỷ lệ sống",
      sortable: true,
      render: (row) => {
        if (!row.survivalRate && row.survivalRate !== 0) return "—";
        const rate = row.survivalRate;
        const color =
          rate >= 90 ? "#10B981" : rate >= 70 ? "#F59E0B" : "#EF4444";
        return (
          <Typography variant="body2" sx={{ color, fontWeight: 700 }}>
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
        return (
          <Typography
            variant="body2"
            sx={{ color: "#334155", fontWeight: 500 }}
          >
            {current.toLocaleString()}
          </Typography>
        );
      },
    },
  ];

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: BatchStatus | "all",
  ) => {
    setStatusFilter(newValue);
    setSelectedBatches([]);
    setPage(1); // Reset page khi đổi tab
  };

  const handleCompare = () => {
    if (selectedBatches.length >= 2) {
      const ids = selectedBatches.join(",");
      navigate(`/supervisor/batches/compare?ids=${ids}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F8FAFC", // Nền nền tổng thể
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
        <SupervisorHeader />

        {/* Đã gỡ bỏ maxWidth, để flexGrow lấp đầy */}
        <Box
          component="main"
          sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, width: "100%" }}
        >
          {/* HEADER KHU VỰC NỘI DUNG */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
              >
                Quản lý vụ nuôi
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Theo dõi tiến độ, trạng thái và tỷ lệ sống của các lô nuôi thủy
                sản.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              {selectedBatches.length >= 2 && (
                <Button
                  variant="outlined"
                  startIcon={<CompareArrowsIcon />}
                  onClick={handleCompare}
                  sx={{
                    borderRadius: "8px",
                    color: "#475569",
                    borderColor: "#CBD5E1",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#F1F5F9", borderColor: "#94A3B8" },
                  }}
                >
                  So sánh ({selectedBatches.length})
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/supervisor/batches/create")}
                sx={{
                  borderRadius: "8px",
                  bgcolor: "#2A85FF",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1F6FDB" },
                }}
              >
                Tạo vụ nuôi mới
              </Button>
            </Stack>
          </Stack>

          {/* MAIN PAPER (Gộp chung Tabs, Toolbar, Bảng và Pagination) */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
              bgcolor: "#FFFFFF",
            }}
          >
            {/* KHU VỰC TABS */}
            <Tabs
              value={statusFilter}
              onChange={handleTabChange}
              sx={{
                px: 2,
                pt: 1,
                "& .MuiTab-root": {
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#64748B",
                  minHeight: 48,
                },
                "& .Mui-selected": {
                  color: "#0F172A !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#2A85FF",
                  height: 2,
                },
              }}
            >
              <Tab label="Tất cả" value="all" />
              <Tab label="Đang nuôi" value="ACTIVE" />
              <Tab label="Đã thu hoạch" value="HARVESTED" />
              <Tab label="Tạm dừng" value="PAUSED" />
              <Tab label="Kết thúc" value="TERMINATED" />
            </Tabs>
            <Divider />

            {/* KHU VỰC TOOLBAR */}
            <TableToolbar
              searchPlaceholder="Tìm kiếm tên lô nuôi..."
              searchTerm={searchTerm}
              onSearchTermChange={(v) => {
                setSearchTerm(v);
                setPage(1);
              }}
              pageSize={pageSize}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />

            {/* BẢNG DỮ LIỆU */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : paginatedBatches.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="#475569">
                  Không tìm thấy vụ nuôi
                </Typography>
                <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                  {statusFilter === "all"
                    ? "Hãy tạo vụ nuôi đầu tiên để bắt đầu."
                    : `Không có vụ nuôi nào ở trạng thái ${statusLabels[statusFilter]}.`}
                </Typography>
              </Box>
            ) : (
              <DataTable columns={columns} rows={paginatedBatches} />
            )}

            {/* PAGINATION */}
            {!loading && filteredBatches.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                }}
              >
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default BatchListPage;

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FactoryIcon from "@mui/icons-material/Factory";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Chip, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import DataTable, { type Column } from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import { useToast } from "../../components/common/toastContext";
import { isApiError } from "../../api/client";
import ConfirmDeleteDialog from "../../components/supervisor/feed-types/ConfirmDeleteDialog";
import FeedFormDialog from "../../components/supervisor/feed-types/FeedFormDialog";
import useFeedTypes from "../../hooks/useFeedTypes";
import type { FeedType } from "../../types/feed-type";

const FeedTypesTab: React.FC = () => {
  const { feeds, meta, load, create, update, remove } = useFeedTypes();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FeedType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: undefined as string | undefined,
    sortDir: undefined as "asc" | "desc" | undefined,
  });
  const [manufacturerFilter, setManufacturerFilter] = useState<string | "">("");

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (f: FeedType) => {
    setEditing(f);
    setFormOpen(true);
  };

  const openConfirm = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    try {
      await remove(confirmId);
      setConfirmId(null);
      toast.success("Xóa cám thành công");
    } catch (e) {
      console.error("Xóa cám thất bại", e);
      const apiMsg = isApiError(e) ? ((e.data as Record<string, unknown>)?.message as string) : undefined;
      toast.error(apiMsg || "Xóa cám thất bại");
    }
  };

  const handleSave = async (values: { name: string; protein: string; description?: string; manufacturer?: string }) => {
    try {
      if (editing) {
        await update(editing.id, values);
        toast.success("Cập nhật cám thành công");
      } else {
        await create(values as Omit<FeedType, "id">);
        toast.success("Thêm cám thành công");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      console.error("Lưu cám thất bại", e);
      toast.error("Lưu cám thất bại");
      throw e;
    }
  };

  React.useEffect(() => {
    void load({
      page: tableParams.page,
      pageSize: tableParams.pageSize,
      searchTerm: tableParams.searchTerm,
      sortBy: tableParams.sortBy,
      sortDir: tableParams.sortDir,
    });
  }, [tableParams.page, tableParams.pageSize, tableParams.searchTerm, tableParams.sortBy, tableParams.sortDir, load]);

  const manufacturerOptions = Array.from(new Set(feeds.map((f) => f.manufacturer).filter(Boolean))) as string[];
  const filtered = manufacturerFilter ? feeds.filter((f) => f.manufacturer === manufacturerFilter) : feeds;

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    const key = tableParams.sortBy;
    const dir = tableParams.sortDir === "desc" ? -1 : 1;
    if (!key) return arr;
    if (key === "proteinPercentage") {
      arr.sort((a, b) => {
        const an = typeof a.proteinPercentage === "number" ? a.proteinPercentage : parseInt(String(a.protein || "0"), 10) || 0;
        const bn = typeof b.proteinPercentage === "number" ? b.proteinPercentage : parseInt(String(b.protein || "0"), 10) || 0;
        return (an - bn) * dir;
      });
      return arr;
    }
    if (key === "manufacturer") {
      arr.sort((a, b) => (String(a.manufacturer || "").localeCompare(String(b.manufacturer || "")) as number) * dir);
      return arr;
    }
    return arr;
  }, [filtered, tableParams.sortBy, tableParams.sortDir]);

  const columns: Column<FeedType>[] = [
    {
      field: "name",
      label: "Tên",
      sortable: true,
      render: (r) => <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.95rem" }}>{r.name}</Typography>,
    },
    {
      field: "description",
      label: "Mô tả",
      render: (r) => (
        <Typography
          sx={{
            color: "#64748B",
            fontSize: "0.875rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {r.description || ""}
        </Typography>
      ),
    },
    {
      field: "protein",
      label: "Đạm",
      sortable: true,
      sortKey: "proteinPercentage",
      render: (r) => (
        <Chip
          label={r.protein}
          size="small"
          sx={{
            bgcolor: "#E0F2FE",
            color: "#0369A1",
            fontWeight: 700,
            borderRadius: "6px",
            border: "none",
          }}
        />
      ),
    },
    {
      field: "manufacturer",
      label: "Nhà sản xuất",
      sortable: true,
      render: (r) => <Typography sx={{ color: "#334155", fontSize: "0.875rem" }}>{r.manufacturer}</Typography>,
    },
    {
      field: "actions",
      label: "Hành động",
      render: (r) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={() => openEdit(r)}
            sx={{
              color: "#64748B",
              "&:hover": { color: "#2A85FF", bgcolor: "#EFF6FF" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => openConfirm(r.id)}
            sx={{
              color: "#64748B",
              "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    // ĐÃ SỬA CHỖ NÀY: Loại bỏ minHeight, bgcolor và padding cứng. Để nó tự nhiên lấp đầy Component Cha.
    <Box sx={{ width: "100%", flexGrow: 1 }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        {/* Đã bọc Tiêu đề và Phụ đề vào Box */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}>
            Quản lý cám
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Quản lý danh mục các loại cám, hàm lượng dinh dưỡng và nhà sản xuất.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            onClick={() =>
              load({
                page: tableParams.page,
                pageSize: tableParams.pageSize,
                searchTerm: tableParams.searchTerm,
                sortBy: tableParams.sortBy,
                sortDir: tableParams.sortDir,
              })
            }
            sx={{
              borderRadius: "8px",
              color: "#475569",
              borderColor: "#CBD5E1",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#F1F5F9", borderColor: "#94A3B8" },
            }}
          >
            Làm mới
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={openCreate}
            sx={{
              borderRadius: "8px",
              bgcolor: "#2A85FF",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { bgcolor: "#1F6FDB" },
            }}
          >
            Thêm cám
          </Button>
        </Stack>
      </Stack>

      {/* PAPER BỌC CẢ TOOLBAR VÀ BẢNG */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
        }}
      >
        <TableToolbar
          searchPlaceholder="Tìm kiếm tên cám..."
          searchTerm={tableParams.searchTerm}
          onSearchTermChange={(v) => setTableParams((p) => ({ ...p, searchTerm: v, page: 1 }))}
          pageSize={tableParams.pageSize}
          onPageSizeChange={(n) => setTableParams((p) => ({ ...p, pageSize: n, page: 1 }))}
          filters={
            <TextField
              size="small"
              select
              value={manufacturerFilter}
              onChange={(e) => setManufacturerFilter(e.target.value as string)}
              sx={{
                width: 220,
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">
                <FactoryIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                Tất cả nhà sản xuất
              </MenuItem>
              {manufacturerOptions.map((m) => (
                <MenuItem key={m} value={m}>
                  <FactoryIcon fontSize="small" sx={{ mr: 1, opacity: 0.9 }} />
                  {m}
                </MenuItem>
              ))}
            </TextField>
          }
        />

        <DataTable columns={columns} rows={sorted} sortBy={tableParams.sortBy} sortDir={tableParams.sortDir} onSort={(s, d) => setTableParams((p) => ({ ...p, sortBy: s, sortDir: d }))} />

        <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
          <PaginationControls
            page={tableParams.page}
            totalPages={meta && typeof meta.totalPages === "number" ? (meta.totalPages as number) : 1}
            onPageChange={(p) => setTableParams((t) => ({ ...t, page: p }))}
          />
        </Box>
      </Paper>

      {/* DIALOGS */}
      <FeedFormDialog open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSave={handleSave} manufacturerOptions={manufacturerOptions} />
      <ConfirmDeleteDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDeleteConfirmed} />
    </Box>
  );
};

export default FeedTypesTab;

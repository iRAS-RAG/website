import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import MedicationIcon from "@mui/icons-material/Medication";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Box, Button, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import type { FeedType } from "../../api/feed-types";
import DataTable, { type Column } from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import { useToast } from "../../components/common/toastContext";
import ConfirmDeleteDialog from "../../components/supervisor/feed-types/ConfirmDeleteDialog";
import FeedFormDialog from "../../components/supervisor/feed-types/FeedFormDialog";
import useFeedTypes from "../../hooks/useFeedTypes";

const FeedTypesTab: React.FC = () => {
  const { feeds, meta, load, create, update, remove } = useFeedTypes();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FeedType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [tableParams, setTableParams] = useState({ page: 1, pageSize: 10, searchTerm: "", sortBy: undefined as string | undefined, sortDir: undefined as "asc" | "desc" | undefined });
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
      toast.success("Xóa thức ăn thành công");
    } catch (e) {
      console.error("Xóa thức ăn thất bại", e);
      toast.error("Xóa thức ăn thất bại");
    }
  };

  const handleSave = async (values: { name: string; protein: string; description?: string; manufacturer?: string }) => {
    try {
      if (editing) {
        await update(editing.id, values);
        toast.success("Cập nhật thức ăn thành công");
      } else {
        await create(values as Omit<FeedType, "id">);
        toast.success("Tạo thức ăn thành công");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      console.error("Lưu thức ăn thất bại", e);
      toast.error("Lưu thức ăn thất bại");
      throw e;
    }
  };

  React.useEffect(() => {
    void load({ page: tableParams.page, pageSize: tableParams.pageSize, searchTerm: tableParams.searchTerm, sortBy: tableParams.sortBy, sortDir: tableParams.sortDir });
  }, [tableParams.page, tableParams.pageSize, tableParams.searchTerm, tableParams.sortBy, tableParams.sortDir, load]);

  // build client-side manufacturer options from currently loaded items
  const manufacturerOptions = Array.from(new Set(feeds.map((f) => f.manufacturer).filter(Boolean))) as string[];

  // apply client-side filtering by manufacturer
  const filtered = manufacturerFilter ? feeds.filter((f) => f.manufacturer === manufacturerFilter) : feeds;

  // apply client-side sorting for certain keys
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
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <LocalDiningIcon fontSize="small" />
          Tên
        </span>
      ),
      sortable: true,
      render: (r) => <strong>{r.name}</strong>,
    },
    {
      field: "description",
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <DescriptionIcon fontSize="small" />
          Mô tả
        </span>
      ),
      render: (r) => <span>{r.description ? (r.description.length > 120 ? r.description.slice(0, 120) + "…" : r.description) : ""}</span>,
    },
    {
      field: "protein",
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <MedicationIcon fontSize="small" />
          Đạm
        </span>
      ),
      sortable: true,
      sortKey: "proteinPercentage",
      render: (r) => <span>{r.protein}</span>,
    },
    {
      field: "manufacturer",
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FactoryIcon fontSize="small" />
          Nhà sản xuất
        </span>
      ),
      sortable: true,
      render: (r) => (r.manufacturer ? <span>{r.manufacturer}</span> : null),
    },
    {
      field: "actions",
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <MoreHorizIcon fontSize="small" />
          Hành động
        </span>
      ),
      render: (r) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" aria-label="edit" onClick={() => openEdit(r)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" aria-label="delete" onClick={() => openConfirm(r.id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Thức ăn
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={openCreate}>
          Thêm thức ăn
        </Button>
      </Stack>

      <TableToolbar
        searchTerm={tableParams.searchTerm}
        onSearchTermChange={(v) => setTableParams((p) => ({ ...p, searchTerm: v, page: 1 }))}
        pageSize={tableParams.pageSize}
        onPageSizeChange={(n) => setTableParams((p) => ({ ...p, pageSize: n, page: 1 }))}
        filters={
          <TextField size="small" select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value as string)} sx={{ width: 220 }} SelectProps={{ displayEmpty: true }}>
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

      <Box>
        <DataTable columns={columns} rows={sorted} sortBy={tableParams.sortBy} sortDir={tableParams.sortDir} onSort={(s, d) => setTableParams((p) => ({ ...p, sortBy: s, sortDir: d }))} />
      </Box>

      <PaginationControls
        page={tableParams.page}
        totalPages={meta && typeof meta.totalPages === "number" ? (meta.totalPages as number) : 1}
        onPageChange={(p) => setTableParams((t) => ({ ...t, page: p }))}
      />

      <FeedFormDialog open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />

      <ConfirmDeleteDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDeleteConfirmed} />
    </Box>
  );
};

export default FeedTypesTab;

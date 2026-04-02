import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import DataTable, { type Column } from "../../components/common/DataTable";
import PaginationControls from "../../components/common/PaginationControls";
import TableToolbar from "../../components/common/TableToolbar";
import { useToast } from "../../components/common/toastContext";
import useDocuments from "../../hooks/useDocuments";
import type { DocumentItem } from "../../types/document";

// Helpers chung
const getFileIcon = (type?: string) => {
  const ext = type?.toLowerCase() || "";
  if (ext.includes("pdf"))
    return <PictureAsPdfIcon sx={{ color: "#EF4444" }} />;
  if (ext.includes("doc") || ext.includes("word"))
    return <DescriptionIcon sx={{ color: "#2563EB" }} />;
  if (ext.includes("txt")) return <TextSnippetIcon sx={{ color: "#64748B" }} />;
  return <DescriptionIcon sx={{ color: "#94A3B8" }} />;
};

const AIKnowledge: React.FC = () => {
  const toast = useToast();
  const { data, meta, loading, params, setParams, upload, remove } =
    useDocuments();

  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        await remove(id);
        toast.success("Đã xóa tài liệu");
      } catch (error) {
        console.error("Lỗi xóa file:", error); // Log ra để error không bị mắng là unused
        toast.error("Xóa thất bại");
      }
    }
  };

  const columns = useMemo(
    (): Column<DocumentItem>[] => [
      {
        field: "title",
        label: "Tên tài liệu",
        render: (r) => (
          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>
            {r.title}
          </Typography>
        ),
      },
      {
        field: "type",
        label: "Loại file",
        render: (r) => {
          const ext = r.fileUrl?.split(".").pop() || "pdf";
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              {getFileIcon(ext)}
              <Typography
                variant="body2"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#64748B",
                }}
              >
                {ext}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: "uploadedAt",
        label: "Ngày tải lên",
        render: (r) => (
          <Typography sx={{ color: "#475569" }}>
            {new Date(r.uploadedAt).toLocaleDateString("vi-VN")}
          </Typography>
        ),
      },
      {
        field: "uploader",
        label: "Người tải",
        render: (r) => (
          <Typography sx={{ color: "#475569" }}>
            {r.uploadedByUserEmail}
          </Typography>
        ),
      },
      {
        field: "actions",
        label: "Thao tác",
        render: (r) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <IconButton
              size="small"
              sx={{
                color: "#64748B",
                "&:hover": { color: "#2A85FF", bgcolor: "#EFF6FF" },
              }}
              onClick={() => window.open(r.fileUrl, "_blank")}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(r.id)}
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
    ],
    [],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file || !title)
      return toast.error("Vui lòng chọn file và nhập tiêu đề");
    setIsUploading(true);
    try {
      await upload(file, title);
      toast.success("Tải lên tài liệu thành công!");
      setOpenUpload(false);
      setFile(null);
      setTitle("");
    } catch (error: unknown) {
      console.error("Lỗi upload file:", error); // Log lỗi an toàn
      const err = error as Record<string, unknown>;
      const msg =
        (err?.data as Record<string, string>)?.message ||
        (err?.message as string) ||
        "Tải lên thất bại";
      toast.error(msg); // Gọi msg ra dùng
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <AdminSidebar />
      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AdminHeader />
        <Box
          component="main"
          sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, width: "100%" }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
              >
                AI & Cơ sở tri thức
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Quản lý tài liệu nguồn để AI học và đưa ra khuyến nghị
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setOpenUpload(true)}
              sx={{
                bgcolor: "#2A85FF",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: "8px",
              }}
            >
              Tải lên tri thức mới
            </Button>
          </Stack>

          <Card
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              width: "fit-content",
              minWidth: 250,
            }}
          >
            <CardContent sx={{ pb: "16px !important" }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "#64748B", fontWeight: 600, mb: 1 }}
              >
                TỔNG SỐ TÀI LIỆU
              </Typography>
              <Typography
                variant="h3"
                sx={{ color: "#0F172A", fontWeight: 800 }}
              >
                {meta?.totalItems || data.length}
              </Typography>
            </CardContent>
          </Card>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              bgcolor: "#FFFFFF",
            }}
          >
            <TableToolbar
              searchPlaceholder="Tìm kiếm tài liệu..."
              searchTerm={params.searchTerm || ""}
              onSearchTermChange={(v) =>
                setParams({ ...params, searchTerm: v, page: 1 })
              }
              pageSize={params.pageSize}
              onPageSizeChange={(n) =>
                setParams({ ...params, pageSize: n, page: 1 })
              }
            />
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataTable columns={columns} rows={data} />
            )}
            <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
              <PaginationControls
                page={meta?.page || 1}
                totalPages={meta?.totalPages || 1}
                onPageChange={(p) => setParams({ ...params, page: p })}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Dialog Tải lên */}
      <Dialog
        open={openUpload}
        onClose={() => !isUploading && setOpenUpload(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Tải lên tài liệu tri thức
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ height: 100, borderStyle: "dashed" }}
            >
              {file ? file.name : "Nhấp để chọn file (PDF, DOCX, TXT)"}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </Button>
            <TextField
              label="Tên hiển thị tài liệu"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setOpenUpload(false)}
            color="inherit"
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadSubmit}
            disabled={isUploading || !file || !title}
          >
            {isUploading ? "Đang tải lên..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIKnowledge;

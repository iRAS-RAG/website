import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useToast } from "../../common/toastContext";

// Interface cơ bản cho mọi loại "Type"
export interface BaseTypeItem {
  id: string;
  name: string;
}

// Props cho component con (Dialog truyền vào)
export type DialogCompProps<T> = {
  open: boolean;
  onClose: () => void;
  initial?: T | null;
  onUpdate?: (id: string, payload: Partial<T>) => Promise<T | null>;
  existingNames?: string[];
};

// Props cho ManageTypesDialog
interface ManageTypesDialogProps<T extends BaseTypeItem, P> {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: T[];
  updateItem: (id: string, p: P) => Promise<T | null>;
  deleteItem: (id: string) => Promise<boolean>;
  onDeleted?: (id: string) => void;
  DialogComponent: React.ComponentType<DialogCompProps<T>>;
  renderSecondary?: (it: T) => string;
}

function ManageTypesDialog<T extends BaseTypeItem, P>({
  open,
  onClose,
  title,
  items,
  updateItem,
  deleteItem,
  onDeleted,
  DialogComponent,
  renderSecondary,
}: ManageTypesDialogProps<T, P>) {
  const [editing, setEditing] = useState<T | null>(null);

  // State quản lý việc hiển thị modal xác nhận xóa
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  return (
    <>
      {/* Dialog Quản lý danh sách */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{title ?? "Quản lý"}</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List disablePadding>
            {items.map((it) => (
              <ListItem key={it.id} divider sx={{ px: 3, py: 1.5 }}>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 500 }}>{it.name}</Typography>
                  }
                  secondary={renderSecondary ? renderSecondary(it) : ""}
                />
                <ListItemSecondaryAction sx={{ right: 24 }}>
                  <IconButton
                    edge="end"
                    onClick={() => setEditing(it)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => setItemToDelete(it)} // Mở modal xác nhận
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {items.length === 0 && (
              <ListItem sx={{ px: 3, py: 3 }}>
                <ListItemText
                  primary="Chưa có dữ liệu."
                  sx={{ color: "text.secondary", textAlign: "center" }}
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Form Chỉnh sửa */}
      <DialogComponent
        open={Boolean(editing)}
        initial={editing}
        onClose={() => setEditing(null)}
        onUpdate={async (id, payload) => {
          const res = await updateItem(id, payload as unknown as P); // Đã kèm fix type lỗi kỳ trước
          if (res) toast.success("Cập nhật thành công");
          return res;
        }}
        existingNames={items.map((it) => it.name)}
      />

      {/* Dialog Xác nhận Xóa (Custom Confirm Modal) */}
      <Dialog
        open={Boolean(itemToDelete)}
        onClose={() => !isDeleting && setItemToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Xác nhận xóa?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Bạn có chắc chắn muốn xóa <strong>{itemToDelete?.name}</strong>?
            Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn cấu hình này
            khỏi hệ thống.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setItemToDelete(null)}
            color="inherit"
            disabled={isDeleting}
            sx={{ fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            onClick={async () => {
              if (!itemToDelete) return;
              setIsDeleting(true);
              try {
                const ok = await deleteItem(itemToDelete.id);
                if (ok) {
                  toast.success("Xóa thành công");
                  onDeleted?.(itemToDelete.id);
                } else {
                  toast.error("Xóa thất bại");
                }
              } catch {
                toast.error("Có lỗi xảy ra khi xóa");
              } finally {
                setIsDeleting(false);
                setItemToDelete(null);
              }
            }}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{ borderRadius: "8px", fontWeight: 600, boxShadow: "none" }}
          >
            {isDeleting ? "Đang xử lý..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ManageTypesDialog;

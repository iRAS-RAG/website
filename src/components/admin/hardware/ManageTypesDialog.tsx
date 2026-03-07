import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@mui/material";
import React, { useState } from "react";
import { useToast } from "../../common/toastContext";

type DialogCompProps = {
  open: boolean;
  onClose: () => void;
  initial?: any | null;
  onUpdate?: (id: string, payload: any) => Promise<any | null>;
};

const ManageTypesDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  items: any[];
  updateItem: (id: string, p: Partial<any>) => Promise<any | null>;
  deleteItem: (id: string) => Promise<boolean>;
  onDeleted?: (id: string) => void;
  DialogComponent: React.ComponentType<DialogCompProps>;
  renderSecondary?: (it: any) => string;
}> = ({ open, onClose, title, items, updateItem, deleteItem, onDeleted, DialogComponent, renderSecondary }) => {
  const [editing, setEditing] = useState<any | null>(null);
  const toast = useToast();

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{title ?? "Quản lý"}</DialogTitle>
        <DialogContent>
          <List>
            {items.map((it) => (
              <ListItem key={it.id} divider>
                <ListItemText primary={it.name} secondary={renderSecondary ? renderSecondary(it) : ""} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => setEditing(it)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={async () => {
                      const ok = window.confirm(`Xóa loại '${it.name}'? Điều này có thể ảnh hưởng các mục đang sử dụng.`);
                      if (!ok) return;
                      try {
                        const okDel = await deleteItem(it.id);
                        if (okDel) {
                          toast.success("Xóa thành công");
                          if (onDeleted) onDeleted(it.id);
                        } else {
                          toast.error("Xóa thất bại");
                        }
                      } catch (e) {
                        toast.error((e as Error).message || "Xóa thất bại");
                      }
                    }}
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <DialogComponent
        open={Boolean(editing)}
        initial={editing}
        onClose={() => setEditing(null)}
        onUpdate={async (id: string, payload: any) => {
          try {
            const res = await updateItem(id, payload);
            toast.success("Cập nhật thành công");
            return res;
          } catch (e) {
            toast.error((e as Error).message || "Cập nhật thất bại");
            return null;
          }
        }}
      />
    </>
  );
};

export default ManageTypesDialog;

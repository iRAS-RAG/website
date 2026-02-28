import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
};

const ConfirmDeleteDialog: React.FC<Props> = ({ open, onClose, onConfirm, title = "Xác nhận", description = "Bạn có chắc chắn muốn xóa mục này?" }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{description}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Hủy</Button>
      <Button color="error" onClick={onConfirm}>
        Xóa
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteDialog;

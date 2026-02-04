import LogoutIcon from "@mui/icons-material/Logout";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { clearCurrentUser, logout } from "../../api/auth";

const LogoutButton: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      clearCurrentUser();
      localStorage.removeItem("userRole");
      setOpen(false);
      navigate("/auth/login");
    }
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)} aria-label="logout">
        <LogoutIcon />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Đăng xuất</DialogTitle>
        <DialogContent>
          <DialogContentText>Bạn có chắc muốn đăng xuất không?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Đăng xuất
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;

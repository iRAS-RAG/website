import { Box, Paper, Typography, useTheme } from "@mui/material";
import React from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AIKnowledge: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", bgcolor: theme.palette.background.default, minHeight: "100vh", width: "100%" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              AI & Cơ sở tri thức
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trang quản lý AI và cơ sở tri thức — nội dung mẫu.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AIKnowledge;

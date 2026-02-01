import { Box, Typography, useTheme } from "@mui/material";
import React from "react";

export const AdminHeader: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        Quản trị hệ thống
      </Typography>

      <Box />
    </Box>
  );
};

export default AdminHeader;

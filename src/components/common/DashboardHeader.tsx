import SearchIcon from "@mui/icons-material/Search";
import { Box, InputBase, Paper, Typography, useTheme } from "@mui/material";
import React from "react";

interface DashboardHeaderProps {
  title?: string;
  searchPlaceholder?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  searchPlaceholder = "Tìm nhanh mã lô nuôi, cảm biến...",
}) => {
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
      {/* SEARCH on left */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          width: 400,
          bgcolor: theme.palette.background.default,
          borderRadius: "12px",
          px: 1.5,
          py: 0.5,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SearchIcon
          sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }}
        />
        <InputBase
          placeholder={searchPlaceholder}
          sx={{ flex: 1, fontSize: "0.875rem" }}
        />
      </Paper>

      {/* Title centered if provided */}
      <Box sx={{ flex: 1, textAlign: "center", pr: "400px" }}>
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DashboardHeader;

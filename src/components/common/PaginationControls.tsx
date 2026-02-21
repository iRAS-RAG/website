import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import React from "react";

type Props = {
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
};

export const PaginationControls: React.FC<Props> = ({ page = 1, totalPages = 1, onPageChange }) => {
  return (
    <Paper elevation={0} sx={{ mt: 2, display: "flex", justifyContent: "flex-end", alignItems: "center", p: 1, borderRadius: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ mr: 1, color: "text.secondary" }}>
          Trang {page} / {totalPages}
        </Typography>
        <IconButton size="small" onClick={() => onPageChange?.(page - 1)} disabled={page <= 1}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default PaginationControls;

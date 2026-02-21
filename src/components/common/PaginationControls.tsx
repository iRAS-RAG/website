import { Box, Button, Typography } from "@mui/material";
import React from "react";

type Props = {
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
};

export const PaginationControls: React.FC<Props> = ({ page = 1, totalPages = 1, onPageChange }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2, gap: 1 }}>
      <Typography variant="body2">
        Trang {page} / {totalPages}
      </Typography>
      <Button size="small" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
        Trước
      </Button>
      <Button size="small" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
        Tiếp
      </Button>
    </Box>
  );
};

export default PaginationControls;

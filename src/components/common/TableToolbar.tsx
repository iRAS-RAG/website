import { Box, MenuItem, Stack, TextField } from "@mui/material";
import React from "react";

type Props = {
  q?: string;
  onQChange?: (v: string) => void;
  pageSize?: number;
  onPageSizeChange?: (n: number) => void;
  pageSizeOptions?: number[];
};

export const TableToolbar: React.FC<Props> = ({ q = "", onQChange, pageSize = 10, onPageSizeChange, pageSizeOptions = [5, 10, 25, 50] }) => {
  return (
    <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
      <TextField size="small" placeholder="Search" value={q} onChange={(e) => onQChange?.(e.target.value)} sx={{ minWidth: 240 }} />

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField select size="small" value={String(pageSize)} onChange={(e) => onPageSizeChange?.(Number(e.target.value))} sx={{ width: 120 }}>
          {pageSizeOptions.map((o) => (
            <MenuItem key={o} value={o}>
              {o} / trang
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};

export default TableToolbar;

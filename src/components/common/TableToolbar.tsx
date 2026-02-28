import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment, MenuItem, Paper, Stack, TextField } from "@mui/material";
import React from "react";

type Props = {
  searchTerm?: string;
  onSearchTermChange?: (v: string) => void;
  pageSize?: number;
  onPageSizeChange?: (n: number) => void;
  pageSizeOptions?: number[];
  filters?: React.ReactNode;
};

export const TableToolbar: React.FC<Props> = ({ searchTerm = "", onSearchTermChange, pageSize = 10, onPageSizeChange, pageSizeOptions = [5, 10, 25, 50], filters }) => {
  return (
    <Paper elevation={0} sx={{ mb: 2, p: 1.25, borderRadius: 1, bgcolor: (t) => t.palette.background.paper }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange?.(e.target.value)}
          sx={{ minWidth: 260, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
          <TextField select size="small" value={String(pageSize)} onChange={(e) => onPageSizeChange?.(Number(e.target.value))} sx={{ width: 140 }}>
            {pageSizeOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o} / trang
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Box>

      {filters && <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>{filters}</Box>}
    </Paper>
  );
};

export default TableToolbar;

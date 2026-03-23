import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment, MenuItem, TextField } from "@mui/material";
import React from "react";

type Props = {
  searchTerm?: string;
  onSearchTermChange?: (v: string) => void;
  pageSize?: number;
  onPageSizeChange?: (n: number) => void;
  pageSizeOptions?: number[];
  filters?: React.ReactNode;
  searchPlaceholder?: string; // Bổ sung prop này
};

export const TableToolbar: React.FC<Props> = ({
  searchTerm = "",
  onSearchTermChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  filters,
  searchPlaceholder = "Tìm kiếm theo tên hoặc email...", // Giá trị mặc định
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        justifyContent: "space-between",
        p: 2.5,
        borderBottom: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
      }}
    >
      {/* Box TRÁI: Search và Bộ lọc (Switch/Select) */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "center",
          flex: 1,
          minWidth: { xs: "100%", sm: "auto" },
        }}
      >
        <TextField
          size="small"
          placeholder={searchPlaceholder} // Sử dụng prop mới ở đây
          value={searchTerm}
          onChange={(e) => onSearchTermChange?.(e.target.value)}
          sx={{
            minWidth: 280,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "#F8FAFC",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
        />
        {filters && <Box>{filters}</Box>}
      </Box>

      {/* Box PHẢI: Select số dòng/trang */}
      <Box>
        <TextField
          select
          size="small"
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          sx={{
            width: 130,
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          }}
        >
          {pageSizeOptions.map((o) => (
            <MenuItem key={o} value={o} sx={{ fontSize: "0.9rem" }}>
              {o} / trang
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};

export default TableToolbar;

import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import type { SpeciesConfig } from "../../../hooks/useSpeciesConfigs";

const SpeciesList: React.FC<{
  items: SpeciesConfig[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
}> = ({ items, onSelect, selectedId }) => {
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* THANH TÌM KIẾM NHỎ */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm loài..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "#F8FAFC",
            },
          }}
        />
      </Box>

      {/* DANH SÁCH LOÀI */}
      <Stack
        spacing={1}
        sx={{ overflowY: "auto", flexGrow: 1, pr: 0.5, pb: 1 }}
      >
        {filtered.map((s) => {
          const isActive = selectedId === s.id;
          return (
            <Box
              key={s.id}
              onClick={() => onSelect(s.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                bgcolor: isActive ? "#EFF6FF" : "#FFFFFF",
                border: "1px solid",
                borderColor: isActive ? "#2A85FF" : "transparent",
                "&:hover": { bgcolor: isActive ? "#EFF6FF" : "#F8FAFC" },
              }}
            >
              {/* Đã thay đổi: Avatar hiển thị icon mặc định là con cá */}
              <Avatar
                sx={{
                  bgcolor: "#E2E8F0",
                  color: "#475569",
                  width: 36,
                  height: 36,
                  fontWeight: 600,
                }}
              >
                🐟
              </Avatar>
              <Typography
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0F172A" : "#334155",
                  fontSize: "0.95rem",
                }}
              >
                {s.name}
              </Typography>
            </Box>
          );
        })}
        {filtered.length === 0 && (
          <Typography
            variant="body2"
            sx={{ color: "#94A3B8", textAlign: "center", mt: 2 }}
          >
            Không tìm thấy loài nào.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default SpeciesList;

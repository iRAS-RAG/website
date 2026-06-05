import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { recommendationApi } from "../../api/recommendations";
import type { Recommendation } from "../../types/recommendation";

interface AISuggestionsPanelProps {
  limit?: number;
}

export const AISuggestionsPanel = ({ limit = 5 }: AISuggestionsPanelProps) => {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await recommendationApi.getAll({ page: 1, pageSize: limit });
        if (!mounted) return;
        setItems(res?.data ?? []);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [limit]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: "1px solid #E2E8F0",
        bgcolor: "#fff",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <AutoAwesomeIcon sx={{ color: "#9333EA", fontSize: 20 }} />
        <Typography fontWeight={700} sx={{ color: "#0F172A" }}>
          Gợi ý từ AI
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={22} />
        </Box>
      ) : items.length === 0 ? (
        <Typography variant="body2" sx={{ color: "#94A3B8", py: 2, textAlign: "center" }}>
          Chưa có gợi ý mới
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.map((r) => (
            <ListItem
              key={r.id}
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: "8px",
                bgcolor: "#FAF5FF",
                mb: 0.75,
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#9333EA",
                  mt: 0.8,
                  mr: 1.25,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#0F172A", fontWeight: 500, lineHeight: 1.45 }}
                >
                  {r.suggestionText || r.content || "—"}
                </Typography>
                {r.documentTitle && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#9333EA", fontWeight: 600, mt: 0.25, display: "block" }}
                  >
                    📄 {r.documentTitle}
                  </Typography>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default AISuggestionsPanel;

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, TextField, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { FeedType as FeedTypeType } from "../../api/feeds";
import { createFeed, deleteFeed, fetchFeeds, updateFeed } from "../../api/feeds";

const FeedsTab: React.FC = () => {
  const theme = useTheme();

  const [feedsData, setFeedsData] = useState<FeedTypeType[]>([]);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedTypeType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [feedName, setFeedName] = useState("");
  const [feedProtein, setFeedProtein] = useState("");

  useEffect(() => {
    fetchFeeds()
      .then(setFeedsData)
      .catch(() => setFeedsData([]));
  }, []);

  const openConfirm = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    try {
      await deleteFeed(confirmId);
      setFeedsData(await fetchFeeds());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveFeed = async (values: { name: string; protein: string }) => {
    if (editingFeed) await updateFeed(editingFeed.id, values);
    else await createFeed(values);
    setFeedDialogOpen(false);
    setEditingFeed(null);
    setFeedsData(await fetchFeeds());
    setFeedName("");
    setFeedProtein("");
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Thức ăn
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => {
            setEditingFeed(null);
            setFeedName("");
            setFeedProtein("");
            setFeedDialogOpen(true);
          }}
        >
          Thêm thức ăn
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
        {feedsData.map((f) => (
          <Paper key={f.id} sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Avatar sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.main }}>
              <FastfoodIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{f.name}</Typography>
              <Chip label={`Protein: ${f.protein}`} size="small" sx={{ mt: 1 }} color="info" />
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={() => {
                  setEditingFeed(f);
                  setFeedName(f.name);
                  setFeedProtein(f.protein);
                  setFeedDialogOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => openConfirm(f.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Dialog open={feedDialogOpen} onClose={() => setFeedDialogOpen(false)} fullWidth>
        <DialogTitle>{editingFeed ? "Chỉnh sửa thức ăn" : "Thêm thức ăn"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Tên" value={feedName} onChange={(e) => setFeedName(e.target.value)} fullWidth />
            <TextField label="Protein" value={feedProtein} onChange={(e) => setFeedProtein(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => handleSaveFeed({ name: feedName, protein: feedProtein })} disabled={!feedName || !feedProtein}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa mục này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button color="error" onClick={handleDeleteConfirmed}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedsTab;

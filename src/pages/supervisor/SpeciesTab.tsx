import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PetsIcon from "@mui/icons-material/Pets";
import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, TextField, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { Species as SpeciesType } from "../../api/species";
import { createSpecies, deleteSpecies, fetchSpecies, updateSpecies } from "../../api/species";

const SpeciesTab: React.FC = () => {
  const theme = useTheme();

  const [speciesData, setSpeciesData] = useState<SpeciesType[]>([]);
  const [speciesDialogOpen, setSpeciesDialogOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<SpeciesType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [spName, setSpName] = useState("");
  const [spOptimal, setSpOptimal] = useState("");

  useEffect(() => {
    fetchSpecies()
      .then(setSpeciesData)
      .catch(() => setSpeciesData([]));
  }, []);

  const openConfirm = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    try {
      await deleteSpecies(confirmId);
      setSpeciesData(await fetchSpecies());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSpecies = async (values: { name: string; optimalTemp: string }) => {
    if (editingSpecies) await updateSpecies(editingSpecies.id, values);
    else await createSpecies(values);
    setSpeciesDialogOpen(false);
    setEditingSpecies(null);
    setSpeciesData(await fetchSpecies());
    setSpName("");
    setSpOptimal("");
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Loài
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => {
            setEditingSpecies(null);
            setSpName("");
            setSpOptimal("");
            setSpeciesDialogOpen(true);
          }}
        >
          Thêm loài
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
        {speciesData.map((s) => (
          <Paper key={s.id} sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main }}>
              <PetsIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
              <Chip label={`Nhiệt tối ưu: ${s.optimalTemp}`} size="small" sx={{ mt: 1 }} />
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={() => {
                  setEditingSpecies(s);
                  setSpName(s.name);
                  setSpOptimal(s.optimalTemp);
                  setSpeciesDialogOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => openConfirm(s.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Dialog open={speciesDialogOpen} onClose={() => setSpeciesDialogOpen(false)} fullWidth>
        <DialogTitle>{editingSpecies ? "Chỉnh sửa loài" : "Thêm loài"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Tên loài" value={spName} onChange={(e) => setSpName(e.target.value)} fullWidth />
            <TextField label="Nhiệt tối ưu" value={spOptimal} onChange={(e) => setSpOptimal(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpeciesDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => handleSaveSpecies({ name: spName, optimalTemp: spOptimal })} disabled={!spName || !spOptimal}>
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

export default SpeciesTab;

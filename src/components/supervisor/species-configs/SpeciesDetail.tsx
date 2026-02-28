import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import useFeedTypes from "../../../hooks/useFeedTypes";
import type { SpeciesConfig, Stage } from "../../../hooks/useSpeciesConfigs";
import ThresholdEditor from "./ThresholdEditor";

const SpeciesDetail: React.FC<{
  species: SpeciesConfig;
  updateStage: (speciesId: string, stageId: string, patch: Partial<Stage>) => void;
  updateStageThreshold: (speciesId: string, stageId: string, sensor: string, min: number | null, max: number | null) => void;
  addStage: (speciesId: string, name?: string) => void;
}> = ({ species, updateStage, updateStageThreshold, addStage }) => {
  const { feeds: feedTypes, loading: feedLoading } = useFeedTypes();
  return (
    <Box>
      <Typography variant="h6">{species.name}</Typography>
      <Divider sx={{ my: 1 }} />

      <Stack spacing={2}>
        {species.stages.map((st) => (
          <Accordion key={st.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{st.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="Tên giai đoạn" fullWidth value={st.name} onChange={(e) => updateStage(species.id, st.id, { name: e.target.value })} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id={`feedtype-label-${st.id}`}>Loại thức ăn</InputLabel>
                    <Select labelId={`feedtype-label-${st.id}`} label="Loại thức ăn" value={st.feedType ?? ""} onChange={(e) => updateStage(species.id, st.id, { feedType: String(e.target.value) })}>
                      {/* Use growth stages as demo options for feed type */}
                      {feedLoading ? (
                        <MenuItem value="">
                          <CircularProgress size={18} />
                        </MenuItem>
                      ) : (
                        feedTypes.map((f) => (
                          <MenuItem key={f.id} value={f.name}>
                            {f.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField label="Feed (kg/100 cá)" type="number" fullWidth value={st.feedPer100} onChange={(e) => updateStage(species.id, st.id, { feedPer100: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Số lần/ngày" type="number" fullWidth value={st.frequencyPerDay} onChange={(e) => updateStage(species.id, st.id, { frequencyPerDay: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Mật độ tối đa (cá/m3)"
                    type="number"
                    fullWidth
                    value={st.maxStockingDensity}
                    onChange={(e) => updateStage(species.id, st.id, { maxStockingDensity: Number(e.target.value) })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Thời gian (ngày)"
                    type="number"
                    fullWidth
                    value={st.expectedDurationDays}
                    onChange={(e) => updateStage(species.id, st.id, { expectedDurationDays: Number(e.target.value) })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Ngưỡng cảm biến</Typography>
                  <ThresholdEditor speciesId={species.id} stage={st} onSaveThreshold={(sensor, min, max) => updateStageThreshold(species.id, st.id, sensor, min, max)} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box>
          <Button variant="contained" onClick={() => addStage(species.id)}>
            Thêm giai đoạn
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default SpeciesDetail;

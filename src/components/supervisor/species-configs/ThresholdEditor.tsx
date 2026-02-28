import { Box, Button, Grid, List, ListItem, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import type { Stage } from "../../../hooks/useSpeciesConfigs";

const ThresholdEditor: React.FC<{
  speciesId: string;
  stage: Stage;
  onSaveThreshold: (sensor: string, min: number | null, max: number | null) => void;
}> = ({ stage, onSaveThreshold }) => {
  const [sensor, setSensor] = useState("");
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");

  function handleSave() {
    const minN = min === "" ? null : Number(min);
    const maxN = max === "" ? null : Number(max);
    if (!sensor) return;
    onSaveThreshold(sensor, minN, maxN);
    setSensor("");
    setMin("");
    setMax("");
  }

  return (
    <Box sx={{ mt: 1 }}>
      <List dense>
        {stage.thresholds.map((t) => (
          <ListItem key={t.sensor}>
            <Typography>
              {t.sensor}: {t.min ?? "-"} - {t.max ?? "-"}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField label="Sensor" value={sensor} fullWidth onChange={(e) => setSensor(e.target.value)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField label="Min" value={min} fullWidth onChange={(e) => setMin(e.target.value)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField label="Max" value={max} fullWidth onChange={(e) => setMax(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="outlined" onClick={handleSave} fullWidth>
            Lưu
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThresholdEditor;

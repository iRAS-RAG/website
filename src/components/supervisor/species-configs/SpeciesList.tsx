import { Box, Grid } from "@mui/material";
import React from "react";
import type { SpeciesConfig } from "../../../hooks/useSpeciesConfigs";
import SpeciesCard from "./SpeciesCard";

const SpeciesList: React.FC<{
  items: SpeciesConfig[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
}> = ({ items, onSelect, selectedId }) => {
  return (
    <Box>
      <Grid container spacing={2}>
        {items.map((s) => (
          <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <SpeciesCard species={s} onClick={() => onSelect(s.id)} selected={selectedId === s.id} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SpeciesList;

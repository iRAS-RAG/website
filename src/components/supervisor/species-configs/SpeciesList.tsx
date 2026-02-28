import { Box } from "@mui/material";
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
      {items.map((s) => (
        <SpeciesCard key={s.id} species={s} onClick={() => onSelect(s.id)} selected={selectedId === s.id} />
      ))}
    </Box>
  );
};

export default SpeciesList;

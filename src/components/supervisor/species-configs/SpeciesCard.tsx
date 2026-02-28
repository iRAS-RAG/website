import { Avatar, Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import React from "react";
import type { SpeciesConfig } from "../../../hooks/useSpeciesConfigs";

function pickEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes("cá") || n.startsWith("ca") || n.includes("ca ")) return "🐟";
  if (n.includes("tôm") || n.includes("tom")) return "🦐";
  if (n.includes("tôm") || n.includes("shrimp")) return "🦐";
  return "🐠";
}

const SpeciesCard: React.FC<{ species: SpeciesConfig; onClick?: () => void; selected?: boolean }> = ({ species, onClick, selected }) => {
  const emoji = pickEmoji(species.name);
  return (
    <Card variant={selected ? "elevation" : "outlined"} sx={{ mb: 2, borderColor: selected ? "primary.main" : undefined }}>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40 }}>{emoji}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{species.name}</Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default SpeciesCard;

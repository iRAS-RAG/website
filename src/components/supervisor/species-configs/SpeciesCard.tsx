import { Avatar, Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import React from "react";
import type { SpeciesConfig } from "../../../hooks/useSpeciesConfigs";

function pickEmoji(name: string) {
  const n = name.toLowerCase();

  const includesAny = (words: string[]) => words.some((w) => n.includes(w));

  // Shrimp / prawn
  if (includesAny(["tôm", "tom", "shrimp", "prawn"])) return "🦐";

  // Crab
  if (includesAny(["cua", "crab"])) return "🦀";

  // Lobster
  if (includesAny(["hùm", "hum", "lobster"])) return "🦞";

  // Squid / octopus
  if (includesAny(["mực", "muc", "squid"])) return "🦑";
  if (includesAny(["bạch tuộc", "bach tuoc", "octopus"])) return "🐙";

  // Shellfish
  if (includesAny(["nghêu", "ngao", "sò", "so", "clam", "oyster", "mussel"])) return "🐚";

  // Turtle / dolphin
  if (includesAny(["rùa", "rua", "turtle"])) return "🐢";
  if (includesAny(["cá heo", "ca heo", "dolphin"])) return "🐬";

  // Fish defaults (tilapia, salmon, tuna, eel, carp, catfish, etc.)
  if (includesAny(["cá", "ca ", "ca-", "tilapia", "salmon", "tuna", "eel", "carp", "catfish", "cobia", "grouper", "seabass"])) return "🐟";

  return "🐠";
}

const SpeciesCard: React.FC<{ species: SpeciesConfig; onClick?: () => void; selected?: boolean }> = ({ species, onClick, selected }) => {
  const emoji = pickEmoji(species.name);
  return (
    <Card variant={selected ? "elevation" : "outlined"} sx={{ borderColor: selected ? "primary.main" : undefined }}>
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

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FactoryIcon from "@mui/icons-material/Factory";
import MedicationIcon from "@mui/icons-material/Medication";
import { Avatar, Box, Chip, IconButton, Paper, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { FaFish } from "react-icons/fa";
import type { FeedType } from "../../../api/feed-types";

type Props = {
  feed: FeedType;
  onEdit: (f: FeedType) => void;
  onDelete: (id: string) => void;
};

const FeedCard: React.FC<Props> = ({ feed, onEdit, onDelete }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
      }}
    >
      <Avatar sx={{ bgcolor: theme.palette.secondary.main, color: theme.palette.common.white }}>
        <FaFish style={{ width: 18, height: 18, color: theme.palette.common.white }} />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700 }}>{feed.name}</Typography>
        {feed.description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {feed.description}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
          <Chip icon={<MedicationIcon fontSize="small" />} label={`Protein: ${feed.protein}`} size="small" color="info" />
          {feed.manufacturer ? <Chip icon={<FactoryIcon fontSize="small" />} label={feed.manufacturer} size="small" /> : null}
        </Stack>
      </Box>
      <Stack direction="row" spacing={1}>
        <IconButton size="small" onClick={() => onEdit(feed)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(feed.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default FeedCard;

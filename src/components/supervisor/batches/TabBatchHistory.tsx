import { Box } from "@mui/material";
import React from "react";
import type { Batch } from "../../../types/batch";
import BatchHistoryChart from "./BatchHistoryChart";

const TabBatchHistory: React.FC<{ batch: Batch }> = ({ batch }) => {
  const defaultStart = batch.startDate;
  const defaultEnd = batch.actualHarvestDate ?? batch.estimatedHarvestDate ?? undefined;

  return (
    <Box>
      <BatchHistoryChart batchId={batch.id} defaultStart={defaultStart} defaultEnd={defaultEnd} />
    </Box>
  );
};

export default TabBatchHistory;

import { Box, Paper, Typography } from "@mui/material";
import React from "react";

type Props = {
  batchId: string;
};

const TabAlertHistory: React.FC<Props> = ({ batchId }) => {
  // TODO: Implement alert history fetching
  // This would integrate with your existing alert system

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Lịch sử cảnh báo & khuyến nghị
      </Typography>

      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Lịch sử cảnh báo cho đợt nuôi {batchId}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tính năng này sẽ hiển thị dòng thời gian của tất cả cảnh báo và gợi ý AI đã được kích hoạt cho đợt nuôi cụ thể này.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TabAlertHistory;

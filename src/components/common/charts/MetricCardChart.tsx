import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type Point = { timestamp: string; value: number };

interface Props {
  title: string;
  value: number | string;
  series?: Point[];
  color?: string;
}

export const MetricCardChart: React.FC<Props> = ({ title, value, series = [], color = "#2A85FF" }) => {
  const data = series.map((p) => ({ time: new Date(p.timestamp).toLocaleDateString(), v: Number(p.value) }));

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>{title}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A" }}>
            {value}
          </Typography>
        </Box>

        <Box sx={{ width: 120, height: 48 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default MetricCardChart;

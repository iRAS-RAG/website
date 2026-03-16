import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";

interface TrendData {
  time: string;
  [key: string]: number | string;
}

interface TrendProps {
  title: string;
  data: TrendData[];
  dataKey: string;
  color: string;
}

export const TrendLineChart = ({ title, data, dataKey, color }: TrendProps) => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px", height: 350 }}>
    <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700 }}>
      {title}
    </Typography>

    <Box sx={{ height: 250, width: "100%" }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />

          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />

          <Tooltip />

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </Paper>
);

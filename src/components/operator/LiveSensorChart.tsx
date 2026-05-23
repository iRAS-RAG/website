import { Box, Paper, Typography, useTheme } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LivePoint } from "../../hooks/useLiveTelemetry";

interface Props {
  sensorName: string;
  sensorTypeName: string;
  unitOfMeasure: string;
  points: LivePoint[];
  color: string;
  safeMin: number;
  safeMax: number;
}

export const LiveSensorChart = ({
  sensorName,
  unitOfMeasure,
  points,
  color,
  safeMin,
  safeMax,
}: Props) => {
  const theme = useTheme();

  const values = points.map((p) => p.value);
  const dataMin = values.length ? Math.min(...values) : safeMin;
  const dataMax = values.length ? Math.max(...values) : safeMax;
  const yMin = Math.floor(Math.min(dataMin, safeMin) - 0.5);
  const yMax = Math.ceil(Math.max(dataMax, safeMax) + 0.5);

  const chartPoints = points.map(({ time, value }) => ({ time, value }));

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: "16px",
        borderColor: theme.palette.divider,
        height: 240,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {sensorName}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#10B981",
              animation: "pulse 1.5s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Trực tiếp · 10s
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartPoints}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis dataKey="time" hide />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              domain={[yMin, yMax]}
              unit={` ${unitOfMeasure}`}
              width={68}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: 12,
              }}
              formatter={(v: number | undefined) => [
                `${v ?? ""} ${unitOfMeasure}`,
                "Giá trị",
              ]}
              labelFormatter={(label) => `🕐 ${String(label)}`}
            />
            <ReferenceArea
              y1={safeMin}
              y2={safeMax}
              fill="#10B981"
              fillOpacity={0.08}
              stroke="#10B981"
              strokeOpacity={0.3}
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

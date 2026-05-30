import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { timestamp: string; value: number };
type Series = { name: string; points: Point[] };

interface Props {
  title?: string;
  series?: Series[] | null;
  height?: number;
  yLabel?: string;
}

const COLORS = ["#2A85FF", "#10B981", "#F59E0B", "#9333EA", "#EF4444", "#06B6D4"];

function buildChartData(series: Series[]) {
  const tsSet = new Set<string>();
  series.forEach((s) => s.points.forEach((p) => tsSet.add(p.timestamp)));
  const ts = Array.from(tsSet).sort();
  return ts.map((t) => {
    const row: Record<string, unknown> = { time: new Date(t).toLocaleDateString() };
    series.forEach((s) => {
      const p = s.points.find((x) => x.timestamp === t);
      row[s.name] = p ? Number(p.value) : null;
    });
    return row as Record<string, unknown>;
  });
}

export const TimeseriesChart: React.FC<Props> = ({ title, series, height = 320, yLabel }) => {
  if (!series || series.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px", minHeight: height }}>
        {title && (
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ py: 6, color: "#64748B" }}>Không có dữ liệu cho khoảng thời gian đã chọn.</Box>
      </Paper>
    );
  }

  const data = buildChartData(series);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "16px", height }}>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ height: height - 60, width: "100%" }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {series.map((s, i) => (
              <Line key={s.name} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 6 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TimeseriesChart;

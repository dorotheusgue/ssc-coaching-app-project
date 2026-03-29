"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyChartProps {
  data: { day: string; completed: number; total: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="day" stroke="#a3a3a3" fontSize={12} />
          <YAxis stroke="#a3a3a3" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#262626",
              border: "1px solid #404040",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
          <Bar dataKey="total" fill="#525252" radius={[4, 4, 0, 0]} name="Total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

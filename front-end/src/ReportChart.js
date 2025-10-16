import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ReportChart = ({ data }) => {
  const chartData = data.reduce((acc, c) => {
    const found = acc.find((x) => x.category === c.category);
    if (found) found.count++;
    else acc.push({ category: c.category, count: 1 });
    return acc;
  }, []);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#1E293B" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;

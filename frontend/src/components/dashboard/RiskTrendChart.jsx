import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function RiskTrendChart({ history }) {
  return (
    <div className="bg-[#1E293B] p-6 rounded-2xl shadow-xl">
      <h2 className="mb-4">Real-Time Risk Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="probability"
            stroke="#EF4444"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
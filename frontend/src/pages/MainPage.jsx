import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function MainPage() {
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#642323] to-[#0b1120] text-white p-10">
      <div className="grid grid-cols-2 gap-10">

       {/* LEFT PANEL */}
<div className="rounded-3xl bg-[#0f172a]/70 border border-slate-800 p-10 shadow-2xl">

  <h2 className="text-2xl font-semibold mb-8">
    Vehicle AI Prediction
  </h2>

  <div className="space-y-6">

    {/* Row 1 */}
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Vehicle Type" />
      <SelectField label="Make & Model" />
    </div>

    {/* Row 2 */}
    <InputField label="Year of Manufacture" />
    
    {/* Row 3 */}
    <div className="grid grid-cols-2 gap-4">
      <SmallInput label="Usage Hours (hours)" value="5200" />
      <SmallInput label="Engine Temperature (°C)" value="118" />
    </div>

    {/* Row 4 */}
    <div className="grid grid-cols-2 gap-4">
      <SmallInput label="Actual Load (tons)" value="14" />
      <SmallInput label="Load Capacity (tons)" value="16" />
    </div>

    {/* Row 5 */}
    <div className="grid grid-cols-2 gap-4">
      <SmallInput label="Fuel Consumption (L/100km)" value="21.5" />
      <SmallInput label="Vibration Levels (g)" value="0.82" />
    </div>

    {/* Row 6 */}
    <div className="grid grid-cols-2 gap-4">
      <StatusSelect label="Battery Status" value="Good" />
      <StatusSelect label="Brake Condition" value="Fair" />
    </div>

    {/* Row 7 */}
    <div className="grid grid-cols-2 gap-4">
      <StatusSelect label="Oil Quality" value="Good" />
      <StatusSelect label="Weather Conditions" value="Clear" />
    </div>

    {/* Row 8 */}
    <div className="grid grid-cols-2 gap-4">
      <StatusSelect label="Road Conditions" value="Highway" />
      <StatusSelect label="Tire Pressure (PSI)" value="34" />
    </div>

    <button
      onClick={handlePredict}
      className="w-full mt-6 bg-blue-600 hover:bg-green-500 transition-all py-4 rounded-xl text-lg font-semibold"
    >
      {loading ? "Predicting..." : "Predict Vehicle Health"}
    </button>

  </div>
</div>

        {/* RIGHT PANEL */}
        <div className="rounded-3xl bg-[#0f172a]/70 border border-slate-800 p-10 shadow-2xl">

          {/* HEADER */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Vehicle Dashboard</h2>
          </div>

          <div className="mb-6">
            <div className="text-lg font-semibold">
              Truck • AshokLeyland_1616
            </div>
            <div className="text-sm text-slate-400 mt-1 flex justify-between">
              <span>Model Confidence: 99.7%</span>
              <span>Last Updated: 3 mins ago • Auto Refresh On</span>
            </div>
          </div>

          {/* TOP SECTION */}
          <div className="grid grid-cols-2 gap-6 mb-8">

            {/* HEALTH RING */}
            <div className="bg-[#111827] rounded-2xl p-6 flex flex-col items-center">
              <div className="text-sm text-slate-400 mb-4">
                Health Score
              </div>

              <CircularRing value={0.2} />
            </div>

            {/* FAILURE RISK */}
            <div className="bg-[#111827] rounded-2xl p-6">
              <div className="text-sm text-slate-400 mb-4">
                Failure Risk
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Probability:</span>
                  <span className="font-semibold">99.84%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Risk Level:</span>
                  <span className="bg-red-500 text-xs px-3 py-1 rounded-full">
                    HIGH
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Time to Failure:</span>
                  <span>24.96 hours</span>
                </div>

                <div className="flex justify-between">
                  <span>Confidence Range:</span>
                  <span>± 25 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* TREND */}
          <div className="bg-[#111827] rounded-2xl p-6 mb-6">
            <div className="text-sm text-slate-400 mb-4">
              Real-Time Risk Trend
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={[
                  { time: "12:00", value: 5 },
                  { time: "12:03", value: 18 },
                  { time: "12:06", value: 40 },
                  { time: "12:09", value: 45 },
                  { time: "12:12", value: 50 },
                ]}
              >
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* COMPONENT CARDS */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MiniCard title="Battery" value="Good" color="green" />
            <MiniCard title="Brakes" value="Fair" color="yellow" />
            <MiniCard title="Oil Quality" value="Good" color="green" />
            <MiniCard title="Tires" value="34 PSI" color="blue" />
          </div>

          {/* AI RECOMMENDATION */}
          <div className="bg-[#111827] rounded-2xl p-6 border border-yellow-500/30">
            <div className="text-yellow-400 text-sm mb-2">
              AI Recommendation
            </div>
            <div className="text-red-400 text-sm">
              Immediate Maintenance Required. High risk of failure detected.
              Stop the vehicle and inspect critical components.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
function InputField({ label }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">
        {label}
      </label>
      <input
        className="w-full bg-[#111827] border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SmallInput({ label, value }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">
        {label}
      </label>
      <input
        defaultValue={value}
        className="w-full bg-[#111827] border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({ label }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">
        {label}
      </label>
      <select
        className="w-full bg-[#111827] border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option>Select</option>
      </select>
    </div>
  );
}

function StatusSelect({ label, value }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">
        {label}
      </label>
      <select
        defaultValue={value}
        className="w-full bg-[#111827] border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option>{value}</option>
      </select>
    </div>
  );
}
function CircularRing({ value }) {
  const radius = 80;
  const stroke = 16;
  const normalized = radius - stroke * 2;
  const circumference = normalized * 2 * Math.PI;
  const offset = circumference - value * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#1e293b"
        fill="transparent"
        strokeWidth={stroke}
        r={normalized}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#ef4444"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={normalized}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-red-400 text-2xl font-bold"
      >
        0.2%
      </text>
    </svg>
  );
}

function MiniCard({ title, value, color }) {
  const colors = {
    green: "bg-green-500/20 text-green-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4">
      <div className="text-xs text-slate-400 mb-2">{title}</div>
      <div className={`text-sm px-3 py-1 rounded-lg w-fit ${colors[color]}`}>
        {value}
      </div>
    </div>
  );
}
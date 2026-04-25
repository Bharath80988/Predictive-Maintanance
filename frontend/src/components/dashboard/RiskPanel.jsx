import { getRiskColor } from "../../utils/helpers";

export default function RiskPanel({ data }) {
  const risk = data.failure_risk;

  return (
    <div className="bg-[#1E293B] p-8 rounded-2xl shadow-xl">
      <h2 className="mb-4">Failure Risk</h2>
      <p>Probability: {(risk.probability * 100).toFixed(2)}%</p>
      <p className={getRiskColor(risk.risk_level)}>
        Level: {risk.risk_level}
      </p>
      <p>
        Estimated Time: {data.time_to_failure.estimated_hours} hrs
      </p>
      <p>{data.time_to_failure.confidence_range}</p>
    </div>
  );
}
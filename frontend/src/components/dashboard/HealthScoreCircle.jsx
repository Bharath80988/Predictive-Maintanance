export default function HealthScoreCircle({ score }) {
  return (
    <div className="bg-[#1E293B] p-8 rounded-2xl shadow-xl text-center">
      <h2 className="mb-4">Health Score</h2>
      <div className="text-5xl font-bold text-green-400">
        {score}%
      </div>
    </div>
  );
}
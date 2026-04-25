export default function AIRecommendations({ riskLevel }) {
  const getMessage = () => {
    if (riskLevel === "HIGH") {
      return {
        text: "Immediate maintenance required. Stop vehicle and inspect critical systems.",
        color: "text-red-600",
      };
    }

    if (riskLevel === "MEDIUM") {
      return {
        text: "Schedule maintenance within 48 hours.",
        color: "text-yellow-600",
      };
    }

    return {
      text: "Vehicle condition stable. Continue monitoring.",
      color: "text-green-600",
    };
  };

  const message = getMessage();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="font-semibold mb-2 text-[#1E3A8A]">
        AI Recommendation
      </h3>
      <p className={message.color}>{message.text}</p>
    </div>
  );
}
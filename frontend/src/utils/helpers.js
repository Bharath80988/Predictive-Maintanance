export const calculateHealthScore = (probability) => {
  return ((1 - probability) * 100).toFixed(1);
};

export const getRiskColor = (level) => {
  switch (level) {
    case "HIGH":
      return "text-red-500";
    case "MEDIUM":
      return "text-amber-500";
    case "LOW":
      return "text-green-500";
    default:
      return "text-gray-400";
  }
};
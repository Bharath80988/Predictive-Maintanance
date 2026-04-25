export default function ComponentHealthCard({
  title,
  status,
  value,
}) {
  const getColor = () => {
    if (status === "Good") return "bg-green-100 text-green-700";
    if (status === "Fair") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-2">
      <h3 className="font-medium text-gray-700">{title}</h3>

      {value && (
        <div className="text-lg font-semibold text-[#1E3A8A]">
          {value}
        </div>
      )}

      <div
        className={`px-3 py-1 rounded-full text-sm w-fit ${getColor()}`}
      >
        {status}
      </div>
    </div>
  );
}
export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white py-3 rounded-xl transition-all duration-200 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
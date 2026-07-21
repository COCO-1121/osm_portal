import { FaArrowUp } from "react-icons/fa";

function DashboardCard({
  title,
  value,
  icon,
  color = "blue",
  subtitle = "",
}) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-700",
      border: "border-blue-100",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-700",
      border: "border-green-100",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-700",
      border: "border-red-100",
    },
    yellow: {
      bg: "bg-yellow-50",
      icon: "text-yellow-700",
      border: "border-yellow-100",
    },
  };

  const theme = colors[color];

  return (
    <div
      className={`bg-white rounded-2xl border ${theme.border} shadow-sm p-6 hover:shadow-lg transition`}
    >
      <div className="flex justify-between items-center">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {value}
          </h1>

          {subtitle && (
            <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
              <FaArrowUp className="text-green-500" />
              {subtitle}
            </p>
          )}

        </div>

        <div
          className={`${theme.bg} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${theme.icon}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

export default DashboardCard;
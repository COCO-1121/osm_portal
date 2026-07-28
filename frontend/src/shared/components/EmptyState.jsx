import { FaUsers } from "react-icons/fa";

function EmptyState({
  title = "No Examiners Found",
  description = "Create your first examiner to get started.",
  buttonText = "Create Examiner",
  onClick,
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm py-16 px-8 text-center">

      <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl">
        <FaUsers />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mt-6">
        {title}
      </h2>

      <p className="text-gray-500 mt-3 max-w-md mx-auto">
        {description}
      </p>

      <button
        onClick={onClick}
        className="mt-8 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
      >
        {buttonText}
      </button>

    </div>
  );
}

export default EmptyState;
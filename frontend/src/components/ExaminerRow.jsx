import { FaEdit } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

function ExaminerRow({ examiner, onEdit }) {
  return (
    <tr className="border-b last:border-b-0 hover:bg-blue-50 transition-colors duration-200">
      <td className="px-6 py-4 font-medium text-left">
        {examiner.user_id}
      </td>

      <td className="px-6 py-4 text-left">
      <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold flex-shrink-0">
    {examiner.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()}
  </div>

  <div className="min-w-0">
    <p className="font-medium text-gray-800 truncate">{examiner.name}</p>
    <p className="text-xs text-gray-500 truncate">{examiner.user_id}</p>
  </div>
</div>
      </td>

      <td className="px-6 py-4 text-left">
        <span className="block truncate">{examiner.email}</span>
      </td>

      <td className="px-6 py-4 text-left">
        {examiner.phone}
      </td>

      <td className="px-6 py-4 text-left">
        <StatusBadge active={examiner.is_active} />
      </td>

      <td className="px-6 py-4 text-center">
        <button
          onClick={() => onEdit(examiner)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          <FaEdit />
          Edit
        </button>
      </td>
    </tr>
  );
}

export default ExaminerRow;
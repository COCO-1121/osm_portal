import { useNavigate } from "react-router-dom";

function SubjectAssignmentCard() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 p-6">

      {/* Heading */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-5">
        Examiner Subject Assignment
      </h1>

      {/* Examiner Details */}
      <div className="space-y-3 text-base">

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-500">
            Examiner ID
          </span>

          <span className="font-semibold text-gray-800">
            EXM102
          </span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-500">
            Institute ID
          </span>

          <span className="font-semibold text-gray-800">
            INST-123
          </span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium text-gray-500">
            Session
          </span>

          <span className="font-semibold text-gray-800">
            February 2026
          </span>
        </div>

      </div>

      {/* Assigned Subject */}
      <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">

        <p className="uppercase tracking-[3px] text-gray-600 text-xs">
          Assigned Subject
        </p>

        <h2 className="text-4xl font-bold text-blue-700 mt-2">
          PHYSICS (048)
        </h2>

        <p className="text-gray-600 text-sm leading-6 mt-3">
          This subject has been assigned by the administrator.
          Subject assignment cannot be modified by the examiner.
        </p>

      </div>

      {/* Button */}
      <div className="mt-5 flex justify-center">

        <button
          onClick={() => navigate("/main-assessment")}
          className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-2.5 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
        >
          Access Session
        </button>

      </div>

    </div>
  );
}

export default SubjectAssignmentCard;
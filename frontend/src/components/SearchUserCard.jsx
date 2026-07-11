import { FaSearch } from "react-icons/fa";

function SearchUserCard() {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Search User
      </h2>

      <p className="text-gray-500 text-sm mb-5">
        Search an Examiner or Admin using the permanent Examiner/Admin ID.
      </p>

      <div className="flex gap-4">

        <div className="flex flex-1 items-center border border-gray-300 rounded-lg px-4">

          <FaSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Enter Examiner ID or Admin ID..."
            className="w-full px-3 py-3 outline-none"
          />

        </div>

        <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 rounded-lg">
          Search
        </button>

      </div>

    </div>
  );
}

export default SearchUserCard;
import { FaPlus, FaSearch } from "react-icons/fa";

function SearchBar({
  search,
  setSearch,
  status,
  setStatus,
  onCreate,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap gap-4 flex-1">
        <div className="relative flex-1 min-w-[260px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Login ID, Name or Email..."
            className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-3"
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <button
        onClick={onCreate}
        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2"
      >
        <FaPlus />

        Create Examiner
      </button>
    </div>
  );
}

export default SearchBar;
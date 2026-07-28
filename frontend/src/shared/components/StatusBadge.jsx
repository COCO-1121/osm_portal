function StatusBadge({ active }) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          active
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            active ? "bg-green-600" : "bg-red-600"
          }`}
        />
  
        {active ? "Active" : "Inactive"}
      </span>
    );
  }
  
  export default StatusBadge;
function StatsCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <h3 className="text-gray-500 text-xs font-semibold tracking-wide">
        {title}
      </h3>

      <h1 className="text-3xl font-bold text-blue-600 mt-3">
        {value}
      </h1>
    </div>
  );
}

export default StatsCard;
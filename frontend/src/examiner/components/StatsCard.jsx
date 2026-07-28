function StatsCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow border p-6">

      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <h1 className="text-4xl font-bold text-blue-700 mt-2">
        {value}
      </h1>

    </div>
  );
}

export default StatsCard;
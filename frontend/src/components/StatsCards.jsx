export default function StatsCards() {
  return (
    <div className="flex gap-6 my-6">

      <div className="bg-white shadow w-64 rounded-lg overflow-hidden">

        <div className="bg-gray-200 p-3 font-semibold text-center">
          Total Eval. Completed
        </div>

        <div className="text-center text-3xl py-5">
          3
        </div>

      </div>

      <div className="bg-white shadow w-64 rounded-lg overflow-hidden">

        <div className="bg-gray-200 p-3 font-semibold text-center">
          Today Eval. Completed
        </div>

        <div className="text-center text-3xl py-5">
          0
        </div>

      </div>

    </div>
  );
}
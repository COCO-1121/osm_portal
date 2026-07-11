import AdminLayout from "../layouts/AdminLayout";
import StatsCard from "../components/StatsCard";
import RejectedTable from "../components/RejectedTable";

function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">

      <div className="grid grid-cols-4 gap-6">

        <StatsCard title="Rejected Today" value="18" />
        <StatsCard title="Pending Review" value="7" />
        <StatsCard title="Returned" value="11" />
        <StatsCard title="Total Examiners" value="243" />

      </div>

      <RejectedTable />

    </AdminLayout>
  );
}

export default AdminDashboard;
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

function AdminLayout({ title, children }) {
  return (
    <div className="h-screen flex bg-gray-100">

      <AdminSidebar />

      <div className="flex-1 flex flex-col">

        <AdminTopbar title={title} />

        <main className="flex-1 overflow-y-auto p-8">

          {children}

        </main>

      </div>

    </div>
  );
}

export default AdminLayout;
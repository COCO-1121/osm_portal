import AdminSidebar from "../../admin/components/AdminSidebar";
import AdminTopbar from "../../admin/components/AdminTopbar";

function AdminLayout({ title, subtitle, children }) {
  return (
    <div className="h-screen flex bg-slate-50/70 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
function AdminTopbar({ title }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {title}
        </h1>

        <p className="text-sm text-gray-500">
          On Screen Marking Administration Portal
        </p>
      </div>

      <div className="text-right">

        <h2 className="font-semibold text-gray-800">
          ADMIN001
        </h2>

        <p className="text-sm text-gray-500">
          System Administrator
        </p>

      </div>

    </header>
  );
}

export default AdminTopbar;
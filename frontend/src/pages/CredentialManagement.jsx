import AdminLayout from "../layouts/AdminLayout";
import SearchUserCard from "../components/SearchUserCard";
import CredentialForm from "../components/CredentialForm";

function CredentialManagement() {
  return (
    <AdminLayout title="Credential Management">

      <SearchUserCard />

      <div className="mt-6">
        <CredentialForm />
      </div>

    </AdminLayout>
  );
}

export default CredentialManagement;
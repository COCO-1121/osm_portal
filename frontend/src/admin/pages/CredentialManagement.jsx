import AdminLayout from "../../shared/layouts/AdminLayout";
import SearchUserCard from "../../shared/components/SearchUserCard";
import CredentialForm from "../../shared/components/CredentialForm";

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
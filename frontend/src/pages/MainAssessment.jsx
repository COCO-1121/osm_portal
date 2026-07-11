import UserInfo from "../components/UserInfo";
import StatsCards from "../components/StatsCards";
import SubjectsTable from "../components/SubjectsTable";

export default function MainAssessment() {
  return (
    <div className="flex-1 p-5">
      <UserInfo />

      <h1 className="text-4xl text-center text-blue-900 my-6">
        Main Assessment Dashboard
      </h1>

      <StatsCards />

      <SubjectsTable />
    </div>
  );
}
import ExaminerRejectedTable from "../../shared/components/ExaminerRejectedTable";

export default function ExaminerRejectedScripts() {
  return (
    <div className="flex-1 p-5">

      <h1 className="text-4xl text-center text-blue-900 my-6">
        Rejected Scripts
      </h1>

      <ExaminerRejectedTable />

    </div>
  );
}

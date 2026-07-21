import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaUserCheck, FaUserSlash } from "react-icons/fa";

import AdminLayout from "../layouts/AdminLayout";
import SearchBar from "../components/SearchBar";
import ExaminerTable from "../components/ExaminerTable";
import DashboardCard from "../components/DashboardCard";
import CreateExaminerModal from "../components/CreateExaminerModal";
import EditExaminerModal from "../components/EditExaminerModal";

import { getAllExaminers } from "../services/examinerService.jsx";

function ExaminerManagement() {
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [selectedExaminer, setSelectedExaminer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadExaminers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllExaminers();
      setExaminers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading examiners:", err);
      setError(err.message || "Unable to load examiners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExaminers();
  }, []);

  const filteredExaminers = useMemo(() => {
    return examiners.filter((examiner) => {
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        examiner.user_id?.toLowerCase().includes(keyword) ||
        examiner.name?.toLowerCase().includes(keyword) ||
        examiner.email?.toLowerCase().includes(keyword) ||
        examiner.phone?.toLowerCase().includes(keyword);
      const matchesStatus =
        status === "ALL"
          ? true
          : status === "ACTIVE"
          ? examiner.is_active
          : !examiner.is_active;
      return matchesSearch && matchesStatus;
    });
  }, [examiners, search, status]);

  const total = examiners.length;
  const active = examiners.filter((e) => e.is_active).length;
  const inactive = total - active;

  return (
    <AdminLayout
      title="Examiner Management"
      subtitle="Create, update and manage examiner accounts."
    >
      <div className="space-y-8">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading examiners...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <DashboardCard
                title="Total Examiners"
                value={total}
                icon={<FaUsers />}
                color="blue"
                subtitle={`${active} currently active`}
              />
              <DashboardCard
                title="Active Examiners"
                value={active}
                icon={<FaUserCheck />}
                color="green"
              />
              <DashboardCard
                title="Inactive Examiners"
                value={inactive}
                icon={<FaUserSlash />}
                color="red"
              />
            </div>

            <SearchBar
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              onCreate={() => setShowCreateModal(true)}
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <ExaminerTable
              examiners={filteredExaminers}
              loading={loading}
              onCreate={() => setShowCreateModal(true)}
              onEdit={(examiner) => {
                setSelectedExaminer(examiner);
                setShowEditModal(true);
              }}
            />
          </>
        )}

        {showCreateModal && (
          <CreateExaminerModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadExaminers();
            }}
          />
        )}

        {showEditModal && selectedExaminer && (
          <EditExaminerModal
            examiner={selectedExaminer}
            onClose={() => {
              setShowEditModal(false);
              setSelectedExaminer(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedExaminer(null);
              loadExaminers();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default ExaminerManagement;
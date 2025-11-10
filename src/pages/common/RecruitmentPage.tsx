import React from "react";
import CandidateTable from "../../components/common/CandidateTable";

export default function RecruitmentPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Recruitment</h1>
      <CandidateTable />
    </div>
  );
}
import React from "react";
import AppraisalTable from "../../components/performance/AppraisalTable";

export default function PerformancePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Performance Management</h1>
      <AppraisalTable />
    </div>
  );
}
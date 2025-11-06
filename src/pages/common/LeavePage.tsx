import React from "react";
import LeaveTable from "../../components/common/LeaveTable";

export default function LeavePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave Management</h1>
      <LeaveTable />
    </div>
  );
}
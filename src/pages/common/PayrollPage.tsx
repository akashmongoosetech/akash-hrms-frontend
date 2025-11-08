import React from "react";
import PayrollTable from "../../components/common/PayrollTable";

export default function PayrollPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payroll</h1>
      <PayrollTable />
    </div>
  );
}
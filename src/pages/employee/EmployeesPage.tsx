import React from "react";
import EmployeeTable from "../../components/employee/EmployeeTable";

export default function EmployeesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Employees</h1>
      <EmployeeTable />
    </div>
  );
}
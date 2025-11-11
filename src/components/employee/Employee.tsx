"use client";

import React, { useState } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  status: "Active" | "Inactive";
  joiningDate: string;
  mobile: string;
  salary: number;
};

/* ------------------------------------------------------------------ */
/* Dummy data                                                         */
/* ------------------------------------------------------------------ */
const initialData: Employee[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.j@demo.com",
    department: "Engineering",
    status: "Active",
    joiningDate: "2022-03-15",
    mobile: "+1 555-123-4567",
    salary: 95000,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.s@demo.com",
    department: "Marketing",
    status: "Inactive",
    joiningDate: "2021-07-22",
    mobile: "+1 555-987-6543",
    salary: 72000,
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol.w@demo.com",
    department: "Sales",
    status: "Active",
    joiningDate: "2023-01-10",
    mobile: "+1 555-456-7890",
    salary: 68000,
  },
];

/* ------------------------------------------------------------------ */
/* Table Component                                                    */
/* ------------------------------------------------------------------ */
export default function EmployeeTable() {
  const [employees] = useState<Employee[]>(initialData);

  return (
    <section className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Employees</h1>

      {/* Wrapper for horizontal scroll on small screens */}
      <div className="overflow-x-auto shadow-md rounded-lg ring-1 ring-black/5">
        <table className="min-w-full bg-white">
          {/* Header */}
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              {[
                "Name",
                "Email",
                "Department",
                "Status",
                "Joining Date",
                "Mobile",
                "Salary",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-3 text-left font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {emp.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {emp.department}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {emp.joiningDate}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.mobile}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  ${emp.salary.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Edit"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      aria-label="Delete"
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
import React, { useState, useEffect } from 'react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joiningDate: string;
  mobile1: string;
  department?: string;
}

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const users = await response.json();
          // Filter to only employees
          const filteredEmployees = users.filter((user: Employee) => user.role === 'Employee');
          setEmployees(filteredEmployees);
        } else {
          setError('Failed to fetch employees');
        }
      } catch (err) {
        setError('Error fetching employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading employees...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.firstName} {employee.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(employee.joiningDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.mobile1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {employees.length === 0 && (
        <div className="text-center py-8 text-gray-500">No employees found</div>
      )}
    </div>
  );
}
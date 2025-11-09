import React, { useState, useEffect } from 'react';
import { X, Edit, Save, X as CancelIcon } from 'lucide-react';
import { formatDate } from '../../../../Common/Commonfunction';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  joiningDate: string;
  salary?: number;
  role: string;
  department?: {
    _id: string;
    name: string;
  };
  bankAccountName?: string;
  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  bankAddress?: string;
}

interface PayrollViewModalProps {
   showModal: boolean;
   onClose: () => void;
   selectedEmployee: Employee | null;
   onEmployeeUpdate?: (updatedEmployee: Employee) => void;
}

const PayrollViewModal: React.FC<PayrollViewModalProps> = ({ showModal, onClose, selectedEmployee, onEmployeeUpdate }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [editedSalary, setEditedSalary] = useState<string>('');
   const [isSaving, setIsSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (selectedEmployee?.salary) {
         setEditedSalary(selectedEmployee.salary.toString());
      }
      setError(null); // Clear any previous errors when employee changes
   }, [selectedEmployee]);

   const handleSaveSalary = async () => {
      if (!selectedEmployee || !editedSalary.trim()) {
         setError('Please enter a valid salary amount');
         return;
      }

      const salaryValue = parseFloat(editedSalary);
      if (isNaN(salaryValue) || salaryValue < 0) {
         setError('Please enter a valid positive number for salary');
         return;
      }

      setIsSaving(true);
      setError(null);

      try {
         const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users/${selectedEmployee._id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ salary: salaryValue })
         });

         if (response.ok) {
            setIsEditing(false);
            // Update the selectedEmployee with new salary for immediate UI update
            const updatedEmployee = { ...selectedEmployee, salary: salaryValue };
            setEditedSalary(salaryValue.toString());
            // Notify parent component to update the employee list
            if (onEmployeeUpdate) {
               onEmployeeUpdate(updatedEmployee);
            }
         } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to update salary');
         }
      } catch (err) {
         setError('Network error. Please try again.');
      } finally {
         setIsSaving(false);
      }
   };

   if (!showModal || !selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Employee Payroll Details</h2>
          <button onClick={onClose} className="hover:text-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Employee Information</h3>
            <div className="flex items-center space-x-4">
              {selectedEmployee.photo ? (
                <img
                  className="h-14 w-14 rounded-full object-cover shadow-md"
                  src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${selectedEmployee.photo}`}
                  alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
                  {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                </div>
              )}
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                <p className="text-sm text-gray-500 capitalize">{selectedEmployee.role}</p>
              </div>
            </div>
          </div>

          {/* Employment Info */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Employment Info</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Joining Date</p>
                <p className="font-medium text-gray-900">
                  {selectedEmployee.joiningDate && !isNaN(new Date(selectedEmployee.joiningDate).getTime())
                    ? formatDate(selectedEmployee.joiningDate)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium text-gray-900">
                  {selectedEmployee.department?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Monthly Salary</p>
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      value={editedSalary}
                      onChange={(e) => setEditedSalary(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter salary"
                      disabled={isSaving}
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                  </>
                ) : (
                  <p className="font-medium text-gray-900">
                    {selectedEmployee.salary ? `₹${selectedEmployee.salary.toLocaleString()}` : '-'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Banking Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Account Name</p>
                <p className="font-medium text-gray-900">{selectedEmployee.bankAccountName || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Account Number</p>
                <p className="font-medium text-gray-900">{selectedEmployee.bankAccountNo || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Bank Name</p>
                <p className="font-medium text-gray-900">{selectedEmployee.bankName || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">IFSC Code</p>
                <p className="font-medium text-gray-900">{selectedEmployee.ifscCode || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Bank Address</p>
                <p className="font-medium text-gray-900">{selectedEmployee.bankAddress || '-'}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-gray-200 space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedSalary(selectedEmployee.salary?.toString() || '');
                  }}
                  className="px-6 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-gray-700 transition-all"
                >
                  <CancelIcon className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveSalary}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-2" />
                      Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-yellow-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-yellow-700 transition-all"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Salary
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PayrollViewModal;

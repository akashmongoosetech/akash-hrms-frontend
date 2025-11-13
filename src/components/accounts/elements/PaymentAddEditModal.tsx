import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import toast from 'react-hot-toast';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Payment {
  _id?: string;
  paymentId: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reason: string;
  date: string;
  type: string;
  amount: number;
  createdAt?: string;
}

interface PaymentAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPayment?: Payment | null;
}

export default function PaymentAddEditModal({
  isOpen,
  onClose,
  onSuccess,
  editingPayment
}: PaymentAddEditModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    reason: '',
    date: '',
    type: 'Cash',
    amount: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      if (editingPayment) {
        setFormData({
          employee: editingPayment.employee._id,
          reason: editingPayment.reason,
          date: editingPayment.date.split('T')[0], // Format for date input
          type: editingPayment.type,
          amount: editingPayment.amount.toString()
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingPayment]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      reason: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      type: 'Cash',
      amount: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employee || !formData.reason || !formData.date || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const url = editingPayment
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/payments/${editingPayment._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/payments`;

      const method = editingPayment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employee: formData.employee,
          reason: formData.reason,
          date: formData.date,
          type: formData.type,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(editingPayment ? 'Payment updated successfully' : 'Payment created successfully');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Error saving payment');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editingPayment ? 'Edit Payment' : 'Add New Payment'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment ID (Read-only for edit, auto-generated for new) */}
          {editingPayment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment ID
              </label>
              <input
                type="text"
                value={editingPayment.paymentId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <Select value={formData.employee} onValueChange={(value) => setFormData({ ...formData, employee: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} ({employee.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <input
              type="text"
              required
              placeholder="Enter payment reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Net Banking">Net Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="Enter amount in rupees"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitLoading}
            >
              {editingPayment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
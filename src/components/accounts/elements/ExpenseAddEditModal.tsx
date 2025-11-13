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

interface Expense {
  _id?: string;
  expenseId: string;
  item: string;
  orderBy: string;
  from: string;
  date: string;
  status: string;
  type: string;
  amount: number;
  createdAt?: string;
}

interface ExpenseAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingExpense?: Expense | null;
}

export default function ExpenseAddEditModal({
  isOpen,
  onClose,
  onSuccess,
  editingExpense
}: ExpenseAddEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    item: '',
    orderBy: '',
    from: '',
    date: '',
    status: 'Pending',
    type: 'Cash',
    amount: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setFormData({
          item: editingExpense.item,
          orderBy: editingExpense.orderBy,
          from: editingExpense.from,
          date: editingExpense.date.split('T')[0], // Format for date input
          status: editingExpense.status,
          type: editingExpense.type,
          amount: editingExpense.amount.toString()
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingExpense]);

  const resetForm = () => {
    setFormData({
      item: '',
      orderBy: '',
      from: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      status: 'Pending',
      type: 'Cash',
      amount: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item || !formData.orderBy || !formData.from || !formData.date || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const url = editingExpense
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/expenses/${editingExpense._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/expenses`;

      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          item: formData.item,
          orderBy: formData.orderBy,
          from: formData.from,
          date: formData.date,
          status: formData.status,
          type: formData.type,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(editingExpense ? 'Expense updated successfully' : 'Expense created successfully');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error saving expense');
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
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense ID (Read-only for edit, auto-generated for new) */}
          {editingExpense && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense ID
              </label>
              <input
                type="text"
                value={editingExpense.expenseId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          )}

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item *
            </label>
            <input
              type="text"
              required
              placeholder="Enter item name"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Order By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order By *
            </label>
            <input
              type="text"
              required
              placeholder="Enter order by"
              value={formData.orderBy}
              onChange={(e) => setFormData({ ...formData, orderBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Amazon, Flipkart, Myntra..."
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              list="from-options"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id="from-options">
              <option value="Amazon" />
              <option value="Flipkart" />
              <option value="Myntra" />
              <option value="Meesho" />
              <option value="Ebay" />
            </datalist>
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Reject">Reject</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
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
              {editingExpense ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
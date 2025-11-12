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

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface Invoice {
  _id?: string;
  invoiceNo: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  type: string;
  status: string;
  amount: number;
  createdAt?: string;
}

interface AccountAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingInvoice?: Invoice | null;
}

export default function AccountAddEditModal({
  isOpen,
  onClose,
  onSuccess,
  editingInvoice
}: AccountAddEditModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    date: '',
    type: 'Cash',
    status: 'Pending',
    amount: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      if (editingInvoice) {
        setFormData({
          client: editingInvoice.client._id,
          date: editingInvoice.date.split('T')[0], // Format for date input
          type: editingInvoice.type,
          status: editingInvoice.status,
          amount: editingInvoice.amount.toString()
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingInvoice]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/clients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const resetForm = () => {
    setFormData({
      client: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      type: 'Cash',
      status: 'Pending',
      amount: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client || !formData.date || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const url = editingInvoice
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/invoices/${editingInvoice._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/invoices`;

      const method = editingInvoice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          client: formData.client,
          date: formData.date,
          type: formData.type,
          status: formData.status,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Error saving invoice');
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
          {editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Number (Read-only for edit, auto-generated for new) */}
          {editingInvoice && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={editingInvoice.invoiceNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            <Select value={formData.client} onValueChange={(value) => setFormData({ ...formData, client: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="CARD">CARD</SelectItem>
                <SelectItem value="Crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Hold">Hold</SelectItem>
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
              {editingInvoice ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
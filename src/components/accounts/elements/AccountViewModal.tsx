import React from 'react';
import { Button } from '../../ui/button';
import { formatDate } from '../../../Common/Commonfunction';

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface Invoice {
  _id: string;
  invoiceNo: string;
  client: Client;
  date: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface AccountViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
  invoice?: Invoice | null;
}

export default function AccountViewModal({
  isOpen,
  onClose,
  onEdit,
  invoice
}: AccountViewModalProps) {
  if (!isOpen || !invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Cash':
        return 'bg-blue-100 text-blue-800';
      case 'Online':
        return 'bg-purple-100 text-purple-800';
      case 'UPI':
        return 'bg-indigo-100 text-indigo-800';
      case 'CARD':
        return 'bg-pink-100 text-pink-800';
      case 'Crypto':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Invoice Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Invoice Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{invoice.invoiceNo}</h4>
                <p className="text-sm text-gray-500">Invoice Number</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">₹{invoice.amount.toLocaleString()}</div>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Client Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">CLIENT INFORMATION</h5>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Name:</span>
                  <div className="text-sm font-medium text-gray-900">{invoice.client.name}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Email:</span>
                  <div className="text-sm text-gray-900">{invoice.client.email}</div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">INVOICE DETAILS</h5>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Date:</span>
                  <div className="text-sm font-medium text-gray-900">{formatDate(invoice.date)}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Type:</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(invoice.type)}`}>
                      {invoice.type}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Status:</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-semibold text-blue-700">TOTAL AMOUNT</h5>
                <p className="text-xs text-blue-600">Amount in Indian Rupees</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">₹{invoice.amount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="text-xs text-gray-500">
            <p>Created on: {formatDate(invoice.createdAt)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onEdit(invoice);
              onClose();
            }}
          >
            Edit Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
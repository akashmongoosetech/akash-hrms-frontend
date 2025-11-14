import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Printer, Search, Plus } from 'lucide-react';
import DeleteModal from '../../../Common/DeleteModal';
import { formatDate } from '../../../Common/Commonfunction';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { UniversalSkeleton, BaseSkeleton } from '../../ui/skeleton';

interface Client {
  _id: string;
  name: string;
  email: string;
  country?: string;
  state?: string;
  city?: string;
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

interface AccountTableProps {
  onAdd: () => void;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
}

export default function AccountTable({ onAdd, onEdit, onView }: AccountTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [currentPage]);

  const fetchInvoices = async (page: number = 1) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/invoices?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } else {
        console.error('Failed to fetch invoices');
        setInvoices([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.invoiceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (invoice.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (invoice.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (invoice.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleDelete = (invoiceId: string) => {
    setDeleteInvoiceId(invoiceId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteInvoiceId) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/invoices/${deleteInvoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchInvoices(currentPage);
        setShowDeleteModal(false);
        setDeleteInvoiceId(null);
        toast.success('Invoice deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Error deleting invoice');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = async (invoice: Invoice) => {
    try {
      // Generate QR code data URL
      const qrData = `Invoice: ${invoice.invoiceNo} - Amount: ₹${invoice.amount}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create a printable version of the invoice
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const clientAddress = [invoice.client.city, invoice.client.state, invoice.client.country].filter(Boolean).join(', ');

        printWindow.document.write(`
          <html>
            <head>
              <title> ${invoice.invoiceNo}</title>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 20px;
                  color: #333;
                  line-height: 1.6;
                }
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                  border: 1px solid #ddd;
                  padding: 30px;
                  background: white;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 40px;
                  border-bottom: 2px solid #007bff;
                  padding-bottom: 20px;
                }
                .company-info {
                  flex: 1;
                }
                .company-logo {
                  font-size: 24px;
                  font-weight: bold;
                  color: #007bff;
                  margin-bottom: 10px;
                }
                .company-details {
                  font-size: 14px;
                  color: #666;
                }
                .invoice-title {
                  text-align: right;
                  flex: 1;
                }
                .invoice-title h1 {
                  margin: 0;
                  color: #007bff;
                  font-size: 36px;
                }
                .invoice-no {
                  font-size: 18px;
                  font-weight: bold;
                  color: #333;
                }
                .details-section {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 30px;
                }
                .detail-box {
                  flex: 1;
                  margin-right: 20px;
                }
                .detail-box:last-child {
                  margin-right: 0;
                }
                .detail-box h3 {
                  margin-top: 0;
                  margin-bottom: 10px;
                  color: #007bff;
                  font-size: 16px;
                  text-transform: uppercase;
                  border-bottom: 1px solid #eee;
                  padding-bottom: 5px;
                }
                .detail-box p {
                  margin: 5px 0;
                  font-size: 14px;
                }
                .amount-section {
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: center;
                  margin-top: 30px;
                }
                .amount {
                  font-size: 28px;
                  font-weight: bold;
                  color: #28a745;
                  margin: 10px 0;
                }
                .qr-section {
                  text-align: center;
                  margin-top: 30px;
                }
                .qr-code {
                  width: 150px;
                  height: 150px;
                  border: 1px solid #ddd;
                }
                @media print {
                  body { margin: 0; }
                  .container { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="company-info">
                    <div class="company-logo">SoSapient</div>
                    <div class="company-details">
                      <p>521, C Sector, Vasant Vihar<br>
                      Ujjain, Madhya Pradesh, India<br>
                      Phone: +91-9685533878<br>
                      Fax: +91-9171606807<br>
                      Email: info@sosapient.com</p>
                    </div>
                  </div>
                  <div class="invoice-title">
                    <h1>INVOICE</h1>
                    <div class="invoice-no">${invoice.invoiceNo}</div>
                  </div>
                </div>

                <div class="details-section">
                  <div class="detail-box">
                    <h3>Bill To</h3>
                    <p><strong>${invoice.client.name}</strong></p>
                    <p>${invoice.client.email}</p>
                    <p>${clientAddress || 'Address not provided'}</p>
                  </div>
                  <div class="detail-box">
                    <h3>Invoice Details</h3>
                    <p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
                    <p><strong>Date:</strong> ${formatDate(invoice.date)}</p>
                    <p><strong>Payment Type:</strong> ${invoice.type}</p>
                    <p><strong>Status:</strong> ${invoice.status}</p>
                  </div>
                </div>

                <div class="amount-section">
                  <h3>Total Amount</h3>
                  <div class="amount">₹${invoice.amount.toLocaleString()}</div>
                </div>

                <div class="qr-section">
                  <h3>Scan QR Code</h3>
                  <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code">
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code for printing');
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full">
          <BaseSkeleton className="h-8 w-40" />
          <BaseSkeleton className="h-10 w-32" />
        </div>

        {/* Search Skeleton */}
        <BaseSkeleton className="h-10 w-full" />

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-4" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-20" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-12" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-8" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-8" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-12" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-12" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-14" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 10 }, (_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <BaseSkeleton className="h-5 w-8" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <BaseSkeleton className="h-5 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <BaseSkeleton className="h-4 w-20 mb-1" />
                        <BaseSkeleton className="h-3 w-28" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <BaseSkeleton className="h-5 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <BaseSkeleton className="h-5 w-12" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <BaseSkeleton className="h-5 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <BaseSkeleton className="h-5 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <BaseSkeleton className="h-8 w-8 rounded" />
                        <BaseSkeleton className="h-8 w-8 rounded" />
                        <BaseSkeleton className="h-8 w-8 rounded" />
                        <BaseSkeleton className="h-8 w-8 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full">
        {/* Title */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
          Invoice Management
        </h2>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm sm:text-base">Add Invoice</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice, index) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{invoice.client.name}</div>
                      <div className="text-gray-500 text-xs">{invoice.client.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(invoice.type)}`}>
                      {invoice.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(invoice)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePrint(invoice)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Print"
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No invoices found matching your search.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
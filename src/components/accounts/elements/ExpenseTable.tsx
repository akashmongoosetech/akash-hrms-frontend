import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Search, Plus } from 'lucide-react';
import DeleteModal from '../../../Common/DeleteModal';
import { formatDate } from '../../../Common/Commonfunction';
import toast from 'react-hot-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { UniversalSkeleton, BaseSkeleton } from '../../ui/skeleton';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Expense {
  _id: string;
  expenseId: string;
  item: string;
  orderBy: string;
  from: string;
  date: string;
  status: string;
  type: string;
  amount: number;
  createdAt: string;
}

interface ExpenseTableProps {
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onView: (expense: Expense) => void;
}

export default function ExpenseTable({ onAdd, onEdit, onView }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [currentPage]);

  const fetchExpenses = async (page: number = 1) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/expenses?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
        const meta = data.pagination || data;
        setTotalPages(meta.totalPages || 1);
        setTotalItems(meta.totalItems || 0);
      } else {
        console.error('Failed to fetch expenses');
        setExpenses([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    (expense.expenseId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (expense.item?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (expense.orderBy?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (expense.from?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (expense.type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleDelete = (expenseId: string) => {
    setDeleteExpenseId(expenseId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteExpenseId) return;

    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/expenses/${deleteExpenseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete expense');
    }

    fetchExpenses(currentPage);
    setDeleteExpenseId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Reject':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Online':
        return 'bg-purple-100 text-purple-800';
      case 'UPI':
        return 'bg-indigo-100 text-indigo-800';
      case 'Cash':
        return 'bg-blue-100 text-blue-800';
      case 'Card':
        return 'bg-pink-100 text-pink-800';
      case 'Net Banking':
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
          <BaseSkeleton className="h-8 w-48" />
          <BaseSkeleton className="h-10 w-32" />
        </div>

        {/* Search Skeleton */}
        <BaseSkeleton className="h-10 w-full" />

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-4" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-8" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-8" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-8" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-12" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-8" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-12" />
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-14" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 10 }, (_, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <BaseSkeleton className="h-5 w-8" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <BaseSkeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <BaseSkeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <BaseSkeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <BaseSkeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <BaseSkeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <BaseSkeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <BaseSkeleton className="h-5 w-12" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <BaseSkeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <BaseSkeleton className="h-8 w-8 rounded" />
                        <BaseSkeleton className="h-8 w-8 rounded" />
                        <BaseSkeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          Expense Management
        </h2>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm sm:text-base">Add Expense</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense ID
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order By
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense, index) => (
                <TableRow key={expense._id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.expenseId}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.item}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.orderBy}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.from}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(expense.type)}`}>
                      {expense.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(expense)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No expenses found matching your search.</p>
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
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteExpenseId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        successMessage="Expense deleted successfully!"
      />
    </div>
  );
}
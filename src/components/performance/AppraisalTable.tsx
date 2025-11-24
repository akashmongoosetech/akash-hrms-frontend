import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, User, Star } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { UniversalSkeleton, BaseSkeleton } from '../ui/skeleton';
import DeleteModal from '../../Common/DeleteModal';
import AppraisalModal from './AppraisalModal';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Reviewer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Appraisal {
  _id: string;
  employee: Employee;
  reviewer: Reviewer;
  period: {
    startDate: string;
    endDate: string;
  };
  overallRating: number;
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  goals: Array<{
    title: string;
    description: string;
    status: string;
    targetDate: string;
    progress: number;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
  comments: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AppraisalTable() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [editingAppraisal, setEditingAppraisal] = useState<Appraisal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAppraisalId, setDeleteAppraisalId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchAppraisals(currentPage);
  }, [currentPage]);

  const fetchAppraisals = async (page: number) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/appraisals?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppraisals(data.appraisals || []);
        setTotalPages(data.pagination?.totalPages || 0);
      } else {
        setError('Failed to fetch appraisals');
      }
    } catch (err) {
      setError('Error fetching appraisals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setSubmitLoading(true);
    try {
      const isUpdate = formData.id;
      const url = isUpdate
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/appraisals/${formData.id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/appraisals`;

      const method = isUpdate ? 'PUT' : 'POST';

      if (isUpdate) {
        delete formData.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchAppraisals(currentPage);
      } else {
        setError('Failed to save appraisal');
      }
    } catch (err) {
      setError('Error saving appraisal');
    } finally {
      setSubmitLoading(false);
      setShowModal(false);
      setEditingAppraisal(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteAppraisalId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteAppraisalId) return;

    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/appraisals/${deleteAppraisalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete appraisal');
    }

    fetchAppraisals(currentPage);
    setDeleteAppraisalId(null);
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/appraisals/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchAppraisals(currentPage);
      } else {
        setError('Failed to submit appraisal');
      }
    } catch (err) {
      setError('Error submitting appraisal');
    }
  };

  const handleReview = async (id: string, status: 'Approved' | 'Rejected', comments?: string) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/appraisals/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, comments })
      });

      if (response.ok) {
        fetchAppraisals(currentPage);
      } else {
        setError('Failed to review appraisal');
      }
    } catch (err) {
      setError('Error reviewing appraisal');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Under Review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (appraisal?: Appraisal) => {
    setEditingAppraisal(appraisal || null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <BaseSkeleton className="h-6 w-32" />
          <BaseSkeleton className="h-10 w-48" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-8" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-24" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-12" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-20" />
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
                    <BaseSkeleton className="h-4 w-24 mb-1" />
                    <BaseSkeleton className="h-3 w-16 mb-1" />
                    <BaseSkeleton className="h-3 w-32" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <BaseSkeleton className="h-5 w-20" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <BaseSkeleton className="h-5 w-16" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <BaseSkeleton className="h-5 w-5 rounded-full" />
                      <BaseSkeleton className="h-5 w-16" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <BaseSkeleton className="h-5 w-20" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <div className="flex space-x-2">
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
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Appraisals</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Appraisal</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appraisals.map((appraisal, index) => (
              <tr key={appraisal._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(currentPage - 1) * 10 + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center space-x-3">
                    {appraisal.employee.photo ? (
                      <img
                        src={appraisal.employee.photo.startsWith('http') ? appraisal.employee.photo : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/uploads/${appraisal.employee.photo}`}
                        alt={appraisal.employee.firstName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                    <div>
                      {appraisal.employee.firstName} {appraisal.employee.lastName}
                      <div className="text-sm text-gray-500">{appraisal.employee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appraisal.reviewer.firstName} {appraisal.reviewer.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(appraisal.period.startDate)} - {formatDate(appraisal.period.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{appraisal.overallRating}/5</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(appraisal.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appraisal.status)}`}>
                      {appraisal.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedAppraisal(appraisal)}
                      className="p-2 rounded hover:bg-gray-100 text-gray-600"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {(appraisal.status === 'Draft' || localStorage.getItem('role') === 'Admin' || localStorage.getItem('role') === 'SuperAdmin') && (
                      <button
                        onClick={() => openModal(appraisal)}
                        className="p-2 rounded hover:bg-gray-100 text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}
                    {appraisal.status === 'Draft' && (
                      <button
                        onClick={() => handleSubmitForReview(appraisal._id)}
                        className="p-2 rounded hover:bg-gray-100 text-green-600"
                        title="Submit for Review"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {appraisal.status === 'Submitted' && localStorage.getItem('role') !== 'Employee' && (
                      <>
                        <button
                          onClick={() => handleReview(appraisal._id, 'Approved')}
                          className="p-2 rounded hover:bg-gray-100 text-green-600"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReview(appraisal._id, 'Rejected')}
                          className="p-2 rounded hover:bg-gray-100 text-red-600"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {(appraisal.status === 'Draft' || appraisal.status === 'Submitted' || localStorage.getItem('role') === 'Admin' || localStorage.getItem('role') === 'SuperAdmin') && (
                      <button
                        onClick={() => handleDelete(appraisal._id)}
                        className="p-2 rounded hover:bg-gray-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {appraisals.length === 0 && (
        <div className="text-center py-8 text-gray-500">No appraisals found</div>
      )}

      {totalPages > 1 && (
        <Pagination>
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
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
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


      <AppraisalModal
        isOpen={showModal}
        editingAppraisal={editingAppraisal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        loading={submitLoading}
      />

      <AppraisalModal
        isOpen={selectedAppraisal !== null}
        isViewMode={true}
        editingAppraisal={selectedAppraisal}
        onClose={() => setSelectedAppraisal(null)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteAppraisalId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Appraisal"
        message="Are you sure you want to delete this appraisal? This action cannot be undone."
        successMessage="Appraisal deleted successfully!"
      />
    </div>
  );
}
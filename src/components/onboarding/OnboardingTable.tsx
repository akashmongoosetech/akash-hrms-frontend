import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { UniversalSkeleton, BaseSkeleton } from '../ui/skeleton';
import DeleteModal from '../../Common/DeleteModal';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Manager {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface HRContact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
}

interface Onboarding {
  _id: string;
  employee: Employee;
  startDate: string;
  endDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled';
  tasks: Task[];
  manager?: Manager;
  hrContact?: HRContact;
  createdAt: string;
  updatedAt: string;
}

export default function OnboardingTable() {
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOnboarding, setSelectedOnboarding] = useState<Onboarding | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOnboardingId, setDeleteOnboardingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchOnboardings(currentPage);
  }, [currentPage]);

  const fetchOnboardings = async (page: number) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/onboardings?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardings(data.onboardings || []);
        setTotalPages(data.pagination?.totalPages || 0);
      } else {
        setError('Failed to fetch onboardings');
      }
    } catch (err) {
      setError('Error fetching onboardings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteOnboardingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteOnboardingId) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/onboardings/${deleteOnboardingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete onboarding');
      }

      fetchOnboardings(currentPage);
      setDeleteOnboardingId(null);
    } catch (error) {
      console.error('Error deleting onboarding:', error);
      // Optionally show an error message to the user
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Not Started':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskCompletion = (tasks: Task[]) => {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
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
                  <BaseSkeleton className="h-4 w-16" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-20" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-12" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-16" />
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
        <h3 className="text-lg font-semibold text-gray-900">Onboarding Processes</h3>
        <button
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Onboarding</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {onboardings.map((onboarding, index) => {
              const { completed, total, percentage } = getTaskCompletion(onboarding.tasks);
              return (
                <tr key={onboarding._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(currentPage - 1) * 10 + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-3">
                      {onboarding.employee.photo ? (
                        <img
                          src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/uploads/${onboarding.employee.photo}`}
                          alt={onboarding.employee.firstName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                      <div>
                        {onboarding.employee.firstName} {onboarding.employee.lastName}
                        <div className="text-sm text-gray-500">{onboarding.employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(onboarding.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {onboarding.endDate ? formatDate(onboarding.endDate) : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{completed}/{total}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(onboarding.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(onboarding.status)}`}>
                        {onboarding.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOnboarding(onboarding)}
                        className="p-2 rounded hover:bg-gray-100 text-gray-600"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-gray-100 text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(onboarding._id)}
                        className="p-2 rounded hover:bg-gray-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onboardings.length === 0 && (
        <div className="text-center py-8 text-gray-500">No onboarding processes found</div>
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

      {/* Onboarding Details Modal */}
      {selectedOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Onboarding Details</h3>
              <button onClick={() => setSelectedOnboarding(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">Employee</div>
                  <div className="text-gray-800 font-medium">
                    {selectedOnboarding.employee.firstName} {selectedOnboarding.employee.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Start Date</div>
                  <div className="text-gray-800">{formatDate(selectedOnboarding.startDate)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">End Date</div>
                  <div className="text-gray-800">
                    {selectedOnboarding.endDate ? formatDate(selectedOnboarding.endDate) : 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Status</div>
                  <div className="text-gray-800 flex items-center space-x-2">
                    {getStatusIcon(selectedOnboarding.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOnboarding.status)}`}>
                      {selectedOnboarding.status}
                    </span>
                  </div>
                </div>
                {selectedOnboarding.manager && (
                  <div>
                    <div className="text-gray-500 text-sm">Manager</div>
                    <div className="text-gray-800">
                      {selectedOnboarding.manager.firstName} {selectedOnboarding.manager.lastName}
                    </div>
                  </div>
                )}
                {selectedOnboarding.hrContact && (
                  <div>
                    <div className="text-gray-500 text-sm">HR Contact</div>
                    <div className="text-gray-800">
                      {selectedOnboarding.hrContact.firstName} {selectedOnboarding.hrContact.lastName}
                    </div>
                  </div>
                )}
              </div>

              {selectedOnboarding.tasks.length > 0 && (
                <div>
                  <div className="text-gray-500 text-sm mb-2">Tasks ({selectedOnboarding.tasks.filter(t => t.completed).length}/{selectedOnboarding.tasks.length})</div>
                  <div className="space-y-2">
                    {selectedOnboarding.tasks.map((task, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-600">{task.description}</div>
                            )}
                            {task.dueDate && (
                              <div className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                onClick={() => setSelectedOnboarding(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteOnboardingId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Onboarding"
        message="Are you sure you want to delete this onboarding process? This action cannot be undone."
        successMessage="Onboarding deleted successfully!"
      />
    </div>
  );
}
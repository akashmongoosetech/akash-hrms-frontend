import React, { useState, useEffect } from 'react';
import { Edit, Trash2, UserPlus, Search, Loader, Grid, Table as TableIcon } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import { formatDate } from '../../Common/Commonfunction';
import toast from 'react-hot-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { UniversalSkeleton, BaseSkeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Department {
  _id: string;
  name: string;
  head: string;
  createdAt: string;
  totalAssociateEmployee: number;
}

interface HeadOption {
  id: string;
  name: string;
  role: string;
}

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

export default function DepartmentTable() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDepartmentId, setDeleteDepartmentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', head: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [headOptions, setHeadOptions] = useState<HeadOption[]>([]);
  const [headOptionsLoading, setHeadOptionsLoading] = useState(true);
  const [headOptionsFailed, setHeadOptionsFailed] = useState(false);

  useEffect(() => {
    fetchDepartments(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchHeadOptions();
  }, []);

  // Populate the "Department Head" dropdown with every active user, regardless
  // of role. Falls back to a free-text input if the list cannot be loaded.
  const fetchHeadOptions = async () => {
    setHeadOptionsLoading(true);
    setHeadOptionsFailed(false);
    try {
      const response = await fetch(`${API_BASE}/users?status=Active&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      const list: HeadOption[] = (data.users || []).map((user: any) => ({
        id: user._id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unnamed',
        role: user.role || ''
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      // SelectItem values must be unique; the value is the person's name.
      const seen = new Set<string>();
      setHeadOptions(
        list.filter((option) => {
          if (seen.has(option.name)) return false;
          seen.add(option.name);
          return true;
        })
      );
    } catch (error) {
      console.error('Error fetching users for department head:', error);
      setHeadOptions([]);
      setHeadOptionsFailed(true);
    } finally {
      setHeadOptionsLoading(false);
    }
  };

  const fetchDepartments = async (page: number = 1) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/departments?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
        setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1);
        setTotalItems(data.pagination?.totalItems ?? data.totalItems ?? 0);
      } else {
        console.error('Failed to fetch departments');
        setDepartments([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    (dept.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (dept.head?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The head is a Radix Select, not a native required field, so validate it here.
    if (!formData.name.trim() || !formData.head.trim()) {
      toast.error(formData.name.trim() ? 'Please select a department head' : 'Department name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingDepartment
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/departments/${editingDepartment._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/departments`;

      const method = editingDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchDepartments(currentPage);
        setShowAddModal(false);
        setEditingDepartment(null);
        setFormData({ name: '', head: '' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Error saving department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({ name: department.name, head: department.head });
    setShowAddModal(true);
  };

  const handleDelete = (department: Department) => {
    const assigned = department.totalAssociateEmployee || 0;

    if (assigned > 0) {
      toast.error(
        `Cannot delete "${department.name}": ${assigned} ${assigned === 1 ? 'employee is' : 'employees are'} still assigned to this department. Reassign them to another department first.`
      );
      return;
    }

    setDeleteDepartmentId(department._id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteDepartmentId) return;

    try {
      const response = await fetch(`${API_BASE}/departments/${deleteDepartmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        toast.success('Department deleted successfully');
        setShowDeleteModal(false);
        setDeleteDepartmentId(null);
        fetchDepartments(currentPage);
      } else {
        // The backend also refuses deletion when users are still assigned (e.g.
        // someone was added after this page loaded). Surface its message.
        const error = await response.json().catch(() => ({}));
        toast.error(error.message || 'Failed to delete department');
        setShowDeleteModal(false);
        setDeleteDepartmentId(null);
        fetchDepartments(currentPage);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingDepartment(null);
    setFormData({ name: '', head: '' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full">
          <BaseSkeleton className="h-8 w-56" />
          <BaseSkeleton className="h-10 w-40" />
        </div>

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
                    <BaseSkeleton className="h-4 w-24" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <BaseSkeleton className="h-4 w-24" />
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
                      <BaseSkeleton className="h-5 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <BaseSkeleton className="h-5 w-28" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <BaseSkeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
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
          Department Management
        </h2>

        {/* Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <UserPlus className="h-5 w-5" />
          <span className="text-sm sm:text-base">Add Department</span>
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center space-x-2">
            <TableIcon className="h-4 w-4" />
            <span>Table</span>
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center space-x-2">
            <Grid className="h-4 w-4" />
            <span>Grid</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
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
                  Department Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Head
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Employee
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.map((department, index) => (
                <tr key={department._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {department.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {department.head}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {department.totalAssociateEmployee}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(department.createdAt)}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(department)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(department)}
                        aria-label={`Delete department ${department.name}`}
                        title={
                          department.totalAssociateEmployee > 0
                            ? 'Reassign its employees before deleting this department'
                            : 'Delete department'
                        }
                        className={`text-red-600 hover:text-red-900 ${department.totalAssociateEmployee > 0 ? 'opacity-60' : ''}`}
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

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No departments found matching your search.</p>
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
        </TabsContent>

        <TabsContent value="grid">
          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <div key={department._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(department)}
                      aria-label={`Delete department ${department.name}`}
                      title={
                        department.totalAssociateEmployee > 0
                          ? 'Reassign its employees before deleting this department'
                          : 'Delete department'
                      }
                      className={`text-red-600 hover:text-red-900 ${department.totalAssociateEmployee > 0 ? 'opacity-60' : ''}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Head:</span> {department.head}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Employees:</span> {department.totalAssociateEmployee}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span> {formatDate(department.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No departments found matching your search.</p>
            </div>
          )}

          {/* Pagination for Grid */}
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
        </TabsContent>
      </Tabs>

      {/* Add/Edit Modal */}
      <Dialog
        open={showAddModal}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Engineering"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-head">Department Head</Label>

              {headOptionsFailed || (!headOptionsLoading && headOptions.length === 0) ? (
                <>
                  <Input
                    id="department-head"
                    type="text"
                    required
                    value={formData.head}
                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                    placeholder="Enter department head name"
                  />
                  <p className="text-xs text-amber-600">
                    No user list available, so a name can be typed manually.
                  </p>
                </>
              ) : (
                <>
                  <Select
                    value={formData.head}
                    onValueChange={(value) => setFormData({ ...formData, head: value })}
                    disabled={headOptionsLoading}
                  >
                    <SelectTrigger id="department-head" className="w-full">
                      <SelectValue
                        placeholder={
                          headOptionsLoading ? 'Loading users...' : 'Select department head'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.head &&
                        !headOptions.some((option) => option.name === formData.head) && (
                          <SelectItem value={formData.head}>{formData.head} (current)</SelectItem>
                        )}
                      {headOptions.map((option) => (
                        <SelectItem key={option.id} value={option.name}>
                          {option.name}
                          {option.role ? ` — ${option.role}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {headOptionsLoading
                      ? 'Loading users...'
                      : `${headOptions.length} active user${headOptions.length === 1 ? '' : 's'} across all roles.`}
                  </p>
                </>
              )}
            </div>

            <DialogFooter className="flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || (headOptionsLoading && !headOptionsFailed)}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : editingDepartment ? (
                  'Update'
                ) : (
                  'Add'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
      />
    </div>
  );
}

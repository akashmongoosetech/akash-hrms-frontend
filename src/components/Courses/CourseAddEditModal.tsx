import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  duration: string;
  status: 'Published' | 'Draft';
  category: string;
  categoryDetails?: Category;
  createdBy: string;
  createdByDetails?: Employee;
  courseVideo?: string;
  thumbnailImage?: string;
  createdAt?: string;
}

interface CourseAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCourse?: Course | null;
}

export default function CourseAddEditModal({
  isOpen,
  onClose,
  onSuccess,
  editingCourse
}: CourseAddEditModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    status: 'Draft' as 'Published' | 'Draft',
    category: '',
    createdBy: '',
    courseVideo: null as File | null,
    thumbnailImage: null as File | null,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchEmployees();
      if (editingCourse) {
        setFormData({
          title: editingCourse.title,
          description: editingCourse.description,
          duration: editingCourse.duration,
          status: editingCourse.status,
          category: editingCourse.category,
          createdBy: editingCourse.createdBy,
          courseVideo: null,
          thumbnailImage: null,
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingCourse]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Employees data:', data);
        console.log('Users array:', data.users);
        setEmployees(data.users || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch employees:', response.status, errorText);
        toast.error(`Failed to load employees: ${response.status} ${response.statusText}`);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      setEmployees([]);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCategoryData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Category created successfully');
        setShowAddCategoryModal(false);
        setNewCategoryData({ name: '', description: '' });
        // Refresh categories and select the new one
        await fetchCategories();
        setFormData({ ...formData, category: data.category._id });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      status: 'Draft',
      category: '',
      createdBy: '',
      courseVideo: null,
      thumbnailImage: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.duration || !formData.category || !formData.createdBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('createdBy', formData.createdBy);

      if (formData.courseVideo) {
        formDataToSend.append('courseVideo', formData.courseVideo);
      }
      if (formData.thumbnailImage) {
        formDataToSend.append('thumbnailImage', formData.thumbnailImage);
      }

      const url = editingCourse
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/courses/${editingCourse._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/courses`;

      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(editingCourse ? 'Course updated successfully' : 'Course created successfully');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Error saving course');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (field: 'courseVideo' | 'thumbnailImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="Enter course title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Enter course description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours/minutes) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 2 hours 30 minutes"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <Select value={formData.status} onValueChange={(value: 'Published' | 'Draft') => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <Select value={formData.category} onValueChange={(value) => {
              if (value === 'add-new') {
                setShowAddCategoryModal(true);
              } else {
                setFormData({ ...formData, category: value });
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
                <SelectItem value="add-new" className="text-blue-600 font-medium">
                  + Add New Category
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Created By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By *
            </label>
            <Select value={formData.createdBy} onValueChange={(value) => setFormData({ ...formData, createdBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee/admin" />
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

          {/* Course Video */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Video
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange('courseVideo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {editingCourse?.courseVideo && (
              <p className="text-sm text-gray-500 mt-1">Current video: {editingCourse.courseVideo}</p>
            )}
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange('thumbnailImage')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {editingCourse?.thumbnailImage && (
              <p className="text-sm text-gray-500 mt-1">Current image: {editingCourse.thumbnailImage}</p>
            )}
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
              {editingCourse ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter category name"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter category description (optional)"
                  value={newCategoryData.description}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryData({ name: '', description: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCategory}
              >
                Create Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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

interface Video {
  _id?: string;
  title: string;
  description: string;
  videoFile: string | File;
  duration?: number;
  order: number;
}

interface Module {
  _id?: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
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
  thumbnailImage?: string;
  modules: Module[];
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
    thumbnailImage: null as File | null,
    modules: [] as Module[],
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
          thumbnailImage: null,
          modules: editingCourse.modules || [],
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
        let fetchedCategories = data.categories || [];
        if (editingCourse?.categoryDetails && !fetchedCategories.find((c: Category) => c._id === editingCourse.categoryDetails._id)) {
          fetchedCategories = [editingCourse.categoryDetails, ...fetchedCategories];
        }
        setCategories(fetchedCategories);
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
        let fetchedEmployees = data.users || [];
        if (editingCourse?.createdByDetails && !fetchedEmployees.find((e: Employee) => e._id === editingCourse.createdByDetails._id)) {
          fetchedEmployees = [editingCourse.createdByDetails, ...fetchedEmployees];
        }
        setEmployees(fetchedEmployees);
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
      thumbnailImage: null,
      modules: [],
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
        const courseId = data.course._id;

        // Handle modules and videos for new courses
        if (!editingCourse) {
          await handleModulesAndVideos(courseId);
        }

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

  const handleModulesAndVideos = async (courseId: string) => {
    const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

    for (const [moduleIndex, module] of formData.modules.entries()) {
      try {
        // Add module
        const moduleResponse = await fetch(`${API_URL}/courses/${courseId}/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            title: module.title,
            description: module.description,
            order: moduleIndex
          })
        });

        if (moduleResponse.ok) {
          const moduleData = await moduleResponse.json();
          const moduleId = moduleData.module._id;

          // Add videos to this module
          for (const [videoIndex, video] of module.videos.entries()) {
            if (video.videoFile instanceof File) {
              const videoFormData = new FormData();
              videoFormData.append('title', video.title);
              videoFormData.append('description', video.description);
              videoFormData.append('order', videoIndex.toString());
              videoFormData.append('video', video.videoFile);

              await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}/videos`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: videoFormData
              });
            }
          }
        }
      } catch (error) {
        console.error('Error adding module/video:', error);
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (field: 'thumbnailImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
  };

  const addModule = () => {
    const newModule: Module = {
      title: '',
      description: '',
      order: formData.modules.length,
      videos: []
    };
    setFormData({ ...formData, modules: [...formData.modules, newModule] });
  };

  const updateModule = (index: number, field: keyof Module, value: any) => {
    const updatedModules = [...formData.modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setFormData({ ...formData, modules: updatedModules });
  };

  const removeModule = (index: number) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: updatedModules });
  };

  const addVideoToModule = (moduleIndex: number) => {
    const updatedModules = [...formData.modules];
    const newVideo: Video = {
      title: '',
      description: '',
      videoFile: '',
      order: updatedModules[moduleIndex].videos.length
    };
    updatedModules[moduleIndex].videos.push(newVideo);
    setFormData({ ...formData, modules: updatedModules });
  };

  const updateVideoInModule = (moduleIndex: number, videoIndex: number, field: keyof Video, value: any) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].videos[videoIndex] = {
      ...updatedModules[moduleIndex].videos[videoIndex],
      [field]: value
    };
    setFormData({ ...formData, modules: updatedModules });
  };

  const removeVideoFromModule = (moduleIndex: number, videoIndex: number) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].videos = updatedModules[moduleIndex].videos.filter((_, i) => i !== videoIndex);
    setFormData({ ...formData, modules: updatedModules });
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

          {/* Modules and Videos */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Course Modules & Videos
              </label>
              <Button
                type="button"
                onClick={addModule}
                variant="outline"
                size="sm"
              >
                + Add Module
              </Button>
            </div>

            <div className="space-y-4">
              {formData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Module {moduleIndex + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove Module
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Module Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter module title"
                        value={module.title}
                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        placeholder="Enter module description"
                        value={module.description}
                        onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Videos in this module */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Videos in this Module
                      </label>
                      <Button
                        type="button"
                        onClick={() => addVideoToModule(moduleIndex)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        + Add Video
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {module.videos.map((video, videoIndex) => (
                        <div key={videoIndex} className="border border-gray-100 rounded p-2 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-gray-700">Video {videoIndex + 1}</span>
                            <Button
                              type="button"
                              onClick={() => removeVideoFromModule(moduleIndex, videoIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Title *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Video title"
                                value={video.title}
                                onChange={(e) => updateVideoInModule(moduleIndex, videoIndex, 'title', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                placeholder="Video description"
                                value={video.description}
                                onChange={(e) => updateVideoInModule(moduleIndex, videoIndex, 'description', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Video File *
                              </label>
                              <input
                                type="file"
                                accept="video/*"
                                required={!editingCourse || typeof video.videoFile !== 'string'}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    updateVideoInModule(moduleIndex, videoIndex, 'videoFile', file);
                                  }
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {typeof video.videoFile === 'string' && video.videoFile && (
                                <p className="text-xs text-gray-500 mt-1">Current video: {video.videoFile.split('/').pop()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
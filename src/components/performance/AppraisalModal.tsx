import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, Star } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Reviewer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Category {
  name: string;
  rating: number;
  comments: string;
}

interface Goal {
  title: string;
  description: string;
  status: string;
  targetDate: string;
  progress: number;
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
  categories: Category[];
  goals: Goal[];
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
  comments: string;
  status: string;
}

interface AppraisalModalProps {
  isOpen: boolean;
  editingAppraisal: Appraisal | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  loading?: boolean;
}

export default function AppraisalModal({
  isOpen,
  editingAppraisal,
  onClose,
  onSubmit,
  loading = false
}: AppraisalModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [formData, setFormData] = useState({
    employee: '',
    reviewer: '',
    periodStart: '',
    periodEnd: '',
    overallRating: 3,
    categories: [] as Category[],
    goals: [] as Goal[],
    strengths: [] as string[],
    areasForImprovement: [] as string[],
    developmentPlan: '',
    comments: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchReviewers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingAppraisal) {
      setFormData({
        employee: editingAppraisal.employee._id,
        reviewer: editingAppraisal.reviewer._id,
        periodStart: editingAppraisal.period.startDate.split('T')[0],
        periodEnd: editingAppraisal.period.endDate.split('T')[0],
        overallRating: editingAppraisal.overallRating,
        categories: editingAppraisal.categories,
        goals: editingAppraisal.goals,
        strengths: editingAppraisal.strengths,
        areasForImprovement: editingAppraisal.areasForImprovement,
        developmentPlan: editingAppraisal.developmentPlan,
        comments: editingAppraisal.comments
      });
    } else {
      setFormData({
        employee: '',
        reviewer: '',
        periodStart: '',
        periodEnd: '',
        overallRating: 3,
        categories: [],
        goals: [],
        strengths: [],
        areasForImprovement: [],
        developmentPlan: '',
        comments: ''
      });
    }
  }, [editingAppraisal, isOpen]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const employeesOnly = data.users.filter((user: any) => user.role === 'Employee' && user.status === 'Active');
        setEmployees(employeesOnly);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const reviewersOnly = data.users.filter((user: any) => ['Admin', 'HR', 'Manager'].includes(user.role) && user.status === 'Active');
        setReviewers(reviewersOnly);
      }
    } catch (err) {
      console.error('Error fetching reviewers:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      employeeId: formData.employee,
      reviewerId: formData.reviewer,
      period: {
        startDate: formData.periodStart,
        endDate: formData.periodEnd
      },
      overallRating: formData.overallRating,
      categories: formData.categories,
      goals: formData.goals,
      strengths: formData.strengths.filter(s => s.trim()),
      areasForImprovement: formData.areasForImprovement.filter(a => a.trim()),
      developmentPlan: formData.developmentPlan,
      comments: formData.comments
    };

    onSubmit(submitData);
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', rating: 3, comments: '' }]
    }));
  };

  const updateCategory = (index: number, field: keyof Category, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, { title: '', description: '', status: 'Not Started', targetDate: '', progress: 0 }]
    }));
  };

  const updateGoal = (index: number, field: keyof Goal, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) =>
        i === index ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const addStrength = () => {
    setFormData(prev => ({
      ...prev,
      strengths: [...prev.strengths, '']
    }));
  };

  const updateStrength = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.map((strength, i) =>
        i === index ? value : strength
      )
    }));
  };

  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }));
  };

  const addAreaForImprovement = () => {
    setFormData(prev => ({
      ...prev,
      areasForImprovement: [...prev.areasForImprovement, '']
    }));
  };

  const updateAreaForImprovement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      areasForImprovement: prev.areasForImprovement.map((area, i) =>
        i === index ? value : area
      )
    }));
  };

  const removeAreaForImprovement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      areasForImprovement: prev.areasForImprovement.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editingAppraisal ? 'Edit Appraisal' : 'Add Appraisal'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee</label>
              <select
                required
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} ({employee.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reviewer</label>
              <select
                required
                value={formData.reviewer}
                onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Reviewer</option>
                {reviewers.map(reviewer => (
                  <option key={reviewer._id} value={reviewer._id}>
                    {reviewer.firstName} {reviewer.lastName} ({reviewer.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Period Start</label>
              <input
                type="date"
                required
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Period End</label>
              <input
                type="date"
                required
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
              <div className="mt-1 flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, overallRating: rating })}
                    className={`p-1 ${formData.overallRating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{formData.overallRating}/5</span>
              </div>
            </div>
          </div>

          {/* Performance Categories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Performance Categories</label>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Category</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.categories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={category.rating}
                        onChange={(e) => updateCategory(index, 'rating', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <option key={rating} value={rating}>{rating}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Comments"
                        value={category.comments}
                        onChange={(e) => updateCategory(index, 'comments', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Goals</label>
              <button
                type="button"
                onClick={addGoal}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Goal</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.goals.map((goal, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3">
                  <div className="grid grid-cols-12 gap-3 mb-3">
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Goal title"
                        value={goal.title}
                        onChange={(e) => updateGoal(index, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={goal.status}
                        onChange={(e) => updateGoal(index, 'status', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="date"
                        value={goal.targetDate}
                        onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => updateGoal(index, 'progress', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="text-red-600 hover:text-red-800 mr-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    placeholder="Goal description"
                    value={goal.description}
                    onChange={(e) => updateGoal(index, 'description', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Strengths</label>
              <button
                type="button"
                onClick={addStrength}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Strength</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Employee strength"
                    value={strength}
                    onChange={(e) => updateStrength(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeStrength(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Areas for Improvement</label>
              <button
                type="button"
                onClick={addAreaForImprovement}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Area</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.areasForImprovement.map((area, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Area for improvement"
                    value={area}
                    onChange={(e) => updateAreaForImprovement(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeAreaForImprovement(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Development Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Development Plan</label>
            <textarea
              value={formData.developmentPlan}
              onChange={(e) => setFormData({ ...formData, developmentPlan: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe the development plan for the employee"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Additional comments"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {editingAppraisal ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
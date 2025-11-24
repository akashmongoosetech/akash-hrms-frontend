import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, Star, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';

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
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppraisalModalProps {
  isOpen: boolean;
  editingAppraisal: Appraisal | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  onDelete?: (id: string) => void;
  isViewMode?: boolean;
  loading?: boolean;
}

export default function AppraisalModal({
  isOpen,
  editingAppraisal,
  onClose,
  onSubmit,
  onDelete,
  isViewMode = false,
  loading = false
}: AppraisalModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [isEditing, setIsEditing] = useState(!isViewMode);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    reviewer: '',
    periodStart: '',
    periodEnd: '',
    overallRating: 3,
    status: '',
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
      setIsEditing(!isViewMode);
    }
  }, [isOpen, isViewMode]);

  useEffect(() => {
    if (editingAppraisal) {
      setFormData({
        employee: editingAppraisal.employee._id,
        reviewer: editingAppraisal.reviewer._id,
        periodStart: editingAppraisal.period.startDate.split('T')[0],
        periodEnd: editingAppraisal.period.endDate.split('T')[0],
        overallRating: editingAppraisal.overallRating,
        status: editingAppraisal.status,
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
        status: '',
        categories: [],
        goals: [],
        strengths: [],
        areasForImprovement: [],
        developmentPlan: '',
        comments: ''
      });
    }
  }, [editingAppraisal, isOpen]);

  useEffect(() => {
    if (!loading && submitted) {
      onClose();
      setSubmitted(false);
    }
  }, [loading, submitted, onClose]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users?limit=1000`, {
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
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const reviewersOnly = data.users.filter((user: any) => ['Admin', 'HR', 'Manager', 'SuperAdmin'].includes(user.role) && user.status === 'Active');
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
      status: formData.status,
      categories: formData.categories,
      goals: formData.goals,
      strengths: formData.strengths.filter(s => s.trim()),
      areasForImprovement: formData.areasForImprovement.filter(a => a.trim()),
      developmentPlan: formData.developmentPlan,
      comments: formData.comments
    };

    if (editingAppraisal) {
      (submitData as any).id = editingAppraisal._id;
    }

    setSubmitted(true);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? (editingAppraisal ? 'Edit Appraisal' : 'Add Appraisal') : 'Appraisal Details'}
        </h3>
        {isEditing ? (
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
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
            {editingAppraisal && onDelete && (
              <Button
                type="button"
                onClick={() => onDelete(editingAppraisal._id)}
                variant="destructive"
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              loading={loading}
            >
              {editingAppraisal ? 'Update' : 'Create'}
            </Button>
          </div>
       </form>
       ) : (
         <div className="space-y-6">
           {editingAppraisal && (
             <>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <div className="text-gray-500 text-sm">Employee</div>
                   <div className="text-gray-800 font-medium">
                     {editingAppraisal.employee.firstName} {editingAppraisal.employee.lastName}
                   </div>
                 </div>
                 <div>
                   <div className="text-gray-500 text-sm">Reviewer</div>
                   <div className="text-gray-800 font-medium">
                     {editingAppraisal.reviewer.firstName} {editingAppraisal.reviewer.lastName}
                   </div>
                 </div>
                 <div>
                   <div className="text-gray-500 text-sm">Period</div>
                   <div className="text-gray-800">
                     {formatDate(editingAppraisal.period.startDate)} - {formatDate(editingAppraisal.period.endDate)}
                   </div>
                 </div>
                 <div>
                   <div className="text-gray-500 text-sm">Overall Rating</div>
                   <div className="text-gray-800 flex items-center space-x-1">
                     <Star className="h-4 w-4 text-yellow-500 fill-current" />
                     <span>{editingAppraisal.overallRating}/5</span>
                   </div>
                 </div>
                 <div>
                   <div className="text-gray-500 text-sm">Status</div>
                   <div className="text-gray-800 flex items-center space-x-2">
                     {getStatusIcon(editingAppraisal.status)}
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(editingAppraisal.status)}`}>
                       {editingAppraisal.status}
                     </span>
                   </div>
                 </div>
                 <div>
                   <div className="text-gray-500 text-sm">Created</div>
                   <div className="text-gray-800">{formatDate(editingAppraisal.createdAt)}</div>
                 </div>
               </div>

               {editingAppraisal.categories.length > 0 && (
                 <div>
                   <div className="text-gray-500 text-sm mb-2">Performance Categories</div>
                   <div className="space-y-2">
                     {editingAppraisal.categories.map((category, index) => (
                       <div key={index} className="bg-gray-50 p-3 rounded">
                         <div className="flex justify-between items-center mb-2">
                           <span className="font-medium">{category.name}</span>
                           <div className="flex items-center space-x-1">
                             <Star className="h-4 w-4 text-yellow-500 fill-current" />
                             <span>{category.rating}/5</span>
                           </div>
                         </div>
                         {category.comments && (
                           <div className="text-sm text-gray-600">{category.comments}</div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {editingAppraisal.goals.length > 0 && (
                 <div>
                   <div className="text-gray-500 text-sm mb-2">Goals</div>
                   <div className="space-y-2">
                     {editingAppraisal.goals.map((goal, index) => (
                       <div key={index} className="bg-gray-50 p-3 rounded">
                         <div className="flex justify-between items-center mb-2">
                           <span className="font-medium">{goal.title}</span>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             goal.status === 'Completed' ? 'bg-green-100 text-green-800' :
                             goal.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                             'bg-gray-100 text-gray-800'
                           }`}>
                             {goal.status}
                           </span>
                         </div>
                         <div className="text-sm text-gray-600 mb-2">{goal.description}</div>
                         <div className="flex justify-between items-center text-sm">
                           <span>Progress: {goal.progress}%</span>
                           <span>Target: {formatDate(goal.targetDate)}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {editingAppraisal.strengths.length > 0 && (
                 <div>
                   <div className="text-gray-500 text-sm mb-2">Strengths</div>
                   <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                     {editingAppraisal.strengths.map((strength, index) => (
                       <li key={index}>{strength}</li>
                     ))}
                   </ul>
                 </div>
               )}

               {editingAppraisal.areasForImprovement.length > 0 && (
                 <div>
                   <div className="text-gray-500 text-sm mb-2">Areas for Improvement</div>
                   <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                     {editingAppraisal.areasForImprovement.map((area, index) => (
                       <li key={index}>{area}</li>
                     ))}
                   </ul>
                 </div>
               )}

               {editingAppraisal.developmentPlan && (
                 <div>
                   <div className="text-gray-500 text-sm mb-2">Development Plan</div>
                   <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                     {editingAppraisal.developmentPlan}
                   </div>
                 </div>
               )}

               {editingAppraisal.comments && (
                 <div>
                   <div className="text-gray-500 text-sm mb-2">Comments</div>
                   <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                     {editingAppraisal.comments}
                   </div>
                 </div>
               )}
             </>
           )}

           <div className="flex justify-end space-x-2 pt-4 border-t">
             <button
               onClick={onClose}
               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
             >
               Close
             </button>
             {editingAppraisal && onDelete && (
               <button
                 onClick={() => onDelete(editingAppraisal._id)}
                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
               >
                 Delete
               </button>
             )}
             <button
               onClick={() => setIsEditing(true)}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
             >
               Edit
             </button>
           </div>
         </div>
       )}
     </div>
   </div>
 );
}
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../../../Common/DeleteModal';
import { formatDate } from '../../../Common/Commonfunction';
import { UniversalSkeleton, BaseSkeleton } from '../../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import toast from 'react-hot-toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Question {
  _id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  _id: string;
  employee_id: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  question_id: {
    _id: string;
    question_text: string;
    difficulty: string;
    category: string;
  };
  assigned_on: string;
  due_date: string | null;
  completed: boolean;
}

export default function QuizAdminTable() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(null);
  const [showDeleteAssignmentModal, setShowDeleteAssignmentModal] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchAssignments();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        // Extract unique modules
        const uniqueModules = Array.from(new Set(data.map((q: Question) => q.category).filter(Boolean))) as string[];
        setModules(uniqueModules);
      } else {
        setError('Failed to fetch questions');
      }
    } catch (err) {
      setError('Error fetching questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        setErrorAssignments('Failed to fetch assignments');
      }
    } catch (err) {
      setErrorAssignments('Error fetching assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteQuestionId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteQuestionId) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/question/${deleteQuestionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchQuestions();
        setShowDeleteModal(false);
        setDeleteQuestionId(null);
        toast.success('Question deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete question');
      }
    } catch (err) {
      setError('Error deleting question');
      toast.error('Error deleting question');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/quiz-admin/edit/${id}`);
  };

  const startEditingAssignment = (assignment: Assignment) => {
    setEditingAssignmentId(assignment._id);
    setEditingDueDate(assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 10) : '');
  };

  const saveAssignmentDueDate = async (assignmentId: string) => {
    setSavingAssignment(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/assignment/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ due_date: editingDueDate || null })
      });

      if (response.ok) {
        toast.success('Assignment updated successfully!');
        setEditingAssignmentId(null);
        setEditingDueDate('');
        fetchAssignments();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update assignment');
      }
    } catch (err) {
      toast.error('Error updating assignment');
    } finally {
      setSavingAssignment(false);
    }
  };

  const confirmDeleteAssignment = async () => {
    if (!deleteAssignmentId) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/assignment/${deleteAssignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Assignment deleted successfully!');
        setShowDeleteAssignmentModal(false);
        setDeleteAssignmentId(null);
        fetchAssignments();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete assignment');
      }
    } catch (err) {
      toast.error('Error deleting assignment');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quiz Management</h3>
      <Tabs defaultValue="questions" className="w-full">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="assignments">Assigned Quizzes</TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          {/* Module Filter */}
          <div className="mb-4">
            <Label>Filter by Module</Label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <BaseSkeleton className="h-6 w-32" />
                <BaseSkeleton className="h-10 w-32" />
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-4" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-12" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-20" />
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
                          <BaseSkeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-500">
                          <BaseSkeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
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
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate('/quiz-admin/assign')}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Assign Quiz</span>
                  </button>
                  <button
                    onClick={() => navigate('/quiz-admin/add')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {questions
                      .filter(question => selectedModule === 'all' || question.category === selectedModule)
                      .map((question, index) => (
                      <TableRow key={question._id} className="hover:bg-gray-50">
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={question.question_text}>
                            {question.question_text}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question.correct_option}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question.category || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(question.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(question._id)}
                              className="p-2 rounded hover:bg-gray-100 text-purple-600"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(question._id)}
                              className="p-2 rounded hover:bg-gray-100 text-red-600"
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

              {questions.filter(question => selectedModule === 'all' || question.category === selectedModule).length === 0 && (
                <div className="text-center py-8 text-gray-500">No questions found</div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="assignments">
          {loadingAssignments ? (
            <div>
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
                        <BaseSkeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-12" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <BaseSkeleton className="h-4 w-16" />
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
                          <BaseSkeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900">
                          <BaseSkeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <BaseSkeleton className="h-5 w-14" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : errorAssignments ? (
            <div className="text-center py-8 text-red-600">{errorAssignments}</div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment, index) => (
                      <TableRow key={assignment._id} className="hover:bg-gray-50">
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.employee_id.firstName} {assignment.employee_id.lastName}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={assignment.question_id.question_text}>
                            {assignment.question_id.question_text}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assignment.question_id.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            assignment.question_id.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assignment.question_id.difficulty}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.question_id.category || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(assignment.assigned_on)}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingAssignmentId === assignment._id ? (
                            <input
                              type="date"
                              value={editingDueDate}
                              onChange={(event) => setEditingDueDate(event.target.value)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                            />
                          ) : (
                            assignment.due_date ? formatDate(assignment.due_date) : 'N/A'
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assignment.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {assignment.completed ? 'Completed' : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {editingAssignmentId === assignment._id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveAssignmentDueDate(assignment._id)}
                                  disabled={savingAssignment}
                                  className="rounded px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {savingAssignment ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAssignmentId(null);
                                    setEditingDueDate('');
                                  }}
                                  className="rounded px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditingAssignment(assignment)}
                                  title="Edit due date"
                                  className="rounded p-1 text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteAssignmentId(assignment._id);
                                    setShowDeleteAssignmentModal(true);
                                  }}
                                  title="Delete assignment"
                                  className="rounded p-1 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {assignments.length === 0 && (
                <div className="text-center py-8 text-gray-500">No assignments found</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
      />

      <DeleteModal
        isOpen={showDeleteAssignmentModal}
        onClose={() => {
          setShowDeleteAssignmentModal(false);
          setDeleteAssignmentId(null);
        }}
        onConfirm={confirmDeleteAssignment}
        title="Delete Assignment"
        message="Are you sure you want to delete this quiz assignment? The employee will be notified."
      />
    </div>
  );
}
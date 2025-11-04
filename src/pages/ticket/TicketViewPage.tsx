import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, User, AlertCircle, Send, MessageCircle, TrendingUp, Clock, Edit } from 'lucide-react';
import { formatDate, formatDateTime } from '../../Common/Commonfunction';
import socket from '../../utils/socket';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface ProgressEntry {
  _id: string;
  date: string;
  workingHours: number;
  progress: number;
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface Ticket {
  _id: string;
  title: string;
  employee: Employee;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  progress: ProgressEntry[];
  currentProgress: number;
}

interface Comment {
  _id: string;
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    photo?: string;
  };
  createdAt: string;
}

export default function TicketViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressDate, setProgressDate] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [progressValue, setProgressValue] = useState('');
  const [currentProgress, setCurrentProgress] = useState('');

  useEffect(() => {
    if (id) {
      fetchTicket();
      fetchComments();

      // Listen for real-time comments
      socket.on(`comment-${id}`, (newComment: Comment) => {
        setComments(prev => [...prev, newComment]);
      });
    }

    // Cleanup socket listener on unmount or id change
    return () => {
      if (id) {
        socket.off(`comment-${id}`);
      }
    };
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setCurrentProgress(ticket.currentProgress?.toString() || '0');
    }
  }, [ticket]);

  const fetchTicket = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data: Ticket = await response.json();
        setTicket(data);
      } else {
        setError('Failed to fetch ticket');
      }
    } catch (err) {
      setError('Error fetching ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/comments/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data: Comment[] = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/comments/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newComment.trim() })
      });

      if (response.ok) {
        const comment: Comment = await response.json();
        // Comment will be added via socket listener, no need to manually add
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const userRole = localStorage.getItem('role');
    let updateData: any = {};

    if (userRole === 'Employee') {
      // Employee updates with date, working hours, and progress
      updateData.progressUpdate = {
        date: progressDate || new Date().toISOString(),
        workingHours: parseFloat(workingHours) || 0,
        progress: parseInt(progressValue) || 0
      };
    } else {
      // Admin/SuperAdmin directly set current progress
      updateData.currentProgress = parseInt(currentProgress) || 0;
    }

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedTicket: Ticket = await response.json();
        setTicket(updatedTicket);
        setShowProgressForm(false);
        setProgressDate('');
        setWorkingHours('');
        setProgressValue('');
      } else {
        console.error('Failed to update progress');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const formatDateTimeSafe = (s?: string): string => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-8">Loading ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-8 text-red-600">
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Ticket Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">{ticket.title}</h2>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {ticket.priority} Priority
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <User className="h-4 w-4" />
                    <span>Assigned Employee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {ticket.employee?.photo && (
                      <img
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${ticket.employee.photo}`}
                        alt={`${ticket.employee.firstName} ${ticket.employee.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="text-gray-900 font-medium">
                        {ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}` : 'No employee assigned'}
                      </div>
                      {ticket.employee?.email && (
                        <div className="text-sm text-gray-500">{ticket.employee.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due Date</span>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {formatDate(ticket.dueDate)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Progress</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ticket.currentProgress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{ticket.currentProgress || 0}%</span>
                    <button
                      onClick={() => setShowProgressForm(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Created</div>
                  <div className="text-gray-900 font-medium">
                    {formatDateTime(ticket.createdAt)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                  <div className="text-gray-900 font-medium">
                    {formatDateTime(ticket.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Description</div>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </div>
            </div>

            {/* Progress History */}
            {ticket.progress && ticket.progress.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Progress History</div>
                <div className="space-y-2">
                  {ticket.progress.map((entry, index) => (
                    <div key={entry._id || index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{formatDate(entry.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{entry.workingHours}h</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{entry.progress}%</span>
                          </div>
                        </div>
                        {entry.updatedBy && (
                          <div className="text-sm text-gray-500">
                            by {entry.updatedBy.firstName} {entry.updatedBy.lastName} <br />
                            <span>{ entry.updatedBy.role}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-96">
            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {comment.user.photo ? (
                            <img
                              src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${comment.user.photo}`}
                              alt={`${comment.user.firstName} ${comment.user.lastName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {comment.user.firstName[0]}{comment.user.lastName[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user.firstName} {comment.user.lastName}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              comment.user.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {comment.user.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-900" dangerouslySetInnerHTML={{ __html: comment.message }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3">
                {/* @ts-ignore */}
                <CKEditor
                  editor={ClassicEditor}
                  data={newComment}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setNewComment(data);
                  }}
                  config={{
                    toolbar: [
                      'bold', 'italic', 'underline', 'strikethrough', '|',
                      'numberedList', 'bulletedList', '|',
                      'link', 'blockQuote', '|',
                      'insertTable', '|',
                      'undo', 'redo'
                    ],
                    table: {
                      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
                    }
                  }}
                />
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Progress Update Modal */}
        {showProgressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Progress
              </h3>
              <form onSubmit={handleUpdateProgress} className="space-y-4">
                {localStorage.getItem('role') === 'Employee' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={progressDate}
                        onChange={(e) => setProgressDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                        placeholder="Enter hours worked"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Progress (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progressValue}
                        onChange={(e) => setProgressValue(e.target.value)}
                        placeholder="Enter progress percentage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentProgress}
                      onChange={(e) => setCurrentProgress(e.target.value)}
                      placeholder="Enter current progress"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProgressForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
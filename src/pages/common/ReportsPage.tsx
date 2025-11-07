import React, { useState, useEffect } from "react";
import { Plus, X, Calendar, Clock, User, Eye, Edit, Trash2 } from "lucide-react";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import DeleteModal from '../../Common/DeleteModal';
import socket from '../../utils/socket';

interface Report {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  description: string;
  startTime: string;
  breakDuration: number;
  endTime: string;
  workingHours: string;
  totalHours: string;
  date: string;
  createdAt: string;
}

export default function ReportsPage() {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [selectedReport, setSelectedReport] = useState<Report | null>(null);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
   const [reports, setReports] = useState<Report[]>([]);
   const [loading, setLoading] = useState(false);
   const [fetchingReports, setFetchingReports] = useState(true);
   const [formData, setFormData] = useState({
     description: '',
     startTime: '',
     breakDuration: 0,
     endTime: '',
     workingHours: '',
     totalHours: '',
   });
   const role = localStorage.getItem('role');

  useEffect(() => {
    fetchReports();
    fetchBreakDuration();

    // Socket listeners for real-time updates
    socket.on('reportCreated', (newReport) => {
      setReports(prev => [newReport, ...prev]);
      toast.success('New report added by another user');
    });

    socket.on('reportUpdated', (updatedReport) => {
      setReports(prev => prev.map(report =>
        report._id === updatedReport._id ? updatedReport : report
      ));
      toast.success('Report updated by another user');
    });

    socket.on('reportDeleted', (deletedReportId) => {
      setReports(prev => prev.filter(report => report._id !== deletedReportId));
      toast.success('Report deleted by another user');
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off('reportCreated');
      socket.off('reportUpdated');
      socket.off('reportDeleted');
    };
  }, []);

  useEffect(() => {
    calculateHours();
  }, [formData.startTime, formData.endTime, formData.breakDuration]);

  const fetchReports = async () => {
    try {
      const response = await API.get('/reports');
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error loading reports');
    } finally {
      setFetchingReports(false);
    }
  };

  const fetchBreakDuration = async () => {
    try {
      const response = await API.get('/breaks/duration');
      setFormData(prev => ({ ...prev, breakDuration: response.data.totalBreakDuration }));
    } catch (error) {
      console.error('Error fetching break duration:', error);
    }
  };

  const calculateHours = () => {
    if (!formData.startTime || !formData.endTime) return;

    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);

    if (end <= start) return;

    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = Math.floor(totalMinutes % 60);
    const totalHoursStr = `${totalHours.toString().padStart(2, '0')}:${totalMins.toString().padStart(2, '0')}`;

    const workingMinutes = totalMinutes - formData.breakDuration;
    const workingHours = Math.floor(workingMinutes / 60);
    const workingMins = Math.floor(workingMinutes % 60);
    const workingHoursStr = `${workingHours.toString().padStart(2, '0')}:${workingMins.toString().padStart(2, '0')}`;

    setFormData(prev => ({
      ...prev,
      totalHours: totalHoursStr,
      workingHours: workingHoursStr,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/reports', {
        description: formData.description,
        startTime: formData.startTime,
        breakDuration: formData.breakDuration,
        endTime: formData.endTime,
        workingHours: formData.workingHours,
        totalHours: formData.totalHours,
      });

      // Emit socket event for real-time update
      socket.emit('reportCreated', response.data.report);

      toast.success('Report added successfully!');
      setIsModalOpen(false);
      setFormData({
        description: '',
        startTime: '',
        breakDuration: 0,
        endTime: '',
        workingHours: '',
        totalHours: '',
      });
      fetchReports(); // Refresh reports list
      fetchBreakDuration(); // Refresh break duration
    } catch (error) {
      console.error('Error adding report:', error);
      toast.error('Error adding report');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDelete = (id: string) => {
    setDeleteReportId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteReportId) return;

    try {
      await API.delete(`/reports/${deleteReportId}`);

      // Emit socket event for real-time update
      socket.emit('reportDeleted', deleteReportId);

      toast.success('Report deleted successfully!');
      setShowDeleteModal(false);
      setDeleteReportId(null);
      fetchReports(); // Refresh reports list
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error deleting report');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        {role && role !== 'Admin' && role !== 'SuperAdmin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>Add Report</span>
          </button>
        )}
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {fetchingReports ? (
          <div className="p-6 text-center">
            <div className="text-gray-600">Loading reports...</div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No reports found. Click "Add Report" to create your first report.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                      {role && role !== 'Employee' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                      )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Break (min)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    {role && role !== 'Employee' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.employee ? (
                          <div className="flex items-center">
                            {report.employee.photo ? (
                              <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${report.employee.photo}`}
                                alt={`${report.employee.firstName} ${report.employee.lastName}`}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {report.employee.firstName[0]}{report.employee.lastName[0]}
                                </span>
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {report.employee.firstName} {report.employee.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{report.employee.email}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Employee not found</div>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(report.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(report.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.breakDuration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {report.workingHours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {report.totalHours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteReportId(report._id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Daily Report</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Description *
                </label>
                <div className="border border-gray-300 rounded-lg">
                  {/* @ts-ignore */}
                  <CKEditor
                    editor={ClassicEditor}
                    data={formData.description}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setFormData(prev => ({ ...prev, description: data }));
                    }}
                    config={{
                      toolbar: [
                        'bold', 'italic', 'underline', 'strikethrough', '|',
                        'numberedList', 'bulletedList', '|',
                        'link', 'blockQuote', '|',
                        'undo', 'redo'
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.breakDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    min="0"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-fetched from today's break activities</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Working Hours
                  </label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">End Time - Start Time - Break Duration</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Total Hours
                  </label>
                  <input
                    type="text"
                    value={formData.totalHours}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">End Time - Start Time</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">View Report</h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedReport(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {role && role !== 'Employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name & Email with Profile
                  </label>
                  <div className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedReport.employee.photo ? (
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${selectedReport.employee.photo}`}
                        alt={`${selectedReport.employee.firstName} ${selectedReport.employee.lastName}`}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {selectedReport.employee.firstName[0]}{selectedReport.employee.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-lg font-medium text-gray-900">
                        {selectedReport.employee.firstName} {selectedReport.employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{selectedReport.employee.email}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Description
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: selectedReport.description }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formatTime(selectedReport.startTime)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="text"
                    value={selectedReport.breakDuration}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formatTime(selectedReport.endTime)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Working Hours
                  </label>
                  <input
                    type="text"
                    value={selectedReport.workingHours}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Total Hours
                  </label>
                  <input
                    type="text"
                    value={selectedReport.totalHours}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedReport(null);
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
      />
    </div>
  );
}
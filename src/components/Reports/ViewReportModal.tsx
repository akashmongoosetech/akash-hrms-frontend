import React from 'react';
import { X, FileText } from 'lucide-react';

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
  note: string;
  createdAt: string;
}

interface ViewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  role: string | null;
}

const ViewReportModal: React.FC<ViewReportModalProps> = ({ isOpen, onClose, report, role }) => {
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Daily Work Report</h2>
          </div>
          <button onClick={onClose} className="hover:text-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          {role && role !== 'Employee' && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
                Employee Information
              </h3>
              <div className="flex items-center space-x-4">
                {report.employee.photo ? (
                  <img
                    className="h-14 w-14 rounded-full object-cover shadow-md"
                    src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${report.employee.photo}`}
                    alt={`${report.employee.firstName} ${report.employee.lastName}`}
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
                    {report.employee.firstName[0]}
                    {report.employee.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {report.employee.firstName} {report.employee.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{report.employee.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Report Description */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
              Report Description
            </h3>
            <div
              className="prose prose-sm text-gray-800"
              dangerouslySetInnerHTML={{ __html: report.description }}
            />
          </div>

          {/* Time Details */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
              Work Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Start Time</p>
                <p className="font-medium text-gray-900">{formatTime(report.startTime)}</p>
              </div>
              <div>
                <p className="text-gray-500">Break Duration</p>
                <p className="font-medium text-gray-900">{report.breakDuration} min</p>
              </div>
              <div>
                <p className="text-gray-500">End Time</p>
                <p className="font-medium text-gray-900">{formatTime(report.endTime)}</p>
              </div>
              <div>
                <p className="text-gray-500">Today's Working Hours</p>
                <p className="font-medium text-gray-900">{report.workingHours}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Total Hours</p>
                <p className="font-medium text-gray-900">{report.totalHours}</p>
              </div>
            </div>
          </div>

          {/* Admin Note */}
          {report.note && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wide">
                Admin Note
              </h3>
              <p className="text-red-700 text-sm">{report.note}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReportModal;

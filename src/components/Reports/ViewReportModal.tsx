import React from 'react';
import { X } from 'lucide-react';

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

const ViewReportModal: React.FC<ViewReportModalProps> = ({
  isOpen,
  onClose,
  report,
  role,
}) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">View Report</h2>
          <button
            onClick={onClose}
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
                {report.employee.photo ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${report.employee.photo}`}
                    alt={`${report.employee.firstName} ${report.employee.lastName}`}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {report.employee.firstName[0]}{report.employee.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-lg font-medium text-gray-900">
                    {report.employee.firstName} {report.employee.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{report.employee.email}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Description
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: report.description }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="text"
                value={formatTime(report.startTime)}
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
                value={report.breakDuration}
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
                value={formatTime(report.endTime)}
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
                value={report.workingHours}
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
                value={report.totalHours}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>

            {/* {role && (role === 'Admin' || role === 'SuperAdmin') && report.note && ( */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Note
                </label>
                <div className="border border-red-800 rounded-lg p-4 bg-red-100">
                  <p className="text-red-700">{report.note}</p>
                </div>
              </div>
            {/* )} */}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
import React from 'react';
import { Eye, Edit, Trash2, NotebookPen } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';

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
  note: string;
  date: string;
  createdAt: string;
}

interface ReportTableProps {
  reports: Report[];
  role: string | null;
  fetchingReports: boolean;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  role,
  fetchingReports,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
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
                    {formatDate(report.date)}
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
                        onClick={() => onView(report)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      {role && (role === 'Admin' || role === 'SuperAdmin') && (
                        <button
                          onClick={() => onEdit(report)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {role && (role === 'Admin' || role === 'SuperAdmin') && (
                        <button
                          onClick={() => onDelete(report._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {/* If note get then display this icon */}
                      {role === 'Employee' && (
                        <>
                          {report.note && report.note.trim() && (
                            <span className='text-red-600 hover:text-red-900' title='Note Found'>
                              <NotebookPen size={16} />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
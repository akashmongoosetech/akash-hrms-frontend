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

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ReportTableProps {
  reports: Report[];
  role: string | null;
  fetchingReports: boolean;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
  employees: Employee[];
  filters: {
    fromDate: string;
    toDate: string;
    employeeId: string;
  };
  onFiltersChange: (filters: { fromDate: string; toDate: string; employeeId: string }) => void;
  onApplyFilters: () => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  role,
  fetchingReports,
  onView,
  onEdit,
  onDelete,
  employees,
  filters,
  onFiltersChange,
  onApplyFilters,
}) => {
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getWorkingHoursBadge = (workingHours: string) => {
    if (!workingHours) return 'text-gray-600 bg-gray-100';

    const [hours, minutes] = workingHours.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

    if (totalMinutes >= 8 * 60) { // 8 hours or above
      return 'text-green-800 bg-green-100';
    } else if (totalMinutes >= 4 * 60 && totalMinutes < 8 * 60) { // 4:00 to 7:59
      return 'text-blue-800 bg-blue-100';
    } else { // below 3:59
      return 'text-red-800 bg-red-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
      {/* Filter Section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onFiltersChange({ ...filters, fromDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => onFiltersChange({ ...filters, toDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {role && role !== 'Employee' && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={filters.employeeId}
                onChange={(e) => onFiltersChange({ ...filters, employeeId: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {fetchingReports ? (
        <div className="p-6 text-center">
          <div className="text-gray-600">Loading reports...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-600">No reports found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-4 p-4">
            {reports.map((report) => (
              <div key={report._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                {/* Employee Profile Section */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {report.employee ? (
                      <>
                        {report.employee.photo ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${report.employee.photo}`}
                            alt={`${report.employee.firstName} ${report.employee.lastName}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
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
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Employee not found</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
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
                    {role === 'Employee' && report.note && report.note.trim() && (
                      <span className='text-red-600 hover:text-red-900' title='Note Found'>
                        <NotebookPen size={16} />
                      </span>
                    )}
                  </div>
                </div>
                {/* Report Details */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Report:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Date:</strong> {formatDate(report.date)}</div>
                    <div><strong>Start Time:</strong> {formatTime(report.startTime)}</div>
                    <div><strong>End Time:</strong> {formatTime(report.endTime)}</div>
                    <div><strong>Break (min):</strong> {report.breakDuration}</div>
                    <div><strong>Working Hours:</strong> <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWorkingHoursBadge(report.workingHours)}`}>{report.workingHours}</span></div>
                    <div><strong>Total Hours:</strong> {report.totalHours}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop Table View */}
          <div className="hidden sm:block">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWorkingHoursBadge(report.workingHours)}`}>
                          {report.workingHours}
                        </span>
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
          </div>
        </>
      )}
    </div>
  );
};

export default ReportTable;
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AlertMessages from '../../components/common/AlertMessages';
import YearSelector from '../../components/common/YearSelector';
import MonthSelector from '../../components/common/MonthSelector';
import AttendanceTableSkeleton from '../../components/common/AttendanceTableSkeleton';
import moment from 'moment';
import { sortEmployeesAlphabetically } from '../../Common/Commonfunction';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Shield, CalendarX, RefreshCw, Settings } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

interface StatisticsProps {
  employeeData: Employee[];
}

interface Report {
  _id: string;
  employee: Employee | null;
  date: string;
  workingHours: string;
}

interface Saturday {
  _id: string;
  date: string;
  isWeekend: boolean;
  year: number;
  month: number;
}

interface Holiday {
  _id: string;
  name: string;
  date: string;
}

interface LeaveRow {
  employee_id: string;
  from_date: string;
  to_date: string;
  is_half_day: boolean;
}

interface DayCell {
  display: string;
  style: string;
}

const PAGE_SIZE = 200;
const MAX_PAGES = 100;

const STYLE_FULL_DAY = '!bg-green-500 !text-white';
const STYLE_HALF_DAY = '!bg-cyan-400 !text-black';
const STYLE_ABSENT = '!bg-red-500 !text-white';
const STYLE_WEEKEND = '!bg-yellow-200';

const normalizeDate = (value?: string | null) => (value ? String(value).slice(0, 10) : '');

const parseHours = (value: string) => {
  const parts = value.split(':').map(Number);
  if (parts.some((part) => Number.isNaN(part))) return 0;
  return (parts[0] || 0) + (parts[1] || 0) / 60;
};

/** "09:30:00" / "09:30" -> "9:30", "8" -> "8". */
const formatHours = (value: string) => {
  if (!value) return '';
  const parts = value.split(':');
  if (parts.length < 2) return value;
  return `${Number(parts[0])}:${parts[1]}`;
};

const parseLocalDate = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
};

const Statistics: React.FC<StatisticsProps> = ({ employeeData }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const [leavesData, setLeavesData] = useState<LeaveRow[]>([]);
  const [alternateSaturdayData, setAlternateSaturdayData] = useState<string[]>([]);
  const [holidaysData, setHolidaysData] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { notify } = useToast();
  const navigate = useNavigate();

  const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  // Several requests run in parallel; keep the skeleton up until the last one
  // settles instead of hiding it as soon as the fastest one finishes.
  const pendingFetches = useRef(0);
  const reportsRequestId = useRef(0);

  const beginLoad = () => {
    pendingFetches.current += 1;
    setIsLoading(true);
  };

  const endLoad = () => {
    pendingFetches.current = Math.max(0, pendingFetches.current - 1);
    if (pendingFetches.current === 0) setIsLoading(false);
  };

  /**
   * The API paginates every list endpoint (default limit 10). The statistics
   * table needs the whole month and every active employee, so walk the pages
   * instead of silently showing only the first ten records.
   */
  const fetchAllPages = async <T,>(
    buildUrl: (page: number) => string,
    pick: (payload: any) => T[] | undefined
  ): Promise<T[]> => {
    const items: T[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await fetch(buildUrl(page), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        break;
      }
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const payload = await response.json();
      items.push(...(pick(payload) || []));

      const reportedTotal = Number(payload?.pagination?.totalPages);
      totalPages = Number.isFinite(reportedTotal) && reportedTotal > 0 ? reportedTotal : 1;
      page += 1;
    } while (page <= totalPages && page <= MAX_PAGES);

    return items;
  };

  useEffect(() => {
    fetchEmployees();
    fetchReports();
    fetchLeaves();
    fetchAlternateSaturdays();
    fetchHolidays();
  }, []);

  const fetchEmployees = async () => {
    beginLoad();
    try {
      const users = await fetchAllPages<Employee>(
        (page) =>
          `${API_BASE_URL}/users?role=Employee&status=Active&page=${page}&limit=${PAGE_SIZE}`,
        (payload) => payload.users
      );
      setEmployeesData(sortEmployeesAlphabetically(users) as Employee[]);
    } catch (err) {
      setErrorMessage('Failed to fetch employees data');
      setShowError(true);
      console.error(err);
    } finally {
      endLoad();
    }
  };

  const fetchReports = async (year: number = selectedYear, month: number = selectedMonth) => {
    const requestId = ++reportsRequestId.current;
    beginLoad();
    try {
      const firstDay = moment({ year, month: month - 1 }).startOf('month').format('YYYY-MM-DD');
      const lastDay = moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD');

      const reports = await fetchAllPages<Report>(
        (page) =>
          `${API_BASE_URL}/reports?fromDate=${firstDay}&toDate=${lastDay}&page=${page}&limit=${PAGE_SIZE}`,
        (payload) => payload.reports
      );

      // A report whose employee was removed or deactivated comes back with
      // employee: null, which has no column to render into.
      const usable = reports.filter((report) => report && report.employee && report.employee._id);

      if (requestId === reportsRequestId.current) {
        setReportsData(usable);
      }
    } catch (err) {
      if (requestId === reportsRequestId.current) {
        setErrorMessage('Failed to fetch reports data');
        setShowError(true);
      }
      console.error(err);
    } finally {
      endLoad();
    }
  };

  const fetchLeaves = async () => {
    beginLoad();
    try {
      const response = await fetch(`${API_BASE_URL}/leaves?status=approved`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        setErrorMessage('Failed to fetch leaves data');
        setShowError(true);
        return;
      }

      const data = await response.json();
      const approvedLeaves: LeaveRow[] = (data.leaves || [])
        .filter((leave: any) => leave && String(leave.status).toLowerCase() === 'approved')
        .map((leave: any) => ({
          employee_id:
            typeof leave.employee === 'string' ? leave.employee : leave.employee?._id || '',
          from_date: normalizeDate(leave.startDate),
          to_date: normalizeDate(leave.endDate),
          is_half_day:
            leave.is_half_day === '1' || leave.is_half_day === 1 || leave.is_half_day === true
        }))
        .filter((leave: LeaveRow) => leave.employee_id && leave.from_date && leave.to_date);

      setLeavesData(approvedLeaves);
    } catch (err) {
      setErrorMessage('Failed to fetch leaves data');
      setShowError(true);
      console.error(err);
    } finally {
      endLoad();
    }
  };

  const fetchAlternateSaturdays = async (
    year: number = selectedYear,
    month: number = selectedMonth
  ) => {
    beginLoad();
    try {
      const response = await fetch(`${API_BASE_URL}/saturdays?year=${year}&month=${month - 1}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        setAlternateSaturdayData([]);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const alternateSaturdays = data
          .filter((s: Saturday) => s.isWeekend)
          .map((s: Saturday) => {
            // Normalize date to UTC to avoid timezone issues
            const date = new Date(s.date);
            return date.toISOString().split('T')[0];
          });
        setAlternateSaturdayData(alternateSaturdays);
      } else {
        setAlternateSaturdayData([]);
      }
    } catch (error) {
      console.error('Failed to fetch saved Saturdays:', error);
      setAlternateSaturdayData([]);
    } finally {
      endLoad();
    }
  };

  const fetchHolidays = async () => {
    beginLoad();
    try {
      const response = await fetch(`${API_BASE_URL}/holidays`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        setErrorMessage('Failed to fetch holidays data');
        setShowError(true);
        return;
      }

      const data = await response.json();
      setHolidaysData(data.holidays || []);
    } catch (err) {
      setErrorMessage('Failed to fetch holidays data');
      setShowError(true);
      console.error(err);
    } finally {
      endLoad();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    fetchAlternateSaturdays(year, selectedMonth);
    fetchReports(year, selectedMonth);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    fetchAlternateSaturdays(selectedYear, month);
    fetchReports(selectedYear, month);
  };

  /** Every date of the selected month, in display order. */
  const getAllDatesOfMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: Array<{ display: string; key: string }> = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month - 1, day);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });

      days.push({
        display: `${weekday}, ${day} ${monthName}`,
        key: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
    }

    return days;
  };

  const calculateWorking = (hours: number) => {
    if (hours >= 4 && hours < 8) {
      return 0.5;
    } else if (hours >= 8) {
      return 1;
    }

    return 0;
  };

  const monthDays = useMemo(
    () => getAllDatesOfMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const attendanceByDate = useMemo(() => {
    const byDate: { [date: string]: { [employeeId: string]: string } } = {};

    reportsData.forEach((report) => {
      const date = normalizeDate(report.date);
      if (!date || !report.employee?._id) return;
      if (!byDate[date]) byDate[date] = {};
      byDate[date][report.employee._id] = report.workingHours || '';
    });

    return byDate;
  }, [reportsData]);

  /**
   * Builds the whole month grid in one pass, so summary counts and cell colours
   * always come from the same data. Only saved records produce a filled cell:
   * a report, an approved leave or a holiday. Dates with none of those stay
   * blank.
   */
  const { cellsByDate, leaveCounts, extraWorkingCounts } = useMemo(() => {
    const cellsByDate: { [date: string]: { [employeeId: string]: DayCell } } = {};
    const leaveCounts: { [employeeId: string]: number } = {};
    const extraWorkingCounts: { [employeeId: string]: number } = {};

    employeesData.forEach((employee) => {
      leaveCounts[employee._id] = 0;
      extraWorkingCounts[employee._id] = 0;
    });

    monthDays.forEach((day) => {
      const dayAttendance = attendanceByDate[day.key] || {};
      const isAlternateSaturday = alternateSaturdayData.includes(day.key);
      const isSunday = parseLocalDate(day.key).getDay() === 0;
      const isWeekend = isAlternateSaturday || isSunday;
      const holiday = holidaysData.find((item) => normalizeDate(item.date) === day.key);

      const row: { [employeeId: string]: DayCell } = {};

      employeesData.forEach((employee) => {
        const saved = dayAttendance[employee._id] || '';
        const hasReport = saved.trim() !== '';
        const hours = hasReport ? parseHours(saved) : 0;
        const workedDays = hasReport ? calculateWorking(hours) : 0;

        const matchingLeave = leavesData.find(
          (leave) =>
            leave.employee_id === employee._id &&
            day.key >= leave.from_date &&
            day.key <= leave.to_date
        );

        let display = formatHours(saved);
        let style = '';

        if (hasReport) {
          if (isWeekend || holiday) {
            // Working on a default day off counts as extra working.
            style = STYLE_FULL_DAY;
            extraWorkingCounts[employee._id] += hours >= 8 ? 1 : 0.5;
          } else if (workedDays === 1) {
            style = STYLE_FULL_DAY;
          } else if (workedDays === 0.5) {
            style = STYLE_HALF_DAY;
            leaveCounts[employee._id] += 0.5;
          } else {
            style = STYLE_ABSENT;
            leaveCounts[employee._id] += 1;
          }
        } else if (matchingLeave) {
          style = matchingLeave.is_half_day ? STYLE_HALF_DAY : STYLE_ABSENT;
          leaveCounts[employee._id] += matchingLeave.is_half_day ? 0.5 : 1;
        } else if (holiday) {
          display = holiday.name;
          style = STYLE_ABSENT;
        } else if (isWeekend) {
          style = STYLE_WEEKEND;
        }

        row[employee._id] = { display, style };
      });

      cellsByDate[day.key] = row;
    });

    return { cellsByDate, leaveCounts, extraWorkingCounts };
  }, [
    monthDays,
    attendanceByDate,
    alternateSaturdayData,
    holidaysData,
    leavesData,
    employeesData
  ]);

  // Calculate statistics from employeeData prop
  const totalEmployees = employeeData?.length || 0;
  const activeEmployees = (employeeData?.filter((e) => e.status === 'Active') || []).length;
  const onLeaveEmployees = (employeeData?.filter((e) => e.status === 'On Leave') || []).length;
  const offlineEmployees = (employeeData?.filter((e) => e.status === 'Offline') || []).length;

  const handleRefresh = () => {
    notify({
      title: 'Data Refreshed',
      description: 'Employee statistics have been updated successfully',
      variant: 'success',
    });
  };

  return (
    <>
      <AlertMessages
        showSuccess={showSuccess}
        successMessage={successMessage}
        showError={showError}
        errorMessage={errorMessage}
        setShowSuccess={setShowSuccess}
        setShowError={setShowError}
      />

      <div className="section-body mt-3">
        <div className="container-fluid">
          {/* Filters */}
          <div className="flex flex-wrap items-center mb-3">
            <div className="flex items-center mr-3 mb-2">
              <YearSelector
                selectedYear={selectedYear}
                handleYearChange={handleYearChange}
                labelClass="mr-2 mb-0"
                selectClass="custom-select w-auto"
              />
            </div>
            <div className="flex items-center mr-3 mb-2">
              <MonthSelector
                selectedMonth={selectedMonth}
                handleMonthChange={handleMonthChange}
                labelClass="mr-2 mb-0"
                selectClass="custom-select w-auto"
              />
            </div>
            <div className="mb-2 mr-3 text-sm text-gray-600">
              {moment({ year: selectedYear, month: selectedMonth - 1 }).format('MMMM YYYY')} ·{' '}
              {monthDays.length} days
            </div>
            <button
              onClick={handleRefresh}
              className="ml-2 text-sm text-blue-600 hover underline"
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Refresh Data
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Employees Card */}
            <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Total Employees
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
                </div>
                <StatusBadge status="online" size="sm" />
              </div>
            </Card>

            {/* Active Employees Card */}
            <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Active Employees
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
                </div>
                <StatusBadge status="success" size="sm" />
              </div>
            </Card>

            {/* On Leave Card */}
            <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    On Leave
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{onLeaveEmployees}</p>
                </div>
                <StatusBadge status="info" size="sm" />
              </div>
            </Card>

            {/* Offline Card */}
            <Card className="p-6 bg-white rounded-2xl shadow-soft transition-all hover:shadow-medium">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Offline
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{offlineEmployees}</p>
                </div>
                <StatusBadge status="critical" size="sm" />
              </div>
            </Card>
          </div>

          {/* Attendance Table */}
          {isLoading ? (
            <AttendanceTableSkeleton
              employeeCount={employeesData.length || 5}
              dayCount={monthDays.length || 10}
            />
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <table className="table table-bordered table-sm text-center min-w-full">
                <thead className="bg-gray-400">
                  <tr>
                    <th className="px-4 py-3 !bg-gray-300">Date</th>
                    {employeesData.map((employee) => (
                      <th className="px-4 py-3 !bg-gray-300" key={employee._id}>
                        {employee.firstName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthDays.map((day) => {
                    const dayCells = cellsByDate[day.key] || {};
                    const isAlternateSaturday = alternateSaturdayData.includes(day.key);
                    const isSunday = parseLocalDate(day.key).getDay() === 0;
                    const isHoliday = holidaysData.some(
                      (holiday) => normalizeDate(holiday.date) === day.key
                    );

                    return (
                      <tr
                        key={day.key}
                        className={
                          isHoliday
                            ? '!bg-red-200'
                            : isAlternateSaturday || isSunday
                              ? '!bg-yellow-200'
                              : ''
                        }
                      >
                        <td className="!bg-green-200 px-4 py-2 min-w-48">{day.display}</td>
                        {employeesData.map((employee) => {
                          const cell = dayCells[employee._id] || { display: '', style: '' };
                          return (
                            <td key={employee._id} className={`px-2 py-1 ${cell.style}`}>
                              {cell.display}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Summary Row 1: Leave Taken */}
                  <tr className="font-bold">
                    <td className="!bg-gray-400 !text-black px-4 py-2">Leave Taken(-)</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const total = Math.round(fullLeaves * 10) / 10; // Round to 1 decimal
                      return (
                        <td key={emp._id} className="px-2 py-1">
                          {total}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Summary Row 2: Extra Working Days */}
                  <tr className="font-bold">
                    <td className="!bg-green-400 px-4 py-2">Extra Working Days(+)</td>
                    {employeesData.map((emp) => (
                      <td key={emp._id} className="px-2 py-1">
                        {extraWorkingCounts[emp._id] || 0}
                      </td>
                    ))}
                  </tr>

                  {/* Summary Row 3: Paid Leaves */}
                  <tr className="font-bold">
                    <td className="!bg-green-400 px-4 py-2">Paid Leave(+)</td>
                    {employeesData.map((emp) => (
                      <td key={emp._id} className="px-2 py-1">
                        1
                      </td>
                    ))}
                  </tr>

                  {/* Summary Row 4: Deduction/Paid */}
                  <tr className="font-bold">
                    <td className="px-4 py-2 !bg-blue-400 !text-white">Deduction/Paid</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                      const totalDeduction = extraWorkCounts + 1 - fullLeaves; // Subtract 1 paid leave
                      return (
                        <td key={emp._id} className="px-2 py-1">
                          {totalDeduction}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Summary Row 5: No Of Days Salary To Be Credited */}
                  <tr className="font-bold">
                    <td className="px-4 py-2 !bg-red-400 !text-white">
                      No Of Days Salary To Be Credited
                    </td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                      const deduction = extraWorkCounts + 1 - fullLeaves;
                      const salaryDays = deduction + 30;
                      return (
                        <td key={emp._id} className="px-2 py-1">
                          {salaryDays}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Statistics;

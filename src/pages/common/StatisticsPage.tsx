import React, { useEffect, useMemo, useRef, useState } from 'react';
import AlertMessages from '../../components/common/AlertMessages';
import YearSelector from '../../components/common/YearSelector';
import MonthSelector from '../../components/common/MonthSelector';
import AttendanceTableSkeleton from '../../components/common/AttendanceTableSkeleton';
import moment from 'moment';
import { sortEmployeesAlphabetically } from '../../Common/Commonfunction';
import ReportViewModal from '../../components/common/modals/ReportViewModal';
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
  // Profile picture fields (match backend User model)
  photo?: string;
  profilePictures?: string[];
  // Optional profile picture fields (legacy/fallback)
  profilePicture?: string;
  profileImage?: string;
  profilePic?: string;
  avatar?: string;
  image?: string;
}

interface StatisticsProps {
  employeeData: Employee[];
}

interface Report {
  _id: string;
  employee: Employee | null;
  date: string;
  workingHours: string;
  livePic?: string;
  location?: string;
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

/* ---------- Cell styles (visual only) ---------- */
const STYLE_FULL_DAY =
  '!bg-emerald-500 !text-white font-semibold hover:!bg-emerald-600 hover:ring-2 hover:ring-inset hover:ring-emerald-700/30';
const STYLE_HALF_DAY =
  '!bg-sky-400 !text-white font-semibold hover:!bg-sky-500 hover:ring-2 hover:ring-inset hover:ring-sky-700/30';
const STYLE_ABSENT = '!bg-rose-500 !text-white font-semibold';
const STYLE_WEEKEND = '!bg-amber-100';

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

/* ---------- Presentation helpers (visual only) ---------- */
const AVATAR_TONES = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700'
];

const initialsOf = (employee: Employee) =>
  `${(employee.firstName || '').charAt(0)}${(employee.lastName || '').charAt(0)}`.toUpperCase() ||
  '?';

/** Picks the first profile image field the API provides and makes it an absolute URL. */
const getProfileImageUrl = (employee: Employee, apiBase: string) => {
  // Backend User model uses 'photo' (single) or 'profilePictures' (array)
  const raw =
    employee.photo ||
    (employee.profilePictures && employee.profilePictures[0]) ||
    employee.profilePicture ||
    employee.profileImage ||
    employee.profilePic ||
    employee.avatar ||
    employee.image ||
    '';
  if (!raw) return '';
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  return `${apiBase.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
};

/** Profile photo with an initials fallback when there is no image or it fails to load. */
const EmployeeAvatar: React.FC<{ employee: Employee; tone: string; apiBase: string }> = ({
  employee,
  tone,
  apiBase
}) => {
  const [failed, setFailed] = useState(false);
  const src = getProfileImageUrl(employee, apiBase);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${employee.firstName} ${employee.lastName}`.trim()}
        onError={() => setFailed(true)}
        className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }

  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white shadow-sm ${tone}`}
    >
      {initialsOf(employee)}
    </span>
  );
};

const LEGEND = [
  { label: 'Full day', swatch: 'bg-emerald-500' },
  { label: 'Half day', swatch: 'bg-sky-400' },
  { label: 'Leave / absent / holiday', swatch: 'bg-rose-500' },
  { label: 'Weekly off', swatch: 'bg-amber-200' }
];

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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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

  /* ---------- Presentation-only data for the stat cards ---------- */
  const statCards = [
    {
      label: 'Total employees',
      value: totalEmployees,
      icon: Users,
      badge: 'online' as const,
      iconTone: 'bg-indigo-50 text-indigo-600',
      bar: 'bg-indigo-500'
    },
    {
      label: 'Active employees',
      value: activeEmployees,
      icon: Shield,
      badge: 'success' as const,
      iconTone: 'bg-emerald-50 text-emerald-600',
      bar: 'bg-emerald-500'
    },
    {
      label: 'On leave',
      value: onLeaveEmployees,
      icon: CalendarX,
      badge: 'info' as const,
      iconTone: 'bg-sky-50 text-sky-600',
      bar: 'bg-sky-500'
    },
    {
      label: 'Offline',
      value: offlineEmployees,
      icon: Calendar,
      badge: 'critical' as const,
      iconTone: 'bg-rose-50 text-rose-600',
      bar: 'bg-rose-500'
    }
  ];

  const monthTitle = moment({ year: selectedYear, month: selectedMonth - 1 }).format('MMMM YYYY');

  /** Summary rows share one layout: a label cell plus one value per employee. */
  const labelCell =
    'sticky left-0 z-10 min-w-[220px] px-4 py-3 text-left text-sm font-semibold border-r border-slate-200';
  const valueCell = 'px-2 py-3 text-sm font-semibold tabular-nums';

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
          {/* Page header + filters */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Attendance statistics
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {monthTitle} &middot; {monthDays.length} days &middot; {employeesData.length}{' '}
                employees
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <YearSelector
                  selectedYear={selectedYear}
                  handleYearChange={handleYearChange}
                  labelClass="mr-2 mb-0 text-sm font-medium text-slate-600"
                  selectClass="custom-select w-auto"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <MonthSelector
                  selectedMonth={selectedMonth}
                  handleMonthChange={handleMonthChange}
                  labelClass="mr-2 mb-0 text-sm font-medium text-slate-600"
                  selectClass="custom-select w-auto"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh data
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          {/* <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className={`absolute inset-y-0 left-0 w-1 ${stat.bar}`} aria-hidden="true" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconTone}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="text-3xl font-bold tabular-nums text-slate-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={stat.badge} size="sm" />
                  </div>
                </Card>
              );
            })}
          </div>


          {/* Attendance Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Monthly register</h2>
                <p className="text-sm text-slate-500">
                  Select a coloured cell to open that day&apos;s report.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {LEGEND.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"
                  >
                    <span className={`h-3 w-3 rounded ${item.swatch}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="p-4">
                <AttendanceTableSkeleton
                  employeeCount={employeesData.length || 5}
                  dayCount={monthDays.length || 10}
                />
              </div>
            ) : (
              <div className="max-h-[75vh] overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                <table className="min-w-full border-separate border-spacing-0 text-center">
                  <thead>
                    <tr>
                      <th className="sticky left-0 top-0 z-30 min-w-[220px] border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Date
                      </th>
                      {employeesData.map((employee, index) => (
                        <th
                          key={employee._id}
                          className="sticky top-0 z-20 min-w-[120px] border-b border-slate-200 bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-700"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <EmployeeAvatar
                              employee={employee}
                              tone={AVATAR_TONES[index % AVATAR_TONES.length]}
                              apiBase={API_BASE_URL}
                            />
                            <span
                              className="max-w-[120px] truncate leading-tight"
                              title={`${employee.firstName} ${employee.lastName}`.trim()}
                            >
                              {employee.firstName}
                              {employee.lastName ? ` ${employee.lastName}` : ''}
                            </span>
                          </div>
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

                      const rowTone = isHoliday
                        ? 'bg-rose-50'
                        : isAlternateSaturday || isSunday
                          ? 'bg-amber-50'
                          : 'bg-white';
                      const dateTone = isHoliday
                        ? 'bg-rose-100 text-rose-800'
                        : isAlternateSaturday || isSunday
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-50 text-slate-700';

                      return (
                        <tr key={day.key} className={rowTone}>
                          <td
                            className={`sticky left-0 z-10 min-w-[220px] border-b border-r border-slate-200 px-4 py-2.5 text-left text-sm font-medium ${dateTone}`}
                          >
                            {day.display}
                          </td>
                          {employeesData.map((employee) => {
                            const cell = dayCells[employee._id] || { display: '', style: '' };
                            const report = reportsData.find(
                              (r) =>
                                r.employee?._id === employee._id &&
                                normalizeDate(r.date) === day.key
                            );
                            const clickable = !!(cell.display && report);
                            return (
                              <td
                                key={employee._id}
                                className={`border-b border-r border-white/60 px-2 py-2 text-sm tabular-nums transition-colors ${
                                  clickable ? 'cursor-pointer' : ''
                                } ${cell.style}`}
                                onClick={() => {
                                  if (cell.display && report) {
                                    setSelectedReport(report);
                                  }
                                }}
                              >
                                {cell.display}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>

                  <tfoot>
                    {/* Summary Row 1: Leave Taken */}
                    <tr>
                      <td className={`${labelCell} border-t-2 border-t-slate-300 bg-slate-900 text-white`}>
                        Leave taken (&minus;)
                      </td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp._id] || 0;
                        const total = Math.round(fullLeaves * 10) / 10; // Round to 1 decimal
                        return (
                          <td
                            key={emp._id}
                            className={`${valueCell} border-t-2 border-t-slate-300 bg-slate-50 text-rose-600`}
                          >
                            {total}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Summary Row 2: Extra Working Days */}
                    <tr>
                      <td className={`${labelCell} bg-emerald-600 text-white`}>
                        Extra working days (+)
                      </td>
                      {employeesData.map((emp) => (
                        <td key={emp._id} className={`${valueCell} bg-emerald-50 text-emerald-700`}>
                          {extraWorkingCounts[emp._id] || 0}
                        </td>
                      ))}
                    </tr>

                    {/* Summary Row 3: Paid Leaves */}
                    <tr>
                      <td className={`${labelCell} bg-teal-500 text-white`}>Paid leave (+)</td>
                      {employeesData.map((emp) => (
                        <td key={emp._id} className={`${valueCell} bg-teal-50 text-teal-700`}>
                          1
                        </td>
                      ))}
                    </tr>

                    {/* Summary Row 4: Deduction/Paid */}
                    <tr>
                      <td className={`${labelCell} bg-indigo-600 text-white`}>Deduction / paid</td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp._id] || 0;
                        const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                        const totalDeduction = extraWorkCounts + 1 - fullLeaves; // Subtract 1 paid leave
                        return (
                          <td key={emp._id} className={`${valueCell} bg-indigo-50 text-indigo-700`}>
                            {totalDeduction}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Summary Row 5: No Of Days Salary To Be Credited */}
                    <tr>
                      <td className={`${labelCell} bg-rose-600 text-white`}>
                        No. of days salary to be credited
                      </td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp._id] || 0;
                        const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                        const deduction = extraWorkCounts + 1 - fullLeaves;
                        const salaryDays = deduction + 30;
                        return (
                          <td
                            key={emp._id}
                            className={`${valueCell} bg-rose-50 text-base font-bold text-rose-700`}
                          >
                            {salaryDays}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportViewModal
        showModal={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        selectedReport={selectedReport}
      />
    </>
  );
};

export default Statistics;

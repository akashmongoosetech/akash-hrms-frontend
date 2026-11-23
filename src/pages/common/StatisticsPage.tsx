import React, { useEffect, useMemo, useRef, useState } from 'react';
import AlertMessages from '../../components/common/AlertMessages';
import YearSelector from '../../components/common/YearSelector';
import MonthSelector from '../../components/common/MonthSelector';
import AttendanceTableSkeleton from '../../components/common/AttendanceTableSkeleton';
import moment from 'moment';
import { sortEmployeesAlphabetically } from '../../Common/Commonfunction';
import ReportViewModal from '../../components/common/modals/ReportViewModal';
import { useToast } from '../../components/ui/toast';
import {
  Users,
  Shield,
  Calendar,
  CalendarX,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Gift,
  Calculator,
  Wallet,
  CalendarDays,
} from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  photo?: string;
  profilePictures?: string[];
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
  'bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-600 transition-colors';
const STYLE_HALF_DAY =
  'bg-sky-500 text-white shadow-sm shadow-sky-600/20 hover:bg-sky-600 transition-colors';
const STYLE_ABSENT = 'bg-rose-500 text-white shadow-sm shadow-rose-600/20';
const STYLE_WEEKEND = 'bg-amber-50';

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

/* ---------- Presentation helpers ---------- */
const AVATAR_TONES = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-rose-500',
];

const initialsOf = (employee: Employee) =>
  `${(employee.firstName || '').charAt(0)}${(employee.lastName || '').charAt(0)}`.toUpperCase() ||
  '?';

const getProfileImageUrl = (employee: Employee, apiBase: string) => {
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

const EmployeeAvatar: React.FC<{ employee: Employee; tone: string; apiBase: string }> = ({
  employee,
  tone,
  apiBase,
}) => {
  const [failed, setFailed] = useState(false);
  const src = getProfileImageUrl(employee, apiBase);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${employee.firstName} ${employee.lastName}`.trim()}
        onError={() => setFailed(true)}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }

  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-white shadow-sm ${tone}`}
    >
      {initialsOf(employee)}
    </span>
  );
};

const LEGEND = [
  { label: 'Full day', swatch: 'bg-emerald-500' },
  { label: 'Half day', swatch: 'bg-sky-500' },
  { label: 'Leave / absent / holiday', swatch: 'bg-rose-500' },
  { label: 'Weekly off', swatch: 'bg-amber-200' },
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

  const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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
            leave.is_half_day === '1' || leave.is_half_day === 1 || leave.is_half_day === true,
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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
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

  const getAllDatesOfMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: Array<{ display: string; key: string }> = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month - 1, day);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });

      days.push({
        display: `${weekday}, ${day} ${monthName}`,
        key: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
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
    employeesData,
  ]);

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

  const statCards = [
    {
      label: 'Total employees',
      value: totalEmployees,
      icon: Users,
      iconTone: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
      bar: 'bg-indigo-500',
    },
    {
      label: 'Active',
      value: activeEmployees,
      icon: Shield,
      iconTone: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
      bar: 'bg-emerald-500',
    },
    {
      label: 'On leave',
      value: onLeaveEmployees,
      icon: CalendarX,
      iconTone: 'bg-sky-50 text-sky-600 ring-sky-100',
      bar: 'bg-sky-500',
    },
    {
      label: 'Offline',
      value: offlineEmployees,
      icon: Calendar,
      iconTone: 'bg-rose-50 text-rose-600 ring-rose-100',
      bar: 'bg-rose-500',
    },
  ];

  const monthTitle = moment({ year: selectedYear, month: selectedMonth - 1 }).format('MMMM YYYY');

  const labelCell =
    'sticky left-0 z-10 min-w-[240px] px-4 py-3 text-left text-sm font-semibold border-r border-slate-200';
  const valueCell = 'px-2 py-2.5 text-sm font-semibold tabular-nums';

  const labelIcon = 'flex h-7 w-7 items-center justify-center rounded-lg';

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

      <div className="min-h-screen bg-slate-100/70 py-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-6">
          {/* ============ HEADER ============ */}
          <header className="mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Attendance statistics
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                      {monthTitle}
                    </span>
                    <span>{monthDays.length} days</span>
                    <span className="text-slate-300">/</span>
                    <span>{employeesData.length} employees</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-colors focus-within:border-indigo-300">
                  <YearSelector
                    selectedYear={selectedYear}
                    handleYearChange={handleYearChange}
                    labelClass="mr-2 mb-0 text-sm font-medium text-slate-500"
                    selectClass="custom-select w-auto"
                  />
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-colors focus-within:border-indigo-300">
                  <MonthSelector
                    selectedMonth={selectedMonth}
                    handleMonthChange={handleMonthChange}
                    labelClass="mr-2 mb-0 text-sm font-medium text-slate-500"
                    selectClass="custom-select w-auto"
                  />
                </div>
                <button
                  onClick={handleRefresh}
                  className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const share = totalEmployees > 0 ? (stat.value / totalEmployees) * 100 : 0;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${stat.iconTone}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${stat.bar}`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </header>

          {/* ============ TABLE ============ */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Monthly register</h2>
                <p className="text-sm text-slate-500">
                  Click any colored cell to open that day&apos;s report
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {LEGEND.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.swatch}`} />
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
                      <th className="sticky left-0 top-0 z-30 min-w-[240px] border-b border-r border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-500">
                        Date
                      </th>
                      {employeesData.map((employee, index) => (
                        <th
                          key={employee._id}
                          className="sticky top-0 z-20 min-w-[120px] border-b border-slate-200 bg-white px-2 py-3 text-sm font-semibold text-slate-700"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <EmployeeAvatar
                              employee={employee}
                              tone={AVATAR_TONES[index % AVATAR_TONES.length]}
                              apiBase={API_BASE_URL}
                            />
                            <span
                              className="max-w-[110px] truncate text-xs font-semibold leading-tight text-slate-700"
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
                        ? 'bg-rose-50/40'
                        : isAlternateSaturday || isSunday
                        ? 'bg-amber-50/50'
                        : 'bg-white hover:bg-slate-50';

                      const dateTone = isHoliday
                        ? 'bg-rose-50 text-rose-700'
                        : isAlternateSaturday || isSunday
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-white text-slate-700';

                      const accent = isHoliday
                        ? 'bg-rose-400'
                        : isAlternateSaturday || isSunday
                        ? 'bg-amber-400'
                        : 'bg-transparent';

                      return (
                        <tr key={day.key} className={`${rowTone} transition-colors`}>
                          <td
                            className={`sticky left-0 z-10 min-w-[240px] border-b border-r border-slate-200 px-4 py-2 text-left text-sm font-medium ${dateTone}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`h-5 w-1 shrink-0 rounded-full ${accent}`}
                                aria-hidden="true"
                              />
                              {isHoliday && (
                                <Gift className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />
                              )}
                              <span>{day.display}</span>
                            </div>
                          </td>
                          {employeesData.map((employee) => {
                            const cell = dayCells[employee._id] || { display: '', style: '' };
                            const report = reportsData.find(
                              (r) =>
                                r.employee?._id === employee._id &&
                                normalizeDate(r.date) === day.key
                            );
                            const clickable = !!(cell.display && report);
                            const hasContent = !!cell.display;
                            return (
                              <td
                                key={employee._id}
                                className={`border-b border-r border-slate-100 p-1.5 text-center text-sm tabular-nums transition-colors ${
                                  clickable ? 'cursor-pointer' : ''
                                } ${hasContent ? '' : cell.style}`}
                                onClick={() => {
                                  if (cell.display && report) {
                                    setSelectedReport(report);
                                  }
                                }}
                              >
                                {hasContent && (
                                  <span
                                    className={`inline-flex min-w-[52px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${cell.style} ${
                                      clickable
                                        ? 'cursor-pointer hover:-translate-y-0.5 transform'
                                        : ''
                                    }`}
                                  >
                                    {cell.display}
                                  </span>
                                )}
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
                      <td
                        className={`${labelCell} border-t-2 border-t-slate-300 bg-slate-50 text-slate-800`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${labelIcon} bg-rose-100 text-rose-600`}>
                            <TrendingDown className="h-4 w-4" />
                          </span>
                          <span>Leave taken (&minus;)</span>
                        </div>
                      </td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp._id] || 0;
                        const total = Math.round(fullLeaves * 10) / 10;
                        return (
                          <td
                            key={emp._id}
                            className={`${valueCell} border-t-2 border-t-slate-300 bg-slate-50`}
                          >
                            <span className="inline-flex min-w-[40px] items-center justify-center rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                              {total}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Summary Row 2: Extra Working Days */}
                    <tr>
                      <td className={`${labelCell} border-t border-t-slate-200 bg-slate-50 text-slate-800`}>
                        <div className="flex items-center gap-3">
                          <span className={`${labelIcon} bg-emerald-100 text-emerald-600`}>
                            <TrendingUp className="h-4 w-4" />
                          </span>
                          <span>Extra working days (+)</span>
                        </div>
                      </td>
                      {employeesData.map((emp) => (
                        <td key={emp._id} className={`${valueCell} border-t border-t-slate-200 bg-slate-50`}>
                          <span className="inline-flex min-w-[40px] items-center justify-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                            {extraWorkingCounts[emp._id] || 0}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Summary Row 3: Paid Leaves */}
                    <tr>
                      <td className={`${labelCell} border-t border-t-slate-200 bg-slate-50 text-slate-800`}>
                        <div className="flex items-center gap-3">
                          <span className={`${labelIcon} bg-teal-100 text-teal-600`}>
                            <Gift className="h-4 w-4" />
                          </span>
                          <span>Paid leave (+)</span>
                        </div>
                      </td>
                      {employeesData.map((emp) => (
                        <td key={emp._id} className={`${valueCell} border-t border-t-slate-200 bg-slate-50`}>
                          <span className="inline-flex min-w-[40px] items-center justify-center rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-700">
                            1
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Summary Row 4: Deduction / paid */}
                    <tr>
                      <td className={`${labelCell} border-t border-t-slate-200 bg-slate-50 text-slate-800`}>
                        <div className="flex items-center gap-3">
                          <span className={`${labelIcon} bg-indigo-100 text-indigo-600`}>
                            <Calculator className="h-4 w-4" />
                          </span>
                          <span>Deduction / paid</span>
                        </div>
                      </td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp._id] || 0;
                        const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                        const totalDeduction = extraWorkCounts + 1 - fullLeaves;
                        return (
                          <td key={emp._id} className={`${valueCell} border-t border-t-slate-200 bg-slate-50`}>
                            <span className="inline-flex min-w-[40px] items-center justify-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                              {totalDeduction}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Summary Row 5: No Of Days Salary To Be Credited */}
                    <tr>
                      <td className={`${labelCell} bg-slate-900 text-white`}>
                        <div className="flex items-center gap-3">
                          <span className={`${labelIcon} bg-white/10 text-white`}>
                            <Wallet className="h-4 w-4" />
                          </span>
                          <span>Salary days to be credited</span>
                        </div>
                      </td>
                      {employeesData.map((emp) => {
                        const fullLeaves = leaveCounts[emp._id] || 0;
                        const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                        const deduction = extraWorkCounts + 1 - fullLeaves;
                        const salaryDays = deduction + 30;
                        return (
                          <td key={emp._id} className={`${valueCell} bg-slate-900`}>
                            <span className="inline-flex min-w-[44px] items-center justify-center rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900">
                              {salaryDays}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
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
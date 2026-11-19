import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import socket from '../../utils/socket';
import API from '../../utils/api';
import {
  AttendanceRecord,
  AttendanceStatus,
  formatClock,
  formatDuration,
  formatLongDate,
  getAttendanceHistory,
  getTodayAttendance,
} from '../../utils/attendanceApi';
import AttendanceVerificationModal from './AttendanceVerificationModal';
import AttendanceDetailModal from './AttendanceDetailModal';
import SecureSelfie from './SecureSelfie';

const TARGET_HOURS = Number((import.meta as any).env.VITE_TARGET_WORK_HOURS || 8);
const HISTORY_PAGE_SIZE = 10;

const statusMeta: Record<
  AttendanceStatus,
  { label: string; chip: string; dot: string; hero: string }
> = {
  'not-punched-in': {
    label: 'Not Punched In',
    chip: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    hero: 'Start your day',
  },
  'punched-in': {
    label: 'Punched In',
    chip: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    hero: 'On the clock',
  },
  'punched-out': {
    label: 'Punched Out',
    chip: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
    hero: 'Day complete',
  },
};

const pad = (n: number) => String(n).padStart(2, '0');
const dateInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function CircularProgress({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#attendanceGradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-gray-900">{Math.round(clamped)}%</span>
        <span className="text-[10px] uppercase tracking-wide text-gray-400">of target</span>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
      {hint && <p className="truncate text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function TimelineNode({
  kind,
  time,
  location,
  record,
  pending,
}: {
  kind: 'in' | 'out';
  time?: string | null;
  location?: AttendanceRecord['punchIn']['location'];
  record: AttendanceRecord;
  pending?: boolean;
}) {
  const isIn = kind === 'in';
  return (
    <div className="relative flex gap-3 pb-6 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span
          className={`z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-white ${
            pending
              ? 'bg-gray-100 text-gray-400'
              : isIn
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-500 text-white'
          }`}
        >
          {isIn ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
        </span>
        <span className="absolute top-9 h-full w-px bg-gray-200" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{isIn ? 'Punched In' : 'Punched Out'}</p>
          <span className="text-xs font-medium text-gray-500">{time ? formatClock(time) : 'Pending'}</span>
        </div>
        <p className="mt-1 flex items-start gap-1.5 text-xs text-gray-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
          {pending ? 'Waiting for punch out' : location?.address || 'Location not available'}
        </p>
        {!pending && (location?.city || location?.state) && (
          <p className="mt-0.5 text-[11px] text-gray-400">
            {[location?.area, location?.city, location?.state, location?.postalCode]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        {!pending && ((isIn && record.punchIn.hasSelfie) || (!isIn && record.punchOut?.hasSelfie)) && (
          <div className="mt-2">
            <SecureSelfie
              attendanceId={record.id}
              type={kind}
              className="h-14 w-14"
              rounded="rounded-xl"
              alt={isIn ? 'Punch in selfie' : 'Punch out selfie'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttendanceDashboard() {
  const role = localStorage.getItem('role') || 'Employee';
  const userId = localStorage.getItem('userId') || '';
  const canPunch = role === 'Employee' || role === 'HR';
  const privileged = ['HR', 'Manager', 'Admin', 'SuperAdmin'].includes(role);

  const [profile, setProfile] = useState<any>({
    firstName: localStorage.getItem('userName')?.split(' ')[0] || '',
    lastName: localStorage.getItem('userName')?.split(' ').slice(1).join(' ') || '',
    photo: null,
    email: '',
  });

  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [status, setStatus] = useState<AttendanceStatus>('not-punched-in');
  const [loadingToday, setLoadingToday] = useState(true);

  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: HISTORY_PAGE_SIZE,
  });

  const initialFilters = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return {
      fromDate: dateInputValue(start),
      toDate: dateInputValue(end),
      status: '',
      search: '',
    };
  }, []);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [clock, setClock] = useState(new Date());
  const [nowTick, setNowTick] = useState(Date.now());

  const [modalMode, setModalMode] = useState<'in' | 'out' | null>(null);
  const [detailRecord, setDetailRecord] = useState<AttendanceRecord | null>(null);

  const loadToday = async () => {
    try {
      const result = await getTodayAttendance();
      setToday(result.attendance);
      setStatus(result.status);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to load attendance status.');
    } finally {
      setLoadingToday(false);
    }
  };

  const loadHistory = async (
    targetPage: number,
    applied: typeof initialFilters
  ) => {
    setHistoryLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: targetPage,
        limit: HISTORY_PAGE_SIZE,
      };
      if (applied.fromDate) params.fromDate = applied.fromDate;
      if (applied.toDate) params.toDate = applied.toDate;
      if (applied.status) params.status = applied.status;
      if (privileged && applied.search) params.search = applied.search;

      const result = await getAttendanceHistory(params);
      setHistory(result.records);
      setPagination(result.pagination);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to load attendance history.');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadToday();

    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const { data } = await API.get(`/users/${userId}`);
        setProfile((prev: any) => ({ ...prev, ...data }));
      } catch {
        /* fall back to localStorage values */
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    loadHistory(page, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, appliedFilters]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
      setNowTick(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const refresh = () => {
      loadToday();
      loadHistory(page, appliedFilters);
    };
    socket.on('punch-in', refresh);
    socket.on('punch-out', refresh);
    return () => {
      socket.off('punch-in', refresh);
      socket.off('punch-out', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, appliedFilters]);

  const meta = statusMeta[status];

  const workedMinutes = useMemo(() => {
    if (!today) return 0;
    if (today.status === 'punched-in' && today.punchInTime) {
      return Math.max(0, (nowTick - new Date(today.punchInTime).getTime()) / 60000);
    }
    return today.totalWorkingMinutes ?? 0;
  }, [today, nowTick]);

  const targetMinutes = TARGET_HOURS * 60;
  const remainingMinutes = Math.max(0, targetMinutes - workedMinutes);
  const progress = targetMinutes > 0 ? (workedMinutes / targetMinutes) * 100 : 0;
  const currentLocation = today?.punchIn.location;

  const initials =
    `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase() ||
    localStorage.getItem('userName')?.slice(0, 2).toUpperCase() ||
    'HR';

  const handleApplyFilters = (event?: React.FormEvent) => {
    event?.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  };

  const handlePunchClick = (mode: 'in' | 'out') => {
    if (!canPunch) {
      toast.error('Only employees can record attendance.');
      return;
    }
    setModalMode(mode);
  };

  const statusSubtitle =
    status === 'punched-in'
      ? 'Your attendance is active. Remember to punch out when you finish.'
      : status === 'punched-out'
        ? "Today's attendance is complete. See your summary below."
        : 'Punch in with a live selfie and GPS location to start your day.';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">
            Attendance
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            My Attendance
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your working hours and daily attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              {formatLongDate(clock)}
            </p>
            <p className="font-mono text-xl font-semibold tabular-nums text-gray-900">
              {clock.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm">
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={initials}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                {initials}
              </span>
            )}
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-gray-900">
                {`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Employee'}
              </p>
              <p className="truncate text-[11px] text-gray-400">{profile?.email || role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status + progress */}
      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-sm sm:p-6 lg:col-span-2"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-100/60 to-emerald-100/40 blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatLongDate(today?.punchInTime || new Date())}
            </span>
          </div>

          <div className="relative mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                {meta.hero}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {loadingToday
                  ? 'Loading…'
                  : status === 'punched-in'
                    ? formatDuration(workedMinutes, true)
                    : status === 'punched-out'
                      ? `${today?.totalWorkingHours || '00:00'} worked`
                      : 'Ready when you are'}
              </h2>
              <p className="mt-1 max-w-md text-sm text-gray-500">{statusSubtitle}</p>
            </div>

            <div className="shrink-0">
              {!canPunch ? (
                <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500">
                  <Eye className="h-4 w-4" /> Admin view
                </span>
              ) : status === 'punched-in' ? (
                <Button
                  onClick={() => handlePunchClick('out')}
                  className="h-12 w-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-medium hover:bg-blue-700 sm:w-auto"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Punch Out
                </Button>
              ) : status === 'punched-out' ? (
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" /> Completed
                </span>
              ) : (
                <Button
                  onClick={() => handlePunchClick('in')}
                  disabled={loadingToday}
                  className="h-12 w-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-medium hover:bg-emerald-700 sm:w-auto"
                >
                  <LogIn className="mr-2 h-4 w-4" /> Punch In
                </Button>
              )}
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              icon={<LogIn className="h-3 w-3" />}
              label="Punch In"
              value={today?.punchInTime ? formatClock(today.punchInTime) : '—'}
            />
            <Stat
              icon={<LogOut className="h-3 w-3" />}
              label="Punch Out"
              value={today?.punchOutTime ? formatClock(today.punchOutTime) : '—'}
            />
            <Stat
              icon={<Timer className="h-3 w-3" />}
              label="Total Hours"
              value={
                status === 'not-punched-in'
                  ? '—'
                  : formatDuration(workedMinutes)
              }
            />
            <Stat
              icon={<MapPin className="h-3 w-3" />}
              label="Location"
              value={currentLocation?.city || currentLocation?.area || '—'}
              hint={currentLocation?.postalCode}
            />
          </div>
        </motion.div>

        {/* Working hours */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Working Hours</h3>
              <p className="text-xs text-gray-500">Daily progress</p>
            </div>
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
              Target {TARGET_HOURS}h
            </span>
          </div>

          <div className="mt-5 flex items-center gap-5">
            <CircularProgress percent={progress} />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Worked</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDuration(workedMinutes)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Remaining</p>
                <p className="text-sm font-semibold text-gray-900">
                  {status === 'punched-in' ? formatDuration(remainingMinutes) : status === 'punched-out' ? '00:00' : formatDuration(targetMinutes)}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-gray-50/80 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
              <Clock className="h-3 w-3" /> Live session
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-gray-900">
              {status === 'punched-in' ? formatDuration(workedMinutes, true) : '00:00:00'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Today's Timeline</h3>
            <p className="text-xs text-gray-500">Live selfie and location for each attendance event.</p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${meta.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
          </span>
        </div>

        <div className="mt-5">
          {!today ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-10 text-center">
              <Clock className="h-7 w-7 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-600">No attendance yet today</p>
              <p className="mt-1 text-xs text-gray-400">
                Your punch-in event will appear here once you start.
              </p>
            </div>
          ) : (
            <>
              <TimelineNode
                kind="in"
                time={today.punchInTime}
                location={today.punchIn.location}
                record={today}
              />
              {today.punchOut ? (
                <TimelineNode
                  kind="out"
                  time={today.punchOut.time}
                  location={today.punchOut.location}
                  record={today}
                />
              ) : (
                <TimelineNode kind="out" record={today} pending />
              )}
            </>
          )}
        </div>
      </div>

      {/* History */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Attendance History</h3>
            <p className="text-xs text-gray-500">
              {pagination.totalItems} record{pagination.totalItems === 1 ? '' : 's'} found
            </p>
          </div>
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>

        {/* Filters */}
        <form
          onSubmit={handleApplyFilters}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500">From</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) => setFilters((prev) => ({ ...prev, fromDate: event.target.value }))}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500">To</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) => setFilters((prev) => ({ ...prev, toDate: event.target.value }))}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500">Status</label>
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All statuses</option>
              <option value="punched-in">Punched In</option>
              <option value="punched-out">Punched Out</option>
            </select>
          </div>
          {privileged ? (
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-500">Search employee</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Name or email"
                  className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}
          <div className="flex items-end gap-2">
            <Button type="submit" className="h-10 flex-1 bg-gray-900 text-white hover:bg-gray-800">
              <Filter className="mr-1.5 h-3.5 w-3.5" /> Apply
            </Button>
            <Button type="button" variant="outline" onClick={handleClearFilters} className="h-10">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Punch In</th>
                <th className="px-3 py-3 font-medium">Punch Out</th>
                <th className="px-3 py-3 font-medium">Hours</th>
                <th className="hidden px-3 py-3 font-medium lg:table-cell">Selfies</th>
                <th className="hidden px-3 py-3 font-medium lg:table-cell">Location</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-3 py-4"><div className="h-4 w-24 rounded bg-gray-100" /></td>
                      <td className="px-3 py-4"><div className="h-4 w-16 rounded bg-gray-100" /></td>
                      <td className="px-3 py-4"><div className="h-4 w-16 rounded bg-gray-100" /></td>
                      <td className="px-3 py-4"><div className="h-4 w-12 rounded bg-gray-100" /></td>
                      <td className="hidden px-3 py-4 lg:table-cell"><div className="h-8 w-16 rounded bg-gray-100" /></td>
                      <td className="hidden px-3 py-4 lg:table-cell"><div className="h-4 w-28 rounded bg-gray-100" /></td>
                      <td className="px-3 py-4"><div className="h-5 w-20 rounded-full bg-gray-100" /></td>
                      <td className="px-3 py-4"><div className="ml-auto h-8 w-16 rounded bg-gray-100" /></td>
                    </tr>
                  ))
                : history.map((record) => {
                    const recordMeta = statusMeta[record.status];
                    return (
                      <tr key={record.id} className="transition-colors hover:bg-gray-50/70">
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <p className="font-medium text-gray-900">
                            {new Date(record.punchInTime).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(record.punchInTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          {privileged && record.employee && (
                            <p className="text-[11px] text-gray-400">
                              {record.employee.firstName} {record.employee.lastName}
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-700">
                          {formatClock(record.punchInTime)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-700">
                          {record.punchOutTime ? formatClock(record.punchOutTime) : '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-medium text-gray-900">
                          {record.totalWorkingHours || '—'}
                        </td>
                        <td className="hidden px-3 py-3.5 lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            {record.punchIn.hasSelfie ? (
                              <SecureSelfie attendanceId={record.id} type="in" className="h-9 w-9" />
                            ) : (
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
                                <LogIn className="h-3.5 w-3.5" />
                              </span>
                            )}
                            {record.punchOut?.hasSelfie ? (
                              <SecureSelfie attendanceId={record.id} type="out" className="h-9 w-9" />
                            ) : (
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-300">
                                <LogOut className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden max-w-[200px] px-3 py-3.5 lg:table-cell">
                          <p className="truncate text-xs text-gray-600">
                            {record.punchOut?.location?.city ||
                              record.punchIn.location?.city ||
                              record.punchIn.location?.area ||
                              '—'}
                          </p>
                          <p className="truncate text-[11px] text-gray-400">
                            {record.punchIn.location?.address || ''}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${recordMeta.chip}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${recordMeta.dot}`} />
                            {recordMeta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setDetailRecord(record)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {!historyLoading && history.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-12 text-center">
              <CalendarX2 className="h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-600">No attendance records</p>
              <p className="mt-1 text-xs text-gray-400">
                Try adjusting the date range or filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
                .filter((pageNumber) => {
                  if (pagination.totalPages <= 7) return true;
                  return (
                    Math.abs(pageNumber - pagination.currentPage) <= 1 ||
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages
                  );
                })
                .map((pageNumber, index, list) => (
                  <span key={pageNumber} className="flex items-center">
                    {index > 0 && pageNumber - list[index - 1] > 1 && (
                      <span className="px-1 text-xs text-gray-400">…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                        pageNumber === pagination.currentPage
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  </span>
                ))}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() =>
                  setPage((current) => Math.min(pagination.totalPages, current + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[11px] text-gray-400">
        <UserRound className="h-3 w-3" />
        Attendance requires a live selfie and GPS location for every punch.
      </p>

      <AttendanceVerificationModal
        isOpen={modalMode !== null}
        mode={modalMode || 'in'}
        onClose={() => setModalMode(null)}
        onSuccess={() => {
          loadToday();
          loadHistory(page, appliedFilters);
        }}
      />

      <AttendanceDetailModal
        isOpen={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
    </div>
  );
}

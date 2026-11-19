import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Navigation,
  Timer,
  X,
} from 'lucide-react';
import LocationMap from './LocationMap';
import SecureSelfie from './SecureSelfie';
import { AttendanceRecord, formatClock, formatLongDate } from '@/utils/attendanceApi';

interface Props {
  isOpen: boolean;
  record: AttendanceRecord | null;
  onClose: () => void;
}

const statusStyles: Record<string, { chip: string; label: string }> = {
  'punched-in': { chip: 'bg-emerald-50 text-emerald-700', label: 'Punched In' },
  'punched-out': { chip: 'bg-blue-50 text-blue-700', label: 'Punched Out' },
};

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function AttendanceDetailModal({ isOpen, record, onClose }: Props) {
  const status = record ? statusStyles[record.status] : undefined;

  return (
    <AnimatePresence>
      {isOpen && record && (
        <motion.div
          className="fixed inset-0 z-[1250] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Attendance Details</h2>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatLongDate(record.punchInTime)}
                  {record.employee && (
                    <span className="text-gray-400">
                      · {record.employee.firstName} {record.employee.lastName}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {status && (
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.chip}`}>
                    {status.label}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric
                  icon={<LogIn className="h-3 w-3" />}
                  label="Punch In"
                  value={formatClock(record.punchInTime)}
                />
                <Metric
                  icon={<LogOut className="h-3 w-3" />}
                  label="Punch Out"
                  value={record.punchOutTime ? formatClock(record.punchOutTime) : '—'}
                />
                <Metric
                  icon={<Timer className="h-3 w-3" />}
                  label="Total Hours"
                  value={record.totalWorkingHours || '—'}
                />
                <Metric
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  label="Status"
                  value={status?.label || '—'}
                />
              </div>

              {record.autoPunchOut && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  This session was closed automatically by the system at end of day.
                </p>
              )}

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {/* Punch In */}
                <section className="rounded-2xl border border-gray-100 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <LogIn className="h-4 w-4" />
                    </span>
                    Punch In
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-gray-500">
                      <Clock className="h-3.5 w-3.5" /> {formatClock(record.punchInTime)}
                    </span>
                  </h3>

                  <div className="mt-3 overflow-hidden rounded-xl bg-slate-900">
                    <SecureSelfie
                      attendanceId={record.id}
                      type="in"
                      className="h-44 w-full"
                      rounded="rounded-xl"
                      alt="Punch in selfie"
                    />
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-gray-600">
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                      {record.punchIn.location?.address || 'Address unavailable'}
                    </p>
                    <p className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
                      <Navigation className="h-3.5 w-3.5" />
                      {record.punchIn.location
                        ? `${record.punchIn.location.latitude.toFixed(6)}, ${record.punchIn.location.longitude.toFixed(6)}`
                        : '—'}
                    </p>
                    {record.punchIn.location && (
                      <p className="text-[11px] text-gray-400">
                        Accuracy: {Math.round(record.punchIn.location.accuracy)} m
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <LocationMap
                      latitude={record.punchIn.location?.latitude}
                      longitude={record.punchIn.location?.longitude}
                      className="h-36"
                      label="Punch in location"
                    />
                  </div>
                </section>

                {/* Punch Out */}
                <section className="rounded-2xl border border-gray-100 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <LogOut className="h-4 w-4" />
                    </span>
                    Punch Out
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-gray-500">
                      <Clock className="h-3.5 w-3.5" />{' '}
                      {record.punchOutTime ? formatClock(record.punchOutTime) : '—'}
                    </span>
                  </h3>

                  {record.punchOut ? (
                    <>
                      <div className="mt-3 overflow-hidden rounded-xl bg-slate-900">
                        <SecureSelfie
                          attendanceId={record.id}
                          type="out"
                          className="h-44 w-full"
                          rounded="rounded-xl"
                          alt="Punch out selfie"
                        />
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-gray-600">
                        <p className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                          {record.punchOut.location?.address || 'Address unavailable'}
                        </p>
                        <p className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
                          <Navigation className="h-3.5 w-3.5" />
                          {record.punchOut.location
                            ? `${record.punchOut.location.latitude.toFixed(6)}, ${record.punchOut.location.longitude.toFixed(6)}`
                            : '—'}
                        </p>
                        {record.punchOut.location && (
                          <p className="text-[11px] text-gray-400">
                            Accuracy: {Math.round(record.punchOut.location.accuracy)} m
                          </p>
                        )}
                      </div>

                      <div className="mt-3">
                        <LocationMap
                          latitude={record.punchOut.location?.latitude}
                          longitude={record.punchOut.location?.longitude}
                          className="h-36"
                          label="Punch out location"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
                      <LogOut className="h-6 w-6 text-gray-300" />
                      <p className="mt-2 text-xs font-medium text-gray-500">Not punched out yet</p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        Punch-out selfie and location will appear here.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 px-5 py-3 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

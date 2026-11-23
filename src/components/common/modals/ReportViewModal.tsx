import React, { useEffect, useState } from 'react';
import { X, Clock, Users, Calendar, Shield, MapPin, ImageOff, Loader2 } from 'lucide-react';
import API from '@/utils/api';
import { formatClock, type AttendanceLocation } from '@/utils/attendanceApi';
import SecureSelfie from '@/components/Punch/SecureSelfie';
import LocationMap from '@/components/Punch/LocationMap';
import { StatusBadge } from '../../ui/status-badge';

interface ReportAttendancePunch {
  time: string;
  location: AttendanceLocation | null;
  hasSelfie: boolean;
}

interface ReportAttendance {
  id: string;
  dateKey: string | null;
  status: string;
  punchInTime: string;
  punchOutTime: string | null;
  totalWorkingMinutes: number | null;
  punchIn: ReportAttendancePunch;
  punchOut: ReportAttendancePunch | null;
}

interface Report {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    photo?: string;
  } | null;
  date: string;
  workingHours: string;
}

interface ReportViewModalProps {
  showModal: boolean;
  onClose: () => void;
  selectedReport: Report | null;
}

function AttendancePunchCard({
  attendanceId,
  type,
  punch,
}: {
  attendanceId: string;
  type: 'in' | 'out';
  punch: ReportAttendancePunch;
}) {
  const isIn = type === 'in';
  const location = punch.location;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            isIn ? 'text-emerald-700' : 'text-blue-700'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isIn ? 'bg-emerald-500' : 'bg-blue-500'}`}
          />
          Punch {isIn ? 'In' : 'Out'}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
          <Clock className="h-3.5 w-3.5" /> {formatClock(punch.time)}
        </span>
      </div>

      <div className="space-y-3 p-3">
        {punch.hasSelfie ? (
          <SecureSelfie
            attendanceId={attendanceId}
            type={type}
            alt={`Punch ${type} selfie`}
            className="h-44 w-full"
            rounded="rounded-lg"
          />
        ) : (
          <div className="flex h-44 w-full flex-col items-center justify-center gap-1 rounded-lg bg-gray-100 text-gray-400">
            <ImageOff className="h-5 w-5" />
            <span className="text-[11px] font-medium">No selfie recorded</span>
          </div>
        )}

        {location ? (
          <div className="space-y-1.5 text-xs">
            <p className="flex items-start gap-1.5 font-medium text-gray-800">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span className="break-words">
                {location.address ||
                  `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
              </span>
            </p>
            {(location.area || location.city || location.state || location.postalCode) && (
              <p className="pl-5 text-gray-500">
                {[location.area, location.city, location.state, location.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            <p className="pl-5 text-gray-500">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
            <p className="pl-5 text-gray-500">Accuracy: {Math.round(location.accuracy)} m</p>
            <LocationMap
              latitude={location.latitude}
              longitude={location.longitude}
              className="h-32"
              label={`Punch ${isIn ? 'in' : 'out'} location`}
            />
          </div>
        ) : (
          <p className="text-xs text-gray-500">Location not recorded.</p>
        )}
      </div>
    </div>
  );
}

const ReportViewModal: React.FC<ReportViewModalProps> = ({ showModal, onClose, selectedReport }) => {
  if (!showModal || !selectedReport) return null;

  const employee = selectedReport.employee;
  const [attendance, setAttendance] = useState<ReportAttendance | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const reportId = selectedReport._id;

  useEffect(() => {
    if (!showModal || !reportId) return;

    let active = true;
    setAttendance(null);
    setAttendanceError(null);
    setAttendanceLoading(true);

    API.get(`/reports/${reportId}/attendance`)
      .then(({ data }) => {
        if (active) setAttendance(data?.attendance || null);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Error fetching report attendance:', error);
        setAttendanceError('Unable to load the attendance verification for this report.');
      })
      .finally(() => {
        if (active) setAttendanceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showModal, reportId]);

  const totalHours = selectedReport.workingHours
    ? parseFloat(selectedReport.workingHours.split(':')[0]) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Attendance Report</h2>
          </div>
          <button onClick={onClose} className="hover:text-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Employee Information</h3>
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
                {employee?.firstName?.[0]}{employee?.lastName?.[0]}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                </p>
                <p className="text-sm text-gray-500">{employee?.email || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">{employee?.role || 'N/A'} • {employee?.status || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Report Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{selectedReport.date}</p>
              </div>
              <div>
                <p className="text-gray-500">Working Hours</p>
                <p className="font-medium text-gray-900">{selectedReport.workingHours || '0:00'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <StatusBadge status="online" size="sm" />
              </div>
              <div>
                <p className="text-gray-500">Report ID</p>
                <p className="font-medium text-gray-900 truncate max-w-xs">{selectedReport._id}</p>
              </div>
            </div>
          </div>

          {/* Attendance Verification */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                <Shield className="h-4 w-4" /> Attendance Verification
              </h3>
              {attendance && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    attendance.status === 'punched-out'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      attendance.status === 'punched-out' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                  />
                  {attendance.status === 'punched-out' ? 'Punched out' : 'Punched in'}
                </span>
              )}
            </div>

            {attendanceLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Loading punch-in / punch-out records…
              </div>
            ) : attendanceError ? (
              <p className="text-sm text-rose-600">{attendanceError}</p>
            ) : !attendance ? (
              <p className="text-sm text-gray-500">
                No punch-in / punch-out record was found for this date.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AttendancePunchCard
                  attendanceId={attendance.id}
                  type="in"
                  punch={attendance.punchIn}
                />
                {attendance.punchOut ? (
                  <AttendancePunchCard
                    attendanceId={attendance.id}
                    type="out"
                    punch={attendance.punchOut}
                  />
                ) : (
                  <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-gray-400">
                    <Clock className="h-5 w-5" />
                    <p className="text-xs font-medium">No punch-out recorded for this day.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hours Breakdown */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Hours Breakdown</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-500">Total Hours</span>
              </div>
              <span className="text-lg font-bold text-green-700">{totalHours}h</span>
            </div>
          </div>

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

export default ReportViewModal;

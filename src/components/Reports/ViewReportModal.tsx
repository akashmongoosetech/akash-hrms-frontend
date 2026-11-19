import React, { useEffect, useState } from 'react';
import {
  Camera,
  Clock,
  FileText,
  ImageOff,
  Loader2,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import API from '../../utils/api';
import { formatClock, type AttendanceLocation } from '@/utils/attendanceApi';
import SecureSelfie from '@/components/Punch/SecureSelfie';
import LocationMap from '@/components/Punch/LocationMap';

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

const ViewReportModal: React.FC<ViewReportModalProps> = ({
  isOpen,
  onClose,
  report,
  role,
}) => {
  const [attendance, setAttendance] = useState<ReportAttendance | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const reportId = report?._id;

  useEffect(() => {
    if (!isOpen || !reportId) return;

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
  }, [isOpen, reportId]);

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
                    src={report.employee.photo}
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

          {/* Attendance Verification */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4" /> Attendance Verification
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
                    <Camera className="h-5 w-5" />
                    <p className="text-xs font-medium">No punch-out recorded for this day.</p>
                  </div>
                )}
              </div>
            )}
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

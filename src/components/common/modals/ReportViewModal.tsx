import React from 'react';
import { X, Clock, Users, Calendar, Shield, MapPin, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '../../../Common/Commonfunction';
import { StatusBadge } from '../../ui/status-badge';

interface Report {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  } | null;
  date: string;
  workingHours: string;
  livePic?: string;
  location?: string;
}

interface ReportViewModalProps {
  showModal: boolean;
  onClose: () => void;
  selectedReport: Report | null;
}

const ReportViewModal: React.FC<ReportViewModalProps> = ({ showModal, onClose, selectedReport }) => {
  if (!showModal || !selectedReport) return null;

  const employee = selectedReport.employee;
  const totalHours = selectedReport.workingHours ? parseFloat(selectedReport.workingHours.split(':')[0]) : 0;

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
                <p className="font-medium text-gray-900">{formatDate(selectedReport.date)}</p>
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
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">Attendance Verification</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live Pic */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Live Picture</p>
                <div className="h-32 w-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative mb-2">
                  {selectedReport.livePic ? (
                    <img
                      src={selectedReport.livePic}
                      alt="Live attendance picture"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Users className="w-10 h-10 opacity-50 mb-2" />
                      <span className="text-xs">No live picture available</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Live
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center">Employee check-in photo</p>
              </div>

              {/* Location */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Location</p>
                <div className="flex items-start gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 break-words">{selectedReport.location || 'Location not available'}</p>
                    <p className="text-[10px] text-gray-400">GPS coordinates captured at check-in</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-700 font-medium">Location Verified</span>
                </div>
              </div>
            </div>
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


import * as React from 'react';
import { useToast } from '../../ui/toast';
import { StatusBadge } from '../../ui/status-badge';
import { Users, CheckCircle, Clock, MapPin, Building, Shield, Calendar } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'away';
  joinDate: string;
}

interface ViewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export const ViewTeamModal: React.FC<ViewTeamModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const { notify } = useToast();

  if (!employee) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md transform scale-95 opacity-0 transition-all duration-300">
        {/* Modal Header */}
        <div className="p-5 border-b border-border opacity-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-medium text-gray-900">Employee Details</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Employee Profile Header */}
        <div className="p-4 mb-6 rounded-t-2xl border-b border-border">
          <div className="flex items-center justify-center h-32">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</p>
              <p className="text-sm text-gray-500">{employee.role}</p>
              <StatusBadge status={employee.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Employee Information Sections */}
        <div className="p-4 space-y-4">
          
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Joined</p>
                  <p className="text-sm text-gray-500">{employee.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Employment Details</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-500">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Role</p>
                  <p className="text-sm text-gray-500">{employee.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Account Status</h3>
            <div className="flex items-center gap-3">
              <StatusBadge status={employee.status} size="sm" />
              <span className="text-sm text-gray-500">{employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}</span>
            </div>
          </div>

          {/* Additional Metadata */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-400">EMP-00123</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">User Type</p>
                <p className="font-medium text-gray-400">Regular</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-border">
          <button
            onClick={handleClose}
            className="w-full flex items-center justify-center py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTeamModal;

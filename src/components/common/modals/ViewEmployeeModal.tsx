import * as React from 'react';
import { useToast } from '../../ui/toast';
import { Users, MapPin, Calendar, Building, Shield, CheckCircle, XClock } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'away';
  joinDate: string;
  phone?: string;
  address?: string;
  hireDate?: string;
}

interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const { notify } = useToast();
  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg transform scale-95 opacity-0 transition-all duration-300">
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
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</p>
              <p className="text-sm text-gray-500">{employee.role}</p>
              <StatusBadge status={employee.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Employee Details Sections */}
        <div className="p-4 space-y-4">
          
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
              </div>
              {employee.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">{employee.phone}</p>
                  </div>
                </div>
              )}
              {employee.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapMarker className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-500">{employee.address}</p>
                  </div>
                </div>
              )}
              {employee.hireDate && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hire Date</p>
                    <p className="text-sm text-gray-500">{employee.hireDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Employment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{employee.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-900">{employee.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge status={employee.status} size="sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="font-medium text-gray-900">{employee.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Account Metadata */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-400">EMP-00123</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">User Type</p>
                <p className="font-medium text-gray-400">Employee</p>
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

export const ModalHeader = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-medium text-gray-900">{title}</h2>
      </div>
      <button className="p-2 rounded-md hover:bg-gray-100 transition-colors" aria-label="Close">
        ✕
      </button>
    </div>
  );
};

export const ModalFooter = ({
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
}: {
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded-md text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        {confirmText}
      </button>
    </div>
  );
};

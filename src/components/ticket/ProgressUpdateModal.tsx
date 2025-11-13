import React from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface ProgressUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressError: string | null;
  updatingProgress: boolean;
  progressDate: string;
  setProgressDate: (value: string) => void;
  workingHours: string;
  setWorkingHours: (value: string) => void;
  progressValue: string;
  setProgressValue: (value: string) => void;
  currentProgress: string;
  setCurrentProgress: (value: string) => void;
  ticket: Ticket;
  userRole: string;
  onSubmit: (e: React.FormEvent) => void;
  setProgressError: (error: string | null) => void;
}

interface Ticket {
  _id: string;
  title: string;
  employee?: Employee | null;
  priority?: "Low" | "Medium" | "High";
  dueDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: ProgressEntry[];
  currentProgress?: number;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface ProgressEntry {
  _id: string;
  date: string;
  workingHours: number;
  progress: number;
  updatedBy: { _id: string; firstName: string; lastName: string; role: string };
}

const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  isOpen,
  onClose,
  progressError,
  updatingProgress,
  progressDate,
  setProgressDate,
  workingHours,
  setWorkingHours,
  progressValue,
  setProgressValue,
  currentProgress,
  setCurrentProgress,
  ticket,
  userRole,
  onSubmit,
  setProgressError,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Update Progress
        </h3>
        {progressError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{progressError}</p>
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          {userRole === "Employee" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date (Last Updated: {progressDate})
                </label>
                <Input
                  type="date"
                  value={progressDate}
                  onChange={(e) => setProgressDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={progressDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Hours
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="Enter hours worked"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress (%)
                </label>
                <Input
                  type="number"
                  min={ticket.currentProgress || 0}
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  placeholder="Enter progress percentage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Progress (%)
              </label>
              <Input
                type="number"
                min={ticket.currentProgress || 0}
                max="100"
                value={currentProgress}
                onChange={(e) => setCurrentProgress(e.target.value)}
                placeholder="Enter current progress"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                onClose();
                setProgressError(null);
              }}
              variant="outline"
              className="flex-1"
              disabled={updatingProgress}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updatingProgress}
            >
              {updatingProgress ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgressUpdateModal;
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import socket from '../../utils/socket';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportAdded: () => void;
}

const AddReportModal: React.FC<AddReportModalProps> = ({
  isOpen,
  onClose,
  onReportAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    startTime: '',
    breakDuration: 0,
    endTime: '',
    workingHours: '',
    totalHours: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchBreakDuration();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateHours();
  }, [formData.startTime, formData.endTime, formData.breakDuration]);

  const fetchBreakDuration = async () => {
    try {
      const response = await API.get('/breaks/duration');
      setFormData(prev => ({ ...prev, breakDuration: response.data.totalBreakDuration }));
    } catch (error) {
      console.error('Error fetching break duration:', error);
    }
  };

  const calculateHours = () => {
    if (!formData.startTime || !formData.endTime) return;

    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);

    if (end <= start) return;

    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = Math.floor(totalMinutes % 60);
    const totalHoursStr = `${totalHours.toString().padStart(2, '0')}:${totalMins.toString().padStart(2, '0')}`;

    const workingMinutes = totalMinutes - formData.breakDuration;
    const workingHours = Math.floor(workingMinutes / 60);
    const workingMins = Math.floor(workingMinutes % 60);
    const workingHoursStr = `${workingHours.toString().padStart(2, '0')}:${workingMins.toString().padStart(2, '0')}`;

    setFormData(prev => ({
      ...prev,
      totalHours: totalHoursStr,
      workingHours: workingHoursStr,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/reports', {
        description: formData.description,
        startTime: formData.startTime,
        breakDuration: formData.breakDuration,
        endTime: formData.endTime,
        workingHours: formData.workingHours,
        totalHours: formData.totalHours,
      });

      // Emit socket event for real-time update
      socket.emit('reportCreated', response.data.report);

      toast.success('Report added successfully!');
      onClose();
      setFormData({
        description: '',
        startTime: '',
        breakDuration: 0,
        endTime: '',
        workingHours: '',
        totalHours: '',
      });
      onReportAdded();
    } catch (error) {
      console.error('Error adding report:', error);
      toast.error('Error adding report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Daily Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Description *
            </label>
            <div className="border border-gray-300 rounded-lg">
              {/* @ts-ignore */}
              <CKEditor
                editor={ClassicEditor}
                data={formData.description}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setFormData(prev => ({ ...prev, description: data }));
                }}
                config={{
                  toolbar: [
                    'bold', 'italic', 'underline', 'strikethrough', '|',
                    'numberedList', 'bulletedList', '|',
                    'link', 'blockQuote', '|',
                    'undo', 'redo'
                  ],
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.breakDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                min="0"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-fetched from today's break activities</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Today's Working Hours
              </label>
              <input
                type="text"
                value={formData.workingHours}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">End Time - Start Time - Break Duration</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Today's Total Hours
              </label>
              <input
                type="text"
                value={formData.totalHours}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">End Time - Start Time</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportModal;
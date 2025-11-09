import React, { useState, useEffect } from 'react';
import { Calendar, Save, RefreshCw } from 'lucide-react';

interface AlternateSaturday {
  _id?: string;
  month: number;
  year: number;
  workingSaturdays: number[]; // Array of Saturday numbers (1-5) that are working days
  createdAt?: string;
  updatedAt?: string;
}

const AlternateSaturday: React.FC = () => {
  const [alternateSaturdays, setAlternateSaturdays] = useState<AlternateSaturday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchAlternateSaturdays();
  }, []);

  const fetchAlternateSaturdays = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/alternate-saturdays`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlternateSaturdays(data.alternateSaturdays || []);
      } else {
        setError('Failed to fetch alternate Saturdays');
      }
    } catch (err) {
      setError('Error fetching alternate Saturdays');
    } finally {
      setLoading(false);
    }
  };

  const getSaturdaysInMonth = (month: number, year: number): Date[] => {
    const saturdays: Date[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      if (date.getDay() === 6) { // Saturday
        saturdays.push(new Date(date));
      }
    }

    return saturdays;
  };

  const getOrdinalSuffix = (num: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = num % 100;
    return suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  };

  const handleSaturdayChange = (month: number, year: number, saturdayIndex: number, checked: boolean) => {
    const existingIndex = alternateSaturdays.findIndex(
      item => item.month === month && item.year === year
    );

    let updatedWorkingSaturdays: number[] = [];

    if (existingIndex >= 0) {
      updatedWorkingSaturdays = [...(alternateSaturdays[existingIndex].workingSaturdays || [])];
    }

    if (checked) {
      // When checking a Saturday
      if (saturdayIndex % 2 === 1) { // Odd Saturday (1st, 3rd, 5th)
        // Select all odd Saturdays and deselect even ones
        updatedWorkingSaturdays = [1, 3, 5].filter(num => num <= getSaturdaysInMonth(month, year).length);
      } else { // Even Saturday (2nd, 4th)
        // Select all even Saturdays and deselect odd ones
        updatedWorkingSaturdays = [2, 4].filter(num => num <= getSaturdaysInMonth(month, year).length);
      }
    } else {
      // When unchecking a Saturday
      if (saturdayIndex % 2 === 1) { // Unchecking odd Saturday
        // Deselect all odd Saturdays and select even ones
        updatedWorkingSaturdays = [2, 4].filter(num => num <= getSaturdaysInMonth(month, year).length);
      } else { // Unchecking even Saturday
        // Deselect all even Saturdays and select odd ones
        updatedWorkingSaturdays = [1, 3, 5].filter(num => num <= getSaturdaysInMonth(month, year).length);
      }
    }

    // Update or create entry
    if (existingIndex >= 0) {
      const updated = [...alternateSaturdays];
      updated[existingIndex].workingSaturdays = updatedWorkingSaturdays;
      setAlternateSaturdays(updated);
    } else {
      const newEntry: AlternateSaturday = {
        month,
        year,
        workingSaturdays: updatedWorkingSaturdays
      };
      setAlternateSaturdays([...alternateSaturdays, newEntry]);
    }
  };

  const saveAlternateSaturdays = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/alternate-saturdays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ alternateSaturdays })
      });

      if (response.ok) {
        setSuccess('Alternate Saturdays saved successfully!');
        await fetchAlternateSaturdays(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save alternate Saturdays');
      }
    } catch (err) {
      setError('Error saving alternate Saturdays');
    } finally {
      setSaving(false);
    }
  };

  const getWorkingSaturdays = (month: number, year: number): number[] => {
    const entry = alternateSaturdays.find(item => item.month === month && item.year === year);
    return entry?.workingSaturdays || [];
  };

  const isSaturdaySelected = (month: number, year: number, saturdayIndex: number): boolean => {
    const workingSaturdays = getWorkingSaturdays(month, year);
    return workingSaturdays.includes(saturdayIndex);
  };

  const generateMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const month = ((currentMonth - 1 + i) % 12) + 1;
      const year = currentYear + Math.floor((currentMonth - 1 + i) / 12);
      months.push({ month, year });
    }
    return months;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Alternate Saturday Management</h2>
        </div>
        <button
          onClick={fetchAlternateSaturdays}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Smart Alternating Pattern System</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Auto-Selection Logic:</strong> Selecting any odd Saturday (1st, 3rd, 5th) will automatically select all odd Saturdays and deselect even ones.</p>
            <p><strong>Auto-Selection Logic:</strong> Selecting any even Saturday (2nd, 4th) will automatically select all even Saturdays and deselect odd ones.</p>
            <p><strong>Reverse Logic:</strong> Unselecting any Saturday will automatically toggle the entire pattern to the opposite set.</p>
            <p className="mt-2">Selected Saturdays will be marked as "(Working Day)" and the rest will be holidays.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generateMonths().map(({ month, year }) => {
          const saturdays = getSaturdaysInMonth(month, year);

          return (
            <div key={`${year}-${month}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>

              <div className="space-y-2">
                {saturdays.map((saturday, index) => {
                  const saturdayNumber = index + 1;
                  const isSelected = isSaturdaySelected(month, year, saturdayNumber);

                  return (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSaturdayChange(month, year, saturdayNumber, e.target.checked)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${isSelected ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
                        {saturdayNumber}{getOrdinalSuffix(saturdayNumber)} Saturday ({saturday.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })})
                        {isSelected && <span className="text-xs text-blue-500 ml-1">(Working Day)</span>}
                      </span>
                    </label>
                  );
                })}

                {saturdays.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No Saturdays in this month</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveAlternateSaturdays}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AlternateSaturday;
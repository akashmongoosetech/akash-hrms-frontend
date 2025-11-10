import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Saturday {
  _id: string;
  date: string;
  isWeekend: boolean;
  year: number;
  month: number;
}

export default function SaturdaySetting() {
  const [state, setState] = useState({
    selectedYear: new Date().getFullYear(),
    toggle: false,
    checkedDates: {} as { [key: string]: { [key: string]: boolean } },
    databaseCheckedDates: {} as { [key: string]: { [key: string]: boolean } },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const role = localStorage.getItem('role');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    fetchSavedSaturdays();
  }, [state.selectedYear]);

  const getAllSaturdaysInYear = () => {
    const saturdays = [];
    const date = new Date(Date.UTC(state.selectedYear, 0, 1)); // Use UTC
    while (date.getUTCFullYear() === state.selectedYear) {
      if (date.getUTCDay() === 6) { // Use UTC day
        saturdays.push(new Date(date));
      }
      date.setUTCDate(date.getUTCDate() + 1); // Use UTC date
    }
    return saturdays;
  };
  

  const getSaturdaysInMonth = (year: number, month: number) => {
    const saturdays = [];
    const date = new Date(Date.UTC(year, month, 1)); // Use UTC
    while (date.getUTCMonth() === month) {
      if (date.getUTCDay() === 6) { // Use UTC day
        saturdays.push(new Date(date));
      }
      date.setUTCDate(date.getUTCDate() + 1); // Use UTC date
    }
    return saturdays;
  };

  const handleCheckboxChange = (clickedMonth: number, clickedDateStr: string) => {
    setState((prevState) => {
      const { toggle, selectedYear, checkedDates, databaseCheckedDates } = prevState;
      let newChecked = { ...checkedDates };
      let newDatabaseChecked = { ...databaseCheckedDates };

      if (toggle) {
        // Clear previous selections if toggle is true
        newChecked = {};
        const cleanedDbDates = removeFutureDates(databaseCheckedDates);
        newDatabaseChecked = { ...cleanedDbDates };
        const saturdays = getAllSaturdaysInYear();
        let startIndex = saturdays.findIndex(
          (date) => date.toISOString().split('T')[0] === clickedDateStr
        );

        if (startIndex !== -1) {
          for (let i = startIndex; i < saturdays.length; i += 2) {
            const date = saturdays[i];
            const dStr = date.toISOString().split('T')[0];
            const monthKey = `${selectedYear}-${date.getMonth()}`;
            if (!newChecked[monthKey]) newChecked[monthKey] = {};
            newChecked[monthKey][dStr] = true;
          }
        }
      } else {
        // If toggle is false, allow individual checkbox selection without clearing
        const monthKey = `${selectedYear}-${clickedMonth}`;
        const currentChecked = isChecked(clickedMonth, clickedDateStr);

        // Create new checked dates object
        if (!newChecked[monthKey]) {
          newChecked[monthKey] = {};
        }
        newChecked[monthKey][clickedDateStr] = !currentChecked;

        // If it was in database dates, also update there
        if (databaseCheckedDates[monthKey]?.hasOwnProperty(clickedDateStr)) {
          if (!newDatabaseChecked[monthKey]) {
            newDatabaseChecked[monthKey] = {};
          }
          newDatabaseChecked[monthKey][clickedDateStr] = !currentChecked;
        }
      }

      return { ...prevState, checkedDates: newChecked, databaseCheckedDates: newDatabaseChecked };
    });
  };

  const removeFutureDates = (datesObject: { [key: string]: { [key: string]: boolean } }) => {
    const currentDate = new Date();

    Object.keys(datesObject).forEach((yearMonthKey) => {
      const monthDates = datesObject[yearMonthKey];

      Object.keys(monthDates).forEach((dateStr) => {
        const date = new Date(dateStr);

        if (date > currentDate) {
          delete monthDates[dateStr];
        }
      });

      if (Object.keys(monthDates).length === 0) {
        delete datesObject[yearMonthKey];
      }
    });

    return datesObject;
  };

  const isChecked = (month: number, dateStr: string) => {
    const monthKey = `${state.selectedYear}-${month}`;
    const checked = state.checkedDates[monthKey]?.[dateStr];
    const dbChecked = state.databaseCheckedDates[monthKey]?.[dateStr];
    return checked !== undefined ? checked : (dbChecked !== undefined ? dbChecked : false);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setState(prev => ({ ...prev, selectedYear: newYear }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, toggle: e.target.checked }));
  };

  const fetchSavedSaturdays = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/saturdays?year=${state.selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newDatabaseCheckedDates: { [key: string]: { [key: string]: boolean } } = {};

        data.forEach((saturday: any) => {
          const dateStr = saturday.date.split('T')[0]; // Get YYYY-MM-DD part
          // Use UTC to avoid timezone issues
          const date = new Date(dateStr + 'T00:00:00Z'); // Use UTC time
          const month = date.getUTCMonth(); // Use UTC month
          const monthKey = `${state.selectedYear}-${month}`;

          if (!newDatabaseCheckedDates[monthKey]) {
            newDatabaseCheckedDates[monthKey] = {};
          }
          newDatabaseCheckedDates[monthKey][dateStr] = saturday.isWeekend;
        });

        setState(prev => ({ ...prev, databaseCheckedDates: newDatabaseCheckedDates }));
      } else {
        console.error('Failed to fetch Saturdays');
        setState(prev => ({ ...prev, databaseCheckedDates: {} }));
      }
    } catch (error) {
      console.error('Error fetching Saturdays:', error);
      setState(prev => ({ ...prev, databaseCheckedDates: {} }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const allSaturdays = getAllSaturdaysInYear();

      const formatDate = (date: string) => {
        // date is already in YYYY-MM-DD format, return as is
        return date;
      };

      const saturdaysToSave = allSaturdays.reduce((acc: any, date) => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const month = date.getMonth();
        const year = date.getFullYear();
        const isWeekend = isChecked(month, dateStr);
        const monthKey = `${year}-${month}`;

        if (!acc[monthKey]) {
          acc[monthKey] = { year, month, dates: [] };
        }
        acc[monthKey].dates.push({ date: dateStr, isWeekend });

        return acc;
      }, {});

      const mergedData = Object.values(saturdaysToSave);

      if (mergedData.length === 0) {
        toast.error('Please select at least one Saturday.');
        return;
      }

      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/saturdays/bulk-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            saturdays: mergedData,
          })
        }
      );

      if (response.ok) {
        toast.success('Saturdays updated successfully.');
        fetchSavedSaturdays();
        setState(prev => ({ ...prev, checkedDates: {} }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update Saturdays.');
      }
    } catch (error) {
      console.error('Error saving Saturdays:', error);
      toast.error('Network error while saving Saturdays.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Calendar className="h-6 w-6" />
          <span>Saturday Settings</span>
        </h2>
        {role !== 'Employee' && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Submit'}</span>
          </button>
        )}
      </div>

      {/* Year Selector and Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={state.selectedYear}
                onChange={handleYearChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <label className="custom-switch mb-0">
              <span className="custom-switch-description mr-2">
                Select Alternate Saturdays
              </span>
              <input
                className="custom-switch-input"
                type="checkbox"
                checked={state.toggle}
                onChange={handleToggleChange}
              />
              <span className="custom-switch-indicator"></span>
            </label>
          </div>
        </div>

        {/* Monthly Saturday selection UI */}
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const monthName = new Date(state.selectedYear, monthIndex).toLocaleString('default', { month: 'long' });
            const saturdays = getSaturdaysInMonth(state.selectedYear, monthIndex);
            const currentDate = new Date();

            return (
              <div className="w-1/4 mb-4" key={monthIndex}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{monthName}</h5>
                    <ul className="list-unstyled">
                      {saturdays.map((date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isPast = date < new Date(); // Current date comparison
                        const dayOfMonth = date.getUTCDate(); // Use UTC date for display

                        return (
                          <li key={dateStr}>
                            <label className="custom-control custom-checkbox">
                              <input
                                className="custom-control-input"
                                type="checkbox"
                                checked={isChecked(monthIndex, dateStr)}
                                onChange={() => handleCheckboxChange(monthIndex, dateStr)}
                              /> &nbsp;
                              <span className="custom-control-label">
                                {dayOfMonth} {monthName} {/* Use UTC date */}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
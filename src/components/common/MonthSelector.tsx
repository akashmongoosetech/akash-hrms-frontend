import React from 'react';

interface MonthSelectorProps {
  selectedMonth: number;
  handleMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  labelClass?: string;
  selectClass?: string;
}

export default function MonthSelector({
  selectedMonth,
  handleMonthChange,
  labelClass = '',
  selectClass = '',
}: MonthSelectorProps) {
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="flex items-center">
      <label className={`mr-2 ${labelClass}`}>Month:</label>
      <select
        value={selectedMonth}
        onChange={handleMonthChange}
        className={`form-select ${selectClass}`}
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </div>
  );
}
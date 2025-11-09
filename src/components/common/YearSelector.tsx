import React from 'react';

interface YearSelectorProps {
  selectedYear: number;
  handleYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  labelClass?: string;
  selectClass?: string;
}

export default function YearSelector({
  selectedYear,
  handleYearChange,
  labelClass = '',
  selectClass = '',
}: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex items-center">
      <label className={`mr-2 ${labelClass}`}>Year:</label>
      <select
        value={selectedYear}
        onChange={handleYearChange}
        className={`form-select ${selectClass}`}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
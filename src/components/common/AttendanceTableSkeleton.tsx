import React from 'react';

interface AttendanceTableSkeletonProps {
  employeeCount: number;
  dayCount: number;
}

export default function AttendanceTableSkeleton({
  employeeCount,
  dayCount,
}: AttendanceTableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-bordered table-sm text-center">
        <thead>
          <tr>
            <th className="p-4">
              <div className="skeleton-loader w-20 h-4"></div>
            </th>
            {Array.from({ length: employeeCount }).map((_, index) => (
              <th key={index} className="p-4">
                <div className="skeleton-loader w-16 h-4"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: dayCount }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="p-4">
                <div className="skeleton-loader w-24 h-4"></div>
              </td>
              {Array.from({ length: employeeCount }).map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <div className="skeleton-loader w-12 h-4"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
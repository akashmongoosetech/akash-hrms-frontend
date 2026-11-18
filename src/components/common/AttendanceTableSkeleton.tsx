import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
      <Table className="table table-bordered table-sm text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="p-4">
              <div className="skeleton-loader w-20 h-4"></div>
            </TableHead>
            {Array.from({ length: employeeCount }).map((_, index) => (
              <TableHead key={index} className="p-4">
                <div className="skeleton-loader w-16 h-4"></div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: dayCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="p-4">
                <div className="skeleton-loader w-24 h-4"></div>
              </TableCell>
              {Array.from({ length: employeeCount }).map((_, colIndex) => (
                <TableCell key={colIndex} className="p-4">
                  <div className="skeleton-loader w-12 h-4"></div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
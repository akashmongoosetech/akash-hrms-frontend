import React, { useState, useEffect } from 'react';
import AlertMessages from '../../components/common/AlertMessages';
import YearSelector from '../../components/common/YearSelector';
import MonthSelector from '../../components/common/MonthSelector';
import AttendanceTableSkeleton from '../../components/common/AttendanceTableSkeleton';
import moment from 'moment';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

interface Report {
  _id: string;
  employee: Employee;
  date: string;
  workingHours: string;
}

interface Leave {
  _id: string;
  employee: string;
  startDate: string;
  endDate: string;
  is_half_day?: string | number;
  status: string;
}

interface Saturday {
  _id: string;
  date: string;
  isWeekend: boolean;
  year: number;
  month: number;
}

interface Holiday {
  _id: string;
  name: string;
  date: string;
}

const Statistics: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const [leavesData, setLeavesData] = useState<any[]>([]);
  const [alternateSaturdayData, setAlternateSaturdayData] = useState<string[]>([]);
  const [holidaysData, setHolidaysData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchEmployees();
    fetchReports();
    fetchLeaves();
    fetchAlternateSaturdays();
    fetchHolidays();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?role=Employee&status=Active&statistics_visibility_status=statistics_visibility_status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        // Handle redirect to login if needed
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setEmployeesData(data.users || []);
      } else {
        setErrorMessage('Failed to fetch employees data');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch employees data');
      setShowError(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async (year: number = selectedYear, month: number = selectedMonth) => {
    try {
      const firstDay = moment({ year, month: month - 1 }).startOf('month');
      const lastDay = moment({ year, month: month - 1 }).endOf('month');
      const fromDate = firstDay.format('YYYY-MM-DD');
      const toDate = lastDay.format('YYYY-MM-DD');

      const response = await fetch(`${API_BASE_URL}/reports?fromDate=${fromDate}&toDate=${toDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setReportsData(data.reports || []);
      } else {
        setErrorMessage('Failed to fetch reports data');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch reports data');
      setShowError(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leaves?status=approved`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log(data, 'sdgjh')
        const approvedLeaves = (data.leaves || []).filter((leave: any) => leave.status === 'Approved').map((leave: any) => ({
          ...leave,
          employee_id: leave.employee._id,
          from_date: leave.startDate.split('T')[0],
          to_date: leave.endDate.split('T')[0]
        }));
        setLeavesData(approvedLeaves);
      } else {
        setErrorMessage('Failed to fetch leaves data');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch leaves data');
      setShowError(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlternateSaturdays = async (year: number = selectedYear, month: number = selectedMonth) => {
    try {
      const response = await fetch(`${API_BASE_URL}/saturdays?year=${year}&month=${month - 1}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log(data, 'altSaturday')
        if (Array.isArray(data)) {
          const alternateSaturdays = data.filter((s: Saturday) => s.isWeekend).map((s: Saturday) => s.date.split('T')[0]);
          setAlternateSaturdayData(alternateSaturdays);
        } else {
          setAlternateSaturdayData([]);
        }
      } else {
        setAlternateSaturdayData([]);
      }
    } catch (error) {
      console.error('Failed to fetch saved Saturdays:', error);
      setAlternateSaturdayData([]);
    }
  };

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/holidays`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const holidayDates = data.holidays.map((item: Holiday) => item.date.split('T')[0]); // Using date field directly
        setHolidaysData(holidayDates);
      } else {
        setErrorMessage('Failed to fetch holidays data');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch holidays data');
      setShowError(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    fetchAlternateSaturdays(year, selectedMonth);
    fetchReports(year, selectedMonth);
    fetchEmployees();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    fetchAlternateSaturdays(selectedYear, month);
    fetchReports(selectedYear, month);
    fetchEmployees();
  };

  const getAllDatesOfMonth = (year: number, month: number) => {
    const date = new Date(year, month - 1, 1);
    const days = [];

    while (date.getMonth() === month - 1) {
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      const day = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const yearValue = date.getFullYear();

      days.push({
        display: `${weekday}, ${day} ${monthName}`,
        key: `${yearValue}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
      });

      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const prepareAttendanceFromReports = () => {
    const attendanceByDate: { [key: string]: { [key: string]: string } } = {};

    reportsData.forEach(report => {
      const date = report.date;
      if (!attendanceByDate[date]) {
        attendanceByDate[date] = {};
      }
      attendanceByDate[date][report.employee._id] = report.workingHours || '';
    });

    return attendanceByDate;
  };

  const initalizeEmployeeData = (employeesData: Employee[]) => {
    const counts: { [key: string]: number } = {};
    employeesData.forEach(employee => {
      counts[employee._id] = 0;
    });

    return counts;
  };

  const calculateWorking = (hours: number) => {
    if (hours >= 4 && hours < 8) {
      return 0.5;
    } else if (hours >= 8) {
      return 1;
    }

    return 0;
  };

  const monthDays = getAllDatesOfMonth(selectedYear, selectedMonth);
  const attendanceByDate = prepareAttendanceFromReports();
  const leaveCounts = initalizeEmployeeData(employeesData);
  const extraWorkingCounts = initalizeEmployeeData(employeesData);

  return (
    <>
      <AlertMessages
        showSuccess={showSuccess}
        successMessage={successMessage}
        showError={showError}
        errorMessage={errorMessage}
        setShowSuccess={setShowSuccess}
        setShowError={setShowError}
      />

      <div className="section-body mt-3">
        <div className="container-fluid">
          {/* Filters */}
          <div className="flex flex-wrap items-center mb-3">
            <div className="flex items-center mr-3 mb-2">
              <YearSelector
                selectedYear={selectedYear}
                handleYearChange={handleYearChange}
                labelClass="mr-2 mb-0"
                selectClass="custom-select w-auto"
              />
            </div>

            <div className="flex items-center mb-2">
              <MonthSelector
                selectedMonth={selectedMonth}
                handleMonthChange={handleMonthChange}
                labelClass="mr-2 mb-0"
                selectClass="custom-select w-auto"
              />
            </div>

            <div className="legend-container flex ml-auto gap-2">
              <span className="leave bg-red-500 p-2 rounded text-white">Leave</span>
              <span className="halfDay bg-blue-500 p-2 rounded text-white">Half day</span>
              <span className="extraWorking bg-green-500 p-2 rounded text-white">Extra working</span>
              <span className="holiday bg-red-500 p-2 rounded text-white">Holiday</span>
              <span className="alternateHoliday bg-yellow-500 p-2 rounded text-white">Weekend</span>
            </div>
          </div>

          {isLoading ? (
            <AttendanceTableSkeleton
              employeeCount={employeesData.length || 5}
              dayCount={monthDays.length || 10}
            />
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <table className="table table-bordered table-sm text-center min-w-full">
                <thead className="bg-gray-400">
                  <tr>
                    <th className="px-4 py-3 !bg-gray-300">Date</th>
                    {employeesData.map((employee) => (
                      <th className="px-4 py-3 !bg-gray-300" key={employee._id}>{employee.firstName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthDays.map((day, rowIndex) => {
                    const dayAttendance = attendanceByDate[day.key] || {};
                    const isAlternateSaturday = alternateSaturdayData.includes(day.key);
                    const dateObj = new Date(day.key);
                    const isSunday = dateObj.getDay() === 0;
                    const isHoliday = holidaysData.includes(day.key);

                    // Highlight entire row if Sunday or alternate Saturday
                    const highlightRow = isAlternateSaturday || isSunday || isHoliday;

                    return (
                      <tr key={rowIndex} className={highlightRow ? (isHoliday ? '!bg-orange-200' : '!bg-orange-200') : ''}>
                        <td className="bg-green-200 px-4 py-2 min-w-48">{day.display}</td>
                        {employeesData.map((employee, colIndex) => {
                          const value = dayAttendance[employee._id] || '';
                          const isMissingReport = value === '';

                          let hoursNumber = 0;
                          let cellStyle = '';

                          const matchingLeave = leavesData.find((leave) =>
                            leave.employee_id === employee._id &&
                            day.key >= leave.from_date &&
                            day.key <= leave.to_date
                          );
                          const isOnLeave = !!matchingLeave;
                          const isHalfDayLeave = matchingLeave?.is_half_day === '1' || matchingLeave?.is_half_day === 1;
                          const workedOnSpecialDay = !isMissingReport && (
                            isSunday || isAlternateSaturday || isHoliday
                          );

                          if (!isMissingReport && value.includes(':')) {
                            const parts = value.split(':').map(Number);

                            hoursNumber = parts[0] + parts[1] / 60;

                            if (workedOnSpecialDay) {
                              cellStyle = '!bg-green-500 !text-white'; // Green for working on a special day
                              extraWorkingCounts[employee._id] = extraWorkingCounts[employee._id] + (hoursNumber >= 8 ? 1 : 0.5);
                            }
                          }
                          const calculateDay = calculateWorking(hoursNumber);
                          const today = new Date();
                          const currentDate = new Date(day.key);
                          today.setHours(0, 0, 0, 0);
                          currentDate.setHours(0, 0, 0, 0);

                          if (isOnLeave) {
                            if (currentDate >= today && isMissingReport) {
                              if (isHalfDayLeave) {
                                cellStyle = '!bg-cyan-400 !text-black'; // Cyan for half-day
                                leaveCounts[employee._id] = leaveCounts[employee._id] + 0.5;
                              } else {
                                cellStyle = '!bg-red-500 !text-white'; // Red for full-day
                                leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                              }
                            } else if (isMissingReport) {
                              cellStyle = '!bg-red-500 !text-white'; // Red for full-day
                              leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                            } else {
                              if (calculateDay === 0.5) {
                                cellStyle = '!bg-cyan-400 !text-black'; // Cyan for half-day
                                leaveCounts[employee._id] = leaveCounts[employee._id] + calculateDay;
                              } else if (calculateDay === 0) {
                                cellStyle = '!bg-red-500 !text-white'; // Red for full-day
                                leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                              }
                            }
                          } else if (isMissingReport && !highlightRow && currentDate < today) {
                            cellStyle = '!bg-red-500 !text-white'; // Red for full-day
                            leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                          } else if (!isMissingReport) {
                            if (calculateDay === 0.5 && !workedOnSpecialDay) {
                              cellStyle = '!bg-cyan-400 !text-black'; // Cyan for half-day
                              leaveCounts[employee._id] = leaveCounts[employee._id] + calculateDay;
                            } else if (calculateDay === 0 && !workedOnSpecialDay) {
                              cellStyle = '!bg-red-500 !text-white'; // Red for full-day
                              leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                            }
                          }

                          let splitValue = dayAttendance[employee._id] || '';
                          if (splitValue && splitValue.split(':').length === 3) {
                            splitValue = splitValue.split(':').slice(0, 2).join(':');

                            // Remove the leading 0 from the hour part (if it exists)
                            let parts = splitValue.split(':');
                            if (parts[0].startsWith('0')) {
                              parts[0] = parts[0].slice(1);
                            }
                            splitValue = parts.join(':');
                          }

                          if (isAlternateSaturday && !isOnLeave) {
                            cellStyle = '!bg-orange-200';
                          }

                          return (
                            <td key={colIndex} className={`px-2 py-1 ${cellStyle}`}>
                              {splitValue}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Summary Row 1: Leave Taken */}
                  <tr className="font-bold">
                    <td className="!bg-gray-400 !text-black px-4 py-2">Leave Taken(-)</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const total = Math.round((fullLeaves) * 10) / 10; // Round to 1 decimal
                      return <td key={emp._id} className="px-2 py-1">{total}</td>;
                    })}
                  </tr>

                  {/* Summary Row 2: Extra Working Days */}
                  <tr className="font-bold">
                    <td className="!bg-green-400 px-4 py-2">Extra Working Days(+)</td>
                    {employeesData.map((emp) => (
                      <td key={emp._id} className="px-2 py-1">{extraWorkingCounts[emp._id] || 0}</td>
                    ))}
                  </tr>

                  {/* Summary Row 3: Paid Leaves */}
                  <tr className="font-bold">
                    <td className="!bg-green-400 px-4 py-2">Paid Leave(+)</td>
                    {employeesData.map((emp) => (
                      <td key={emp._id} className="px-2 py-1">1</td>
                    ))}
                  </tr>

                  {/* Summary Row 4: Deduction/Paid */}
                  <tr className="font-bold">
                    <td className="px-4 py-2 !bg-blue-400 !text-white">Deduction/Paid</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                      const totalDeduction = (extraWorkCounts + 1) - (fullLeaves); // Subtract 1 paid leave
                      return (
                        <td key={emp._id} className="px-2 py-1">{totalDeduction}</td>
                      );
                    })}
                  </tr>

                  {/* Summary Row 5: No Of Days Salary To Be Credited */}
                  <tr className="font-bold">
                    <td className="px-4 py-2 !bg-red-400 !text-white">No Of Days Salary To Be Credited</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                      const deduction = (extraWorkCounts + 1) - (fullLeaves);
                      const salaryDays = deduction + 30;
                      return (
                        <td key={emp._id} className="px-2 py-1">{salaryDays}</td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Statistics;
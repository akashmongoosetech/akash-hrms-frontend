import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import YearSelector from '../../components/common/YearSelector';
import MonthSelector from '../../components/common/MonthSelector';
import AlertMessages from '../../components/common/AlertMessages';
import AttendanceTableSkeleton from '../../components/common/AttendanceTableSkeleton';
import moment from 'moment';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Report {
  employee: string;
  createdAt: string;
  todaysWorkingHours: string;
}

interface Leave {
  employee: {
    _id: string;
  };
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
}

export default function StatisticsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const [leavesData, setLeavesData] = useState<Leave[]>([]);
  const [alternateSaturdayData, setAlternateSaturdayData] = useState<string[]>([]);
  const [holidaysData, setHolidaysData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getEmployees();
    getReports();
    getLeaves();
    getAlternateSaturdays();
    getHolidays();
  }, []);

  const getEmployees = async () => {
    try {
      const response = await API.get('/users');
      if (response.data.users) {
        setEmployeesData(response.data.users);
        setIsLoading(false);
      } else {
        setErrorMessage('Failed to fetch employees data');
        setShowError(true);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch employees data');
      setShowError(true);
      setIsLoading(false);
      console.error(err);
    }
  };

  const getReports = async () => {
    const firstDay = moment({ year: selectedYear, month: selectedMonth - 1 }).startOf('month');
    const lastDay = moment({ year: selectedYear, month: selectedMonth - 1 }).endOf('month');
    const fromDate = firstDay.format('YYYY-MM-DD');
    const toDate = lastDay.format('YYYY-MM-DD');

    try {
      const response = await API.get('/reports', {
        params: {
          from_date: fromDate,
          to_date: toDate
        }
      });
      if (response.data.reports) {
        setReportsData(response.data.reports);
        setIsLoading(false);
      } else {
        setErrorMessage('Failed to fetch reports data');
        setShowError(true);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch reports data');
      setShowError(true);
      setIsLoading(false);
      console.error(err);
    }
  };

  const getLeaves = async () => {
    try {
      const response = await API.get('/leaves');
      if (response.data.leaves) {
        // Filter only approved leaves
        const approvedLeaves = response.data.leaves.filter((leave: any) => leave.status === 'Approved');
        setLeavesData(approvedLeaves);
        setIsLoading(false);
      } else {
        setErrorMessage('Failed to fetch leaves data');
        setShowError(true);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch leaves data');
      setShowError(true);
      setIsLoading(false);
      console.error(err);
    }
  };

  const getAlternateSaturdays = async () => {
    try {
      const response = await API.get(`/alternate-saturdays/${selectedMonth}/${selectedYear}`);

      if (response.data) {
        // The response structure might be different, need to adapt based on actual API response
        // For now, assuming it returns the alternate saturday data
        setAlternateSaturdayData(response.data.workingSaturdays || []);
      } else {
        setAlternateSaturdayData([]);
      }
    } catch (error) {
      console.error("Failed to fetch saved Saturdays:", error);
      setAlternateSaturdayData([]);
    }
  };

  const getHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await API.get('/events');
      if (response.data) {
        const holidayDates = response.data.filter((item: any) => item.type === 'holiday').map((item: any) => item.date);
        setHolidaysData(holidayDates);
        setIsLoading(false);
      } else {
        setErrorMessage('Failed to fetch holidays data');
        setShowError(true);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch holidays data');
      setShowError(true);
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    getAlternateSaturdays();
    getEmployees();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    getAlternateSaturdays();
    getReports();
    getEmployees();
  };

  const getAllDatesOfMonth = (year: number, month: number) => {
    const date = new Date(year, month - 1, 1);
    const days = [];

    while (date.getMonth() === month - 1) {
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      const day = date.getDate();
      const monthName = date.toLocaleDateString("en-US", { month: "long" });
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
      const date = report.createdAt.split('T')[0];
      if (!attendanceByDate[date]) {
        attendanceByDate[date] = {};
      }
      attendanceByDate[date][report.employee] = report.todaysWorkingHours || "";
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">HR</div>
            <div>
              <h1 className="text-lg font-semibold">HRMS - Statistics</h1>
              <p className="text-sm text-gray-500">Employee Attendance Statistics</p>
            </div>
          </div>
        </header>

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
                <div className="d-flex flex-wrap align-items-center mb-3">
                  <div className="d-flex align-items-center mr-3 mb-2">
                    <YearSelector
                      selectedYear={selectedYear}
                      handleYearChange={handleYearChange}
                      labelClass='mr-2 mb-0'
                      selectClass='custom-select w-auto'
                    />
                  </div>
      
                  <div className="d-flex align-items-center mb-2">
                    <MonthSelector
                      selectedMonth={selectedMonth}
                      handleMonthChange={handleMonthChange}
                      labelClass="mr-2 mb-0"
                      selectClass="custom-select w-auto"
                    />
                  </div>
      
                  <div className="legend-container ml-auto">
                    <span className="leave">Leave</span>
                    <span className="halfDay">Half day</span>
                    <span className="extraWorking">Extra working</span>
                    <span className="holiday">Holiday</span>
                    <span className="alternateHoliday">Weekend</span>
                  </div>
                </div>
              </div>
            </div>

          {isLoading ? (
            <AttendanceTableSkeleton
              employeeCount={employeesData.length || 5}
              dayCount={monthDays.length || 10}
            />
          ) : (
            <div style={{ overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#a2c4c9 #ffffff', scrollBehavior: 'smooth' }}>
              <table className="table table-bordered table-sm text-center" style={{ minWidth: '600px' }}>
                <thead style={{ backgroundColor: "#a2c4c9" }}>
                  <tr>
                    <th style={{ padding: "14px" }}>Date</th>
                    {employeesData.map((employee) => (
                      <th style={{ padding: "14px" }} key={employee._id}>{employee.firstName}</th>
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
                      <tr key={rowIndex} style={highlightRow ? { backgroundColor: isHoliday ? '#FAAA69' : '#fff2cc' } : {}}>
                        <td style={{ backgroundColor: "#b7e1cd", minWidth: "180px" }}>{day.display}</td>
                        {employeesData.map((employee, colIndex) => {
                          const value = dayAttendance[employee._id] || "";
                          const isMissingReport = value === "";

                          let hoursNumber = 0;
                          let cellStyle = {};

                          const matchingLeave = leavesData.find((leave) =>
                            leave.employee._id === employee._id &&
                            day.key >= leave.startDate &&
                            day.key <= leave.endDate
                          );
                          const isOnLeave = !!matchingLeave;
                          const isHalfDayLeave = matchingLeave?.isHalfDay || false;
                          const workedOnSpecialDay = !isMissingReport && (
                            isSunday || isAlternateSaturday || isHoliday
                          );

                          if (!isMissingReport && value.includes(":")) {
                            const parts = value.split(":").map(Number);

                            hoursNumber = parts[0] + parts[1] / 60;

                            if (workedOnSpecialDay) {
                              cellStyle = { backgroundColor: "#28a745", color: "#000" };
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
                                cellStyle = { backgroundColor: "#00ffff", color: "#000" };
                                leaveCounts[employee._id] = leaveCounts[employee._id] + 0.5;
                              } else {
                                cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                                leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                              }
                            } else if (isMissingReport) {
                              cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                              leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                            } else {
                              if (calculateDay === 0.5) {
                                cellStyle = { backgroundColor: "#00ffff", color: "#000" };
                                leaveCounts[employee._id] = leaveCounts[employee._id] + calculateDay;
                              } else if (calculateDay === 0) {
                                cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                                leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                              }
                            }
                          } else if (isMissingReport && !highlightRow && currentDate < today) {
                            cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                            leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                          } else if (!isMissingReport) {
                            if (calculateDay === 0.5 && !workedOnSpecialDay) {
                              cellStyle = { backgroundColor: "#00ffff", color: "#000" };
                              leaveCounts[employee._id] = leaveCounts[employee._id] + calculateDay;
                            } else if (calculateDay === 0 && !workedOnSpecialDay) {
                              cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                              leaveCounts[employee._id] = leaveCounts[employee._id] + 1;
                            }
                          }

                          let splitValue = dayAttendance[employee._id] || "";
                          if (splitValue && splitValue.split(":").length === 3) {
                            splitValue = splitValue.split(":").slice(0, 2).join(":");

                            // Remove the leading 0 from the hour part (if it exists)
                            let parts = splitValue.split(":");
                            if (parts[0].startsWith('0')) {
                              parts[0] = parts[0].slice(1);
                            }
                            splitValue = parts.join(":");
                          }

                          return (
                            <td key={colIndex} style={cellStyle}>
                              {splitValue}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Summary Row 1: Leave Taken */}
                  <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ backgroundColor: '#999999' }}>Leave Taken(-)</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const total = Math.round((fullLeaves) * 10) / 10;
                      return <td key={emp._id}>{total}</td>;
                    })}
                  </tr>

                  {/* Summary Row 2: Extra Working Days */}
                  <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ backgroundColor: '#b7e1cd' }}>Extra Working Days(+)</td>
                    {employeesData.map((emp) => (
                      <td key={emp._id}>{extraWorkingCounts[emp._id] || 0}</td>
                    ))}
                  </tr>

                  {/* Summary Row 3: Paid Leaves */}
                  <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ backgroundColor: '#b7e1cd' }}>Paid Leave(+)</td>
                    {employeesData.map((emp) => (
                      <td key={emp._id}>1</td>
                    ))}
                  </tr>

                  {/* Summary Row 4: Deduction/Paid */}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#a4c2f4' }}>
                    <td>Deduction/Paid</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                      const totalDeduction = (extraWorkCounts + 1) - (fullLeaves);
                      return (
                        <td key={emp._id}>{totalDeduction}</td>
                      );
                    })}
                  </tr>

                  {/* Summary Row 5: No Of Days Salary To Be Credited */}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f4cccc' }}>
                    <td>No Of Days Salary To Be Credited</td>
                    {employeesData.map((emp) => {
                      const fullLeaves = leaveCounts[emp._id] || 0;
                      const extraWorkCounts = extraWorkingCounts[emp._id] || 0;
                      const deduction = (extraWorkCounts + 1) - (fullLeaves);
                      const salaryDays = deduction + 30;
                      return (
                        <td key={emp._id}>{salaryDays}</td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
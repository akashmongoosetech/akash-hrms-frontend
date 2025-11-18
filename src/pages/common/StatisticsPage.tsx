import React, { useState, useEffect, useMemo } from "react";
import API from "../../utils/api";
import YearSelector from "../../components/common/YearSelector";
import MonthSelector from "../../components/common/MonthSelector";
import AlertMessages from "../../components/common/AlertMessages";
import AttendanceTableSkeleton from "../../components/common/AttendanceTableSkeleton";
import moment from "moment";

export default function StatisticsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [employees, setEmployees] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [alternateSaturdays, setAlternateSaturdays] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ---------------------------------------------
   * Fetching Functions
   --------------------------------------------- */

  const getEmployees = async () => {
    try {
      const res = await API.get("/users");
      const filtered = res.data.users?.filter((u: any) => u.role === "Employee") || [];
      setEmployees(filtered);
    } catch {
      setShowError(true);
      setErrorMessage("Failed to load employees");
    }
  };

  const getReports = async () => {
    const start = moment({ year: selectedYear, month: selectedMonth - 1 }).startOf("month").format("YYYY-MM-DD");
    const end = moment({ year: selectedYear, month: selectedMonth - 1 }).endOf("month").format("YYYY-MM-DD");

    try {
      const res = await API.get("/reports", { params: { fromDate: start, toDate: end } });
      setReports(res.data.reports || []);
    } catch {
      setShowError(true);
      setErrorMessage("Failed to load reports");
    }
  };

  const getLeaves = async () => {
    try {
      const res = await API.get("/leaves");
      const approved = res.data.leaves.filter((l: any) => l.status === "Approved");
      setLeaves(approved);
    } catch {
      setShowError(true);
      setErrorMessage("Failed to load leaves");
    }
  };

  const getHolidays = async () => {
    try {
      const res = await API.get("/events");
      const list = res.data.filter((e: any) => e.type === "holiday").map((h: any) => h.date instanceof Date ? h.date.toISOString().split('T')[0] : h.date);
      setHolidays(list);
    } catch {
      setShowError(true);
      setErrorMessage("Failed to load holidays");
    }
  };

  const getAlternateSaturdays = async () => {
    try {
      const res = await API.get("/saturdays", {
        params: { year: selectedYear, month: selectedMonth },
      });

      const parsed = Array.isArray(res.data)
        ? res.data.filter((item: any) => item.isWeekend).map((item: any) => new Date(item.date).toISOString().split('T')[0])
        : [];

      setAlternateSaturdays(parsed);
    } catch {
      setAlternateSaturdays([]);
    }
  };

  /* ---------------------------------------------
   * Initialize load
   --------------------------------------------- */

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getEmployees(), getReports(), getLeaves(), getHolidays(), getAlternateSaturdays()])
      .finally(() => setIsLoading(false));
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
  console.log("REPORTS:", reports);
  console.log("EMPLOYEES:", employees);
}, [reports, employees]);


  /* ---------------------------------------------
   * Derived Data
   --------------------------------------------- */

  const monthDays = useMemo(() => {
    const days = [];
    const d = new Date(selectedYear, selectedMonth - 1, 1);

    while (d.getMonth() === selectedMonth - 1) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      days.push({
        key: `${yyyy}-${mm}-${dd}`,
        display: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
        }),
      });

      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [selectedYear, selectedMonth]);

  const workingDays = useMemo(() => {
    return monthDays.filter(({ key }) => {
      const day = new Date(key).getDay();
      return day !== 0 && day !== 6 && !holidays.includes(key);
    }).length;
  }, [monthDays, holidays]);

  const attendanceByDate = useMemo(() => {
    const map: any = {};

    reports.forEach((r) => {
      const date = r.date;
      if (!map[date]) map[date] = {};
      map[date][r.employee] = r.todaysWorkingHours;
    });

    return map;
  }, [reports]);

  const initializeCounts = () => {
    const map: any = {};
    employees.forEach((e) => (map[e._id] = 0));
    return map;
  };

  const leaveCounts = initializeCounts();
  const extraWorkingCounts = initializeCounts();

  const calculateWorking = (hrs: number) => (hrs >= 8 ? 1 : hrs >= 4 ? 0.5 : 0);

  /* ---------------------------------------------
   * Render
   --------------------------------------------- */

  return (
    <div className="min-h-screen p-4 flex justify-center items-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8">

        <AlertMessages
          showSuccess={showSuccess}
          showError={showError}
          successMessage={successMessage}
          errorMessage={errorMessage}
          setShowSuccess={setShowSuccess}
          setShowError={setShowError}
        />

        {/* Filters */}
        <div className="d-flex align-items-center mb-4 gap-4">
          <YearSelector selectedYear={selectedYear} handleYearChange={(e) => setSelectedYear(+e.target.value)} />
          <MonthSelector selectedMonth={selectedMonth} handleMonthChange={(e) => setSelectedMonth(+e.target.value)} />

          <div className="flex ml-auto gap-2">
            <p className="bg-red-100 text-red-800 border-red-800 border p-1 rounded">Leave</p>
            <p className="bg-blue-100 text-blue-800 border-blue-800 border p-1 rounded">Half Day</p>
            <p className="bg-green-100 text-green-800 border-green-800 border p-1 rounded">Extra Working</p>
            <p className="bg-orange-100 text-orange-800 border-orange-800 border p-1 rounded">Holiday</p>
            <p className="bg-yellow-100 text-yellow-800 border-yellow-800 border p-1 rounded">Sunday</p>
            <p className="bg-yellow-200 text-yellow-800 border-yellow-800 border p-1 rounded">Saturday</p>
          </div>
        </div>

        {isLoading ? (
          <AttendanceTableSkeleton employeeCount={employees.length} dayCount={monthDays.length} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered table-sm text-center" style={{ minWidth: 600 }}>
              <thead style={{ backgroundColor: "#a2c4c9" }}>
                <tr>
                  <th>Date</th>
                  {employees.map((e) => (
                    <th key={e._id}>{e.firstName}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {monthDays.map(({ key, display }) => {
                  const rowReports = attendanceByDate[key] || {};
                  const isSunday = new Date(key).getDay() === 0;
                  const isHoliday = holidays.includes(key);
                  const isSaturday = new Date(key).getDay() === 6;

                  const highlight = isSunday || isHoliday || isSaturday;

                  let bgColor = "";
                  if (isHoliday) bgColor = "#FAAA69";
                  else if (isSunday) bgColor = "#fff2cc";
                  else if (isSaturday) bgColor = "#ffff99";

                  return (
                    <tr
                      key={key}
                      style={
                        bgColor ? { backgroundColor: bgColor } : {}
                      }
                    >
                      <td style={{ backgroundColor: "#b7e1cd" }}>{display}</td>

                      {employees.map((emp) => {
                        const raw = rowReports[emp._id] || "";
                        let cellStyle: any = {};
                        let hours = 0;

                        const leave = leaves.find(
                          (l) =>
                            l.employee?._id === emp._id &&
                            key >= l.startDate &&
                            key <= l.endDate
                        );

                        const isMissing = raw === "";
                        const isHalfLeave = leave?.isHalfDay;

                        if (!isMissing && raw.includes(":")) {
                          const [h, m] = raw.split(":").map(Number);
                          hours = h + m / 60;

                          if (highlight) {
                            extraWorkingCounts[emp._id] += hours >= 8 ? 1 : 0.5;
                            cellStyle = { backgroundColor: "#28a745", color: "#fff" };
                          }
                        }

                        const workValue = calculateWorking(hours);
                        const today = new Date().setHours(0, 0, 0, 0);
                        const current = new Date(key).setHours(0, 0, 0, 0);

                        if (leave) {
                          if (isMissing && current >= today) {
                            if (isHalfLeave) {
                              leaveCounts[emp._id] += 0.5;
                              cellStyle = { backgroundColor: "#00ffff" };
                            } else {
                              leaveCounts[emp._id] += 1;
                              cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                            }
                          } else if (isMissing) {
                            leaveCounts[emp._id] += 1;
                            cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                          } else {
                            if (workValue === 0.5) {
                              leaveCounts[emp._id] += 0.5;
                              cellStyle = { backgroundColor: "#00ffff" };
                            } else if (workValue === 0) {
                              leaveCounts[emp._id] += 1;
                              cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                            }
                          }
                        } else if (isMissing && !highlight && current < today) {
                          leaveCounts[emp._id] += 1;
                          cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                        }

                        return <td key={emp._id} style={cellStyle}>{raw}</td>;
                      })}
                    </tr>
                  );
                })}

                {/* Summary Rows */}
                <tr>
                  <td style={{ backgroundColor: "#999" }}>Leave Taken (-)</td>
                  {employees.map((e) => (
                    <td key={e._id}>{Math.round(leaveCounts[e._id] * 10) / 10}</td>
                  ))}
                </tr>

                <tr>
                  <td style={{ backgroundColor: "#b7e1cd" }}>Extra Working (+)</td>
                  {employees.map((e) => (
                    <td key={e._id}>{extraWorkingCounts[e._id] || 0}</td>
                  ))}
                </tr>

                <tr>
                  <td style={{ backgroundColor: "#b7e1cd" }}>Paid Leave (+)</td>
                  {employees.map((e) => (
                    <td key={e._id}>1</td>
                  ))}
                </tr>

                <tr style={{ backgroundColor: "#a4c2f4" }}>
                  <td>Deduction / Paid</td>
                  {employees.map((e) => {
                    const value = extraWorkingCounts[e._id] + 1 - leaveCounts[e._id];
                    return <td key={e._id}>{value}</td>;
                  })}
                </tr>

                <tr style={{ backgroundColor: "#f4cccc" }}>
                  <td>Salary Days</td>
                  {employees.map((e) => {
                    const value = workingDays + extraWorkingCounts[e._id] + 1 - leaveCounts[e._id];
                    return <td key={e._id}>{value}</td>;
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

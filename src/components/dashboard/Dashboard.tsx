import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";
import DashboardTable from "./DashboardTable";
import EmployeeTodos from "./EmployeeTodos";
import DashboardTickets from "./DashboardTickets";
import DashboardLeaves from "./DashboardLeaves";
import TeamDashboard from "./TeamDashboard";
import DashboardActivities from "./Dashboard Activities";
import DashboardPerformance from "./DashboardPerformance";
import { useLayout } from "../common/Layout";
import { UniversalSkeleton, BaseSkeleton } from "../ui/skeleton";

interface Todo {
  _id: string;
  employeeName: string;
  employeePhoto?: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
}

interface Ticket {
  _id: string;
  employeeName: string;
  employeePhoto?: string;
  title: string;
  priority: string;
  dueDate: string;
  progress: number;
}

export default function Dashboard() {
  const role = localStorage.getItem("role") || "Employee";
  const { dashboardPreferences } = useLayout();

  const gridClass = (role === 'Admin' || role === 'SuperAdmin') ? 'grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-4' : 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4';

  const [todos, setTodos] = useState<Todo[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Mock data for dashboard
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    pendingRequests: 0,
    holidays: 0,
    events: 0,
  });

  const [leavesCount, setLeavesCount] = useState(0);

  const [realStats, setRealStats] = useState({
    totalEmployees: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0
  });


  useEffect(() => {
    // Fetch real user statistics
    const fetchUserStats = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const users = data.users;
          const totalEmployees = users.filter((user: any) => user.role === 'Employee' && user.status === 'Active').length;
          const totalAdmins = users.filter((user: any) => user.role === 'Admin').length;
          const totalSuperAdmins = users.filter((user: any) => user.role === 'SuperAdmin').length;

          setRealStats({
            totalEmployees,
            totalAdmins,
            totalSuperAdmins
          });

          // Update stats with real employee count
          setStats(prevStats => ({
            ...prevStats,
            totalEmployees: totalEmployees
          }));

          setStatsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    // Fetch todos
    const fetchTodos = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/todos`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const todosData = data.todos || [];
          // Transform the data to match the Todo interface
          const transformedTodos: Todo[] = todosData.map((todo: any) => ({
            _id: todo._id,
            employeeName: todo.employee ? `${todo.employee.firstName} ${todo.employee.lastName}` : 'Unknown Employee',
            employeePhoto: todo.employee ? todo.employee.photo : undefined,
            title: todo.title,
            dueDate: new Date(todo.dueDate).toLocaleDateString(),
            status: todo.status,
            priority: todo.priority
          }));
          setTodos(transformedTodos);
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    // Fetch tickets
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const ticketsData = data.tickets || [];
          // Transform the data to match the Ticket interface
          const transformedTickets: Ticket[] = ticketsData.map((ticket: any) => ({
            _id: ticket._id,
            employeeName: ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}` : 'Unknown Employee',
            employeePhoto: ticket.employee ? ticket.employee.photo : undefined,
            title: ticket.title,
            priority: ticket.priority,
            dueDate: new Date(ticket.dueDate).toLocaleDateString('en-GB'), // DD/MM/YYYY format
            progress: ticket.currentProgress
          }));
          setTickets(transformedTickets);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };

    // Fetch holidays
    const fetchHolidays = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/holidays`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const holidaysData = await response.json();
          setHolidays(holidaysData);
          setStats(prevStats => ({
            ...prevStats,
            holidays: holidaysData.length
          }));
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };

    // Fetch events
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/events`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const eventsData = await response.json();
          setEvents(eventsData);
          setStats(prevStats => ({
            ...prevStats,
            events: eventsData.length
          }));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    // Fetch leaves
    const fetchLeaves = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/leaves`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const leaves = data.leaves || [];
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          let filteredLeaves = leaves.filter((leave: any) => {
            const leaveDate = new Date(leave.startDate);
            return leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
          });
          if (role === 'Employee') {
            const userId = localStorage.getItem('userId');
            filteredLeaves = filteredLeaves.filter((leave: any) => leave.employee && leave.employee._id === userId);
          }
          setLeavesCount(filteredLeaves.length);
        }
      } catch (error) {
        console.error('Error fetching leaves:', error);
      }
    };

    fetchUserStats();
    fetchTodos();
    fetchTickets();
    fetchHolidays();
    fetchEvents();
    fetchLeaves();

    // Set other mock data
    setStats(prevStats => ({
      ...prevStats,
      newHires: 5,
      pendingRequests: 12
    }));


  }, []);


  const getStatCardColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
    ];
    return colors[index % colors.length];
  };

  const getBorderColor = (index) => {
    const colors = [
      "border-blue-500",
      "border-green-500",
      "border-purple-500",
      "border-orange-500",
    ];
    return colors[index % colors.length];
  };

  const getActivityIcon = (type) => {
    const icons = {
      leave: <Clock className="h-4 w-4 text-blue-500" />,
      profile: <Users className="h-4 w-4 text-green-500" />,
      document: <FileText className="h-4 w-4 text-purple-500" />,
      review: <BarChart3 className="h-4 w-4 text-orange-500" />,
    };
    return icons[type] || <CheckCircle2 className="h-4 w-4 text-gray-500" />;
  };

  const statCards = [
    {
      title: "Employees",
      value: stats.totalEmployees,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "+2%",
    },
    {
      title: "Users",
      value: realStats.totalAdmins + realStats.totalSuperAdmins,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "",
      // breakdown: {
      //   admins: realStats.totalAdmins,
      //   superAdmins: realStats.totalSuperAdmins
      // }
    },
    {
      title: "Holidays",
      value: stats.holidays,
      icon: <Calendar className="h-6 w-6 text-white" />,
      change: "",
    },
    {
      title: "Events",
      value: stats.events,
      icon: <Calendar className="h-6 w-6 text-white" />,
      change: "",
    },
    {
      title: "Todos",
      value: todos.length,
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      change: "",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Quick Stats */}
        {role !== 'Employee' && (
          <>
            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {Array(5).fill(0).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <BaseSkeleton className="h-4 w-16 mb-2" />
                        <BaseSkeleton className="h-8 w-12 mb-1" />
                      </div>
                      <BaseSkeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {statCards.map((card, index) => (
                  <div
                    key={card.title}
                    className={`bg-white rounded shadow-sm border-t-4  ${getBorderColor(index)} p-4 sm:p-6 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 truncate">
                          {card.title}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                          {card.value}
                        </p>
                        {/* {card.breakdown && (
                      <div className="text-xs text-gray-500 mt-1">
                        <div>Admins: {card.breakdown.admins}</div>
                        <div>Super Admins: {card.breakdown.superAdmins}</div>
                      </div>
                    )} */}
                        <p
                          className={`text-xs mt-1 ${card.change.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          {/* {card.change} from last month */}
                        </p>
                      </div>
                      <div
                        className={`p-2 sm:p-3 rounded-full ${getStatCardColor(
                          index
                        )} flex-shrink-0 ml-3`}
                      >
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Current Month Leaves */}
        {role !== 'SuperAdmin' && role !== 'Admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">
                    Current Month Leaves
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {leavesCount}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-500 flex-shrink-0 ml-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-600">Card 2</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-600">Card 3</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-600">Card 4</p>
            </div>

          </div>
        )}

        {/* Projects Table */}
        {dashboardPreferences.projects && (
          <div className="mb-6 sm:mb-8">
            <DashboardTable />
          </div>
        )}

        {/* Teams Dashboard */}
        {dashboardPreferences.teams && <TeamDashboard />}

        {dashboardPreferences.todos && todos.length > 0 && (
          <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-4 px-4 sm:px-0">Employee Todos Overview</h1>
              <EmployeeTodos todos={todos} />
            </div>
          </div>
        )}

        {dashboardPreferences.tickets && tickets.length > 0 && (
          <div className="mt-[50px] p-5 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-4 px-4 sm:px-0">Employee Tickets Overview</h1>
              <DashboardTickets tickets={tickets} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-4">
          <div className="dashboard-performance">
            {dashboardPreferences.performance && (
              <div className="mt-[50px]">
                <DashboardPerformance />
              </div>
            )}
          </div>
        </div>


        <div className={gridClass}>
          <div className="dashboard-leaves">
            {dashboardPreferences.leaves && (
              <div className="mt-[50px]">
                <DashboardLeaves />
              </div>
            )}
          </div>
          <div className="dashboard-activities">
            {dashboardPreferences.activities && role === 'Employee' && (
              <div className="mt-[50px]">
                <DashboardActivities />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

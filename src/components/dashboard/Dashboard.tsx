import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
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
import { useToast } from "../../hooks/use-toast";

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
  const { toast } = useToast();

  const isAdmin = role === 'Admin' || role === 'SuperAdmin';

  const gridClass = isAdmin ? 'grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-6' : 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6';

  const [todos, setTodos] = useState<Todo[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

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

  const handleRefreshStats = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users?limit=1000`, {
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

        setStats(prevStats => ({
          ...prevStats,
          totalEmployees: totalEmployees
        }));

        toast({
          title: 'Data Refreshed',
          description: 'Dashboard statistics have been updated successfully',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setSyncLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch real user statistics
    const fetchUserStats = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users?limit=1000`, {
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
        setStatsLoading(false);
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

  const getStatCardColor = (index: number) => {
    const colors = [
      "bg-indigo-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-rose-500",
    ];
    return colors[index % colors.length];
  };

  const getBorderColor = (index: number) => {
    const colors = [
      "border-indigo-500",
      "border-emerald-500",
      "border-purple-500",
      "border-orange-500",
      "border-rose-500",
    ];
    return colors[index % colors.length];
  };

  const getActivityIcon = (type: string) => {
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
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "+2%",
      changeType: "positive",
    },
    {
      title: "Users",
      value: realStats.totalAdmins + realStats.totalSuperAdmins,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "",
      changeType: "neutral",
    },
    {
      title: "Holidays",
      value: stats.holidays,
      icon: <Calendar className="h-6 w-6 text-white" />,
      change: "",
      changeType: "neutral",
    },
    {
      title: "Events",
      value: stats.events,
      icon: <Calendar className="h-6 w-6 text-white" />,
      change: "",
      changeType: "neutral",
    },
    {
      title: "Todos",
      value: todos.length,
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      change: "",
      changeType: "neutral",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Monitor team performance, attendance, and key HR metrics at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshStats}
              disabled={syncLoading}
              className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {syncLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>{syncLoading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {isAdmin && (
          <>
            <div className="mb-8">
              {statsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                  {Array(5).fill(0).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="h-4 w-24 bg-slate-200 rounded mb-3 animate-pulse" />
                          <div className="h-8 w-32 bg-slate-200 rounded mb-1 animate-pulse" />
                          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                  {statCards.map((card, index) => (
                    <div
                      key={card.title}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                    >
                      <div className="absolute inset-y-0 right-0 h-full w-1/3 bg-gradient-to-r from-transparent to-slate-50/50" />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              {card.title}
                            </p>
                            {card.change && (
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                card.changeType === 'positive'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {card.change}
                              </span>
                            )}
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            {card.value}
                          </p>
                        </div>
                        <div
                          className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ml-3 ${getStatCardColor(index)}`}
                        >
                          {card.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Current Month Leaves */}
        {!isAdmin && (
          <div className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Current Month Leaves
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
                    {leavesCount}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Table */}
        {dashboardPreferences.projects && (
          <div className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Projects Overview</h2>
                <DashboardTable />
              </div>
            </div>
          </div>
        )}

        {/* Teams Dashboard */}
        {dashboardPreferences.teams && (
          <div className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Team Management</h2>
                <TeamDashboard />
              </div>
            </div>
          </div>
        )}

        {dashboardPreferences.todos && todos.length > 0 && (
          <div className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-lg sm:text-xl font-bold mb-4 px-4 sm:px-0">Employee Todos Overview</h1>
                  <EmployeeTodos todos={todos} />
                </div>
              </div>
            </div>
          </div>
        )}

        {dashboardPreferences.tickets && tickets.length > 0 && (
          <div className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-lg sm:text-xl font-bold mb-4 px-4 sm:px-0">Employee Tickets Overview</h1>
                  <DashboardTickets tickets={tickets} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-6">
          <div className="dashboard-performance">
            {dashboardPreferences.performance && (
              <div className="mb-8">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="p-6 sm:p-8">
                    <DashboardPerformance />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={gridClass}>
          <div className="dashboard-leaves">
            {dashboardPreferences.leaves && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6 sm:p-8">
                  <DashboardLeaves />
                </div>
              </div>
            )}
          </div>
          <div className="dashboard-activities">
            {dashboardPreferences.activities && role === 'Employee' && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6 sm:p-8">
                  <DashboardActivities />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

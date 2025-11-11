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
import TeamDashboard from "./TeamDashboard";

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

  const [todos, setTodos] = useState<Todo[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents] = useState([]);

  // Mock data for dashboard
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    pendingRequests: 0,
    holidays: 0,
    events: 0,
  });

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
          const todosData = await response.json();
          // Transform the data to match the Todo interface
          const transformedTodos: Todo[] = todosData.map((todo: any) => ({
            _id: todo._id,
            employeeName: `${todo.employee.firstName} ${todo.employee.lastName}`,
            employeePhoto: todo.employee.photo,
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
          const ticketsData = await response.json();
          // Transform the data to match the Ticket interface
          const transformedTickets: Ticket[] = ticketsData.map((ticket: any) => ({
            _id: ticket._id,
            employeeName: `${ticket.employee.firstName} ${ticket.employee.lastName}`,
            employeePhoto: ticket.employee.photo,
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

    fetchUserStats();
    fetchTodos();
    fetchTickets();
    fetchHolidays();
    fetchEvents();

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
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

        {/* Projects Table */}
        <div className="mb-6 sm:mb-8">
          <DashboardTable />
        </div>

        {/* Teams Dashboard */}
        <TeamDashboard />

        {todos.length > 0 && (
          <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 px-4 sm:px-0">Employee Todos Overview</h1>
            <EmployeeTodos todos={todos} />
          </div>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="mt-[50px] p-5 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 px-4 sm:px-0">Employee Tickets Overview</h1>
            <DashboardTickets tickets={tickets} />
          </div>
          </div>
        )}

      </main>
    </div>
  );
}

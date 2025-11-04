import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building,
} from "lucide-react";
import DashboardTable from "./DashboardTable";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const allNavItems = [
    {
      id: "overview",
      name: "Dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "user",
      name: "User",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "employees",
      name: "Employees",
      icon: <Users className="h-5 w-5" />,
      roles: ["Employee", "Admin", "SuperAdmin"],
    },
    {
      id: "department",
      name: "Department",
      icon: <Building className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "statistics",
      name: "Statistics",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "activities",
      name: "Activities",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "holidays",
      name: "Holidays",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "events",
      name: "Events",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    { id: "reports", name: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
    {
      id: "gallery",
      name: "Gallery",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "todo",
      name: "Todo",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "link",
      name: "Link",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "ticket",
      name: "Ticket",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "attendance",
      name: "Attendance",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      id: "leave",
      name: "Leave Management",
      icon: <Calendar className="h-5 w-5" />,
    },
    { id: "payroll", name: "Payroll", icon: <FileText className="h-5 w-5" /> },
    {
      id: "recruitment",
      name: "Recruitment",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: "client",
      name: "Client",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: "project",
      name: "Project",
      icon: <Users className="h-5 w-5" />,
    },

  ];

  const role = localStorage.getItem("role") || "Employee";
  const navItems = allNavItems.filter(
    (item) =>
      !item.roles ||
      item.roles.some((r) => r.toLowerCase() === role.toLowerCase())
  );

  // Mock data for dashboard
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onLeave: 0,
    newHires: 0,
    pendingRequests: 0,
  });

  const [realStats, setRealStats] = useState({
    totalEmployees: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

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
          const totalEmployees = users.filter((user: any) => user.role === 'Employee').length;
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

    fetchUserStats();

    // Set other mock data
    setStats(prevStats => ({
      ...prevStats,
      onLeave: 8,
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
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "+2%",
    },
    {
      title: "Admins",
      value: realStats.totalAdmins,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "",
    },
    {
      title: "Super Admins",
      value: realStats.totalSuperAdmins,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "",
    },
    {
      title: "On Leave Today",
      value: stats.onLeave,
      icon: <Calendar className="h-6 w-6 text-white" />,
      change: "-1",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      card.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {/* {card.change} from last month */}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${getStatCardColor(
                    index
                  )}`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects Table */}
        <div className="mb-8">
          <DashboardTable />
        </div>
      </main>
    </div>
  );
}

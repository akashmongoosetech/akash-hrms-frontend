import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDueDate } from "../../Common/Commonfunction";

interface Ticket {
  _id: string;
  employeeName: string;
  employeePhoto?: string;
  title: string;
  priority: string;
  dueDate: string;
  progress: number;
}

interface Props {
  tickets: Ticket[];
}

export default function DashboardTickets({ tickets }: Props) {
  const navigate = useNavigate();

  // Helper function to parse DD/MM/YYYY date string
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Group tickets by employee name and sort each group by due date ascending
  const groupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.employeeName]) acc[ticket.employeeName] = [];
    acc[ticket.employeeName].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  // Sort each employee's tickets by due date ascending
  Object.keys(groupedTickets).forEach(employeeName => {
    groupedTickets[employeeName].sort((a, b) => {
      const dateA = parseDate(a.dueDate);
      const dateB = parseDate(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH":
        return "text-red-600 bg-red-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "LOW":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(groupedTickets).map(([employeeName, employeeTickets]) => (
        <div
          key={employeeName}
          className="bg-white border rounded-2xl shadow-sm p-4 hover:shadow-md transition-all flex flex-col"
          style={{ maxHeight: '400px', overflow: 'auto' }}
        >
          {/* Employee Header */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={employeeTickets[0]?.employeePhoto ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/${employeeTickets[0].employeePhoto}` : `https://ui-avatars.com/api/?name=${employeeName}`}
              alt={employeeName}
              className="w-10 h-10 rounded-full border"
            />
            <h3 className="font-semibold text-gray-800">{employeeName}</h3>
          </div>

          {/* All Tickets of this employee */}
          <div className="space-y-3 flex-1 overflow-auto">
            {employeeTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <p className="text-sm font-medium text-gray-700 truncate">
                  {ticket.title}
                </p>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>{formatDueDate(ticket.dueDate)}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="text-blue-600">Progress: {ticket.progress}%</span>
                  {parseDate(ticket.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) && (
                    <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                      OVERDUE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 text-right">
            <button
              onClick={() => navigate(`/ticket?employeeName=${encodeURIComponent(employeeName)}`)}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
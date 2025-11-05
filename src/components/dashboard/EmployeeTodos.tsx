// Example: EmployeeTodos.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDateTime, formatDueDate } from "../../Common/Commonfunction";

interface Todo {
  _id: string;
  employeeName: string;
  employeePhoto?: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
}

interface Props {
  todos: Todo[];
}

export default function EmployeeTodos({ todos }: Props) {
  const navigate = useNavigate();

  // Helper function to parse DD/MM/YYYY date string
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Group todos by employee name and sort each group by due date ascending
  const groupedTodos = todos.reduce((acc, todo) => {
    if (!acc[todo.employeeName]) acc[todo.employeeName] = [];
    acc[todo.employeeName].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  // Sort each employee's todos by due date ascending
  Object.keys(groupedTodos).forEach(employeeName => {
    groupedTodos[employeeName].sort((a, b) => {
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
      {Object.entries(groupedTodos).map(([employeeName, employeeTodos]) => (
        <div
          key={employeeName}
          className="bg-white border rounded-2xl shadow-sm p-4 hover:shadow-md transition-all flex flex-col"
          style={{ maxHeight: '400px', overflow: 'auto' }}
        >
          {/* Employee Header */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={employeeTodos[0]?.employeePhoto ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/${employeeTodos[0].employeePhoto}` : `https://ui-avatars.com/api/?name=${employeeName}`}
              alt={employeeName}
              className="w-10 h-10 rounded-full border"
            />
            <h3 className="font-semibold text-gray-800">{employeeName}</h3>
          </div>

          {/* All Todos of this employee */}
          <div className="space-y-3 flex-1 overflow-auto">
            {employeeTodos.map((todo) => (
              <div
                key={todo._id}
                className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <p className="text-sm font-medium text-gray-700 truncate">
                  {todo.title}
                </p>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>{formatDueDate(todo.dueDate)}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${getPriorityColor(todo.priority)}`}
                  >
                    {todo.priority}
                  </span>
                  {parseDate(todo.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) && (
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
              onClick={() => navigate(`/todo?employeeName=${encodeURIComponent(employeeName)}`)}
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

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Search,
  Filter,
} from "lucide-react";
import DeleteModal from "../../Common/DeleteModal";
import { formatDate } from '../../Common/Commonfunction';
import socket from '../../utils/socket';

interface Todo {
  _id: string;
  title: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  description?: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function TodoPage() {
  const [searchParams] = useSearchParams();
  const employeeNameFilter = searchParams.get('employeeName');

  const [todos, setTodos] = useState<Todo[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTodoId, setDeleteTodoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(employeeNameFilter || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const role = localStorage.getItem('role');

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    employee: "",
    dueDate: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    description: "",
    status: "Pending" as "Pending" | "In Progress" | "Completed",
  });

  useEffect(() => {
    fetchTodos();
    fetchEmployees();
    fetchCurrentUser();

    // Socket listeners for real-time updates
    socket.on('todo-created', (data) => {
      setTodos(prevTodos => [data.todo, ...prevTodos]);
    });

    socket.on('todo-updated', (data) => {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo._id === data.todo._id ? data.todo : todo
        )
      );
    });

    socket.on('todo-deleted', (data) => {
      setTodos(prevTodos =>
        prevTodos.filter(todo => todo._id !== data.todoId)
      );
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('todo-created');
      socket.off('todo-updated');
      socket.off('todo-deleted');
    };
  }, []);

  // Separate useEffect for personal notifications that depends on currentUser
  useEffect(() => {
    if (currentUser?._id) {
      const handlePersonalNotification = (data: any) => {
        if (data.type === 'new_todo') {
          // Show notification to the employee
          toast.success(`New Todo Assigned: ${data.message}`);
        }
      };

      socket.on(`todo-notification-${currentUser._id}`, handlePersonalNotification);

      // Cleanup this specific listener
      return () => {
        socket.off(`todo-notification-${currentUser._id}`, handlePersonalNotification);
      };
    }
  }, [currentUser]);

  const fetchTodos = async () => {
    try {
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/todos`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.employee || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const url = editingTodo
        ? `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/todos/${editingTodo._id}`
        : `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/todos`;

      const method = editingTodo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingTodo ? "Todo updated successfully" : "Todo added successfully");
        // fetchTodos(); // Removed to rely on socket updates
        setShowModal(false);
        resetForm();
        setEditingTodo(null);
      } else {
        const error = await response.json();
        toast.error(error.message || "Error saving todo");
      }
    } catch (error) {
      console.error("Error saving todo:", error);
      toast.error("Error saving todo");
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      employee: todo.employee ? todo.employee._id : '',
      dueDate: todo.dueDate.split('T')[0], // Format for date input
      priority: todo.priority,
      description: todo.description || "",
      status: todo.status,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTodoId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTodoId) return;

    try {
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/todos/${deleteTodoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Todo deleted successfully");
        // fetchTodos(); // Removed to rely on socket updates
        setShowDeleteModal(false);
        setDeleteTodoId(null);
      } else {
        toast.error("Error deleting todo");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Error deleting todo");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Pending" | "In Progress" | "Completed") => {
    try {
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/todos/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success("Status updated successfully");
        // fetchTodos(); // Removed to rely on socket updates
      } else {
        const error = await response.json();
        toast.error(error.message || "Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      employee: "",
      dueDate: "",
      priority: "Medium",
      description: "",
      status: "Pending",
    });
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (todo.employee && (todo.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === "all" || todo.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || todo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "In Progress":
        return "text-blue-600 bg-blue-100";
      case "Pending":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "In Progress":
        return <Clock className="h-4 w-4" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todo Management</h1>
        {role !== 'Employee' && (
          <button
            onClick={() => {
              resetForm();
              setEditingTodo(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Todo</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Todo List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                {role !== 'Employee' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {role !== 'Employee' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTodos.map((todo) => (
                <tr key={todo._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {todo.title}
                    </div>
                    {todo.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {todo.description}
                      </div>
                    )}
                  </td>
                  {role !== 'Employee' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {todo.employee ? `${todo.employee.firstName} ${todo.employee.lastName}` : 'Unknown Employee'}
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(todo.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        todo.priority
                      )}`}
                    >
                      {todo.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={todo.status}
                      onChange={(e) => handleStatusChange(todo._id, e.target.value as "Pending" | "In Progress" | "Completed")}
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${getStatusColor(
                        todo.status
                      )}`}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  {role !== 'Employee' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(todo)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(todo._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTodos.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No todos found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating a new todo."}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTodo ? "Edit Todo" : "Add New Todo"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee *
                  </label>
                  <select
                    value={formData.employee}
                    onChange={(e) =>
                      setFormData({ ...formData, employee: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.filter(employee => employee.role !== 'Admin' && employee.role !== 'SuperAdmin').map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName} ({employee.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as "Low" | "Medium" | "High" })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {editingTodo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as "Pending" | "In Progress" | "Completed" })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTodo(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                  >
                    {editingTodo ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Todo"
        message="Are you sure you want to delete this todo? This action cannot be undone."
      />
    </div>
  );
}
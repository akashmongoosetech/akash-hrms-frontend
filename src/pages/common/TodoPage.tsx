import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { Plus } from "lucide-react";
import DeleteModal from "../../Common/DeleteModal";
import TodoTable from "../../components/todo/TodoTable";
import TodoModal from "../../components/todo/TodoModal";
import socket from '../../utils/socket';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
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
    fetchTodos(currentPage);
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

  const fetchTodos = async (page: number = 1) => {
    try {
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/todos?page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTodos(data.todos || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
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

      <TodoTable
        filteredTodos={filteredTodos}
        role={role}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleStatusChange={handleStatusChange}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <TodoModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingTodo={editingTodo}
        setEditingTodo={setEditingTodo}
        formData={formData}
        setFormData={setFormData}
        employees={employees}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />

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
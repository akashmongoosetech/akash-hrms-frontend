import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Ticket {
  _id: string;
  title: string;
  employee: Employee;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  description: string;
}

export default function TicketEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    employee: '',
    priority: 'Low' as 'Low' | 'Medium' | 'High',
    dueDate: '',
    description: ''
  });

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only employees
        const employeesOnly = data.users.filter((user: any) => user.role === 'Employee');
        setEmployees(employeesOnly);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchTicket = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const ticket: Ticket = await response.json();
        setFormData({
          title: ticket.title,
          employee: ticket.employee._id,
          priority: ticket.priority,
          dueDate: new Date(ticket.dueDate).toISOString().split('T')[0],
          description: ticket.description
        });
      } else {
        toast.error('Failed to fetch ticket');
      }
    } catch (err) {
      toast.error('Error fetching ticket');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Ticket updated successfully');
        navigate('/tickets');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update ticket');
      }
    } catch (err) {
      toast.error('Error updating ticket');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">Loading ticket...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          onClick={() => navigate('/tickets')}
          variant="ghost"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Tickets</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Ticket</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter ticket title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                required
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} ({employee.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              placeholder="Enter ticket description"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => navigate('/tickets')}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Ticket'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
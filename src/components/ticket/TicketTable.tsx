import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Eye, User, Calendar, AlertCircle } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

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
  createdAt: string;
  currentProgress: number;
}

export default function TicketTable() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);

  const formatDateSafe = (s?: string): string => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };


  useEffect(() => {
    fetchTickets();
    fetchEmployees();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        toast.error('Failed to fetch tickets');
      }
    } catch (err) {
      toast.error('Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = (id: string) => {
    setDeleteTicketId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTicketId) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets/${deleteTicketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchTickets();
        setShowDeleteModal(false);
        setDeleteTicketId(null);
        toast.success('Ticket deleted successfully');
      } else {
        toast.error('Failed to delete ticket');
      }
    } catch (err) {
      toast.error('Error deleting ticket');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const needle = searchTerm.toLowerCase();
    const titleHit = (ticket.title || '').toLowerCase().includes(needle);
    const employeeName = ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}`.toLowerCase() : '';
    const employeeHit = employeeName.includes(needle);
    return titleHit || employeeHit;
  });


  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
        {localStorage.getItem('role') !== 'Employee' && (
          <Button
            onClick={() => navigate('/tickets/add')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Ticket</span>
          </Button>
        )}
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{ticket.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}` : 'No employee'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.employee?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateSafe(ticket.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateSafe(ticket.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ticket.currentProgress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[3rem]">
                      {ticket.currentProgress || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => navigate(`/tickets/view/${ticket._id}`)}
                      variant="ghost"
                      size="icon"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => navigate(`/tickets/edit/${ticket._id}`)}
                      variant="ghost"
                      size="icon"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {localStorage.getItem('role') !== 'Employee' && (
                      <Button
                        onClick={() => handleDelete(ticket._id)}
                        variant="ghost"
                        size="icon"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No tickets found matching your search' : 'No tickets found'}
        </div>
      )}


      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
      />
    </div>
  );
}
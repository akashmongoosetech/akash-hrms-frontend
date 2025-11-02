import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Plus, Search, MoreHorizontal, Eye, User, Calendar, AlertCircle } from 'lucide-react';
import DeleteModal from '../Common/DeleteModal';

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

export default function TicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const formatDateSafe = (s?: string): string => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const [formData, setFormData] = useState({
    title: '',
    employee: '',
    priority: 'Low' as 'Low' | 'Medium' | 'High',
    dueDate: '',
    description: ''
  });

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
        setError('Failed to fetch tickets');
      }
    } catch (err) {
      setError('Error fetching tickets');
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
        const employeesOnly = data.filter((user: any) => user.role === 'Employee');
        setEmployees(employeesOnly);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTicket
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets/${editingTicket._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets`;

      const method = editingTicket ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchTickets();
        setShowModal(false);
        resetForm();
      } else {
        setError('Failed to save ticket');
      }
    } catch (err) {
      setError('Error saving ticket');
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
      } else {
        setError('Failed to delete ticket');
      }
    } catch (err) {
      setError('Error deleting ticket');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      employee: '',
      priority: 'Low',
      dueDate: '',
      description: ''
    });
    setEditingTicket(null);
  };

  const openModal = (ticket?: Ticket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setFormData({
        title: ticket.title,
        employee: ticket.employee._id,
        priority: ticket.priority,
        dueDate: new Date(ticket.dueDate).toISOString().split('T')[0],
        description: ticket.description
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    const needle = searchTerm.toLowerCase();
    const titleHit = (ticket.title || '').toLowerCase().includes(needle);
    const employeeName = ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}`.toLowerCase() : '';
    const employeeHit = employeeName.includes(needle);
    return titleHit || employeeHit;
  });

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Ticket</span>
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket._id} className="relative border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{ticket.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}` : 'No employee'}
                </p>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === ticket._id ? null : ticket._id)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                </button>
                {openMenuId === ticket._id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => { setViewTicket(ticket); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => { openModal(ticket); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => { handleDelete(ticket._id); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-700 line-clamp-2">
              {ticket.description}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Due: {formatDateSafe(ticket.dueDate)}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}` : 'No employee'}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                <AlertCircle className="h-3 w-3 mr-1" />
                {ticket.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No tickets found matching your search' : 'No tickets found'}
        </div>
      )}

      {/* View Modal */}
      {viewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Ticket Details</h3>
              <button onClick={() => setViewTicket(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Title</div>
                  <div className="text-gray-800 font-medium">{viewTicket.title}</div>
                </div>
                <div>
                  <div className="text-gray-500">Employee</div>
                  <div className="text-gray-800">
                    {viewTicket.employee ? `${viewTicket.employee.firstName} ${viewTicket.employee.lastName}` : 'No employee'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Description</div>
                <div className="text-gray-800">{viewTicket.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Due Date</div>
                  <div className="text-gray-800">{formatDateSafe(viewTicket.dueDate)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Priority</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    viewTicket.priority === 'High' ? 'bg-red-100 text-red-800' :
                    viewTicket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {viewTicket.priority}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => { setViewTicket(null); openModal(viewTicket!); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewTicket(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingTicket ? 'Edit Ticket' : 'Add Ticket'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <select
                    required
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTicket ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
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
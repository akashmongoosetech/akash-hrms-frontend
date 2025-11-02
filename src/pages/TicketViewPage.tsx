import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, User, AlertCircle } from 'lucide-react';

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
  updatedAt: string;
}

export default function TicketViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data: Ticket = await response.json();
        setTicket(data);
      } else {
        setError('Failed to fetch ticket');
      }
    } catch (err) {
      setError('Error fetching ticket');
    } finally {
      setLoading(false);
    }
  };

  const formatDateSafe = (s?: string): string => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const formatDateTimeSafe = (s?: string): string => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">Loading ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8 text-red-600">
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Tickets</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
        </div>
        <button
          onClick={() => navigate(`/tickets/edit/${ticket._id}`)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Ticket</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">{ticket.title}</h2>
            <div className="mt-2 flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                <AlertCircle className="h-4 w-4 mr-1" />
                {ticket.priority} Priority
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  <span>Assigned Employee</span>
                </div>
                <div className="text-gray-900 font-medium">
                  {ticket.employee ? `${ticket.employee.firstName} ${ticket.employee.lastName}` : 'No employee assigned'}
                </div>
                {ticket.employee?.email && (
                  <div className="text-sm text-gray-500">{ticket.employee.email}</div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due Date</span>
                </div>
                <div className="text-gray-900 font-medium">
                  {formatDateSafe(ticket.dueDate)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Created</div>
                <div className="text-gray-900 font-medium">
                  {formatDateTimeSafe(ticket.createdAt)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="text-gray-900 font-medium">
                  {formatDateTimeSafe(ticket.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-sm text-gray-500 mb-2">Description</div>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
              {ticket.description || 'No description provided.'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/tickets')}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Tickets
            </button>
            <button
              onClick={() => navigate(`/tickets/edit/${ticket._id}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
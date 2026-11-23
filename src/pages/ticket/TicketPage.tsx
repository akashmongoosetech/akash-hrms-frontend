import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Ticket, XCircle, Clock, CheckCircle, AlertCircle, Users, Shield, Calendar, Plus } from 'lucide-react';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  tags?: string[];
}

interface TicketStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const ticketStats: TicketStats[] = [
  { label: 'Open', value: 45, variant: 'primary', icon: AlertCircle },
  { label: 'In Progress', value: 23, variant: 'success', icon: Clock },
  { label: 'Resolved', value: 12, variant: 'info', icon: CheckCircle },
  { label: 'Closed', value: 8, variant: 'secondary', icon: Shield },
];

const TicketPage: React.FC = () => {
  const { notify } = useToast();

  const handleCreateTicket = () => {
    notify({
      title: 'Ticket Created',
      description: 'New support ticket has been created',
      variant: 'success',
    });
  };

  const handleUpdateStatus = (ticketId: string, status: string) => {
    notify({
      title: 'Status Updated',
      description: `Ticket ${ticketId} status updated to ${status}`,
      variant: 'primary',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and resolve employee issues
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Create Ticket</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {ticketStats.map((stat, index) => (
          <Card
            key={index}
            className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center gap-3 mb-3">
              {(() => { const Icon = stat.icon as React.FC<{ className?: string }>; return <Icon className="h-5 w-5" />; })()}
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant} size="sm" />
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-soft mb-6">
        <div className="flex gap-2 px-4 py-2">
          <button className="flex-1 rounded-md border bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
            All
          </button>
          <button className="flex-1 rounded-md border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Open
          </button>
          <button className="flex-1 rounded-md border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            In Progress
          </button>
          <button className="flex-1 rounded-md border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Resolved
          </button>
        </div>
      </div>

      {/* Create Ticket Form */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Create New Ticket</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Ticket Title</label>
            <input
              type="text"
              placeholder="e.g., System access issue"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Priority</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Select Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Assigned To</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Unassigned</option>
              <option>John Doe</option>
              <option>Jane Smith</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Select Tag</option>
              <option>IT</option>
              <option>HR</option>
              <option>Admin</option>
            </select>
          </div>
          <Button variant="primary" type="submit" className="grid col-span-2">
            <Shield className="mr-2 h-4 w-4" /> Create Ticket
          </Button>
        </form>
      </div>

      {/* Tickets Table */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
          <Button variant="ghost" size="sm" className="text-sm text-primary/70">
            Create Ticket
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TicketRow key={num} ticket={{
              _id: String(num),
              title: `Ticket #${num}: System Access Issue`,
              description: 'Employee reports difficulty accessing the HR system',
              priority: num <= 3 ? 'high' : num <= 6 ? 'medium' : 'low',
              status: num <= 5 ? 'open' : num <= 8 ? 'in-progress' : 'resolved',
              createdBy: 'John Doe',
              assignedTo: num <= 5 ? 'IT Support' : undefined,
              createdAt: '2024-01-15',
              tags: num <= 3 ? ['IT', 'Access'] : num <= 6 ? ['HR'] : [],
            }} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const TicketRow = ({ ticket }: { ticket: Ticket }) => {
  const priorityMap: Record<
    string,
    { variant: string; bg: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    low: { variant: 'secondary', bg: 'var(--secondary)', Icon: Ticket },
    medium: { variant: 'primary', bg: 'var(--primary)', Icon: Clock },
    high: { variant: 'critical', bg: 'var(--destructive)', Icon: AlertCircle },
    urgent: { variant: 'critical', bg: 'var(--destructive)', Icon: AlertCircle },
  };

  const statusMap: Record<string, { variant: string; bg: string }> = {
    open: { variant: 'primary', bg: 'var(--primary)' },
    'in-progress': { variant: 'success', bg: 'var(--success)' },
    resolved: { variant: 'info', bg: 'var(--info)' },
    closed: { variant: 'secondary', bg: 'var(--secondary)' },
  };

  const priorityInfo = priorityMap[ticket.priority] || priorityMap.medium;
  const statusInfo = statusMap[ticket.status] || statusMap.open;

  return (
    <div className="px-6 py-4 border-b border-border opacity-30 last:border-0 flex items-center gap-3">
      <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: priorityInfo.bg }}>
        <priorityInfo.Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
        <p className="text-xs text-gray-500 truncate">{ticket.description}</p>
      </div>
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium" style={{ backgroundColor: statusInfo.bg, color: statusInfo.bg === 'var(--primary)' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)' }}>
        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
      </div>
      <div className="text-right flex-1">
        <Button variant="ghost" size="sm" className="text-xs text-primary/70">
          View
        </Button>
        <Button variant="ghost" size="sm" className="text-xs text-destructive/70">
          Close
        </Button>
      </div>
    </div>
  );
};

export default TicketPage;
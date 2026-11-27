import React from 'react';
import TicketTable from "../../components/ticket/TicketTable";
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tickets</h1>
      <TicketTable />
    </div>
  );
};


export default TicketPage;
import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Users, Building, MapPin, Shield, ShieldCheck, Calendar, Clipboard, Settings, Heart, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  type: 'corporate' | 'individual';
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  lastContact: string;
}

interface ClientStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const clientStats: ClientStats[] = [
  { label: 'Total Clients', value: 24, variant: 'primary', icon: Users },
  { label: 'Active', value: 18, variant: 'success', icon: CheckCircle },
  { label: 'Pending', value: 4, variant: 'info', icon: Clock },
  { label: 'Inactive', value: 2, variant: 'critical', icon: XCircle },
];

const ClientPage: React.FC = () => {
  const { notify } = useToast();

  const handleAddClient = () => {
    notify({
      title: 'Client Added',
      description: 'New client has been added successfully',
      variant: 'success',
    });
  };

  const handleViewDetails = (clientId: string) => {
    notify({
      title: 'View Details',
      description: `Viewing client: ${clientId}`,
      variant: 'info',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage client relationships and information
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Add Client</span>
            </div>
          </div>
          </Card>
        </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {clientStats.map((stat, index) => (
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

      {/* Client Form */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Add New Client</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Client Name</label>
            <input
              type="text"
              placeholder="e.g., Acme Corporation"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Type</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Select Type</option>
              <option>Corporate</option>
              <option>Individual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Industry</label>
            <input
              type="text"
              placeholder="e.g., Technology"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Contact Person</label>
            <input
              type="text"
              placeholder="e.g., John Doe"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
              <input
                type="email"
                placeholder="contact@company.com"
                className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
          <Button variant="primary" type="submit" className="grid col-span-2">
            <ShieldCheck className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </form>
      </div>

      {/* Clients Table */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Client List</h3>
          <Button variant="ghost" size="sm" className="text-sm text-primary/70">
            Add Client
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <ClientRow key={num} client={{
              _id: String(num),
              name: `Client ${num}`,
              type: num % 2 === 0 ? 'corporate' : 'individual',
              industry: `Industry ${num}`,
              contactPerson: `Contact Person ${num}`,
              email: `contact${num}@company.com`,
              phone: `+1 (555) 0${num}-1234`,
              status: num <= 7 ? 'active' : num <= 9 ? 'pending' : 'inactive',
              createdAt: '2024-01-15',
              lastContact: '2024-01-20',
            }} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const ClientRow = ({ client }: { client: Client }) => {
  const statusMap: Record<string, { variant: string; bg: string }> = {
    active: { variant: 'success', bg: 'var(--success)' },
    pending: { variant: 'info', bg: 'var(--info)' },
    inactive: { variant: 'critical', bg: 'var(--destructive)' },
  };

  const statusInfo = statusMap[client.status] || statusMap.active;

  return (
    <div className="px-6 py-4 border-b border-border opacity-30 last:border-0 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: statusInfo.bg }}>
        <StatusBadge status={client.status} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{client.name}</p>
        <p className="text-xs text-gray-500 truncate">{client.industry}</p>
      </div>
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium" style={{ backgroundColor: statusInfo.bg, color: statusInfo.bg === 'var(--primary)' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)' }}>
        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
      </div>
      <div className="text-right text-sm text-gray-500">
        <span>{client.lastContact}</span>
      </div>
    </div>
  );
};

export default ClientPage;
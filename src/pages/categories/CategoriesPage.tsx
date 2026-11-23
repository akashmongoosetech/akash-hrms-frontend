import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Folder, TrendingUp, Users, Calendar, Search, Shield, FileText } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  parentId?: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CategoryStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const categoryStats: CategoryStats[] = [
  { label: 'Total Categories', value: 34, variant: 'primary', icon: Folder },
  { label: 'Active', value: 28, variant: 'success', icon: CheckCircle },
  { label: 'Inactive', value: 6, variant: 'critical', icon: XCircle },
  { label: 'This Month', value: 4, variant: 'info', icon: Calendar },
];

const CategoriesPage: React.FC = () => {
  const { notify } = useToast();

  const handleCreateCategory = () => {
    notify({
      title: 'Category Created',
      description: 'New category has been created',
      variant: 'success',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Organize employees and resources
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Create Category</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categoryStats.map((stat, index) => (
          <Card
            key={index}
            className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant} size="sm" />
          </Card>
        ))}
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-xl shadow-soft mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>All Categories</option>
            <option>Department</option>
            <option>Team</option>
            <option>Location</option>
          </select>
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>Sort by</option>
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
            <option>Employee Count</option>
          </select>
          <Button variant="primary" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Create Category
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Categories List</h3>
          <Button variant="ghost" size="sm" className="text-sm text-primary/70">
            Create Category
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <CategoryRow key={num} category={{
              _id: String(num),
              name: `Category ${num}`,
              description: `Human Resources category ${num}`,
              employeeCount: Math.floor(Math.random() * 50) + 5,
              status: num <= 8 ? 'active' : 'inactive',
              createdAt: '2024-01-15',
            }} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const CategoryRow = ({ category }: { category: Category }) => {
  const statusMap: Record<string, { variant: string; bg: string }> = {
    active: { variant: 'success', bg: 'var(--success)' },
    inactive: { variant: 'critical', bg: 'var(--destructive)' },
  };

  const statusInfo = statusMap[category.status] || statusMap.active;

  return (
    <div className="px-6 py-4 border-b border-border opacity-30 last:border-0 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: statusInfo.bg }}>
        <StatusBadge status={category.status} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{category.name}</p>
        <p className="text-xs text-gray-500 truncate">{category.description}</p>
      </div>
      <div className="text-right text-sm text-gray-500">
        <span>{category.employeeCount} employees</span>
      </div>
    </div>
  );
};

export default CategoriesPage;
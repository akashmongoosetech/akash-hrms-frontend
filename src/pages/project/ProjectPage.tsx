import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Folder, TrendingUp, Users, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  lead: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  progress: number;
  startDate: string;
  endDate?: string;
  members: number;
}

const ProjectStats = {
  active: 12,
  onHold: 3,
  completed: 8,
  total: 23,
};

const ProjectPage: React.FC = () => {
  const { notify } = useToast();

  const handleViewProject = (projectId: string) => {
    notify({
      title: 'View Project',
      description: 'Opening project details',
      variant: 'info',
    });
  };

  const handleEditProject = (projectId: string) => {
    notify({
      title: 'Edit Project',
      description: 'Opening project edit form',
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
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track project progress and team collaboration
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Create Project</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{ProjectStats.active}</p>
            </div>
            <StatusBadge status="primary" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">On Hold</p>
              <p className="text-2xl font-bold text-gray-900">{ProjectStats.onHold}</p>
            </div>
            <StatusBadge status="info" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{ProjectStats.completed}</p>
            </div>
            <StatusBadge status="success" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <Folder className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{ProjectStats.total}</p>
            </div>
            <StatusBadge status="info" size="sm" />
          </div>
        </Card>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-medium text-gray-900">Projects</h2>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border opacity-50">
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Project Name</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Lead</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Progress</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Start Date</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Members</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border opacity-30">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((num) => (
                <ProjectRow key={num} project={{
                  _id: String(num),
                  name: `Project ${num}`,
                  lead: `Lead ${num}`,
                  status: num <= 12 ? 'active' : num <= 15 ? 'on-hold' : 'completed',
                  progress: Math.floor(Math.random() * 100),
                  startDate: '2024-01-15',
                  members: Math.floor(Math.random() * 10) + 1,
                }} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProjectRow = ({ project }: { project: Project }) => {
  const statusMap: Record<string, { variant: string; bg: string }> = {
    planning: { variant: 'primary', bg: 'var(--primary)' },
    active: { variant: 'success', bg: 'var(--success)' },
    'on-hold': { variant: 'info', bg: 'var(--info)' },
    completed: { variant: 'success', bg: 'var(--success)' },
  };

  const statusInfo = statusMap[project.status] || statusMap.active;

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{project.lead}</td>
      <td className="px-6 py-4">
        <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
          <div
            className={`h-full rounded-full bg-${statusInfo.variant} transition-width`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-${statusInfo.variant}-foreground ml-2">{project.progress}%</span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={project.status} size="sm" />
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{project.startDate}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{project.members}</td>
      <td className="px-6 py-4 text-right">
        <Button variant="ghost" size="sm" className="text-sm text-primary/70">
          View
        </Button>
        <Button variant="ghost" size="sm" className="text-sm text-destructive/70">
          Delete
        </Button>
      </td>
    </tr>
  );
};

export default ProjectPage;
import React, { useState, useEffect } from 'react';

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  technology: string;
  client?: Client | null;
  teamMembers: TeamMember[];
  startDate: string;
  status: string;
}

interface AddEditProjectModalProps {
  isOpen: boolean;
  editingProject: Project | null;
  clients: Client[];
  employees: TeamMember[];
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export default function AddEditProjectModal({
  isOpen,
  editingProject,
  clients,
  employees,
  onClose,
  onSubmit
}: AddEditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
    client: '',
    teamMembers: [] as string[],
    startDate: '',
    status: 'Active'
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        description: editingProject.description,
        technology: editingProject.technology,
        client: editingProject.client && editingProject.client._id ? editingProject.client._id : '',
        teamMembers: editingProject.teamMembers?.map(member => member._id) || [],
        startDate: new Date(editingProject.startDate).toISOString().split('T')[0],
        status: editingProject.status
      });
    } else {
      setFormData({
        name: '',
        description: '',
        technology: '',
        client: '',
        teamMembers: [],
        startDate: '',
        status: 'Active'
      });
    }
  }, [editingProject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTeamMemberChange = (memberId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: checked
        ? [...prev.teamMembers, memberId]
        : prev.teamMembers.filter(id => id !== memberId)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editingProject ? 'Edit Project' : 'Add Project'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Technology (comma-separated)</label>
            <input
              type="text"
              required
              value={formData.technology}
              onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
              placeholder="e.g., ReactJS, Node.js, MongoDB"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {employees.map(employee => (
                <label key={employee._id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.teamMembers.includes(employee._id)}
                    onChange={(e) => handleTeamMemberChange(employee._id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{employee.firstName} {employee.lastName} ({employee.email})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingProject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
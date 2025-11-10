import React, { useState, useEffect } from 'react';
import API from '../../../utils/api';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  name: string;
  client?: {
    _id: string;
    name: string;
  };
}

interface CreateTeamModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (teamData: any) => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ showModal, onClose, onSubmit }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    manager: '',
    teamMembers: [] as string[],
    project: ''
  });

  useEffect(() => {
    if (showModal) {
      fetchEmployees();
      fetchProjects();
    }
  }, [showModal]);

  const fetchEmployees = async () => {
    try {
      const response = await API.get('/users');
      const data = response.data;
      // Filter only employees
      const employeesOnly = data.users.filter((user: any) => user.role === 'Employee');
      setEmployees(employeesOnly);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

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

  // Filter employees for team members (exclude selected manager)
  const availableTeamMembers = employees.filter(emp => emp._id !== formData.manager);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create Team</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Manager</label>
            <select
              required
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Manager</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName} ({employee.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {availableTeamMembers.map(employee => (
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              required
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name} {project.client ? `(${project.client.name})` : ''}
                </option>
              ))}
            </select>
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
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
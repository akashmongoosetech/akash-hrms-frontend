import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Plus, Search, MoreHorizontal, Eye, Users, Calendar } from 'lucide-react';

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

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Safe helpers
  const getClientName = (p?: Project | null): string => {
    const c: any = p && (p as any).client;
    if (!c) return 'No client';
    if (typeof c === 'object') return c.name || 'No client';
    return 'No client';
  };

  const getClientNameForSearch = (p: Project): string => {
    const c: any = (p as any).client;
    return c && typeof c === 'object' && c.name ? String(c.name) : '';
  };

  const getMemberCount = (p?: Project | null): number => {
    const m: any = p && (p as any).teamMembers;
    if (!Array.isArray(m)) return 0;
    if (m.length === 0) return 0;
    return typeof m[0] === 'string' ? m.length : m.filter((x: any) => x && x._id).length;
  };

  const getMembersForView = (p?: Project | null): TeamMember[] => {
    const m: any = p && (p as any).teamMembers;
    if (!Array.isArray(m)) return [] as TeamMember[];
    if (m.length === 0) return [] as TeamMember[];
    return typeof m[0] === 'string' ? [] as TeamMember[] : (m.filter((x: any) => x && x._id) as TeamMember[]);
  };

  const formatDateSafe = (s?: string): string => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

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
    fetchProjects();
    fetchClients();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/clients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
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
      const url = editingProject
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/projects/${editingProject._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/projects`;

      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchProjects();
        setShowModal(false);
        resetForm();
      } else {
        setError('Failed to save project');
      }
    } catch (err) {
      setError('Error saving project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchProjects();
      } else {
        setError('Failed to delete project');
      }
    } catch (err) {
      setError('Error deleting project');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      technology: '',
      client: '',
      teamMembers: [],
      startDate: '',
      status: 'Active'
    });
    setEditingProject(null);
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        technology: project.technology,
        client: project.client && project.client._id ? project.client._id : '',
        teamMembers: project.teamMembers?.map(member => member._id) || [],
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        status: project.status
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleTeamMemberChange = (memberId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: checked
        ? [...prev.teamMembers, memberId]
        : prev.teamMembers.filter(id => id !== memberId)
    }));
  };

  const filteredProjects = projects.filter(project => {
    const needle = searchTerm.toLowerCase();
    const nameHit = (project.name || '').toLowerCase().includes(needle);
    const clientName = getClientNameForSearch(project).toLowerCase();
    const clientHit = clientName.includes(needle);
    return nameHit || clientHit;
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
    return <div className="text-center py-8">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div key={project._id} className="relative border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{project.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{getClientName(project)}</p>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === project._id ? null : project._id)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                </button>
                {openMenuId === project._id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => { setViewProject(project); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => { openModal(project); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => { handleDelete(project._id); setOpenMenuId(null); }}
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
              {project.description}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDateSafe(project.startDate as any)}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{getMemberCount(project)} members</span>
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                project.status === 'Active' ? 'bg-green-100 text-green-800' :
                project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No projects found matching your search' : 'No projects found'}
        </div>
      )}

      {/* View Modal */}
      {viewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Project Details</h3>
              <button onClick={() => setViewProject(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Project Name</div>
                  <div className="text-gray-800 font-medium">{viewProject.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Client</div>
                  <div className="text-gray-800">{viewProject.client && viewProject.client.name ? viewProject.client.name : 'No client'}</div>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Description</div>
                <div className="text-gray-800">{viewProject.description}</div>
              </div>
              <div>
                <div className="text-gray-500">Technology</div>
                <div className="text-gray-800">{viewProject.technology}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Start Date</div>
                  <div className="text-gray-800">{formatDateSafe(viewProject.startDate as any)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    viewProject.status === 'Active' ? 'bg-green-100 text-green-800' :
                    viewProject.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewProject.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">Team Members ({viewProject.teamMembers?.length || 0})</div>
                <div className="flex flex-wrap gap-2">
                  {getMembersForView(viewProject).map((member) => (
                    <span key={member._id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {member.firstName} {member.lastName}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => { setViewProject(null); openModal(viewProject!); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewProject(null)}
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
                  onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
}
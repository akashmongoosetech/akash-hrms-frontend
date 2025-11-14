import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Plus, Search, MoreHorizontal, Eye, Users, Calendar, Code } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import { formatDate } from '../../Common/Commonfunction';
import ViewProjectModal from './ViewProjectModal';
import AddEditProjectModal from './AddEditProjectModal';
import ProjectCard from './ProjectCard';
import { UniversalSkeleton, BaseSkeleton } from '../ui/skeleton';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const menuRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
        setProjects(data.projects || []);
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
        setClients(data.clients);
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
        const employeesOnly = data.users.filter((user: any) => user.role === 'Employee');
        setEmployees(employeesOnly);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleSubmit = async (formData: any) => {
    setSubmitLoading(true);
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
        setEditingProject(null);
      } else {
        setError('Failed to save project');
      }
    } catch (err) {
      setError('Error saving project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteProjectId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteProjectId) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/projects/${deleteProjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchProjects();
        setShowDeleteModal(false);
        setDeleteProjectId(null);
      } else {
        setError('Failed to delete project');
      }
    } catch (err) {
      setError('Error deleting project');
    } finally {
      setDeleteLoading(false);
    }
  };


  const openModal = (project?: Project) => {
    setEditingProject(project);
    setShowModal(true);
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
      const target = e.target as Node;
      const isOutside = Object.values(menuRef.current).every(ref => !ref || !ref.contains(target));
      if (isOutside) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <BaseSkeleton className="h-6 w-20" />
          <BaseSkeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <BaseSkeleton className="h-5 w-32 mb-2" />
                  <BaseSkeleton className="h-4 w-48 mb-3" />
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <BaseSkeleton className="h-4 w-4" />
                      <BaseSkeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <BaseSkeleton className="h-4 w-4" />
                      <BaseSkeleton className="h-4 w-12" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BaseSkeleton className="h-6 w-6 rounded-full" />
                      <BaseSkeleton className="h-6 w-6 rounded-full" />
                      <BaseSkeleton className="h-6 w-6 rounded-full" />
                      <BaseSkeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <BaseSkeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <BaseSkeleton className="h-5 w-16" />
                <BaseSkeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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

      {/* <div className="mb-4">
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
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            menuRef={menuRef}
            openMenuId={openMenuId}
            onMenuToggle={setOpenMenuId}
            onView={setViewProject}
            onEdit={openModal}
            onDelete={handleDelete}
            getClientName={getClientName}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No projects found matching your search' : 'No projects found'}
        </div>
      )}

      <ViewProjectModal
        viewProject={viewProject}
        onClose={() => setViewProject(null)}
        onEdit={(project) => { setViewProject(null); openModal(project); }}
      />

      <AddEditProjectModal
        isOpen={showModal}
        editingProject={editingProject}
        clients={clients}
        employees={employees}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
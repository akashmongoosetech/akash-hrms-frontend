import React, { useState, useEffect } from 'react';
import { Users, Code } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  email: string;
  profile: string;
}

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  technology: string;
  client?: Client | null;
  teamMembers: TeamMember[];
  status: string;
}

export default function DashboardTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  // Utility to get image URL
  const getImageUrl = (path?: string) => {
    if (!path) return '';

    let cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, ''); // normalize path

    // If it already includes full URL, return as is
    if (cleanPath.startsWith('http')) return cleanPath;

    // If path starts with 'uploads/', use it directly, else prepend 'uploads/'
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    return `${API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
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

  const getClientName = (project: Project): string => {
    const client = project.client;
    if (!client) return 'No client';
    if (typeof client === 'object') return client.name || 'No client';
    return 'No client';
  };

  const getClientEmail = (project: Project): string => {
    const client = project.client;
    if (!client) return '';
    if (typeof client === 'object') return client.email || '';
    return '';
  };

  const getClientProfile = (project: Project): string => {
    const client = project.client;
    if (!client) return '';
    if (typeof client === 'object') return client.profile || '';
    return '';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
        <div className="text-sm text-gray-500">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technology
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.slice(0, 10).map((project) => (
              <tr key={project._id} className="hover:bg-gray-50">
                {/* Client */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getClientProfile(project) && (
                      <img
                        className="h-8 w-8 rounded-full mr-3"
                        src={getImageUrl(getClientProfile(project))}
                        alt="Client profile"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getClientName(project)}
                      </div>
                      {getClientEmail(project) && (
                        <div className="text-sm text-gray-500">
                          {getClientEmail(project)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Team Members */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {project.teamMembers && project.teamMembers.length > 0 ? (
                      <div className="flex -space-x-2">
                        {project.teamMembers.slice(0, 3).map((member) => (
                          <div key={member._id} className="relative">
                            {member.photo ? (
                              <img
                                className="h-8 w-8 rounded-full border-2 border-white"
                                src={getImageUrl(member.photo)}
                                alt={`${member.firstName} ${member.lastName}`}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-700">
                                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              +{project.teamMembers.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="truncate">No team members</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Project Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {project.name}
                  </div>
                  {project.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {project.description}
                    </div>
                  )}
                </td>

                {/* Technology */}
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Code className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>{project.technology || 'Not specified'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No projects found
        </div>
      )}

      {projects.length > 10 && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Showing 10 of {projects.length} projects
          </p>
        </div>
      )}
    </div>
  );
}

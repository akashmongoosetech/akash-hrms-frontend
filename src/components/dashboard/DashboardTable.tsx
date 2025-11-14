import React, { useState, useEffect } from 'react';
import { Users, Code } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  email: string;
  profile: string;
  status: string;
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

  const getProjectDisplayStatus = (project: Project): string => {
    if (project.client && typeof project.client === 'object' && project.client.status === "Inactive") {
      return "Hold";
    }
    return project.status;
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

  const filteredProjects = projects.filter(p => p.status === "Active" || (p.client && typeof p.client === 'object' && p.client.status === "Inactive"));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Projects</h3>
        <div className="text-xs sm:text-sm text-gray-500">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {filteredProjects.slice(0, 10).map((project) => (
          <div key={project._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                {getClientProfile(project) && (
                  <img
                    className="h-8 w-8 rounded-full mr-3 flex-shrink-0"
                    src={getImageUrl(getClientProfile(project))}
                    alt="Client profile"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {getClientName(project)}
                  </div>
                  {getClientEmail(project) && (
                    <div className="text-xs text-gray-500 truncate">
                      {getClientEmail(project)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Project</div>
                <div className="text-sm text-gray-700">{project.name}</div>
                {project.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {project.description}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-900">
                  <Code className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                  <span className="truncate">{project.technology || 'Not specified'}</span>
                </div>

                <div className="flex items-center">
                  {project.teamMembers && project.teamMembers.length > 0 ? (
                    <div className="flex -space-x-1">
                      {project.teamMembers.slice(0, 3).map((member) => (
                        <div key={member._id} className="relative">
                          {member.photo ? (
                            <img
                              className="h-6 w-6 rounded-full border-2 border-white"
                              src={getImageUrl(member.photo)}
                              alt={`${member.firstName} ${member.lastName}`}
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      {project.teamMembers.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            +{project.teamMembers.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-gray-900">
                      <Users className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                      <span>No team</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProjectDisplayStatus(project) === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {getProjectDisplayStatus(project)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Members
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technology
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.slice(0, 10).map((project) => (
              <tr key={project._id} className="hover:bg-gray-50">
                {/* Client */}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                <td className="px-4 sm:px-6 py-4 cursor-pointer">
                  <div className="flex items-center">
                    {project.teamMembers && project.teamMembers.length > 0 ? (
                      <div className="flex -space-x-2">
                        {project.teamMembers.slice(0, 3).map((member, index) => (
                          <div
                            key={member._id}
                            className="relative transform transition duration-300 hover:scale-110"
                            style={{ animation: `fadeIn 0.3s ease ${index * 0.1}s forwards`, opacity: 0 }}
                          >
                            {member.photo ? (
                              <img
                                className="h-8 w-8 rounded-full border-2 border-white"
                                src={getImageUrl(member.photo)}
                                alt={`${member.firstName} ${member.lastName}`}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-700">
                                  {member.firstName.charAt(0)}
                                  {member.lastName.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div
                            className="h-8 w-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center transform transition duration-300 hover:scale-110"
                            style={{ animation: `fadeIn 0.3s ease 0.4s forwards`, opacity: 0 }}
                          >
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

                  <style>
                    {`
                      @keyframes fadeIn {
                        to {
                          opacity: 1;
                        }
                      }
                    `}
                  </style>
                </td>

                {/* Project Info */}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Code className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>{project.technology || 'Not specified'}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 sm:px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProjectDisplayStatus(project) === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {getProjectDisplayStatus(project)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
          No projects found
        </div>
      )}

      {filteredProjects.length > 10 && (
        <div className="text-center mt-4">
          <p className="text-xs sm:text-sm text-gray-500">
            Showing 10 of {filteredProjects.length} projects
          </p>
        </div>
      )}
    </div>
  );
}


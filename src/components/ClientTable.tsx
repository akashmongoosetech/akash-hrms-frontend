import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Plus, Search, MoreHorizontal, Eye } from 'lucide-react';

interface Client {
  _id: string;
  profile?: string;
  name: string;
  email: string;
  about?: string;
  country?: string;
  state?: string;
  city?: string;
  status: string;
}

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    about: '',
    country: '',
    state: '',
    city: '',
    status: 'Active'
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // projects for selected client
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [clientProjectsLoading, setClientProjectsLoading] = useState<boolean>(false);
  const [clientProjectsError, setClientProjectsError] = useState<string | null>(null);

  const formatDateSafe = (s?: string): string => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  useEffect(() => {
    fetchClients();
  }, []);

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
      } else {
        setError('Failed to fetch clients');
      }
    } catch (err) {
      setError('Error fetching clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingClient
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/clients/${editingClient._id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/clients`;

      const method = editingClient ? 'PUT' : 'POST';

      let response;
      if (profileFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          formDataToSend.append(key, (formData as any)[key]);
        });
        formDataToSend.append('profile', profileFile);

        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataToSend
        });
      } else {
        // Use JSON for non-file updates
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        fetchClients();
        setShowModal(false);
        resetForm();
      } else {
        setError('Failed to save client');
      }
    } catch (err) {
      setError('Error saving client');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchClients();
      } else {
        setError('Failed to delete client');
      }
    } catch (err) {
      setError('Error deleting client');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      about: '',
      country: '',
      state: '',
      city: '',
      status: 'Active'
    });
    setProfileFile(null);
    setEditingClient(null);
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        about: client.about || '',
        country: client.country || '',
        state: client.state || '',
        city: client.city || '',
        status: client.status
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openViewClient = async (client: Client) => {
    setViewClient(client);
    setClientProjects([]);
    setClientProjectsError(null);
    setClientProjectsLoading(true);
    try {
      const resp = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!resp.ok) throw new Error(`Failed to fetch projects: ${resp.status}`);
      const projects = await resp.json();
      // filter by client id; projects are populated with client and teamMembers
      const filtered = Array.isArray(projects)
        ? projects.filter((p: any) => (p?.client && (p.client._id === client._id)))
        : [];
      setClientProjects(filtered);
    } catch (e: any) {
      setClientProjectsError(e?.message || 'Error loading projects');
    } finally {
      setClientProjectsLoading(false);
    }
  };

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
    return <div className="text-center py-8">Loading clients...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div key={client._id} className="relative border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {client.profile ? (
                  <img
                    src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${client.profile}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{client.name}</h4>
                  <p className="text-xs text-gray-500">{client.email}</p>
                </div>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === client._id ? null : client._id)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                </button>
                {openMenuId === client._id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => { openViewClient(client); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => { openModal(client); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => { handleDelete(client._id); setOpenMenuId(null); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-700 line-clamp-3">
              {client.about || 'No description'}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {[client.city, client.state, client.country].filter(Boolean).join(', ') || '-'}
            </div>
            <div className="mt-3">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {client.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No clients found matching your search' : 'No clients found'}
        </div>
      )}

      {/* View Modal */}
      {viewClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Client Details</h3>
              <button onClick={() => setViewClient(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center space-x-3">
                {viewClient.profile ? (
                  <img
                    src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${viewClient.profile}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {viewClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{viewClient.name}</div>
                  <div className="text-gray-600">{viewClient.email}</div>
                </div>
              </div>
              <div>
                <div className="text-gray-500">About</div>
                <div className="text-gray-800">{viewClient.about || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Location</div>
                <div className="text-gray-800">{[viewClient.city, viewClient.state, viewClient.country].filter(Boolean).join(', ') || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    viewClient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {viewClient.status}
                  </span>
                </div>
              </div>

              {/* Projects Section */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-900 font-semibold">Projects</div>
                  <div className="text-xs text-gray-500">
                    {clientProjectsLoading ? 'Loading…' : `${clientProjects.length} project(s)`}
                  </div>
                </div>
                {clientProjectsError && (
                  <div className="text-xs text-red-600">{clientProjectsError}</div>
                )}
                {!clientProjectsLoading && clientProjects.length === 0 && !clientProjectsError && (
                  <div className="text-xs text-gray-500">No projects for this client.</div>
                )}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {clientProjects.map((p: any) => (
                    <div key={p._id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">Start: {formatDateSafe(p.startDate)}</div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-full ${
                          p.status === 'Active' ? 'bg-green-100 text-green-800' :
                          p.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      {p.description && (
                        <div className="mt-2 text-xs text-gray-700 line-clamp-2">{p.description}</div>
                      )}
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Team Members ({Array.isArray(p.teamMembers) ? p.teamMembers.length : 0})</div>
                        <div className="flex -space-x-2">
                          {(Array.isArray(p.teamMembers) ? p.teamMembers : []).map((m: any) => {
                            const fullName = [m?.firstName, m?.lastName].filter(Boolean).join(' ').trim();
                            const initials = fullName
                              ? fullName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
                              : (m?.email ? m.email[0].toUpperCase() : 'U');
                            const photo = m?.photo ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${m.photo}` : null;
                            return (
                              <div key={m._id || m} className="relative group">
                                {photo ? (
                                  <img
                                    src={photo}
                                    alt={fullName || 'Member'}
                                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[10px] font-semibold text-gray-700 shadow-sm">
                                    {initials}
                                  </div>
                                )}
                                <div className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  {fullName || (m?._id || 'Unknown')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => { setViewClient(null); openModal(viewClient); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewClient(null)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingClient ? 'Edit Client' : 'Add Client'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {editingClient?.profile && (
                  <p className="text-sm text-gray-500 mt-1">Leave empty to keep current image</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">About</label>
                <textarea
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {editingClient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
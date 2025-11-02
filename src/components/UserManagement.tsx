import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import DeleteModal from '../Common/DeleteModal';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joiningDate?: string;
  mobile1?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Employee',
    mobile1: '',
    joiningDate: '',
  });

  const currentRole = localStorage.getItem('role') || '';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      alert('Failed to fetch users: ' + err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      mobile1: user.mobile1 || '',
      joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password; // Don't update password if empty

      await API.put(`/users/${editingUser._id}`, updateData);
      alert('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert('Failed to update user: ' + err?.response?.data?.message);
    }
  };

  const handleDelete = (userId: string) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      await API.delete(`/users/${deleteUserId}`);
      alert('User deleted successfully');
      fetchUsers();
      setShowDeleteModal(false);
      setDeleteUserId(null);
    } catch (err: any) {
      alert('Failed to delete user: ' + err?.response?.data?.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.post('/users', formData);
      alert('User created successfully');
      setShowCreateForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Employee',
        mobile1: '',
        joiningDate: '',
      });
      fetchUsers();
    } catch (err: any) {
      alert('Failed to create user: ' + err?.response?.data?.message);
    }
  };

  const canEditRole = (targetRole: string) => {
    if (currentRole === 'SuperAdmin') return true;
    if (currentRole === 'Admin' && ['Employee', 'Admin'].includes(targetRole)) return true;
    return false;
  };

  if (loading) return <div className="text-center py-8">Loading users...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="tel"
              placeholder="Mobile"
              value={formData.mobile1}
              onChange={(e) => setFormData({ ...formData, mobile1: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="date"
              placeholder="Joining Date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="border p-2 rounded"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="Employee">Employee</option>
              {currentRole === 'Admin' && <option value="Admin">Admin</option>}
              {currentRole === 'SuperAdmin' && <option value="SuperAdmin">SuperAdmin</option>}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Edit User</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="New Password (leave empty to keep current)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="tel"
              placeholder="Mobile"
              value={formData.mobile1}
              onChange={(e) => setFormData({ ...formData, mobile1: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="date"
              placeholder="Joining Date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="border p-2 rounded"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="Employee">Employee</option>
              {canEditRole('Admin') && <option value="Admin">Admin</option>}
              {canEditRole('SuperAdmin') && <option value="SuperAdmin">SuperAdmin</option>}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Update
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'SuperAdmin' ? 'bg-red-100 text-red-800' :
                    user.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.mobile1 || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  {currentRole === 'SuperAdmin' && (
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
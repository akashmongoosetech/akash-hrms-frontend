import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import DeleteModal from '../../Common/DeleteModal';
import toast from 'react-hot-toast';
import { Edit, Trash2 } from 'lucide-react';
import Loader from '../common/Loader';
import UserTable from './UserTable';

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
  const [isCreating, setIsCreating] = useState(false);
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
      // Filter to show only Admin and SuperAdmin users
      const filteredData = res.data.users.filter((user: User) => user.role === 'Admin' || user.role === 'SuperAdmin');
      setUsers(filteredData);
    } catch (err: any) {
      toast.error('Failed to fetch users: ' + err?.response?.data?.message);
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
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to update user: ' + err?.response?.data?.message);
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
      toast.success('User deleted successfully');
      fetchUsers();
      setShowDeleteModal(false);
      setDeleteUserId(null);
    } catch (err: any) {
      toast.error('Failed to delete user: ' + err?.response?.data?.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await API.post('/users', formData);
      toast.success('User created successfully');
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
      toast.error('Failed to create user: ' + err?.response?.data?.message);
    } finally {
      setIsCreating(false);
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
      <UserTable />
    </div>
  );
}
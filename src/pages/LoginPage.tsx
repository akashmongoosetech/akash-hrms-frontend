import React, { useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('userName', res.data.firstName + ' ' + res.data.lastName);

      navigate('/dashboard');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border p-2 rounded w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 rounded-md shadow-md bg-blue-600 text-white">{loading ? '...' : 'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

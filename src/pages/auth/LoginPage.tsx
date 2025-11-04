import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Content Section */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Welcome to <span className="text-blue-600">HRMS Portal</span>
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Manage employees, track attendance, and streamline your HR operations effortlessly.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3 flex justify-center items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline font-medium">
              Create one
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right Illustration / Image Section */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg p-8 text-center"
        >
          <img
            src="https://intellipayroll.com/images/hrms.png"
            alt="HRMS Illustration"
            className="rounded-2xl shadow-lg mb-6"
          />
          <h2 className="text-2xl font-semibold mb-3">Simplify Your HR Management</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Empower your company with a digital HR solution — automate payroll, attendance, and employee performance tracking in one place.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

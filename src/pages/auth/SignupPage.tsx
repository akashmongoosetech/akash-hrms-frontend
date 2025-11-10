import React, { useState } from 'react';
import API from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState<any>({ role: 'Employee' });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p: any) => ({ ...p, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setForm((p: any) => ({ ...p, [e.target.name]: file }));
    if (e.target.name === 'photo') setPhotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      const plainFields = [
        'firstName', 'lastName', 'email', 'gender', 'dob', 'joiningDate', 'mobile1', 'mobile2', 'password',
        'address1', 'address2', 'emergencyContact1', 'emergencyContact2', 'emergencyContact3',
        'bankAccountName', 'bankAccountNo', 'bankName', 'ifscCode', 'bankAddress', 'aadharCardNumber',
        'drivingLicenseNumber', 'panCardNumber', 'facebook', 'twitter', 'linkedin', 'instagram', 'upworkProfile'
      ];
      plainFields.forEach(f => { if (form[f]) fd.append(f, form[f]); });

      if (form.skillsFrontend) fd.append('skillsFrontend', JSON.stringify(form.skillsFrontend.split(',').map((s: string) => s.trim())));
      if (form.skillsBackend) fd.append('skillsBackend', JSON.stringify(form.skillsBackend.split(',').map((s: string) => s.trim())));

      if (form.salaryAccountNo || form.salaryBankName || form.salaryIfsc) {
        fd.append('salaryDetails', JSON.stringify({ accountNo: form.salaryAccountNo, bankName: form.salaryBankName, ifscCode: form.salaryIfsc }));
      }

      fd.append('role', form.role || 'Employee');

      ['photo', 'aadharCardFile', 'panCardFile', 'drivingLicenseFile', 'resume'].forEach((key) => {
        if (form[key]) fd.append(key, form[key]);
      });

      const res = await API.post('/auth/signup', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Signup success — you can now login');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Signup error');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left section (Blue background) */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative items-center justify-center overflow-hidden">
        {/* Decorative geometric shapes */}
        <div className="absolute inset-0 flex flex-wrap justify-center items-center opacity-80">
          <div className="bg-blue-500 w-40 h-40 rounded-tl-full m-2"></div>
          <div className="bg-indigo-500 w-32 h-32 rounded-br-full m-2"></div>
          <div className="bg-pink-400 w-24 h-24 rounded-tr-full m-2"></div>
          <div className="bg-blue-400 w-28 h-28 rounded-bl-full m-2"></div>
        </div>

        {/* Logo + Text */}
        <div className="relative text-white text-center z-10">
          <h1 className="text-3xl font-bold mb-2">My HR</h1>
          <p className="text-blue-100">Stay organized</p>
        </div>
      </div>

      {/* Right section (Signup Form) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-6">Sign up to get started</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="firstName"
                onChange={handleChange}
                placeholder="First name"
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                name="lastName"
                onChange={handleChange}
                placeholder="Last name"
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <input
              name="email"
              onChange={handleChange}
              placeholder="Email"
              type="email"
              className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              name="gender"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <input
              name="password"
              onChange={handleChange}
              placeholder="Password"
              type="password"
              className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              name="mobile1"
              onChange={handleChange}
              placeholder="Mobile 1"
              className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>

              <div
                className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                onClick={() => document.getElementById('photo').click()}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="preview"
                    className="h-24 w-24 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 018 0m4-4v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m6-4V4m0 0L5 9m7-5l7 5" />
                    </svg>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium text-blue-600 hover:underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, up to 5MB</p>
                  </>
                )}

                <input
                  id="photo"
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition flex justify-center items-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

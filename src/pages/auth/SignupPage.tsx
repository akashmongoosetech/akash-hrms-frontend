import React, { useState } from 'react';
import API from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';

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
        'firstName','lastName','email','gender','dob','joiningDate','mobile1','mobile2','password',
        'address1','address2','emergencyContact1','emergencyContact2','emergencyContact3',
        'bankAccountName','bankAccountNo','bankName','ifscCode','bankAddress','aadharCardNumber',
        'drivingLicenseNumber','panCardNumber','facebook','twitter','linkedin','instagram','upworkProfile'
      ];
      plainFields.forEach(f => { if (form[f]) fd.append(f, form[f]); });

      if (form.skillsFrontend) fd.append('skillsFrontend', JSON.stringify(form.skillsFrontend.split(',').map((s: string) => s.trim())));
      if (form.skillsBackend) fd.append('skillsBackend', JSON.stringify(form.skillsBackend.split(',').map((s: string) => s.trim())));

      if (form.salaryAccountNo || form.salaryBankName || form.salaryIfsc) {
        fd.append('salaryDetails', JSON.stringify({ accountNo: form.salaryAccountNo, bankName: form.salaryBankName, ifscCode: form.salaryIfsc }));
      }

      fd.append('role', form.role || 'Employee');

      ['photo','aadharCardFile','panCardFile','drivingLicenseFile','resume'].forEach((key) => {
        if (form[key]) fd.append(key, form[key]);
      });

      const res = await API.post('/auth/signup', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Signup success — you can now login');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Signup error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">HR</div>
            <div>
              <h1 className="text-lg font-semibold">HRMS - Sign Up</h1>
              <p className="text-sm text-gray-500">Create your account</p>
            </div>
          </div>
        </header>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="firstName" onChange={handleChange} placeholder="First name" className="input" />
          <input name="lastName" onChange={handleChange} placeholder="Last name" className="input" />
          <input name="email" onChange={handleChange} placeholder="Email" type="email" className="input" />
          <select name="gender" onChange={handleChange} className="input">
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input name="password" onChange={handleChange} placeholder="Password" type="password" className="input" />
          <input name="mobile1" onChange={handleChange} placeholder="Mobile 1" className="input" />
          <select name="role" value={form.role} onChange={handleChange} className="input">
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
            <option value="SuperAdmin">SuperAdmin</option>
          </select>

          <div className="col-span-2">
            <label className="block text-sm text-gray-600">Photo (preview)</label>
            <div className="flex items-center gap-3">
              <input type="file" name="photo" onChange={handleFile} />
              {photoPreview && <img src={photoPreview} alt="preview" className="h-16 w-16 rounded-md" />}
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-end mt-4">
            <div>
              <button type="submit" className="px-6 py-2 rounded-md shadow-md bg-blue-600 text-white hover:opacity-95">
                {loading ? <Loader /> : 'Sign Up'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

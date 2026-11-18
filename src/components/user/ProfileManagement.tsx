import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  status?: string;
  gender?: string;
  dob?: string;
  joiningDate?: string;
  mobile1?: string;
  mobile2?: string;
  address1?: string;
  address2?: string;
  emergencyContact1?: string;
  emergencyContact2?: string;
  emergencyContact3?: string;
  skillsFrontend: string[];
  skillsBackend: string[];
  bankAccountName?: string;
  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  bankAddress?: string;
  aadharCardNumber?: string;
  drivingLicenseNumber?: string;
  panCardNumber?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  upworkProfile?: string;
  photo?: string;
  department?: { _id: string; name: string } | null;
}

type FieldType = 'text' | 'email' | 'tel' | 'date' | 'url' | 'textarea';

interface FieldDef {
  name: keyof UserProfile;
  label: string;
  type?: FieldType;
  placeholder?: string;
  full?: boolean;
}

// Fields the API lets an employee change on their own record
// (userController.js -> SELF_SERVICE_FIELDS).
const EDITABLE_FIELDS: (keyof UserProfile)[] = [
  'firstName', 'lastName', 'gender', 'dob', 'mobile1', 'mobile2',
  'address1', 'address2', 'emergencyContact1', 'emergencyContact2', 'emergencyContact3',
  'skillsFrontend', 'skillsBackend', 'bankAccountName', 'bankAccountNo', 'bankName',
  'ifscCode', 'bankAddress', 'aadharCardNumber', 'drivingLicenseNumber', 'panCardNumber',
  'facebook', 'twitter', 'linkedin', 'instagram', 'upworkProfile'
];

const PERSONAL_FIELDS: FieldDef[] = [
  { name: 'firstName', label: 'First Name', placeholder: 'First name' },
  { name: 'lastName', label: 'Last Name', placeholder: 'Last name' },
  { name: 'gender', label: 'Gender', placeholder: 'Select gender' },
  { name: 'dob', label: 'Date of Birth', type: 'date' },
];

const CONTACT_FIELDS: FieldDef[] = [
  { name: 'mobile1', label: 'Mobile 1', type: 'tel', placeholder: '+91 98765 43210' },
  { name: 'mobile2', label: 'Mobile 2', type: 'tel', placeholder: 'Alternate number' },
  { name: 'address1', label: 'Address 1', type: 'textarea', full: true },
  { name: 'address2', label: 'Address 2', type: 'textarea', full: true },
];

const EMERGENCY_FIELDS: FieldDef[] = [
  { name: 'emergencyContact1', label: 'Emergency Contact 1', type: 'tel' },
  { name: 'emergencyContact2', label: 'Emergency Contact 2', type: 'tel' },
  { name: 'emergencyContact3', label: 'Emergency Contact 3', type: 'tel' },
];

const BANK_FIELDS: FieldDef[] = [
  { name: 'bankAccountName', label: 'Account Holder Name' },
  { name: 'bankAccountNo', label: 'Account Number' },
  { name: 'bankName', label: 'Bank Name' },
  { name: 'ifscCode', label: 'IFSC Code' },
  { name: 'bankAddress', label: 'Bank Address', full: true },
];

const IDENTITY_FIELDS: FieldDef[] = [
  { name: 'aadharCardNumber', label: 'Aadhar Card Number' },
  { name: 'panCardNumber', label: 'PAN Card Number' },
  { name: 'drivingLicenseNumber', label: 'Driving License Number' },
];

const SOCIAL_FIELDS: FieldDef[] = [
  { name: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/...' },
  { name: 'upworkProfile', label: 'Upwork / Portfolio', type: 'url', placeholder: 'https://...' },
  { name: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
  { name: 'twitter', label: 'Twitter / X', type: 'url', placeholder: 'https://x.com/...' },
  { name: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...' },
];

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30';

const toDateInput = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const formatDate = (value?: string) => {
  if (!value) return 'Not specified';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'Not specified' : d.toLocaleDateString();
};

export default function ProfileManagement() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [newPassword, setNewPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/users/${userId}`);
      setProfile(res.data);
      setFormData(res.data);
      setPhotoPreview(res.data.photo || null);
    } catch (err: any) {
      toast.error('Failed to fetch profile: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (type: 'frontend' | 'backend', value: string) => {
    const skills = value.split(',').map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      [type === 'frontend' ? 'skillsFrontend' : 'skillsBackend']: skills,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetEditing = () => {
    setEditing(false);
    setFormData(profile || {});
    setPhotoFile(null);
    setNewPassword('');
    setPhotoPreview(profile?.photo || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      const fd = new FormData();

      // Only send fields the API accepts for self-service, so nothing is
      // silently dropped or rejected.
      EDITABLE_FIELDS.forEach((key) => {
        const value = formData[key];
        if (Array.isArray(value)) {
          fd.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          fd.append(key, String(value));
        }
      });

      if (photoFile) fd.append('photo', photoFile);
      if (newPassword.trim()) fd.append('password', newPassword.trim());

      await API.put(`/users/${userId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Profile updated successfully');
      setEditing(false);
      setPhotoFile(null);
      setNewPassword('');
      await fetchProfile();
    } catch (err: any) {
      toast.error('Failed to update profile: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="py-10 text-center text-gray-500">Profile not found</div>;

  const renderField = (field: FieldDef) => {
    const value = formData[field.name];
    const common = {
      id: String(field.name),
      name: String(field.name),
      value: field.type === 'date' ? toDateInput(value as string) : ((value as string) || ''),
      onChange: handleInputChange,
      className: inputClass,
      placeholder: field.placeholder,
    };

    return (
      <div key={String(field.name)} className={field.full ? 'md:col-span-2' : ''}>
        <label htmlFor={String(field.name)} className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
        </label>
        {field.name === 'gender' ? (
          <select {...common}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        ) : field.type === 'textarea' ? (
          <textarea {...common} rows={2} />
        ) : (
          <input {...common} type={field.type || 'text'} />
        )}
      </div>
    );
  };

  const section = (title: string, fields: FieldDef[]) => (
    <section className="space-y-4">
      <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{fields.map(renderField)}</div>
    </section>
  );

  const viewRow = (label: string, value?: React.ReactNode) => (
    <p className="text-sm">
      <span className="font-medium text-gray-700">{label}:</span>{' '}
      <span className="text-gray-900">{value || 'Not specified'}</span>
    </p>
  );

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="rounded-lg bg-white p-5 shadow-md sm:p-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-gray-500">No Photo</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <p className="mt-1 text-xs text-gray-500">
                {profile.role || 'Employee'}
                {profile.employeeCode ? ` · ${profile.employeeCode}` : ''}
                {profile.department?.name ? ` · ${profile.department.name}` : ''}
              </p>
            </div>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo */}
            <section className="space-y-3">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Profile Photo
              </h4>
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
            </section>

            {/* Read-only account details */}
            <section className="space-y-3">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Account
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input value={profile.email} readOnly className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500`} />
                  <p className="mt-1 text-xs text-gray-500">Login email — contact an Admin to change it.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Employee Code</label>
                  <input value={profile.employeeCode || ''} readOnly placeholder="Assigned by HR" className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500`} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Role / Department / Joining Date</label>
                  <input
                    value={[profile.role, profile.department?.name, profile.joiningDate ? formatDate(profile.joiningDate) : ''].filter(Boolean).join(' · ')}
                    readOnly
                    className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500`}
                  />
                  <p className="mt-1 text-xs text-gray-500">Managed by HR.</p>
                </div>
              </div>
            </section>

            {section('Personal Information', PERSONAL_FIELDS)}
            {section('Contact Details', CONTACT_FIELDS)}
            {section('Emergency Contacts', EMERGENCY_FIELDS)}

            {/* Skills */}
            <section className="space-y-4">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Skills</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Frontend Skills</label>
                  <input
                    value={formData.skillsFrontend?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange('frontend', e.target.value)}
                    placeholder="React, Vue, Angular"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Backend Skills</label>
                  <input
                    value={formData.skillsBackend?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange('backend', e.target.value)}
                    placeholder="Node.js, Python, Java"
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Separate skills with commas.</p>
            </section>

            {section('Bank Details', BANK_FIELDS)}
            {section('Identity Documents', IDENTITY_FIELDS)}
            {section('Social Links', SOCIAL_FIELDS)}

            <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={resetEditing}
                className="rounded-md bg-gray-600 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <section className="space-y-2">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Personal Information</h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {viewRow('Gender', profile.gender)}
                {viewRow('Date of Birth', formatDate(profile.dob))}
                {viewRow('Joining Date', formatDate(profile.joiningDate))}
                {viewRow('Employee Code', profile.employeeCode)}
                {viewRow('Department', profile.department?.name)}
                {viewRow('Status', profile.status)}
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Contact Details</h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {viewRow('Mobile 1', profile.mobile1)}
                {viewRow('Mobile 2', profile.mobile2)}
                {viewRow('Address 1', profile.address1)}
                {viewRow('Address 2', profile.address2)}
                {viewRow('Emergency Contact 1', profile.emergencyContact1)}
                {viewRow('Emergency Contact 2', profile.emergencyContact2)}
                {viewRow('Emergency Contact 3', profile.emergencyContact3)}
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Skills</h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {viewRow('Frontend', profile.skillsFrontend?.join(', ') || 'None specified')}
                {viewRow('Backend', profile.skillsBackend?.join(', ') || 'None specified')}
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Bank Details</h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {viewRow('Account Holder', profile.bankAccountName)}
                {viewRow('Account Number', profile.bankAccountNo)}
                {viewRow('Bank Name', profile.bankName)}
                {viewRow('IFSC Code', profile.ifscCode)}
                {viewRow('Bank Address', profile.bankAddress)}
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Identity Documents</h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {viewRow('Aadhar Card', profile.aadharCardNumber)}
                {viewRow('PAN Card', profile.panCardNumber)}
                {viewRow('Driving License', profile.drivingLicenseNumber)}
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Social Links</h4>
              <div className="space-y-1">
                {profile.linkedin && viewRow('LinkedIn', <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.linkedin}</a>)}
                {profile.upworkProfile && viewRow('Upwork / Portfolio', <a href={profile.upworkProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.upworkProfile}</a>)}
                {profile.facebook && viewRow('Facebook', <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.facebook}</a>)}
                {profile.twitter && viewRow('Twitter / X', <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.twitter}</a>)}
                {profile.instagram && viewRow('Instagram', <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.instagram}</a>)}
                {!profile.linkedin && !profile.upworkProfile && !profile.facebook && !profile.twitter && !profile.instagram && (
                  <p className="text-sm text-gray-500">No social links added yet.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

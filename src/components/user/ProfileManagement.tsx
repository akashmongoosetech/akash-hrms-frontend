import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
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
}

export default function ProfileManagement() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile & { photoFile?: File }>>({});
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
      if (res.data.photo) {
        setPhotoPreview(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${res.data.photo}`);
      }
    } catch (err: any) {
      toast.error('Failed to fetch profile: ' + err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (type: 'frontend' | 'backend', value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      [type === 'frontend' ? 'skillsFrontend' : 'skillsBackend']: skills
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, photoFile: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      // Add all form fields except file fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'photo' && value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            fd.append(key, JSON.stringify(value));
          } else {
            fd.append(key, value.toString());
          }
        }
      });

      // Add photo file if changed
      if (formData.photoFile) {
        fd.append('photo', formData.photoFile);
      }

      await API.put(`/users/${userId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err?.response?.data?.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (!profile) return <div className="text-center py-8">Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500">No Photo</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile 1</label>
                <input
                  type="tel"
                  name="mobile1"
                  value={formData.mobile1 || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address 1</label>
                <textarea
                  name="address1"
                  value={formData.address1 || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address 2</label>
                <textarea
                  name="address2"
                  value={formData.address2 || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  rows={2}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frontend Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skillsFrontend?.join(', ') || ''}
                  onChange={(e) => handleSkillsChange('frontend', e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="React, Vue, Angular"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backend Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skillsBackend?.join(', ') || ''}
                  onChange={(e) => handleSkillsChange('backend', e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Node.js, Python, Java"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub/Upwork Profile</label>
                <input
                  type="url"
                  name="upworkProfile"
                  value={formData.upworkProfile || ''}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(profile);
                  setPhotoPreview(profile.photo ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${profile.photo}` : null);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Photo and Basic Info */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500">No Photo</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h3>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-500">Role: {profile.role || 'Employee'}</p>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Gender:</span> {profile.gender || 'Not specified'}</p>
                  <p><span className="font-medium">Date of Birth:</span> {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not specified'}</p>
                  <p><span className="font-medium">Joining Date:</span> {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not specified'}</p>
                  <p><span className="font-medium">Mobile:</span> {profile.mobile1 || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Frontend:</span> {profile.skillsFrontend?.join(', ') || 'None specified'}</p>
                  <p><span className="font-medium">Backend:</span> {profile.skillsBackend?.join(', ') || 'None specified'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Address</h4>
                <div className="space-y-1 text-sm">
                  <p>{profile.address1 || 'Not specified'}</p>
                  <p>{profile.address2 || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Social Links</h4>
                <div className="space-y-1 text-sm">
                  {profile.linkedin && <p><span className="font-medium">LinkedIn:</span> <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.linkedin}</a></p>}
                  {profile.upworkProfile && <p><span className="font-medium">Profile:</span> <a href={profile.upworkProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.upworkProfile}</a></p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
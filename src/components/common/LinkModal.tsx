import React, { useState, useEffect } from 'react';
import { X, Eye, Edit, Trash2 } from 'lucide-react';
import API from '../../utils/api';

interface Link {
  _id: string;
  type: 'git' | 'excel' | 'codebase';
  title: string;
  url?: string;
  image?: string;
  file?: string;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  linkType: 'git' | 'excel' | 'codebase';
  link?: Link;
  onSuccess: () => void;
}

export default function LinkModal({ isOpen, onClose, mode, linkType, link, onSuccess }: LinkModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    image: '',
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      setFormData({
        title: link?.title || '',
        url: link?.url || '',
        image: link?.image || '',
        file: null,
      });
    } else {
      setFormData({ title: '', url: '', image: '', file: null });
    }
  }, [mode, link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', linkType);
      formDataToSend.append('title', formData.title);
      if (formData.url) formDataToSend.append('url', formData.url);
      if (formData.image) formDataToSend.append('image', formData.image);
      if (formData.file) formDataToSend.append('file', formData.file);

      if (mode === 'add') {
        await API.post('/links', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (mode === 'edit' && link) {
        await API.put(`/links/${link._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!link) return;

    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await API.delete(`/links/${link._id}`);
        onSuccess();
        onClose();
      } catch (error) {
        console.error('Error deleting link:', error);
      }
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isAddMode = mode === 'add';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isAddMode ? `Add ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} Link` :
             isEditMode ? `Edit ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} Link` :
             `View ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} Link`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {isViewMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <p className="mt-1 text-sm text-gray-900">{formData.title}</p>
            </div>
            {formData.url && (
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <p className="mt-1 text-sm text-gray-900">
                  <a href={formData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {formData.url}
                  </a>
                </p>
              </div>
            )}
            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <img src={formData.image} alt={formData.title} className="mt-1 max-w-full h-auto" />
              </div>
            )}
            {link?.file && (
              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <p className="mt-1 text-sm text-gray-900">{link.file}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => window.open(formData.url, '_blank')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!formData.url}
              >
                <Eye size={16} className="inline mr-1" /> View
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                <Trash2 size={16} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                disabled={isViewMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                disabled={isViewMode}
              />
            </div>

            {(linkType === 'excel' || linkType === 'codebase') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload File</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff,.svg,.webp,.heif,.heic,.raw,.cr2,.nef,.orf,.arw,.dng,.ico,.pdf,.doc,.docx,.odt,.rtf,.txt,.md,.tex,.epub,.mobi,.azw3,.xls,.xlsx,.ods,.csv,.tsv,.dat,.ppt,.pptx,.odp,.key,.mp3,.wav,.aac,.flac,.ogg,.wma,.mid,.midi,.m4a,.mp4,.avi,.mov,.mkv,.wmv,.flv,.webm,.3gp,.m4v,.zip,.rar,.7z,.tar,.gz,.bz2,.iso,.exe,.bat,.sh,.app,.dll,.sys,.ini,.cfg,.conf,.html,.htm,.css,.js,.mjs,.ts,.tsx,.jsx,.json,.xml,.yml,.yaml,.py,.java,.c,.cpp,.h,.hpp,.php,.rb,.go,.sql,.db,.bson,.json,.crt,.cer,.pem,.key,.pub,.pfx,.p12,.dwg,.dxf,.obj,.fbx,.stl,.3ds,.psd,.ai,.sketch,.fig"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    disabled={isViewMode}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isAddMode ? 'Add' : 'Update'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
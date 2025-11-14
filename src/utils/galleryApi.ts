import API from './api';

export const uploadProfilePicture = async (file: File, userId?: string) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const url = userId ? `/uploads/profile-picture/${userId}` : '/uploads/profile-picture';
  const response = await API.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getGalleryPictures = async (userId?: string) => {
  const url = userId ? `/uploads/gallery/${userId}` : '/uploads/gallery';
  const response = await API.get(url);
  return response.data;
};

export const getAllGalleryPictures = async () => {
  const response = await API.get('/uploads/gallery-all');
  return response.data;
};

export const deleteProfilePicture = async (userId: string, pictureUrl: string) => {
  const encodedUrl = encodeURIComponent(pictureUrl);
  const response = await API.delete(`/uploads/profile-picture/${userId}/${encodedUrl}`);
  return response.data;
};

export const getUsers = async () => {
  const response = await API.get('/users');
  return response.data;
};
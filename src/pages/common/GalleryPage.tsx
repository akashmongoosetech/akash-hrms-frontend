import React, { useState, useEffect, useRef } from "react";
import { Upload, User, Users, Camera, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import toast from "react-hot-toast";
import DeleteModal from "../../Common/DeleteModal";
import {
  uploadProfilePicture,
  getGalleryPictures,
  getAllGalleryPictures,
  deleteProfilePicture,
  getUsers
} from "../../utils/galleryApi";
import UploadModal from '../../components/gallery/UploadModal';
import ImageModal from '../../components/gallery/ImageModal';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  photo: string;
}

interface GalleryItem {
  user: User;
  pictures: string[];
}

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, userId: string} | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{userId: string, url: string} | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = localStorage.getItem("role") || "Employee";
    const userId = localStorage.getItem("userId") || "";
    setUserRole(role);
    setCurrentUserId(userId);
    if (role !== "Employee") {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchGallery();
    }
  }, [userRole]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      let data;
      if (userRole === "Employee") {
        data = await getGalleryPictures();
        setGallery([data]); // Only show own pictures
      } else {
        data = await getAllGalleryPictures();
        setGallery(data.gallery);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      // Filter only active users
      const activeUsers = data.users.filter((user: any) => user.status === 'Active');
      setUsers(activeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const uploadUserId = userRole === "Employee" ? undefined : selectedUserId;
      await uploadProfilePicture(file, uploadUserId);
      toast.success("Profile picture uploaded successfully");
      setShowUploadModal(false);
      setSelectedUserId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchGallery(); // Refresh gallery
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error("Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async (userId: string, pictureUrl: string) => {
    try {
      await deleteProfilePicture(userId, pictureUrl);
      fetchGallery(); // Refresh gallery
    } catch (error) {
      console.error("Error deleting picture:", error);
      toast.error("Failed to delete picture");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = url.split('/').pop() || 'image.jpg';
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Failed to download image');
    }
  };

  const canUpload = userRole !== "Employee" || (userRole === "Employee" && !selectedUserId);
  const canDelete = (itemUserId: string) => {
    return userRole !== "Employee" || itemUserId === currentUserId;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">
            {userRole === "Employee"
              ? "View and manage your profile pictures"
              : "View and manage all employee profile pictures"
            }
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Picture
        </Button>
      </div>

      {gallery.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pictures yet</h3>
          <p className="text-gray-600 mb-4">
            {userRole === "Employee"
              ? "Start by uploading your first profile picture"
              : "No profile pictures have been uploaded yet"
            }
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload First Picture
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <Card key={item.user._id} className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {item.user.photo ? (
                    <img
                      src={item.user.photo}
                      alt={`${item.user.firstName} ${item.user.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-semibold">
                      {item.user.firstName.charAt(0)}{item.user.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.user.firstName} {item.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.pictures.length} picture{item.pictures.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {item.pictures.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pictures uploaded</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {item.pictures.map((picture, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={picture}
                        alt={`Profile picture ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedImage({ url: picture, userId: item.user._id });
                          setShowImageModal(true);
                        }}
                      />
                      {canDelete(item.user._id) && (
                        <button
                          onClick={() => {
                            setDeleteItem({ userId: item.user._id, url: picture });
                            setShowDeleteModal(true);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <UploadModal
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        userRole={userRole}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        users={users}
        handleFileUpload={handleFileUpload}
        uploading={uploading}
        fileInputRef={fileInputRef}
      />

      <ImageModal
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        selectedImage={selectedImage}
        handleDownload={handleDownload}
        canDelete={canDelete}
        setDeleteItem={setDeleteItem}
        setShowDeleteModal={setShowDeleteModal}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (deleteItem) {
            await handleDeletePicture(deleteItem.userId, deleteItem.url);
            setShowImageModal(false);
          }
        }}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />
    </div>
  );
}
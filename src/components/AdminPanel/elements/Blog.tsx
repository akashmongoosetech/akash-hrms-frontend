import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlogCard from './BlogCard';
import DeleteModal from '../../../Common/DeleteModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { UniversalSkeleton, BaseSkeleton } from '../../ui/skeleton';
import toast from 'react-hot-toast';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  status: 'Published' | 'Draft';
  tags: string[];
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBlogSlug, setDeleteBlogSlug] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12; // More items per page for card view

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  const fetchBlogs = async (page: number = 1) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/blogs?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (err) {
      setError('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (slug: string) => {
    setDeleteBlogSlug(slug);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteBlogSlug) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/blogs/${deleteBlogSlug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchBlogs(currentPage);
        setShowDeleteModal(false);
        setDeleteBlogSlug(null);
        toast.success('Blog deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete blog');
      }
    } catch (err) {
      setError('Error deleting blog');
      toast.error('Error deleting blog');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (slug: string) => {
    navigate(`/blogs/${slug}`);
  };

  const handleEdit = (slug: string) => {
    navigate(`/blogs/edit/${slug}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <BaseSkeleton className="h-6 w-20" />
          <BaseSkeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <UniversalSkeleton className="h-48 w-full" />
              <div className="p-6">
                <UniversalSkeleton className="h-5 w-3/4 mb-2" />
                <UniversalSkeleton className="h-4 w-full mb-1" />
                <UniversalSkeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center space-x-2 mb-4">
                  <UniversalSkeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <UniversalSkeleton className="h-4 w-20 mb-1" />
                    <UniversalSkeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <UniversalSkeleton className="h-8 w-8 rounded" />
                  <UniversalSkeleton className="h-8 w-8 rounded" />
                  <UniversalSkeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Blog Management</h3>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first blog post.</p>
          <button
            onClick={() => navigate('/blogs/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Blog
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '../../../Common/Commonfunction';

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
    photo?: string;
  };
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogCardProps {
  blog: Blog;
  onView: (slug: string) => void;
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
}

export default function BlogCard({ blog, onView, onEdit, onDelete }: BlogCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${blog.featuredImage}`}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              blog.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {blog.status}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {blog.excerpt}
          </p>
        )}

        {/* Author and Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {blog.author.photo ? (
              <img
                src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${blog.author.photo}`}
                alt={blog.author.firstName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {blog.author.firstName[0]}{blog.author.lastName[0]}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {blog.author.firstName} {blog.author.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(blog.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{blog.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => onView(blog.slug)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Read More
          </button>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(blog.slug)}
              className="p-2 rounded-lg hover:bg-gray-100 text-purple-600 transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(blog.slug)}
              className="p-2 rounded-lg hover:bg-gray-100 text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
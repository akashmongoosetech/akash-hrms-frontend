import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Share2,
} from "lucide-react";
import API from "../../utils/api";
import BlogCard from "../../components/AdminPanel/elements/BlogCard";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  sections: Array<{
    heading: string;
    content: string;
    image: string;
  }>;
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

export default function BlogViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await API.get(`/blogs/${slug}`);
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        const response = await API.get(`/users/${userId}`);
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (slug) {
      fetchBlog();
    }
    fetchCurrentUser();
  }, [slug]);

  useEffect(() => {
    if (blog) {
      const fetchRelatedBlogs = async () => {
        try {
          const response = await API.get('/blogs');
          const allBlogs = response.data.blogs || [];
          const related = allBlogs
            .filter((b: Blog) => b._id !== blog._id && b.tags.some(tag => blog.tags.includes(tag)))
            .sort((a: Blog, b: Blog) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 2);
          setRelatedBlogs(related);
        } catch (error) {
          console.error("Error fetching related blogs:", error);
        }
      };
      fetchRelatedBlogs();
    }
  }, [blog]);

  const shareCurrentPage = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  const apiURL =
    (import.meta as any).env.VITE_API_URL || "http://localhost:5000";

  if (loading) {
    return (
      <div className="py-8 max-w-4xl mx-auto font-[Inter] bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 py-4 border-b border-gray-100 mb-8">
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Card Skeleton */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Featured Image Skeleton */}
            <div className="h-80 bg-gray-200"></div>

            <div className="p-10 space-y-6">
              {/* Author Skeleton */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>

              {/* Title Skeleton */}
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
              </div>

              {/* Excerpt Skeleton */}
              <div className="h-6 bg-gray-200 rounded w-5/6"></div>

              {/* Social Skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="flex gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-11 h-11 bg-gray-200 rounded-full"></div>
                  ))}
                </div>
              </div>

              {/* Content Skeleton */}
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>

              {/* Sections Skeleton */}
              <div className="space-y-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border-t border-gray-200 pt-10 bg-gray-50/50 rounded-lg p-6 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags Skeleton */}
              <div className="mt-12 pt-8 border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
                  ))}
                </div>
              </div>

              {/* Related Posts Skeleton */}
              <div className="mt-16 pt-12 border-t border-gray-200">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="py-16 max-w-4xl mx-auto text-center bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blog Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto font-[Inter] bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-sm py-4 z-30 border-b border-gray-100 mb-8 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-900 truncate">
          {blog.title}
        </h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="relative overflow-hidden">
            <img
              src={`${apiURL}/${blog.featuredImage}`}
              alt={blog.title}
              className="w-full h-80 object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="p-10">
          {/* Author */}
          <div className="flex items-center gap-4 mb-10 bg-gray-50 rounded-xl p-4">
            <img
              src={
                blog.author.photo
                  ? `${apiURL}/${blog.author.photo}`
                  : "/default-avatar.png"
              }
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex-1">
              <h4 className="text-gray-900 font-semibold text-lg">
                {blog.author.firstName} {blog.author.lastName}
              </h4>
              <p className="text-sm text-gray-600">{blog.author.email}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Published</p>
              <p className="text-sm text-gray-500">
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl text-gray-600 italic mb-8 leading-relaxed border-l-4 border-indigo-500 pl-6">{blog.excerpt}</p>
          )}

          {/* Social Share */}
          <div className="flex items-center gap-4 mb-10">
            <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>
            <button
              className="p-3 rounded-full bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200 transform hover:scale-110"
              onClick={shareCurrentPage}
              title="Copy Link"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              className="p-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 transform hover:scale-110"
              title="Share on Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
              target="_blank"
              className="p-3 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-500 hover:text-sky-600 transition-all duration-200 transform hover:scale-110"
              title="Share on Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>

            <a
              href={`https://www.linkedin.com/shareArticle?url=${window.location.href}`}
              target="_blank"
              className="p-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-all duration-200 transform hover:scale-110"
              title="Share on LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>

            <button
              className="p-3 rounded-full bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200 transform hover:scale-110"
              onClick={shareCurrentPage}
              title="Copy Link"
            >
              <LinkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12 text-gray-800 leading-relaxed text-[17px] prose-headings:text-gray-900 prose-p:mb-4 prose-li:mb-2">
            {blog.content}
          </div>

          {/* Sections */}
          {blog.sections?.length > 0 && (
            <div className="space-y-12">
              {blog.sections.map((sec, index) => (
                <div key={index} className="border-t border-gray-200 pt-10 bg-gray-50/50 rounded-lg p-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {sec.heading}
                  </h2>

                  {sec.image && (
                    <div className="mb-6 overflow-hidden rounded-xl shadow-lg">
                      <img
                        src={`${apiURL}/${sec.image}`}
                        className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                {blog.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm font-medium rounded-full hover:from-indigo-200 hover:to-purple-200 transition-all duration-200 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Thanks Cards */}
          <div className=" pt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800">
                  Thanks for reading "{blog.title}"
                </h4>
                <p className="text-lg text-gray-800 mt-1">
                  Written by:
                  {/* {blog.author.firstName} {blog.author.lastName} */}
                </p>
                <div className="flex justify-items-center">
                  <div className="">
                    <img
                      src={
                        blog.author.photo
                          ? `${apiURL}/${blog.author.photo}`
                          : "/default-avatar.png"
                      }
                      alt={blog.author.firstName}
                      className="w-14 h-14 rounded-full object-cover mt-3 border-2 border-white shadow-md"
                    />
                  </div>
                  <div className="">
                    <p className="mt-4 ml-4 text-sm text-gray-600">{blog.author.firstName} {blog.author.lastName}</p>
                    <p className="ml-4 text-sm text-gray-600">{blog.author.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800">
                  Welcome back, {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Reader'}!
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Keep exploring our blog posts.
                </p>
                {currentUser && currentUser.photo && (
                  <img
                    src={`${apiURL}/${currentUser.photo}`}
                    alt={currentUser.firstName}
                    className="w-14 h-14 rounded-full object-cover mt-3 border-2 border-white shadow-md"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Related Posts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {relatedBlogs.map((relBlog) => (
                  <div
                    key={relBlog._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/blog/${relBlog.slug}`)}
                  >
                    {/* Featured Image */}
                    {relBlog.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={`${apiURL}/${relBlog.featuredImage}`}
                          alt={relBlog.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relBlog.title}
                      </h3>

                      {/* Excerpt */}
                      {relBlog.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {relBlog.excerpt}
                        </p>
                      )}

                      {/* Author and Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {relBlog.author.photo ? (
                            <img
                              src={`${apiURL}/${relBlog.author.photo}`}
                              alt={relBlog.author.firstName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {relBlog.author.firstName[0]}{relBlog.author.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {relBlog.author.firstName} {relBlog.author.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(relBlog.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          Read More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

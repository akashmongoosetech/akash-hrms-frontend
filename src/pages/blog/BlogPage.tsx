import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { FileText, Users, Calendar, Search, Star, Clock, Heart, Tag } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  status: 'published' | 'draft' | 'archived';
}

interface BlogStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const blogStats: BlogStats[] = [
  { label: 'Total Posts', value: 45, variant: 'primary', icon: FileText },
  { label: 'Total Views', value: 12847, variant: 'success', icon: Eye },
  { label: 'Total Likes', value: 3821, variant: 'info', icon: Heart },
  { label: 'Active Authors', value: 8, variant: 'info', icon: Users },
];

const BlogPage: React.FC = () => {
  const { notify } = useToast();

  const handleCreatePost = () => {
    notify({
      title: 'Post Created',
      description: 'New blog post has been created',
      variant: 'success',
    });
  };

  const filterOptions = ['All Posts', 'Published', 'Draft', 'Archived'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Company news, updates, and insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Write Post</span>
            </div>
          </div>
          </Card>
        </div>

      {/* Blog Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {blogStats.map((stat, index) => (
          <Card
            key={index}
            className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant} size="sm" />
          </Card>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl shadow-soft mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>All Posts</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
          <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>All Categories</option>
            <option>Company</option>
            <option>Culture</option>
            <option>Tech</option>
          </select>
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button variant="primary" size="sm">
            <Search className="mr-2 h-4 w-4" /> Write Post
          </Button>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
          (num) => (
            <Card
              key={num}
              className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {`Company Update ${num}`}
                  </h3>
                  <StatusBadge status="info" size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">2 min read</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{`Category ${num}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-500">4.5</span>
                  </div>
                  <span className="text-xs text-gray-500">{num}K views</span>
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default BlogPage;
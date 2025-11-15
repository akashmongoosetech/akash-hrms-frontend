import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import API from '../../../utils/api';

interface Section {
  heading: string;
  content: string;
  image: File | null;
}

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: File | null;
  sections: Section[];
  status: 'Published' | 'Draft';
  tags: string;
  author: string;
}

const BlogAddEdit: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const isEdit = !!slug;
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      sections: [{ heading: '', content: '', image: null }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [sectionPreviews, setSectionPreviews] = useState<(string | null)[]>([null]);
  const [blogData, setBlogData] = useState<any>(null);

  useEffect(() => {
    API.get('/users').then(res => {
      setUsers(res.data.users);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (isEdit && slug) {
      API.get(`/blogs/${slug}`).then(res => {
        const blog = res.data;
        setBlogData(blog);
        // Reset form with blog data
        reset({
          title: blog.title || '',
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          status: blog.status || 'Draft',
          tags: blog.tags ? blog.tags.join(', ') : '',
          author: blog.author?._id || '',
          sections: blog.sections || [{ heading: '', content: '', image: null }],
        });
        if (blog.featuredImage) {
          setFeaturedImagePreview(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${blog.featuredImage}`);
        }
        if (blog.sections) {
          setSectionPreviews(blog.sections.map((section: any) => section.image ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${section.image}` : null));
        }
      }).catch(err => console.error(err));
    }
  }, [isEdit, slug, reset]);

  const addSection = () => {
    append({ heading: '', content: '', image: null });
    setSectionPreviews([...sectionPreviews, null]);
  };

  const removeSection = (index: number) => {
    remove(index);
    setSectionPreviews(sectionPreviews.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('title', data.title);
      if (data.excerpt) formData.append('excerpt', data.excerpt);
      if (data.content) formData.append('content', data.content);
      formData.append('status', data.status || 'Draft');
      if (data.tags) formData.append('tags', data.tags);
      formData.append('author', data.author);

      // Add sections as JSON
      if (data.sections.length > 0) {
        formData.append('sections', JSON.stringify(data.sections));
      }

      // Add files
      if (data.featuredImage) {
        formData.append('featuredImage', data.featuredImage);
      }

      // Add section images
      data.sections.forEach((section, index) => {
        if (section.image) {
          formData.append(`sectionImage${index}`, section.image);
        }
      });

      const response = await (isEdit ? API.put(`/blogs/${slug}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }) : API.post('/blogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }));

      console.log(`Blog ${isEdit ? 'updated' : 'created'}:`, response.data);
      // TODO: Show success message and redirect
    } catch (error) {
      console.error('Error creating blog:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => <Input {...field} id="title" placeholder="Enter blog title" />}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Controller
                name="excerpt"
                control={control}
                render={({ field }) => <Input {...field} id="excerpt" placeholder="Brief description" />}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => <Textarea {...field} id="content" placeholder="Main content of the blog" rows={4} />}
            />
          </div>
          <div>
            <Label htmlFor="featuredImage">Featured Image</Label>
            <Controller
              name="featuredImage"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Input
                  {...field}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onChange(file);
                    setFeaturedImagePreview(file ? URL.createObjectURL(file) : null);
                  }}
                  id="featuredImage"
                />
              )}
            />
            {featuredImagePreview && (
              <img src={featuredImagePreview} alt="Featured Image Preview" className="w-32 h-32 object-cover mt-2 rounded border" />
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Sections</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium">Section {index + 1}</h4>
                {fields.length > 1 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeSection(index)}>
                    Remove
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`sections.${index}.heading`}>Heading *</Label>
                  <Controller
                    name={`sections.${index}.heading`}
                    control={control}
                    rules={{ required: 'Heading is required' }}
                    render={({ field }) => <Input {...field} id={`sections.${index}.heading`} placeholder="Section heading" />}
                  />
                  {errors.sections?.[index]?.heading && (
                    <p className="text-red-500 text-sm mt-1">{errors.sections[index].heading.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`sections.${index}.content`}>Content *</Label>
                  <Controller
                    name={`sections.${index}.content`}
                    control={control}
                    rules={{ required: 'Content is required' }}
                    render={({ field }) => <Textarea {...field} id={`sections.${index}.content`} placeholder="Section content" rows={3} />}
                  />
                  {errors.sections?.[index]?.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.sections[index].content.message}</p>
                  )}
                </div>
                <div>
            <Label>Author *</Label>
            <Controller
              name="author"
              control={control}
              rules={{ required: 'Author is required' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex items-center">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarImage src={user.photo} />
                            {/* <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback> */}
                          </Avatar>
                          {user.firstName} {user.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
          </div>
                <div>
                  <Label htmlFor={`sections.${index}.image`}>Image Upload</Label>
                  <Controller
                    name={`sections.${index}.image`}
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        {...field}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onChange(file);
                          const newPreviews = [...sectionPreviews];
                          newPreviews[index] = file ? URL.createObjectURL(file) : null;
                          setSectionPreviews(newPreviews);
                        }}
                        id={`sections.${index}.image`}
                      />
                    )}
                  />
                  {sectionPreviews[index] && (
                    <img src={sectionPreviews[index]!} alt={`Section ${index + 1} Preview`} className="w-32 h-32 object-cover mt-2 rounded border" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addSection} variant="outline">
            Add Section
          </Button>
        </div>

        {/* Publishing Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Publishing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => <Input {...field} id="tags" placeholder="Separate tags with commas" />}
              />
            </div>
          </div>
          
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting...' : (isEdit ? 'Update Blog' : 'Submit Blog')}
        </Button>
      </form>
    </div>
  );
};

export default BlogAddEdit;
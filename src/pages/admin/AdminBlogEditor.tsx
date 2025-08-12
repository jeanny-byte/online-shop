// Use API URL from .env
const API_URL = "https://nelysah-server.onrender.com";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AdminLayout from './components/AdminLayout';
import { fetchBlogPostById, createBlogPost, updateBlogPost } from '@/lib/blogUtils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/RichTextEditor';
import { Loader2, ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface FormValues {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author_id?: string | null;
  published: boolean;
}

const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      image: '',
      author_id: undefined,
      published: true,
    }
  });
  
  const watchContent = watch('content');
  
  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      
      try {
        const post = await fetchBlogPostById(id);
        
        if (!post) {
          toast({
            title: "Error",
            description: "Blog post not found",
            variant: "destructive",
          });
          navigate('/admin/blog');
          return;
        }
        
        reset({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image,
          author_id: post.author_id ?? undefined,
          published: post.published,
        });
        
        setImagePreview(post.image);
      } catch (error) {
        console.error('Error loading blog post:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isEditMode) {
      loadPost();
    }
  }, [id, navigate, reset, isEditMode]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create/edit blog posts",
        variant: "destructive",
      });
      return;
    }
    
    if (!imagePreview) {
      toast({
        title: "Error",
        description: "Please upload a featured image",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('excerpt', data.excerpt);
    formData.append('content', data.content);
    formData.append('published', String(data.published));
    if (data.author_id) {
      formData.append('author_id', data.author_id);
    }

    if (imageFile) {
      formData.append('image', imageFile);
    } else {
      formData.append('image', data.image); // Send existing image URL if not changed
    }
    
    try {
      const response = isEditMode
        ? await updateBlogPost(id!, formData)
        : await createBlogPost(formData);

      if (response.error) {
        throw new Error(response.error.error || 'An unknown error occurred');
      }

      toast({
        title: `Blog post ${isEditMode ? 'updated' : 'created'} successfully!`,
      });
      navigate('/admin/blog');

    } catch (error: any) {
      console.error('Failed to submit post:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} post`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEditMode ? "Edit Blog Post" : "Create Blog Post"}>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={isEditMode ? "Edit Blog Post" : "Create Blog Post"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-border rounded-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  {...register('title', { required: "Title is required" })}
                  className="font-serif text-xl"
                  placeholder="Enter blog post title"
                />
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea 
                  id="excerpt" 
                  {...register('excerpt', { required: "Excerpt is required" })}
                  placeholder="Enter a short excerpt (will be displayed in blog listings)"
                  rows={3}
                />
                {errors.excerpt && <p className="text-destructive text-sm mt-1">{errors.excerpt.message}</p>}
              </div>
            </div>
            
            <div>
              <Label className="block mb-2">Featured Image</Label>
              <div className="border-2 border-dashed border-border rounded-md p-4 text-center">
                {imagePreview ? (
                  <div className="relative group">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={imagePreview} 
                        alt="Featured"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label htmlFor="featured-image-upload" className="cursor-pointer">
                        <Button type="button" variant="secondary">
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Change Image
                        </Button>
                        <input 
                          id="featured-image-upload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="featured-image-upload" 
                    className="flex flex-col items-center justify-center h-48 cursor-pointer"
                  >
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload featured image
                    </p>
                    <input 
                      id="featured-image-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-border rounded-md p-6">
          <Label className="block mb-2">Content</Label>
          <RichTextEditor 
            value={watchContent}
            onChange={(value) => setValue('content', value, { shouldValidate: true })}
          />
          {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
        </div>
        
        <div className="bg-white border border-border rounded-md p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="published" 
              checked={watch('published')}
              onCheckedChange={(checked) => setValue('published', checked)}
            />
            <Label htmlFor="published">Publish post</Label>
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/blog')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Post" : "Create Post"
              )}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminBlogEditor;

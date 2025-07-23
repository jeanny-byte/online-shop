import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AdminLayout from './components/AdminLayout';
import { fetchBlogPostById, createBlogPost, updateBlogPost, uploadBlogImage, generateSlug } from '@/lib/blogUtils';
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
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
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
        
        setImageUrl(post.image);
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
  
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const { url, error } = await uploadBlogImage(file);
      
      if (error || !url) {
        throw new Error('Failed to upload image');
      }
      
      setImageUrl(url);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
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
    
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please upload a featured image",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const slug = isEditMode ? 
        (await fetchBlogPostById(id!))?.slug || generateSlug(data.title) : 
        generateSlug(data.title);
      
      if (isEditMode && id) {
        const { data: updatedPost, error } = await updateBlogPost(id, {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          image: imageUrl,
          author_id: user?.id,
          published: data.published,
        });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
        navigate('/admin/blog');
      } else {
        const { data: createdPost, error } = await createBlogPost({
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          image: imageUrl,
          author_id: user?.id,
          slug,
          published: data.published,
        });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
        navigate('/admin/blog');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update blog post" : "Failed to create blog post",
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
              <div className="border border-dashed border-border rounded-md overflow-hidden">
                {imageUrl ? (
                  <div className="relative group">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={imageUrl} 
                        alt="Featured" 
                        className="w-full h-full object-cover"
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
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }} 
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
                      {uploadingImage ? "Uploading..." : "Upload featured image"}
                    </p>
                    <input 
                      id="featured-image-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }} 
                      className="hidden" 
                      disabled={uploadingImage}
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
            onImageUpload={handleImageUpload}
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

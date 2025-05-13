
import { supabase } from './supabase';
import { Database } from '@/types/supabase';

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export const fetchBlogPosts = async (limit?: number) => {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
};

export const fetchBlogPostBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    if (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
};

export const fetchAllBlogPosts = async (includeUnpublished = false) => {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!includeUnpublished) {
      query = query.eq('published', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching all blog posts:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch all blog posts:', error);
    return [];
  }
};

export const fetchBlogPostById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching blog post by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch blog post by ID:', error);
    return null;
  }
};

export const createBlogPost = async (postData: Omit<Database['public']['Tables']['blog_posts']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating blog post:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return { data: null, error };
  }
};

export const updateBlogPost = async (id: string, postData: Partial<Database['public']['Tables']['blog_posts']['Update']>) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating blog post:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Failed to update blog post:', error);
    return { data: null, error };
  }
};

export const deleteBlogPost = async (id: string) => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting blog post:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    return { success: false, error };
  }
};

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const uploadBlogImage = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `blog/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { url: null, error: uploadError };
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Failed to upload image:', error);
    return { url: null, error };
  }
};

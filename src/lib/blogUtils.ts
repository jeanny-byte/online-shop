
import axios from 'axios';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const fetchBlogPosts = async (limit?: number) => {
  try {
    const url = limit ? `${API_URL}/api/blog?limit=${limit}` : `${API_URL}/api/blog`;
    const response = await axios.get<BlogPost[]>(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
};

export const fetchBlogPostBySlug = async (slug: string) => {
  try {
    const response = await axios.get<BlogPost>(`${API_URL}/api/blog/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
};

export const fetchBlogPostById = async (id: string) => {
  try {
    const response = await axios.get<BlogPost>(`${API_URL}/api/blog/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch blog post by ID:', error);
    return null;
  }
};

export const fetchAllBlogPosts = async (includeUnpublished = false) => {
  try {
    // For admin: fetch all, for public: only published
    const url = `${API_URL}/api/blog`;
    const response = await axios.get<BlogPost[]>(url);
    if (includeUnpublished) {
      // Filter unpublished if needed, or extend backend as needed
      return response.data;
    } else {
      return response.data.filter(post => post.published);
    }
  } catch (error) {
    console.error('Failed to fetch all blog posts:', error);
    return [];
  }
};


export const createBlogPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      `${API_URL}/api/blog`,
      postData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { data: response.data, error: null };
  } catch (error: any) {
    console.error('Failed to create blog post:', error);
    return { data: null, error: error?.response?.data?.error || error.message };
  }
};

export const updateBlogPost = async (id: string, postData: Partial<BlogPost>) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(
      `${API_URL}/api/blog/${id}`,
      postData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { data: response.data, error: null };
  } catch (error: any) {
    console.error('Failed to update blog post:', error);
    return { data: null, error: error?.response?.data?.error || error.message };
  }
};

export const deleteBlogPost = async (id: string) => {
  try {
    const token = localStorage.getItem('authToken');
    await axios.delete(`${API_URL}/api/blog/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Failed to delete blog post:', error);
    return { success: false, error: error?.response?.data?.error || error.message };
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


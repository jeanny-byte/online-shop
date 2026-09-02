import { normalizeImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from './imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  content: string;
  image: string;
  excerpt: string;
  author_id?: string | number | null;
  author?: {
    id: number;
    name: string;
  };
  published: boolean;
  created_at: string;
  updated_at: string;
}

const normalizePost = (post: any): BlogPost => {
  if (!post) return post;
  return {
    ...post,
    image: normalizeImageUrl(post.image, DEFAULT_PLACEHOLDER_IMAGE),
  };
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const fetchBlogPosts = async (limit?: number): Promise<BlogPost[]> => {
  const url = limit ? `${API_URL}/api/blog-posts?limit=${limit}` : `${API_URL}/api/blog-posts`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch blog posts');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizePost) : [];
};

export const fetchAllBlogPosts = async (includeUnpublished = false): Promise<BlogPost[]> => {
  const url = `${API_URL}/api/blog-posts?admin=1${includeUnpublished ? '&all=1' : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch all blog posts');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizePost) : [];
};

export const fetchBlogPostById = async (id: string | number): Promise<BlogPost | null> => {
  const res = await fetch(`${API_URL}/api/blog-posts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  return normalizePost(await res.json());
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const res = await fetch(`${API_URL}/api/blog-posts/slug/${slug}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) return null;
  return normalizePost(await res.json());
};

export const createBlogPost = async (postData: FormData): Promise<{ data: BlogPost | null; error: any }> => {
  try {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_URL}/api/blog-posts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: postData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to create post' }));
      return { data: null, error };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateBlogPost = async (id: string | number, postData: FormData): Promise<{ data: BlogPost | null; error: any }> => {
  try {
    const token = localStorage.getItem('jwt_token');
    postData.append('_method', 'PUT'); // Laravel requires this for multipart/form-data PUT requests
    const res = await fetch(`${API_URL}/api/blog-posts/${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: postData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to update post' }));
      return { data: null, error };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteBlogPost = async (id: string | number): Promise<{ success: boolean; error: any }> => {
  try {
    const token = localStorage.getItem('jwt_token');
    const res = await fetch(`${API_URL}/api/blog-posts/${id}`, { 
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      }
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to delete post' }));
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

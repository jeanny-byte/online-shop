export interface BlogPost {
  id: string; // char(36)
  title: string;
  slug: string;
  content: string;
  image: string;
  excerpt: string;
  author_id?: string | null;
  published: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export const fetchBlogPosts = async (limit?: number): Promise<BlogPost[]> => {
  const url = limit ? `/api/blog-posts?limit=${limit}` : '/api/blog-posts';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch blog posts');
  return await res.json();
};

export const fetchAllBlogPosts = async (includeUnpublished = false): Promise<BlogPost[]> => {
  const url = `/api/blog-posts?admin=1${includeUnpublished ? '&all=1' : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch all blog posts');
  return await res.json();
};

export const fetchBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const res = await fetch(`/api/blog-posts/${id}`);
  if (!res.ok) return null;
  return await res.json();
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const res = await fetch(`/api/blog-posts/slug/${slug}`);
  if (!res.ok) return null;
  return await res.json();
};

export const createBlogPost = async (postData: FormData): Promise<{ data: BlogPost | null; error: any }> => {
  try {
    const res = await fetch('/api/blog-posts', {
      method: 'POST',
      body: postData,
    });
    if (!res.ok) {
      const error = await res.json();
      return { data: null, error };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateBlogPost = async (id: string, postData: FormData): Promise<{ data: BlogPost | null; error: any }> => {
  try {
    const res = await fetch(`/api/blog-posts/${id}`, {
      method: 'PUT',
      body: postData,
    });
    if (!res.ok) {
      const error = await res.json();
      return { data: null, error };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteBlogPost = async (id: string): Promise<{ success: boolean; error: any }> => {
  try {
    const res = await fetch(`/api/blog-posts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
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

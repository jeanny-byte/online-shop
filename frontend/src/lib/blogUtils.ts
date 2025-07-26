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

export const createBlogPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: BlogPost | null; error: any }> => {
  try {
    const res = await fetch('/api/blog-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
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

export const updateBlogPost = async (id: string, postData: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: BlogPost | null; error: any }> => {
  try {
    const res = await fetch(`/api/blog-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
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

// Stub for image upload used in AdminBlogEditor
export const uploadBlogImage = async (file: File): Promise<{ url: string | null; error: any }> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = 'Failed to upload image';
      try {
        const error = await response.json();
        errorMsg = error?.error || errorMsg;
      } catch {}
      return { url: null, error: errorMsg };
    }

    const data = await response.json();
    return { url: data.url, error: null };
  } catch (error) {
    return { url: null, error };
  }
};

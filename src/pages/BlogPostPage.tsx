import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBlogPostBySlug, BlogPost } from '@/lib/blogUtils';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.VITE_API_URL;

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      try {
        const data = await fetchBlogPostBySlug(slug);
        
        if (!data) {
          navigate('/blog', { replace: true });
          return;
        }
        
        setPost(data);
      } catch (error) {
        console.error('Error loading blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium mb-4">{post.title}</h1>
            <p className="text-muted-foreground">Published {formattedDate}</p>
          </header>
          
          <div className="mb-8">
            <img 
              src={post.image ? post.image : '/placeholder.jpg'} 
              alt={post.title} 
              className="w-full h-auto rounded-lg object-cover aspect-video"
            />
          </div>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;

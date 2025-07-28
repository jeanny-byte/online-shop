import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPost } from '@/lib/blogUtils';
import { formatDistanceToNow } from 'date-fns';

// Use API URL from .env
const API_URL = import.meta.env.VITE_API_URL;

interface BlogPostPreviewProps {
  post: Readonly<BlogPost>;
  className?: string;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ post, className }) => {
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="aspect-w-16 aspect-h-9">
        <img 
          src={`${API_URL}${post.image}`} 
          alt={post.title} 
          className="w-full h-48 object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="font-serif">
          <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
      </CardContent>
      <CardFooter>
        <Link to={`/blog/${post.slug}`} className="text-sm text-primary hover:underline">
          Read more
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogPostPreview;

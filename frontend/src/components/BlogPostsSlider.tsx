import React, { useEffect, useState } from 'react';
import { BlogPost, fetchBlogPosts } from '@/lib/blogUtils';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Use API URL from .env
const API_URL = import.meta.env.VITE_API_URL;

const BlogPostsSlider: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts: BlogPost[] = await fetchBlogPosts(5);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading blog posts for slider:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="h-72 md:h-96 lg:h-[500px] rounded-lg bg-gray-100 animate-pulse"></div>
    );
  }

  // If no posts are found, show a placeholder image
  if (posts.length === 0) {
    return (
      <div className="relative h-72 md:h-96 lg:h-[500px] rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-lskin-pink/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Woman with glowing skin" 
          className="w-full h-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <Carousel className="w-full h-72 md:h-96 lg:h-[500px] rounded-lg overflow-hidden">
      <CarouselContent>
        {posts.map((post: BlogPost) => (
          <CarouselItem key={post.id}>
            <Link to={`/blog/${post.slug}`} className="group">
              <div className="relative w-full h-full rounded-lg overflow-hidden aspect-[4/5]">
                {/* Image */}
                <AspectRatio ratio={16 / 15} className="h-full">
                  <img 
                    src={`${API_URL}${post.image}`} 
                    alt={post.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </AspectRatio>
                {/* Content at bottom - always above overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-black/70 backdrop-blur-sm rounded-b-lg">
                  <h3 className="text-white text-2xl font-serif mb-1 w-full max-w-full break-words line-clamp-2">{post.title}</h3>
                  <p className="text-white/80 mb-3 text-sm max-w-xs line-clamp-2">{post.excerpt}</p>
                  <span className="inline-block text-white text-sm font-medium border-b border-white pb-1 transition-colors group-hover:border-lskin-pink">
                    Read More
                  </span>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};

export default BlogPostsSlider;

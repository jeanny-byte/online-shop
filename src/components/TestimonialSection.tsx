
import React, { useEffect, useState } from 'react';

// Use API URL from .env
const API_URL = "https://nelysah-server.onrender.com";
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TestimonialProps {
  name: string;
  location: string;
  quote: string;
  rating: number;
  image?: string;
}

// Removed static testimonials array. Will fetch dynamically.

const TestimonialSection: React.FC = () => {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<TestimonialProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;

  // Compute visible testimonials
  const visibleTestimonials = testimonials.length > 0
    ? Array.from({ length: Math.min(testimonialsPerPage, testimonials.length) }, (_, i) =>
        testimonials[(currentIndex + i) % testimonials.length]
      )
    : [];

  // Auto-advance effect
  useEffect(() => {
    if (testimonials.length <= testimonialsPerPage) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + testimonialsPerPage) % testimonials.length);
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, [testimonials, testimonialsPerPage]);

  // Form state
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [location, setLocation] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/testimonials`);
      if (!res.ok) throw new Error('Failed to load testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (err: any) {
      setError(err.message || 'Error loading testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line
  }, []);

  // Handle testimonial submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_URL}/api/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user?.email || 'Anonymous',
          location,
          quote,
          rating,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit testimonial');
      }
      setSubmitSuccess('Testimonial submitted! Thank you.');
      setQuote('');
      setLocation('');
      setRating(5);
      fetchTestimonials();
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting testimonial');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary-foreground">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium mt-1">What Our Customers Say</h2>
        </div>

        {/* Testimonial Submission Form for Signed-in Users */}
        {user && (
          <div className="mb-12 max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-Nelysah-lightGray p-6 rounded-lg shadow">
              <h3 className="font-medium mb-4 text-lg">Share your experience</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Your Testimonial</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                  required
                  placeholder="Write your testimonial..."
                />
              </div>
              {/* <div className="mb-4">
                <label className="block mb-1 font-medium">Location (optional)</label>
                <input
                  className="w-full border rounded p-2"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Accra, Ghana"
                />
              </div> */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i)}
                      className={`focus:outline-none ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star size={20} fill={i <= rating ? '#facc15' : 'none'} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm">{rating} / 5</span>
                </div>
              </div>
              {submitError && <div className="text-red-500 mb-2">{submitError}</div>}
              {submitSuccess && <div className="text-green-600 mb-2">{submitSuccess}</div>}
              <button
                type="submit"
                className="btn-secondary px-4 py-2 rounded font-medium"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : 'Save to Testimonials'}
              </button>
            </form>
          </div>
        )}

        
        {/* Testimonial Carousel - 1 row, 3 columns, auto-slide */}
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-700 ease-in-out" style={{ minWidth: '100%', gap: '2rem' }}>
            {loading ? (
              <div className="w-full text-center">Loading testimonials...</div>
            ) : error ? (
              <div className="w-full text-center text-red-500">{error}</div>
            ) : testimonials.length === 0 ? (
              <div className="w-full text-center text-muted-foreground">No testimonials available yet.</div>
            ) : (
              visibleTestimonials.map((testimonial, index) => (
                <div key={index} className="bg-Nelysah-lightGray p-6 rounded-lg flex-1 min-w-0 max-w-sm mx-auto">
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  {/* Quote */}
                  <blockquote className="text-foreground mb-4">"{testimonial.quote}"</blockquote>
                  {/* Customer */}
                  <div className="flex items-center">
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-Nelysah-pink flex items-center justify-center mr-3">
                        <span className="text-primary-foreground font-medium">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

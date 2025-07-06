
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) throw error;
      toast({
        title: "Login successful",
        description: "You have been logged in to your account.",
      });
      navigate('/'); // Automatically redirect to homepage after successful login
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8 text-center">Sign In</h1>
          
          <div className="bg-white p-6 border border-border rounded-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  className={errors.email ? 'border-red-500' : ''}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  className={errors.password ? 'border-red-500' : ''}
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
              </div>
              
              <Button
                type="submit"
                className="w-full py-2"
                disabled={isSubmitting}
                variant="default"
              >
                {isSubmitting ? 'Logging in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-4 text-sm text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6">
            Welcome to L'Skin Beauty
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover our premium skincare collection with integrated Paystack payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="flex items-center gap-2 text-base"
              onClick={() => navigate('/shop')}
            >
              <ShoppingBag className="h-5 w-5" />
              Shop Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

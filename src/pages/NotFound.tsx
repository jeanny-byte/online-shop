
import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">404</h1>
        <p className="text-2xl font-medium mb-3">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="inline-flex items-center btn btn-primary py-3 px-6">
          <ArrowLeft size={16} className="mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

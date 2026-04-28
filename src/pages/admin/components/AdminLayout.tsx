
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingBag, BookOpen, LogOut, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { pathname } = useLocation();
  const { signOut, isAdmin } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    // Auth context will handle navigation
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Blog', path: '/admin/blog', icon: BookOpen },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];
  
  // Safety check - shouldn't happen due to ProtectedRoute, but just in case
  if (!isAdmin) {
    console.log("Non-admin tried to access AdminLayout");
    return null;
  }
  
  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="container-custom max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-lskin-lightGray rounded-md p-4">
              <h1 className="font-serif font-medium text-2xl mb-6 px-2">Admin Panel</h1>
              
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      pathname === item.path
                        ? 'bg-lskin-pink text-foreground'
                        : 'hover:bg-lskin-peach/30'
                    }`}
                  >
                    <item.icon size={18} className="mr-3" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-8 border-t border-border pt-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-sm px-3 py-2 w-full rounded-md hover:bg-lskin-peach/30"
                >
                  <LogOut size={18} className="mr-3" />
                  Sign Out
                </button>
                
                <Link
                  to="/"
                  className="flex items-center text-sm px-3 py-2 w-full rounded-md hover:bg-lskin-peach/30 mt-2"
                >
                  Visit Store
                </Link>
              </div>
            </div>
          </aside>
          
          {/* Mobile Navigation */}
          <div className="lg:hidden bg-white p-4 border border-border rounded-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-serif font-medium text-xl">Admin Panel</h1>
              <div className="flex gap-1">
                <Link to="/" className="px-3 py-1 border border-border rounded-md text-sm">
                  Visit Store
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 border border-border rounded-md text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
            
            <div className="flex overflow-x-auto gap-2 pb-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-1 rounded-md whitespace-nowrap ${
                    pathname === item.path
                      ? 'bg-lskin-pink text-foreground'
                      : 'bg-muted hover:bg-lskin-peach/30'
                  }`}
                >
                  <item.icon size={16} className="mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white border border-border rounded-md p-6 mb-6">
              <h1 className="text-2xl font-serif font-medium">{title}</h1>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

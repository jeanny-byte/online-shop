import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingBag, BookOpen, LogOut, Users, Settings, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { pathname } = useLocation();
  const { signOut, isAdmin } = useAuth();
  const { settings } = useSettings();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Blog', path: '/admin/blog', icon: BookOpen },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];
  
  if (!isAdmin) {
    return null;
  }

  const storeName = settings?.store_name || 'Nelysah';
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-secondary/15">
      <div className="container-custom max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm sticky top-24">
              {/* Brand Header */}
              <div className="mb-6 px-2 flex items-center gap-3">
                {settings?.logo_url ? (
                  <img 
                    src={settings.logo_url} 
                    alt={storeName} 
                    className="h-9 w-auto max-w-[120px] object-contain rounded"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallbackUrl = `${import.meta.env.VITE_API_URL || ''}/api/settings/logo`;
                      if (!target.dataset.triedFallback && target.src !== fallbackUrl) {
                        target.dataset.triedFallback = 'true';
                        target.src = fallbackUrl;
                      } else {
                        target.style.display = 'none';
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-lg"
                  style={{ display: settings?.logo_url ? 'none' : 'flex' }}
                >
                  {storeName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-serif font-semibold text-base leading-tight text-foreground truncate max-w-[140px]">
                    {storeName}
                  </h2>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Admin Portal</span>
                </div>
              </div>
              
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                      }`}
                    >
                      <item.icon size={18} className="mr-3 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="mt-8 border-t border-border pt-4 space-y-1">
                <Link
                  to="/"
                  target="_blank"
                  className="flex items-center justify-between text-xs font-medium px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <span>View Live Store</span>
                  <ExternalLink size={14} />
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-xs font-medium px-3.5 py-2 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} className="mr-2.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>
          
          {/* Mobile Navigation */}
          <div className="lg:hidden bg-white p-4 border border-border rounded-xl shadow-sm mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                {settings?.logo_url ? (
                  <img 
                    src={settings.logo_url} 
                    alt={storeName} 
                    className="h-7 w-auto object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallbackUrl = `${import.meta.env.VITE_API_URL || ''}/api/settings/logo`;
                      if (!target.dataset.triedFallback && target.src !== fallbackUrl) {
                        target.dataset.triedFallback = 'true';
                        target.src = fallbackUrl;
                      } else {
                        target.style.display = 'none';
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'inline';
                        }
                      }
                    }}
                  />
                ) : null}
                <span 
                  className="font-serif font-semibold"
                  style={{ display: settings?.logo_url ? 'none' : 'inline' }}
                >
                  {storeName}
                </span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
              <div className="flex gap-2">
                <Link to="/" className="px-2.5 py-1 border border-border rounded-lg text-xs font-medium">
                  Live Store
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
            
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  <item.icon size={14} className="mr-1.5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;


import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, Calendar, Image, LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'About Me', path: '/admin/about', icon: User },
    { name: 'Artworks', path: '/admin/artworks', icon: Image },
    { name: 'Events', path: '/admin/events', icon: Calendar },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/admin/login');
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-jewelry-light rounded-full mb-4"></div>
          <p className="text-jewelry-gray">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b py-3 px-4 flex justify-between items-center">
        <h1 className="font-semibold text-jewelry-dark">Admin Panel</h1>
        <button 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-jewelry-dark"
          aria-label="Toggle mobile menu"
        >
          {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar (Desktop) or Drawer (Mobile) */}
      <aside 
        className={`bg-white shadow-md z-20 fixed top-0 bottom-0 w-64 ${
          mobileNavOpen ? 'left-0' : '-left-64'
        } md:left-0 transition-all duration-300`}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-jewelry-dark">Elegance Artistry</h2>
          <p className="text-sm text-jewelry-gray">Admin Dashboard</p>
        </div>
        
        <nav className="py-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-md ${
                    location.pathname === item.path
                      ? 'bg-jewelry-light text-jewelry-dark'
                      : 'text-jewelry-gray hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <item.icon size={18} className="mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-10 pt-6 border-t">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-3 py-2.5 rounded-md text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} className="mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
          
          <div className="mt-6">
            <Link
              to="/"
              className="flex w-full items-center px-3 py-2.5 rounded-md text-jewelry-gray hover:bg-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Home size={18} className="mr-3" />
              <span>View Public Site</span>
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Overlay for mobile */}
      {mobileNavOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      
      {/* Main content */}
      <main className="md:ml-64 pt-4 pb-16">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

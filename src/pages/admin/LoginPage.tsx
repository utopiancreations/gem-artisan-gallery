
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-jewelry-light p-3 rounded-full">
              <Lock className="h-8 w-8 text-jewelry-dark" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-jewelry-dark mb-6">
            Admin Login
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-jewelry-dark mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-jewelry-accent focus:border-jewelry-accent"
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-jewelry-dark mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-jewelry-accent focus:border-jewelry-accent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-jewelry-dark text-white font-medium rounded-md hover:bg-black transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-jewelry-gray hover:text-jewelry-accent">
              Back to Public Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

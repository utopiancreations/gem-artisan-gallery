
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { createDocument } from '../lib/firebase';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Basic email validation
      if (!email.includes('@') || email.trim().length < 5) {
        throw new Error('Please enter a valid email address.');
      }
      
      await createDocument('newsletter', { email, subscribedAt: new Date() });
      
      setIsSuccess(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-jewelry-dark py-12 mt-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-semibold mb-4">Elegance Artistry</h3>
            <p className="text-gray-300 max-w-md">
              Handcrafted jewelry that captures moments and emotions in timeless pieces. Each creation
              tells a unique story, designed with passion and meticulous attention to detail.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Stay Connected</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to receive updates on new collections, events, and special offers.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-jewelry-accent"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-jewelry-accent hover:bg-opacity-90 rounded-md font-medium transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
            {isSuccess && (
              <p className="mt-2 text-green-400 text-sm animate-fade-in">
                Thank you for subscribing!
              </p>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Elegance Artistry. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Facebook
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Pinterest
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

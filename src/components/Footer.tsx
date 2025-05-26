
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from "@/hooks/use-toast"; // For user feedback
import { Mail } from 'lucide-react'; // Removed Send icon as it's not used
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming LoadingSpinner is in the same directory or adjust path

const Footer = () => {
  const firebaseFunctions = getFunctions();
  const subscribeToNewsletterFunction = httpsCallable(firebaseFunctions, 'subscribeToNewsletter');
  const { toast } = useToast(); // Initialize toast

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState(''); // New state for first name
  const [consent, setConsent] = useState(false);   // New state for consent
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Rename 'error' to 'message' and add 'isSuccess' for clarity
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); 

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    if (!consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to receive newsletter updates.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Try Firebase Function first
      const result = await subscribeToNewsletterFunction({ email, firstName });
      const resultData = result.data as { success: boolean; message: string };
      
      setMessage(resultData.message);
      setIsSuccess(resultData.success);

      if (resultData.success) {
        toast({
          title: "Subscribed!",
          description: resultData.message,
        });
        setEmail('');
        setFirstName('');
        setConsent(false);
      } else {
        toast({
          title: "Subscription Failed",
          description: resultData.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.warn('Firebase function failed for footer, attempting FormSubmit fallback', error);
      setMessage('Subscription via primary method failed. Trying fallback...');

      // Fallback to FormSubmit
      try {
        const fallbackFormData = new FormData();
        fallbackFormData.append('email', email);
        fallbackFormData.append('firstName', firstName);
        fallbackFormData.append('_subject', 'New Newsletter Subscription (Fallback/Footer) - Ravenscroft Design');
        fallbackFormData.append('_captcha', 'false'); 

        const response = await fetch('https://formsubmit.co/melissa@ravenscroftdesign.com', { // Replace with your FormSubmit endpoint
          method: 'POST',
          body: fallbackFormData
        });

        if (response.ok) {
          toast({
            title: "Subscribed (Fallback)!",
            description: "Thank you for subscribing! You will receive updates via email.",
          });
          setMessage('Subscribed via fallback! Thank you.');
          setIsSuccess(true);
          setEmail('');
          setFirstName('');
          setConsent(false);
        } else {
          const fallbackErrorText = await response.text();
          throw new Error(`Fallback failed: ${response.status} ${fallbackErrorText}`);
        }
      } catch (fallbackError: any) {
        console.error('FormSubmit fallback error (Footer):', fallbackError);
        toast({
          title: "Subscription Failed",
          description: "Both subscription methods failed. Please try again later or contact support.",
          variant: "destructive"
        });
        setMessage('Subscription failed using both methods. Please try again.');
        setIsSuccess(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-jewelry-dark py-12 mt-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-semibold mb-4">Ravenscroft Design</h3>
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
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-jewelry-accent"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name (optional)"
                  className="w-full px-4 py-2.5 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-jewelry-accent"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="footerNewsletterConsent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="h-4 w-4 text-jewelry-accent bg-gray-800 border-gray-600 rounded focus:ring-jewelry-accent focus:ring-offset-gray-900"
                  required
                  disabled={isSubmitting}
                />
                <label htmlFor="footerNewsletterConsent" className="text-sm text-gray-300">
                  I agree to receive newsletter updates.
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !consent || !email.trim()}
                className="w-full px-6 py-2.5 bg-jewelry-accent hover:bg-opacity-90 rounded-md font-medium transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" color="white" text="" />
                    <span className="ml-2">Subscribing...</span>
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
            {message && (
              <p className={`mt-2 text-sm ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Ravenscroft Design. All rights reserved.
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

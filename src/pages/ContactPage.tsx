
// src/pages/ContactPage.tsx
import { useState, useEffect } from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '../components/LoadingSpinner';

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Animation control state
  const [contentVisible, setContentVisible] = useState(false);

  // Set content visible after initial render
  useEffect(() => {
    // Short timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Effect to control animation of sections
  useEffect(() => {
    if (!contentVisible) return;
    
    const sections = document.querySelectorAll('.contact-section-animate');
    
    // Apply a staggered animation to each section
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('animated');
      }, 100 + index * 150);
    });
  }, [contentVisible]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Please fill out all fields');
      }
      
      if (!formData.email.includes('@') || formData.email.trim().length < 5) {
        throw new Error('Please enter a valid email address');
      }
      
      // Create form data for FormSubmit
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('email', formData.email);
      submitFormData.append('message', formData.message);
      submitFormData.append('_subject', 'New Contact Form Submission from Ravenscroft Design');
      submitFormData.append('_captcha', 'false');
      submitFormData.append('_template', 'table');
      
      // Submit to FormSubmit
      const response = await fetch('https://formsubmit.co/melissa@ravenscroftdesign.com', {
        method: 'POST',
        body: submitFormData
      });
      
      if (response.ok) {
        // Success notification
        toast({
          title: "Message Sent",
          description: "Thank you for your message. I'll get back to you soon!",
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    try {
      if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Submit to Mailchimp via FormSubmit (you'll need to set up a Mailchimp webhook)
      const submitFormData = new FormData();
      submitFormData.append('email', newsletterEmail);
      submitFormData.append('_subject', 'New Newsletter Subscription - Ravenscroft Design');
      submitFormData.append('_captcha', 'false');
      
      const response = await fetch('https://formsubmit.co/melissa@ravenscroftdesign.com', {
        method: 'POST',
        body: submitFormData
      });

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing to our newsletter!",
        });
        setNewsletterEmail('');
      } else {
        throw new Error('Failed to subscribe');
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className={`pt-24 pb-16 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Contact Me"
          subtitle="Have a question about my work or interested in a custom piece? Get in touch."
          className="contact-section-animate opacity-0 transform translate-y-4 transition-all duration-500"
        />
        
        <div className="grid md:grid-cols-2 gap-10 mt-8">
          {/* Contact Form */}
          <div className="contact-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-100">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 transition-all duration-300 hover:shadow-lg">
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-jewelry-dark mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-jewelry-accent focus:border-jewelry-accent"
                    placeholder="Jane Doe"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-jewelry-dark mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-jewelry-accent focus:border-jewelry-accent"
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-jewelry-dark mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-jewelry-accent focus:border-jewelry-accent"
                    placeholder="Tell me about your inquiry or project..."
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-jewelry-dark text-white font-medium rounded-md hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <LoadingSpinner size="small" color="white" text="" />
                        <span className="ml-2">Sending...</span>
                      </span>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Contact Info */}
          <div className="contact-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-200">
            <div className="bg-gray-50 rounded-xl p-6 md:p-8 h-full transition-all duration-300 hover:shadow-md">
              <h3 className="text-2xl font-bold text-jewelry-dark mb-8">
                Get In Touch
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-jewelry-dark mb-4">
                    Ravenscroft Jewelry by Melissa Zahm
                  </h4>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-jewelry-light p-2.5 rounded-full mr-4">
                    <Mail className="h-5 w-5 text-jewelry-dark" />
                  </div>
                  <div>
                    <h4 className="font-medium text-jewelry-dark">Email</h4>
                    <a 
                      href="mailto:melissa@ravenscroftdesign.com" 
                      className="text-jewelry-gray hover:text-jewelry-accent transition-colors"
                    >
                      melissa@ravenscroftdesign.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-jewelry-light p-2.5 rounded-full mr-4">
                    <Phone className="h-5 w-5 text-jewelry-dark" />
                  </div>
                  <div>
                    <h4 className="font-medium text-jewelry-dark">Phone</h4>
                    <a 
                      href="tel:+18315666455" 
                      className="text-jewelry-gray hover:text-jewelry-accent transition-colors"
                    >
                      831-566-6455
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-jewelry-light p-2.5 rounded-full mr-4">
                    <svg className="h-5 w-5 text-jewelry-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-jewelry-dark">Address</h4>
                    <div className="text-jewelry-gray">
                      <p>PO Box 806</p>
                      <p>Soquel CA 95073</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-jewelry-dark mb-3">
                    Studio Hours
                  </h4>
                  <div className="text-jewelry-gray">
                    <p className="mb-2">Available 24/7</p>
                    <p className="text-sm italic">Contact for appointments</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-jewelry-dark mb-3">
                    Follow Me
                  </h4>
                  <div className="space-y-2">
                    <a 
                      href="https://instagram.com/ravenscroftdesign" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-jewelry-gray hover:text-jewelry-accent transition-colors block"
                    >
                      Instagram: @ravenscroftdesign
                    </a>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-jewelry-dark mb-3">
                    Newsletter
                  </h4>
                  <p className="text-sm text-jewelry-gray mb-3">
                    Stay updated with new pieces and show announcements
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-jewelry-accent focus:border-jewelry-accent"
                      disabled={isSubscribing}
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing || !newsletterEmail.trim()}
                      className="px-4 py-2 bg-jewelry-accent text-white text-sm rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                      {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

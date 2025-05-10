
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Initialize scroll animation observer with better threshold and root margin
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Add animated class when element comes into view
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px' // Trigger animation before elements fully enter viewport
    });
    
    // Add animation classes after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      document.querySelectorAll('.section-animate').forEach(section => {
        // Add baseline opacity to prevent flash of content
        section.classList.add('opacity-1');
        observer.observe(section);
      });
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.section-animate').forEach(section => {
        observer.unobserve(section);
      });
    };
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;

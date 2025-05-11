// src/layouts/PublicLayout.tsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  const location = useLocation();
  console.log("PublicLayout rendering for path:", location.pathname); // DEBUG

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    console.log('PublicLayout: useEffect - SCROLLED TO TOP. Animations in PublicLayout TEMPORARILY DISABLED.'); // DEBUG

    // IntersectionObserver logic in PublicLayout is COMMENTED OUT for debugging
    /*
    const observer = new IntersectionObserver((entries, obsInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          obsInstance.unobserve(entry.target); // Unobserve after animating
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    const timer = setTimeout(() => {
      console.log('PublicLayout: (DISABLED) Timer fired, would attempt to observe .section-animate');
      document.querySelectorAll('.section-animate').forEach(section => {
        section.classList.add('opacity-1');
        observer.observe(section);
      });
    }, 100);

    return () => {
      console.log('PublicLayout: useEffect cleanup (observer part disabled)');
      clearTimeout(timer);
      // observer.disconnect(); // If observer were active, good to disconnect
    };
    */
    // End of commented out IntersectionObserver logic in PublicLayout
     return () => {
        console.log('PublicLayout: useEffect cleanup (no observer was active here for this test).');
     }

  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main>
        {console.log("PublicLayout: Rendering Outlet")} {/* DEBUG */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
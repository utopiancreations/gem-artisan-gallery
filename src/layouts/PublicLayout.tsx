
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  const location = useLocation();
  console.log("PublicLayout rendering for path:", location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('PublicLayout: useEffect - SCROLLED TO TOP. Animations in PublicLayout TEMPORARILY DISABLED.');

    return () => {
      console.log('PublicLayout: useEffect cleanup (no observer was active here for this test).');
    };
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main>
        {console.log("PublicLayout: Rendering Outlet")}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;

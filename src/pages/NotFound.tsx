
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-6 text-jewelry-dark">404</h1>
        <p className="text-2xl text-jewelry-gray mb-8">
          Oops! This page doesn't exist.
        </p>
        <p className="text-jewelry-gray mb-10">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="inline-block px-8 py-3 bg-jewelry-accent text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

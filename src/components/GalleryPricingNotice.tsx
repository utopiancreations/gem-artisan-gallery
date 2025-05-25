
import { DollarSign, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const GalleryPricingNotice = () => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
          <DollarSign size={20} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Pricing Information
          </h3>
          <p className="text-gray-700 mb-4">
            Due to fluctuating prices of gold, silver, and precious stones, please contact me for current pricing on all pieces.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/contact" 
              className="inline-flex items-center px-4 py-2 bg-jewelry-dark text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors"
            >
              <Mail size={16} className="mr-2" />
              Contact Me
            </Link>
            <a 
              href="mailto:melissa@ravenscroftdesign.com" 
              className="inline-flex items-center px-4 py-2 border border-jewelry-dark text-jewelry-dark text-sm font-medium rounded-md hover:bg-jewelry-light transition-colors"
            >
              <Mail size={16} className="mr-2" />
              melissa@ravenscroftdesign.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPricingNotice;

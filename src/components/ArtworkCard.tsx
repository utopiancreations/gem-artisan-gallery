
import { Link } from 'react-router-dom';

export type ArtworkType = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string; // Added thumbnail URL
  category: string;
  isHighlighted?: boolean;
  isFeatured?: boolean;
};

type ArtworkCardProps = {
  artwork: ArtworkType;
  featured?: boolean;
};

const ArtworkCard = ({ artwork, featured = false }: ArtworkCardProps) => {
  // Basic validation
  if (!artwork) {
    console.warn('ArtworkCard received null artwork');
    return null;
  }

  if (!artwork.title || !artwork.imageUrl) {
    console.warn('ArtworkCard missing required fields:', artwork);
    return null;
  }

  return (
    <div className="group rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl bg-white">
      {/* Updated image container with better sizing for jewelry */}
      <div className="relative overflow-hidden w-full h-64 md:h-72 lg:h-80">
        <picture>
          {/* Use thumbnail for small screens */}
          <source 
            media="(max-width: 640px)" 
            srcSet={artwork.thumbnailUrl || artwork.imageUrl} 
          />
          {/* Use original for larger screens */}
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-contain bg-gray-50 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              console.error('Image failed to load:', artwork.imageUrl);
              e.currentTarget.src = 'https://placehold.co/400x400?text=Image+Error';
            }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-jewelry-dark">
            {artwork.category}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-jewelry-dark mb-2 transition-colors group-hover:text-jewelry-accent">
          {artwork.title}
        </h3>
        <p className="text-jewelry-gray text-sm line-clamp-2 mb-4">
          {artwork.description || 'No description available'}
        </p>
        <Link 
          to={`/artwork/${artwork.id}`} 
          className="inline-block text-sm font-medium text-jewelry-accent hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ArtworkCard;

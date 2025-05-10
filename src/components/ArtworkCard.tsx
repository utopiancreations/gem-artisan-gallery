
import { Link } from 'react-router-dom';

export type ArtworkType = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'Rings' | 'Earrings' | 'Pearls' | 'Toggles' | 'Pendants' | string;
  isHighlighted?: boolean;
  isFeatured?: boolean;
};

type ArtworkCardProps = {
  artwork: ArtworkType;
  featured?: boolean;
};

const ArtworkCard = ({ artwork, featured = false }: ArtworkCardProps) => {
  return (
    <div className={`group rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl ${
      featured ? 'bg-white' : 'bg-white'
    }`}>
      <div className="relative overflow-hidden aspect-square">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
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
          {artwork.description}
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

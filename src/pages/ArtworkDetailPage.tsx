import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getDocument } from '../lib/firebase';

interface ArtworkType {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  isHighlighted?: boolean;
  isFeatured?: boolean;
}

const ArtworkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<ArtworkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ArtworkDetailPage mounted with id:', id);
    
    const fetchArtwork = async () => {
      if (!id) {
        setError('No artwork ID provided');
        setLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching artwork with ID: ${id}`);
        const result = await getDocument('artworks', id);
        console.log('Raw result:', result);
        
        if (!result) {
          console.log('Artwork not found');
          setError('Artwork not found');
          setLoading(false);
          return;
        }
        
        // Ensure result has the expected properties before accessing them
        const normalizedArtwork = {
          id: String(result.id || ''),
          title: String((result as any).title || 'Untitled'),
          description: String((result as any).description || 'No description provided'),
          imageUrl: String((result as any).imageUrl || ''),
          category: String((result as any).category || 'Uncategorized'),
          isHighlighted: Boolean((result as any).isHighlighted),
          isFeatured: Boolean((result as any).isFeatured)
        };
        
        console.log('Processed artwork:', normalizedArtwork);
        setArtwork(normalizedArtwork);
      } catch (err) {
        console.error('Error fetching artwork:', err);
        setError('Error loading artwork');
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 max-w-md mb-6"></div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-gray-200 aspect-square rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 max-w-xs"></div>
                <div className="h-4 bg-gray-200 max-w-sm"></div>
                <div className="h-4 bg-gray-200 max-w-full"></div>
                <div className="h-4 bg-gray-200 max-w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-jewelry-dark mb-4">
            {error || 'Artwork not found'}
          </h2>
          <p className="text-jewelry-gray mb-6">
            Sorry, we couldn't find the artwork you're looking for.
          </p>
          <Link 
            to="/gallery" 
            className="inline-flex items-center text-jewelry-accent hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link 
          to="/gallery" 
          className="inline-flex items-center text-jewelry-gray hover:text-jewelry-accent mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Gallery
        </Link>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-xl overflow-hidden shadow-md">
            {artwork.imageUrl ? (
              <img 
                src={artwork.imageUrl} 
                alt={artwork.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', artwork.imageUrl);
                  e.currentTarget.src = 'https://placehold.co/600x600?text=Image+Error';
                }}
              />
            ) : (
              <div className="bg-gray-200 aspect-square flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>
          
          <div>
            <span className="inline-block px-3 py-1 bg-jewelry-light rounded-full text-sm font-medium text-jewelry-dark mb-4">
              {artwork.category}
            </span>
            <h1 className="text-3xl font-bold text-jewelry-dark mb-4">
              {artwork.title}
            </h1>
            <p className="text-jewelry-gray mb-8 whitespace-pre-wrap">
              {artwork.description}
            </p>
            
            <div className="mt-8">
              <Link 
                to="/contact" 
                className="inline-block px-6 py-3 bg-jewelry-dark text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
              >
                Inquire About This Piece
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetailPage;

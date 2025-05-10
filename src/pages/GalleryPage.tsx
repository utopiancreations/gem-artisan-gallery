import { useState, useEffect } from 'react';
import { getCollection } from '../lib/firebase';
import SectionHeading from '../components/SectionHeading';
import ArtworkCard, { ArtworkType } from '../components/ArtworkCard';

const GalleryPage = () => {
  const [artworks, setArtworks] = useState<ArtworkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    console.log('Fetching artworks...');
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const result = await getCollection('artworks');
        console.log('Raw result from getCollection:', result);
        
        if (!result || !Array.isArray(result)) {
          console.error('Unexpected result format:', result);
          setError('Failed to load artwork data');
          return;
        }
        
        if (result.length === 0) {
          console.log('No artworks found in collection');
          setArtworks([]);
          return;
        }
        
        // Process artwork data
        const processedArtworks = result.map(artwork => ({
          id: String(artwork.id || ''),
          title: String(artwork.title || 'Untitled'),
          description: String(artwork.description || 'No description provided'),
          imageUrl: String(artwork.imageUrl || ''),
          category: String(artwork.category || 'Uncategorized'),
          isHighlighted: Boolean(artwork.isHighlighted),
          isFeatured: Boolean(artwork.isFeatured)
        }));
        
        setArtworks(processedArtworks);
        
        // Extract categories
        const uniqueCategories = Array.from(
          new Set(processedArtworks.map(artwork => artwork.category))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching artworks:', err);
        setError('Failed to load artworks');
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [refresh]);

  const filteredArtworks = selectedCategory === 'All' 
    ? artworks 
    : artworks.filter(artwork => artwork.category === selectedCategory);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Gallery"
          subtitle="Explore my collection of handcrafted jewelry pieces"
          className="section-animate"
        />
        
        {/* Debug info */}
        <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
          <strong>Debug Info:</strong><br/>
          Loading: {loading ? 'Yes' : 'No'}<br/>
          Error: {error || 'None'}<br/>
          Artworks count: {artworks.length}<br/>
          Categories: {categories.join(', ') || 'None'}<br/>
          Filtered artworks: {filteredArtworks.length}
        </div>
        
        {/* Manual refresh button */}
        <div className="mb-4 text-center">
          <button 
            onClick={() => setRefresh(prev => prev + 1)} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Gallery
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading artworks...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-8 flex justify-center">
                <div className="inline-flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === 'All'
                        ? 'bg-jewelry-dark text-white'
                        : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-jewelry-dark text-white'
                          : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {filteredArtworks.length === 0 ? (
              <div className="text-center py-12 text-jewelry-gray">
                No artworks found. Please add some through the admin panel.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArtworks.map(artwork => (
                  <div key={artwork.id}>
                    <ArtworkCard artwork={artwork} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;

import { useState, useEffect } from 'react';
import { getCollection } from '../lib/firebase'; // Make sure getCollection fetches 'createdAt'
import SectionHeading from '../components/SectionHeading';
import GalleryPricingNotice from '../components/GalleryPricingNotice';
import ArtworkCard, { ArtworkType } from '../components/ArtworkCard';

// Define a type that includes the createdAt field
interface ArtworkWithTimestamp extends ArtworkType {
  createdAt?: any; // Using 'any' for flexibility, but ideally use Firebase Timestamp type or Date
  status?: 'active' | 'sold' | 'archive'; // Add status field for category system
}

const GalleryPage = () => {
  // Use the new type for the state
  const [artworks, setArtworks] = useState<ArtworkWithTimestamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold' | 'archive'>('active');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    console.log('Fetching artworks...');
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        // Ensure your getCollection function retrieves the 'createdAt' field
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
          setCategories([]); // Also clear categories if no artworks
          return;
        }

        // Process artwork data
        const processedArtworks: ArtworkWithTimestamp[] = result.map(artwork => ({
          id: String(artwork.id || ''),
          title: String(artwork.title || 'Untitled'),
          description: String(artwork.description || 'No description provided'),
          imageUrl: String(artwork.imageUrl || ''),
          category: String(artwork.category || 'Uncategorized'),
          isHighlighted: Boolean(artwork.isHighlighted),
          isFeatured: Boolean(artwork.isFeatured),
          status: artwork.status || 'active', // Default to active if no status
          // Make sure the 'createdAt' field is included here
          createdAt: artwork.createdAt, // <-- Include the timestamp here
        }));

        // --- ADD SORTING LOGIC HERE ---
        // Sort by createdAt in descending order (most recent first)
        processedArtworks.sort((a, b) => {
          // Handle cases where createdAt might be missing or invalid
          const dateA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
          const dateB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;

          return dateB - dateA; // Descending order (most recent first)
        });
        // --- END SORTING LOGIC ---

        setArtworks(processedArtworks);

        // Extract categories from the now sorted artworks
        const uniqueCategories = Array.from(
          new Set(processedArtworks.map(artwork => artwork.category))
        );
        setCategories(uniqueCategories);

      } catch (err) {
        console.error('Error fetching artworks:', err);
        setError('Failed to load artworks');
        setArtworks([]); // Clear artworks on error
        setCategories([]); // Clear categories on error
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [refresh]); // Added refresh as a dependency to re-fetch data when refreshed manually

  // Filter artworks based on category and status
  const filteredArtworks = artworks.filter(artwork => {
    // Status filter
    if (statusFilter !== 'all' && artwork.status !== statusFilter) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'All' && artwork.category !== selectedCategory) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Gallery"
          subtitle="Explore my collection of handcrafted jewelry pieces"
          className="section-animate"
        />

        {/* Pricing Notice */}
        <GalleryPricingNotice />

        {loading ? (
          <div className="text-center py-8">Loading artworks...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-8 space-y-4">
              {/* Status Filter */}
              <div className="flex justify-center">
                <div className="inline-flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-jewelry-dark text-white'
                        : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setStatusFilter('sold')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      statusFilter === 'sold'
                        ? 'bg-jewelry-dark text-white'
                        : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                    }`}
                  >
                    Sold
                  </button>
                  <button
                    onClick={() => setStatusFilter('archive')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      statusFilter === 'archive'
                        ? 'bg-jewelry-dark text-white'
                        : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                    }`}
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-jewelry-dark text-white'
                        : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex justify-center">
                  <div className="inline-flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === 'All'
                          ? 'bg-jewelry-accent text-white'
                          : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                      }`}
                    >
                      All Categories
                    </button>

                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-jewelry-accent text-white'
                            : 'bg-gray-100 text-jewelry-dark hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {filteredArtworks.length === 0 ? (
              <div className="text-center py-12 text-jewelry-gray">
                No artworks found. Please add some through the admin panel.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* filteredArtworks are already sorted by creation date */}
                {filteredArtworks.map(artwork => (
                  <div key={artwork.id} className="relative">
                    <ArtworkCard artwork={artwork} />
                    {/* Status indicator for sold/archive items */}
                    {artwork.status === 'sold' && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                        SOLD
                      </div>
                    )}
                    {artwork.status === 'archive' && (
                      <div className="absolute top-4 right-4 bg-gray-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                        ARCHIVE
                      </div>
                    )}
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

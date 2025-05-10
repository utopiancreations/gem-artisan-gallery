import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import ArtworkCard, { ArtworkType } from '../components/ArtworkCard';
import EventItem, { EventType } from '../components/EventItem';
import { getCollection } from '../lib/firebase';
import { isInFuture } from '../lib/dateUtils';

const HomePage = () => {
  const [highlightedWorks, setHighlightedWorks] = useState<ArtworkType[]>([]);
  const [featuredArtwork, setFeaturedArtwork] = useState<ArtworkType | null>(null);
  const [latestCreations, setLatestCreations] = useState<ArtworkType[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<EventType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => prev + '\n' + info);
    console.log(info);
  };

  // Helper to normalize boolean values
  const normalizeBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return !!value; // Convert to boolean
  };

  // Define carousel controls as useCallback functions to prevent recreating them on each render
  const nextSlide = useCallback(() => {
    addDebugInfo(`nextSlide clicked, current: ${currentSlide}, total: ${highlightedWorks.length}`);
    if (highlightedWorks.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % highlightedWorks.length);
  }, [highlightedWorks.length, currentSlide]);

  const prevSlide = useCallback(() => {
    addDebugInfo(`prevSlide clicked, current: ${currentSlide}, total: ${highlightedWorks.length}`);
    if (highlightedWorks.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + highlightedWorks.length) % highlightedWorks.length);
  }, [highlightedWorks.length, currentSlide]);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        addDebugInfo('Fetching home page data...');
        setLoading(true);
        
        // Get all artworks
        const allArtworks = await getCollection('artworks') as ArtworkType[];
        addDebugInfo(`Fetched ${allArtworks.length} artworks`);
        
        if (!allArtworks || allArtworks.length === 0) {
          addDebugInfo('No artworks found');
          setLoading(false);
          return;
        }
        
        // Normalize the artwork data - ensure boolean values are actual booleans
        const normalizedArtworks = allArtworks.map(artwork => ({
          ...artwork,
          isHighlighted: normalizeBoolean(artwork.isHighlighted),
          isFeatured: normalizeBoolean(artwork.isFeatured)
        }));
        
        // Log each artwork's highlighted and featured status
        normalizedArtworks.forEach((artwork, index) => {
          addDebugInfo(`Artwork ${index + 1}: ${artwork.title} - Highlighted: ${artwork.isHighlighted ? 'Yes' : 'No'}, Featured: ${artwork.isFeatured ? 'Yes' : 'No'}`);
        });
        
        // Filter highlighted works
        const highlighted = normalizedArtworks.filter(artwork => artwork.isHighlighted === true);
        addDebugInfo(`Found ${highlighted.length} highlighted works after normalization`);
        
        // Find featured artwork (use the first one found)
        const featured = normalizedArtworks.find(artwork => artwork.isFeatured === true);
        addDebugInfo(`Featured artwork after normalization: ${featured ? featured.title : 'None'}`);
        
        // Sort by createdAt for latest creations
        let sortedByDate = [...normalizedArtworks];
        try {
          sortedByDate = [...normalizedArtworks].sort((a, b) => {
            try {
              const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
              const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
              return dateB.getTime() - dateA.getTime();
            } catch (error) {
              addDebugInfo(`Error sorting by date: ${error}`);
              return 0;
            }
          });
          addDebugInfo('Successfully sorted artworks by date');
        } catch (error) {
          addDebugInfo(`Error in sort: ${error}`);
        }
        
        // Set state with real data
        if (highlighted.length > 0) {
          setHighlightedWorks(highlighted);
          addDebugInfo(`Set ${highlighted.length} highlighted works`);
          
          // Force currentSlide to be in valid range
          if (currentSlide >= highlighted.length) {
            setCurrentSlide(0);
          }
        } else {
          const fallbackHighlighted = sortedByDate.slice(0, 3);
          setHighlightedWorks(fallbackHighlighted);
          addDebugInfo(`No highlighted works found, using latest ${fallbackHighlighted.length} works instead`);
        }
        
        if (featured) {
          setFeaturedArtwork(featured);
          addDebugInfo(`Set featured artwork: ${featured.title}`);
        } else if (sortedByDate.length > 0) {
          setFeaturedArtwork(sortedByDate[0]);
          addDebugInfo(`No featured artwork found, using most recent: ${sortedByDate[0].title}`);
        }
        
        setLatestCreations(sortedByDate.slice(0, 3));
        addDebugInfo(`Set ${Math.min(sortedByDate.length, 3)} latest creations`);
        
        // Get upcoming events
        const events = await getCollection('events') as EventType[];
        addDebugInfo(`Fetched ${events.length} events`);
        
        if (events && events.length > 0) {
          // Filter for upcoming events
          const futureEvents = events.filter(event => {
            try {
              return event.dates.some(d => {
                const eventDate = d.date?.toDate ? d.date.toDate() : new Date(d.date);
                return isInFuture(eventDate);
              });
            } catch (error) {
              addDebugInfo(`Error filtering events: ${error}`);
              return false;
            }
          });
          
          addDebugInfo(`Found ${futureEvents.length} upcoming events`);
          
          if (futureEvents.length > 0) {
            setUpcomingEvent(futureEvents[0]);
            addDebugInfo('Set upcoming event');
          }
        }
      } catch (error) {
        addDebugInfo(`Error fetching home page data: ${error}`);
      } finally {
        setLoading(false);
        addDebugInfo('Finished loading data');
      }
    };

    fetchHomePageData();
  }, [currentSlide]);

  // Auto-advance carousel in a separate useEffect
  useEffect(() => {
    // Only set up auto-advance if we have slides
    if (highlightedWorks.length === 0) return;
    
    addDebugInfo(`Setting up carousel auto-advance, total slides: ${highlightedWorks.length}`);
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % highlightedWorks.length;
        addDebugInfo(`Auto-advancing carousel: ${prev} -> ${next}`);
        return next;
      });
    }, 5000);
    
    return () => {
      addDebugInfo('Clearing carousel auto-advance');
      clearInterval(interval);
    };
  }, [highlightedWorks.length]);

  if (loading) {
    return (
      <div className="mt-24 py-20 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="h-16 w-16 bg-jewelry-light rounded-full"></div>
        </div>
        <p className="mt-4 text-jewelry-gray">Loading beautiful creations...</p>
      </div>
    );
  }

  // Safe access to highlighted work for current slide
  const currentHighlightedWork = highlightedWorks[currentSlide] || null;

  return (
    <div className="pt-16">
      {/* Debug Info (remove in production) */}
      <div className="bg-gray-100 p-4 text-xs" style={{whiteSpace: 'pre-wrap'}}>
        <strong>Debug Info:</strong>
        <br/>
        Highlighted Works: {highlightedWorks.length}
        <br/>
        Current Slide: {currentSlide}
        <br/>
        Current Work: {currentHighlightedWork?.title || 'None'}
        <br/>
        Featured Artwork: {featuredArtwork ? featuredArtwork.title : 'None'}
        <br/>
        Latest Creations: {latestCreations.length}
        <br/>
        Upcoming Event: {upcomingEvent ? 'Yes' : 'None'}
        <br/>
        <br/>
        Log:
        {debugInfo}
        <hr />
        <button 
          onClick={prevSlide} 
          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
        >
          Test Prev
        </button>
        <button 
          onClick={nextSlide} 
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Test Next
        </button>
      </div>

      {/* Hero Section with Carousel */}
      <section className="relative h-[70vh] min-h-[500px] bg-jewelry-dark overflow-hidden">
        {highlightedWorks.length > 0 && currentHighlightedWork ? (
          <>
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img
                src={currentHighlightedWork.imageUrl}
                alt={currentHighlightedWork.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  console.error('Failed to load image:', currentHighlightedWork.imageUrl);
                  e.currentTarget.src = 'https://placehold.co/1200x800?text=Image+Not+Available';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-jewelry-dark/70 to-jewelry-dark/30"></div>
            </div>
            
            <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
              <div className="max-w-2xl section-animate">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  Handcrafted <br />
                  <span className="text-jewelry-accent">Elegance</span>
                </h1>
                <p className="text-xl text-gray-200 mb-8 max-w-lg">
                  Unique jewelry pieces that tell a story, designed and crafted with passion and precision.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/about" className="px-8 py-3 bg-white text-jewelry-dark font-medium rounded-md hover:bg-opacity-90 transition-colors">
                    Discover My Story
                  </Link>
                  <Link to="/contact" className="px-8 py-3 border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors">
                    Get In Touch
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Carousel Controls */}
            <div className="absolute bottom-6 left-0 right-0">
              <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  {highlightedWorks.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        addDebugInfo(`Dot ${index} clicked`);
                        setCurrentSlide(index);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-white' : 'bg-white/40'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      addDebugInfo('Prev button clicked');
                      prevSlide();
                    }}
                    className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={() => {
                      addDebugInfo('Next button clicked');
                      nextSlide();
                    }}
                    className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                    aria-label="Next slide"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">No Highlighted Works Yet</h1>
              <p className="text-xl mb-8">
                Please add some highlighted works through the admin panel.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Upcoming Event Section */}
      {upcomingEvent && (
        <section className="py-16 bg-jewelry-light section-animate">
          <div className="container mx-auto px-4">
            <SectionHeading 
              title="Upcoming Event" 
              subtitle="Join me at my next showcase to experience my latest creations in person."
              centered
            />
            
            <div className="max-w-3xl mx-auto">
              <EventItem event={upcomingEvent} />
              
              <div className="mt-8 text-center">
                <Link 
                  to="/events" 
                  className="inline-flex items-center text-jewelry-dark font-medium hover:text-jewelry-accent transition-colors"
                >
                  View All Events
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Artwork Section */}
      {featuredArtwork && (
        <section className="py-20 section-animate">
          <div className="container mx-auto px-4">
            <SectionHeading 
              title="Featured Creation" 
              subtitle="A special piece that embodies my artistic vision and craftsmanship."
            />
            
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="rounded-xl overflow-hidden aspect-square">
                <img 
                  src={featuredArtwork.imageUrl} 
                  alt={featuredArtwork.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load featured image:', featuredArtwork.imageUrl);
                    e.currentTarget.src = 'https://placehold.co/600x600?text=Image+Not+Available';
                  }}
                />
              </div>
              
              <div>
                <span className="inline-block px-3 py-1 bg-jewelry-light rounded-full text-sm font-medium text-jewelry-dark mb-4">
                  {featuredArtwork.category}
                </span>
                <h3 className="text-3xl font-bold text-jewelry-dark mb-4">
                  {featuredArtwork.title}
                </h3>
                <p className="text-jewelry-gray mb-6">
                  {featuredArtwork.description}
                </p>
                <Link 
                  to={`/artwork/${featuredArtwork.id}`}
                  className="inline-block px-6 py-3 bg-jewelry-dark text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Creations Section */}
      <section className="py-20 bg-gray-50 section-animate">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Latest Creations" 
            subtitle="Explore my most recent work, each piece crafted with attention to detail and artistic vision."
            centered
          />
          
          {latestCreations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestCreations.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-jewelry-gray">
              No artworks available yet. Check back soon!
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link 
              to="/gallery"
              className="inline-block px-8 py-3 bg-jewelry-accent text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
            >
              Explore All Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
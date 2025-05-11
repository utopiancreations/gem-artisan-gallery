// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import ArtworkCard, { ArtworkType } from '../components/ArtworkCard';
import EventItem, { EventType } from '../components/EventItem';
import { getCollection } from '../lib/firebase';
import { isInFuture } from '../lib/dateUtils';
import { Timestamp } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadingSection from '../components/LoadingSection';
import SkeletonCard from '../components/SkeletonCard';

// Interface for raw event data from Firestore
interface RawEventDateDetail {
  date: Timestamp;
  time: string;
}

interface RawEventType {
  id: string;
  title: string;
  address: string;
  description: string;
  dates: RawEventDateDetail[];
}

// Define a type that includes the createdAt field for sorting
interface ArtworkWithTimestamp extends ArtworkType {
  createdAt?: any;
}

const HomePage = () => {
  // Main state variables
  const [highlightedWorks, setHighlightedWorks] = useState<ArtworkWithTimestamp[]>([]);
  const [featuredArtwork, setFeaturedArtwork] = useState<ArtworkWithTimestamp | null>(null);
  const [latestCreations, setLatestCreations] = useState<ArtworkWithTimestamp[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<EventType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Granular loading states
  const [loading, setLoading] = useState(true);
  const [loadingHighlighted, setLoadingHighlighted] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  // Animation control state
  const [contentVisible, setContentVisible] = useState(false);

  const prevSlide = () => {
    if (highlightedWorks.length === 0) return;
    setCurrentSlide((current) => (current - 1 + highlightedWorks.length) % highlightedWorks.length);
  };

  const nextSlide = () => {
    if (highlightedWorks.length === 0) return;
    setCurrentSlide((current) => (current + 1) % highlightedWorks.length);
  };

  const normalizeBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return !!value;
  };

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        console.log('Fetching home page data...');
        setLoading(true);
        setLoadingHighlighted(true);
        setLoadingFeatured(true);
        setLoadingLatest(true);
        setLoadingEvents(true);
        setContentVisible(false);

        // --- Artwork Fetching ---
        const allArtworksRaw = await getCollection('artworks') as any[];
        console.log(`Processed ${allArtworksRaw.length} artworks`);

        if (!allArtworksRaw || allArtworksRaw.length === 0) {
          console.log('No artworks found');
          setLoadingHighlighted(false);
          setLoadingFeatured(false);
          setLoadingLatest(false);
        } else {
          const normalizedArtworks: ArtworkWithTimestamp[] = allArtworksRaw.map(artwork => ({
            ...artwork,
            isHighlighted: normalizeBoolean(artwork.isHighlighted),
            isFeatured: normalizeBoolean(artwork.isFeatured),
            createdAt: artwork.createdAt?.toDate ? artwork.createdAt.toDate() : (artwork.createdAt ? new Date(artwork.createdAt) : new Date(0)),
          }));

          // Create a sorted copy of all artworks by createdAt in descending order
          const sortedByDateArtworks = [...normalizedArtworks].sort((a, b) => {
            const dateA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
            const dateB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;
            return dateB - dateA; // Descending order
          });

          // Filter for explicitly highlighted and featured works
          const highlighted = normalizedArtworks.filter(artwork => artwork.isHighlighted === true);
          const featured = normalizedArtworks.find(artwork => artwork.isFeatured === true);

          // Process highlighted works
          if (highlighted.length > 0) {
            setHighlightedWorks(highlighted);
            if (currentSlide >= highlighted.length && highlighted.length > 0) setCurrentSlide(0);
          } else {
            const fallbackHighlighted = sortedByDateArtworks.slice(0, 3);
            setHighlightedWorks(fallbackHighlighted);
            if (currentSlide >= fallbackHighlighted.length && fallbackHighlighted.length > 0) setCurrentSlide(0);
          }
          setLoadingHighlighted(false);

          // Process featured artwork
          if (featured) {
            setFeaturedArtwork(featured);
          } else if (sortedByDateArtworks.length > 0) {
            setFeaturedArtwork(sortedByDateArtworks[0]);
          }
          setLoadingFeatured(false);

          // Process latest creations
          setLatestCreations(sortedByDateArtworks.slice(0, 3));
          setLoadingLatest(false);
        }

        // --- Upcoming Event Fetching and Processing ---
        const rawEvents = await getCollection('events') as RawEventType[];
        console.log(`Processed ${rawEvents.length} raw events`);

        if (rawEvents && rawEvents.length > 0) {
          // 1. Transform raw events to EventType
          const transformedEvents: EventType[] = rawEvents.map(rawEvent => ({
            id: rawEvent.id,
            title: rawEvent.title,
            address: rawEvent.address,
            description: rawEvent.description,
            dates: rawEvent.dates.map(d => ({
              date: d.date.toDate(),
              time: d.time,
            })),
          }));

          // 2. Filter for future events
          const futureEvents = transformedEvents.filter(event =>
            event.dates.some(d => isInFuture(d.date as Date))
          );
          console.log(`Found ${futureEvents.length} future events after transformation`);

          if (futureEvents.length > 0) {
            // 3. Sort future events to get the soonest one first
            futureEvents.sort((a, b) => {
              const firstDateA = a.dates[0]?.date;
              const firstDateB = b.dates[0]?.date;
              const dateA = firstDateA instanceof Date ? firstDateA.getTime() : new Date(firstDateA || 0).getTime();
              const dateB = firstDateB instanceof Date ? firstDateB.getTime() : new Date(firstDateB || 0).getTime();
              return dateA - dateB; // Ascending order (soonest first)
            });
            setUpcomingEvent(futureEvents[0]);
            console.log('Set upcoming event:', futureEvents[0].title);
          } else {
            setUpcomingEvent(null);
            console.log('No upcoming events found.');
          }
        } else {
          setUpcomingEvent(null);
          console.log('No events fetched from collection.');
        }
        setLoadingEvents(false);

      } catch (error) {
        console.error(`Error fetching home page data: ${error}`);
        // Reset all loading states on error
        setLoadingHighlighted(false);
        setLoadingFeatured(false);
        setLoadingLatest(false);
        setLoadingEvents(false);
      } finally {
        setLoading(false);
        console.log('Finished loading all home page data');
      }
    };

    fetchHomePageData();
  }, []);

  // Effect to handle animation after content is loaded
  useEffect(() => {
    if (!loading) {
      // Set a very short timeout to ensure CSS transitions can take effect
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Effect to control animation of sections
  useEffect(() => {
    if (!contentVisible) return;
    
    const sections = document.querySelectorAll('.home-section-animate');
    
    // Apply a staggered animation to each section
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('animated');
      }, 100 + index * 200); // Slightly longer stagger for home page
    });
  }, [contentVisible]);

  // Effect for auto-sliding the hero carousel
  useEffect(() => {
    if (highlightedWorks.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % highlightedWorks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [highlightedWorks.length]);

  // Full-page loading state
  if (loading) {
    return (
      <div className="pt-16">
        <section className="relative h-[70vh] min-h-[500px] bg-jewelry-dark flex items-center justify-center">
          <LoadingSpinner size="large" color="white" text="Loading beautiful creations..." />
        </section>
        <LoadingSection height="h-96" text="Preparing your experience..." />
      </div>
    );
  }

  // Get the current highlighted work for the hero section based on the slide index
  const currentHighlightedWork = highlightedWorks[currentSlide] || null;

  return (
    <div className={`pt-16 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section - Displays Highlighted Works (or fallback) */}
      <section className="relative h-[70vh] min-h-[500px] bg-jewelry-dark overflow-hidden home-section-animate opacity-0 transform translate-y-4 transition-all duration-500">
        {loadingHighlighted ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="large" color="white" text="Loading highlights..." />
          </div>
        ) : highlightedWorks.length > 0 && currentHighlightedWork ? (
          <>
            {/* Background Image */}
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
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-jewelry-dark/70 to-jewelry-dark/30"></div>
            </div>

            {/* Content Overlay */}
            <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
              <div className="max-w-2xl">
                {/* Hero Heading */}
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  Handcrafted <br />
                  <span className="text-jewelry-accent">Elegance</span>
                </h1>
                {/* Hero Subtitle/Description */}
                <p className="text-xl text-gray-200 mb-8 max-w-lg">
                  Unique jewelry pieces that tell a story, designed and crafted with passion and precision.
                </p>
                {/* Action Buttons */}
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

            {/* Carousel Navigation (Dots and Arrows) */}
            <div className="absolute bottom-6 left-0 right-0 z-20">
              <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Navigation Dots */}
                <div className="flex space-x-2">
                  {highlightedWorks.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-white' : 'bg-white/40'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Navigation Arrows */}
                <div className="flex space-x-2">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={nextSlide}
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
          // Fallback JSX when no highlighted works
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
      {loadingEvents ? (
        <section className="py-16 bg-jewelry-light">
          <div className="container mx-auto px-4">
            <SectionHeading
              title="Upcoming Event"
              subtitle="Loading event information..."
              centered
            />
            <div className="max-w-3xl mx-auto">
              <LoadingSection height="h-48" text="" spinnerSize="small" />
            </div>
          </div>
        </section>
      ) : upcomingEvent && (
        <section className="py-16 bg-jewelry-light home-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-100">
          <div className="container mx-auto px-4">
            <SectionHeading
              title="Upcoming Event"
              subtitle="Join me at my next showcase to experience my latest creations in person."
              centered
            />
            {/* Display the upcoming event details */}
            <div className="max-w-3xl mx-auto">
              <EventItem event={upcomingEvent} />
              {/* Link to view all events */}
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
      {loadingFeatured ? (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              title="Featured Creation"
              subtitle="Loading featured creation..."
            />
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="rounded-xl overflow-hidden aspect-square bg-gray-200 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-32 bg-gray-300 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>
      ) : featuredArtwork && (
        <section className="py-20 home-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-200">
          <div className="container mx-auto px-4">
            <SectionHeading
              title="Featured Creation"
              subtitle="A special piece that embodies my artistic vision and craftsmanship."
            />
            {/* Grid layout for featured artwork */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Featured Image */}
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
              {/* Featured Artwork Details */}
              <div>
                {/* Category Tag */}
                <span className="inline-block px-3 py-1 bg-jewelry-light rounded-full text-sm font-medium text-jewelry-dark mb-4">
                  {featuredArtwork.category}
                </span>
                {/* Title */}
                <h3 className="text-3xl font-bold text-jewelry-dark mb-4">
                  {featuredArtwork.title}
                </h3>
                {/* Description */}
                <p className="text-jewelry-gray mb-6">
                  {featuredArtwork.description}
                </p>
                {/* View Details Link */}
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
      <section className="py-20 bg-gray-50 home-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-300">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Latest Creations"
            subtitle={loadingLatest ? "Loading recent work..." : "Explore my most recent work, each piece crafted with attention to detail and artistic vision."}
            centered
          />
          
          {loadingLatest ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : latestCreations.length > 0 ? (
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
          
          {/* Link to the full gallery */}
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

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import ArtworkCard, { ArtworkType } from '../components/ArtworkCard';
import EventItem, { EventType } from '../components/EventItem';
import { queryCollection } from '../lib/firebase';
import { isInFuture } from '../lib/dateUtils';

const HomePage = () => {
  const [highlightedWorks, setHighlightedWorks] = useState<ArtworkType[]>([]);
  const [featuredArtwork, setFeaturedArtwork] = useState<ArtworkType | null>(null);
  const [latestCreations, setLatestCreations] = useState<ArtworkType[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<EventType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        // For demo, we're using static data
        // In production, replace with the queryCollection functions
        
        // Example highlighted works (carousel items)
        setHighlightedWorks([
          {
            id: '1',
            title: 'Golden Twist Earrings',
            description: 'Hand-forged gold-filled wire with a gentle twist design and freshwater pearl accents.',
            imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80',
            category: 'Earrings'
          },
          {
            id: '2',
            title: 'Silver Wave Ring',
            description: 'Sterling silver ring with an elegant wave pattern, symbolizing life's continuous flow.',
            imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80',
            category: 'Rings'
          },
          {
            id: '3',
            title: 'Pearl Cascade Necklace',
            description: 'A cascade of varying sized freshwater pearls on a delicate silver chain.',
            imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80',
            category: 'Pearls'
          }
        ]);
        
        // Example featured artwork
        setFeaturedArtwork({
          id: '4',
          title: 'Amber Sunrise Pendant',
          description: 'Inspired by dawn's first light, this handcrafted pendant features ethically sourced amber set in recycled gold. The organic shape mimics the sun breaking through the horizon, while subtle texture work creates a warm, dimensional glow.',
          imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80',
          category: 'Pendants',
          isFeatured: true
        });
        
        // Example latest creations
        setLatestCreations([
          {
            id: '5',
            title: 'Copper Leaf Earrings',
            description: 'Delicate copper pieces hand-cut into leaf shapes and treated with a natural patina.',
            imageUrl: 'https://images.unsplash.com/photo-1535632787350-4e68ef7ac577?auto=format&fit=crop&q=80',
            category: 'Earrings'
          },
          {
            id: '6',
            title: 'Moonstone Adjustable Ring',
            description: 'Sterling silver ring with an adjustable band featuring a luminous moonstone.',
            imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80',
            category: 'Rings'
          },
          {
            id: '7',
            title: 'Braided Toggle Clasp',
            description: 'A hand-braided sterling silver toggle clasp that serves as both functional and decorative.',
            imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80',
            category: 'Toggles'
          }
        ]);
        
        // Example upcoming event
        setUpcomingEvent({
          id: '1',
          title: 'Spring Collection Launch',
          address: 'Art Gallery East, 123 Main Street, Portland',
          description: 'Join us for the launch of our Spring Collection featuring live music, refreshments, and exclusive first access to new designs.',
          dates: [
            { date: new Date(2025, 5, 15), time: '6:00 PM - 9:00 PM' }
          ]
        });
        
        // In production, use code like this instead:
        /*
        // Get highlighted works
        const highlightedData = await queryCollection('artworks', [
          { field: 'isHighlighted', operator: '==', value: true }
        ]);
        setHighlightedWorks(highlightedData as ArtworkType[]);
        
        // Get featured artwork
        const featuredData = await queryCollection('artworks', [
          { field: 'isFeatured', operator: '==', value: true }
        ], 'updatedAt', true, 1);
        setFeaturedArtwork(featuredData[0] as ArtworkType);
        
        // Get latest creations
        const latestData = await queryCollection('artworks', [], 'createdAt', true, 3);
        setLatestCreations(latestData as ArtworkType[]);
        
        // Get upcoming event
        const allEvents = await queryCollection('events');
        const futureEvents = (allEvents as EventType[])
          .filter(event => 
            event.dates.some(dateObj => isInFuture(dateObj.date))
          )
          .sort((a, b) => {
            // Sort by the earliest upcoming date
            const aDate = new Date(a.dates.find(d => isInFuture(d.date))?.date || 0);
            const bDate = new Date(b.dates.find(d => isInFuture(d.date))?.date || 0);
            return aDate.getTime() - bDate.getTime();
          });
        
        if (futureEvents.length > 0) {
          setUpcomingEvent(futureEvents[0]);
        }
        */

      } catch (error) {
        console.error("Error fetching home page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
    
    // Initialize scroll animation observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.section-animate').forEach(section => {
      observer.observe(section);
    });
    
    // Auto-advance carousel
    const interval = setInterval(() => {
      if (highlightedWorks.length > 0) {
        setCurrentSlide(prev => (prev + 1) % highlightedWorks.length);
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      document.querySelectorAll('.section-animate').forEach(section => {
        observer.unobserve(section);
      });
    };
  }, [highlightedWorks.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % highlightedWorks.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + highlightedWorks.length) % highlightedWorks.length);
  };

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

  return (
    <div className="pt-16">
      {/* Hero Section with Carousel */}
      <section className="relative h-[70vh] min-h-[500px] bg-jewelry-dark overflow-hidden">
        {highlightedWorks.length > 0 && (
          <>
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
              <img
                src={highlightedWorks[currentSlide].imageUrl}
                alt={highlightedWorks[currentSlide].title}
                className="w-full h-full object-cover object-center"
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
                  <a href="/about" className="px-8 py-3 bg-white text-jewelry-dark font-medium rounded-md hover:bg-opacity-90 transition-colors">
                    Discover My Story
                  </a>
                  <a href="/contact" className="px-8 py-3 border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors">
                    Get In Touch
                  </a>
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
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-white' : 'bg-white/40'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
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
                <a 
                  href="/events" 
                  className="inline-flex items-center text-jewelry-dark font-medium hover:text-jewelry-accent transition-colors"
                >
                  View All Events
                  <ArrowRight size={16} className="ml-1" />
                </a>
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
                <a 
                  href={`/artwork/${featuredArtwork.id}`}
                  className="inline-block px-6 py-3 bg-jewelry-dark text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
                >
                  View Details
                </a>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestCreations.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <a 
              href="/gallery"
              className="inline-block px-8 py-3 bg-jewelry-accent text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
            >
              Explore All Works
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

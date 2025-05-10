
import { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import EventItem, { EventType } from '../components/EventItem';
import { getCollection } from '../lib/firebase';
import { isPastEvent } from '../lib/dateUtils';

const EventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [pastEvents, setPastEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // For demo, we're using static data
        // In production, replace with the getCollection function
        
        // Example event data
        const eventData: EventType[] = [
          {
            id: '1',
            title: 'Spring Collection Launch',
            address: 'Art Gallery East, 123 Main Street, Portland',
            description: 'Join us for the launch of our Spring Collection featuring live music, refreshments, and exclusive first access to new designs.',
            dates: [
              { date: new Date(2025, 5, 15), time: '6:00 PM - 9:00 PM' }
            ]
          },
          {
            id: '2',
            title: 'Artisan Market Weekend',
            address: 'Downtown Market Square, 456 Center Ave, Seattle',
            description: 'A weekend marketplace featuring local artisans. Visit our booth to see our latest creations and meet the artist.',
            dates: [
              { date: new Date(2025, 6, 10), time: '10:00 AM - 6:00 PM' },
              { date: new Date(2025, 6, 11), time: '11:00 AM - 5:00 PM' }
            ]
          },
          {
            id: '3',
            title: 'Jewelry Making Workshop',
            address: 'Creative Arts Center, 789 Workshop Lane, Portland',
            description: 'Learn basic jewelry making techniques in this hands-on workshop. All materials provided. Limited spots available.',
            dates: [
              { date: new Date(2025, 7, 5), time: '2:00 PM - 5:00 PM' }
            ]
          },
          {
            id: '4',
            title: 'Holiday Showcase',
            address: 'Winter Gallery, 101 Snowy Road, Portland',
            description: 'Special holiday showcase featuring one-of-a-kind pieces perfect for gifting. Complimentary gift wrapping available.',
            dates: [
              { date: new Date(2024, 11, 5), time: '12:00 PM - 8:00 PM' },
              { date: new Date(2024, 11, 6), time: '12:00 PM - 8:00 PM' },
              { date: new Date(2024, 11, 7), time: '12:00 PM - 6:00 PM' }
            ]
          },
          {
            id: '5',
            title: 'Winter Collection Preview',
            address: 'Elegance Studio, 202 Artisan Way, Portland',
            description: 'By invitation only: be among the first to see our Winter Collection before its public release.',
            dates: [
              { date: new Date(2024, 10, 15), time: '7:00 PM - 9:00 PM' }
            ]
          }
        ];
        
        // Filter into upcoming and past events
        const upcoming = eventData.filter(event => !isPastEvent(event));
        const past = eventData.filter(event => isPastEvent(event));
        
        // Sort upcoming events by earliest date first
        upcoming.sort((a, b) => {
          const aDate = new Date(a.dates[0].date);
          const bDate = new Date(b.dates[0].date);
          return aDate.getTime() - bDate.getTime();
        });
        
        // Sort past events by most recent first
        past.sort((a, b) => {
          const aDate = new Date(a.dates[0].date);
          const bDate = new Date(b.dates[0].date);
          return bDate.getTime() - aDate.getTime();
        });
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        
        // In production, use code like this instead:
        /*
        const events = await getCollection('events') as EventType[];
        
        // Filter into upcoming and past events
        const upcoming = events.filter(event => !isPastEvent(event));
        const past = events.filter(event => isPastEvent(event));
        
        // Sort upcoming events by earliest date first
        upcoming.sort((a, b) => {
          const aDate = new Date(a.dates[0].date);
          const bDate = new Date(b.dates[0].date);
          return aDate.getTime() - bDate.getTime();
        });
        
        // Sort past events by most recent first
        past.sort((a, b) => {
          const aDate = new Date(a.dates[0].date);
          const bDate = new Date(b.dates[0].date);
          return bDate.getTime() - aDate.getTime();
        });
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        */
        
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    
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
    
    return () => {
      document.querySelectorAll('.section-animate').forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 max-w-md mb-4"></div>
            <div className="h-6 bg-gray-200 max-w-sm mb-10"></div>
            
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-md">
                  <div className="h-6 bg-gray-200 max-w-xs mb-4"></div>
                  <div className="h-4 bg-gray-200 max-w-sm mb-3"></div>
                  <div className="h-4 bg-gray-200 max-w-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Events"
          subtitle="Join me at these upcoming events to see my work in person and discuss custom pieces."
          className="section-animate"
        />
        
        {/* Upcoming Events */}
        <div className="mb-16 section-animate">
          <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
            Upcoming Events
          </h3>
          
          {upcomingEvents.length > 0 ? (
            <div className="space-y-6">
              {upcomingEvents.map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-jewelry-gray">
                No upcoming events scheduled at the moment. Check back soon or subscribe to our newsletter to be notified.
              </p>
            </div>
          )}
        </div>
        
        {/* Past Events */}
        <div className="section-animate">
          <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
            Past Events
          </h3>
          
          {pastEvents.length > 0 ? (
            <div className="space-y-6">
              {pastEvents.map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-jewelry-gray">
                No past events to display.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;

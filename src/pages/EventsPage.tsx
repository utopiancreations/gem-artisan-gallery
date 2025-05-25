
// src/pages/EventsPage.tsx
import { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import EventItem, { EventType } from '../components/EventItem';
import { getCollection } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

// Interface for the raw event data from Firestore
interface RawFirestoreEventDate {
  date: Timestamp;
  time: string;
}

interface RawFirestoreEvent {
  id: string;
  title: string;
  address: string;
  description: string;
  dates: RawFirestoreEventDate[];
}

// Helper function to check if an event is past (older than 365 days)
const isEventPast = (event: EventType): boolean => {
  if (!event.dates || event.dates.length === 0) return false;
  
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  // Check if all dates are older than 365 days
  return event.dates.every(dateEntry => {
    const eventDate = new Date(dateEntry.date);
    return eventDate < oneYearAgo;
  });
};

const EventsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [pastEvents, setPastEvents] = useState<EventType[]>([]);
  
  // Animation control state
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    console.log('Fetching shows data...');
    setLoading(true);
    setError(null);
    setContentVisible(false);

    const fetchEvents = async () => {
      try {
        console.log('Starting to fetch shows...');
        const rawEventsData = await getCollection('events') as RawFirestoreEvent[];
        console.log('Raw shows data from Firestore:', rawEventsData);

        let safeRawEventsData = rawEventsData;
        if (!rawEventsData) {
          console.warn('rawEventsData is undefined or null after fetch.');
          safeRawEventsData = [];
        } else if (rawEventsData.length === 0) {
          console.log('No shows found in Firestore (array is empty).');
        }

        console.log('Transforming raw show data...');
        const transformedEvents: EventType[] = safeRawEventsData.map(rawEvent => {
          if (!rawEvent.id) console.warn('Show missing ID:', rawEvent);
          if (!rawEvent.dates || !Array.isArray(rawEvent.dates)) {
            console.error('rawEvent is missing "dates" array or it is not an array!', rawEvent);
            return {
              id: rawEvent.id || `unknown-id-${Math.random()}`,
              title: rawEvent.title || 'Unknown Title',
              address: rawEvent.address || 'Unknown Address',
              description: rawEvent.description || 'No Description',
              dates: [],
            } as EventType;
          }
          return {
            id: rawEvent.id,
            title: rawEvent.title,
            address: rawEvent.address,
            description: rawEvent.description,
            dates: rawEvent.dates.map(rawDateItem => {
              if (!rawDateItem.date || typeof rawDateItem.date.toDate !== 'function') {
                console.error('Invalid Firestore Timestamp object in rawDateItem.date:', rawDateItem, 'for show ID:', rawEvent.id);
                return { date: new Date(), time: rawDateItem.time || 'Unknown Time' };
              }
              return { date: rawDateItem.date.toDate(), time: rawDateItem.time };
            }),
          };
        });
        console.log('Transformed shows:', transformedEvents);

        console.log('Filtering and sorting shows...');
        const now = new Date();
        
        // Filter for upcoming shows (future dates)
        const upcoming = transformedEvents.filter(event => {
          if (!event.dates || event.dates.length === 0) return false;
          return event.dates.some(dateEntry => {
            const eventDate = new Date(dateEntry.date);
            return eventDate >= now;
          });
        });
        
        // Filter for past shows (events within the last 365 days but not in the future)
        const past = transformedEvents.filter(event => {
          if (!event.dates || event.dates.length === 0) return false;
          
          // Check if event has any future dates
          const hasFutureDates = event.dates.some(dateEntry => {
            const eventDate = new Date(dateEntry.date);
            return eventDate >= now;
          });
          
          // If it has future dates, it's not a past event
          if (hasFutureDates) return false;
          
          // Check if it's not older than 365 days
          return !isEventPast(event);
        });

        upcoming.sort((a, b) => {
          if (!a.dates?.length || !b.dates?.length) return 0;
          const aDate = new Date(a.dates[0].date);
          const bDate = new Date(b.dates[0].date);
          return aDate.getTime() - bDate.getTime();
        });
        past.sort((a, b) => {
          if (!a.dates?.length || !b.dates?.length) return 0;
          const aDate = new Date(a.dates[0].date);
          const bDate = new Date(b.dates[0].date);
          return bDate.getTime() - aDate.getTime();
        });
        console.log('Sorted upcoming shows:', upcoming);
        console.log('Sorted past shows:', past);

        console.log('Setting upcomingEvents and pastEvents states...');
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        console.log('Show states have been set.');

      } catch (err) {
        console.error("Error during fetch or processing:", err);
        setError("Failed to process shows. Please try again later.");
      } finally {
        console.log('Fetch/process attempt complete, setting loading to false.');
        setLoading(false);
        
        // Short delay before showing content to ensure smooth transitions
        setTimeout(() => {
          setContentVisible(true);
        }, 50);
      }
    };

    fetchEvents();
  }, []);
  
  // Effect to control animation of sections
  useEffect(() => {
    if (!contentVisible) return;
    
    const sections = document.querySelectorAll('.events-section-animate');
    
    // Apply a staggered animation to each section
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('animated');
      }, 100 + index * 150);
    });
  }, [contentVisible]);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Shows"
            subtitle="Loading shows information..."
            className="animated" // Always show the heading
          />
          <div className="space-y-8 mt-10">
            {/* Upcoming Shows Loading Skeleton */}
            <div>
              <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
                Upcoming Shows
              </h3>
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                    <div className="h-6 bg-gray-200 max-w-xs mb-4"></div>
                    <div className="h-4 bg-gray-200 max-w-sm mb-3"></div>
                    <div className="h-4 bg-gray-200 max-w-md"></div>
                    <div className="mt-4 flex space-x-2">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Past Shows Loading Skeleton */}
            <div>
              <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
                Past Shows
              </h3>
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                    <div className="h-6 bg-gray-200 max-w-xs mb-4"></div>
                    <div className="h-4 bg-gray-200 max-w-sm mb-3"></div>
                    <div className="h-4 bg-gray-200 max-w-md"></div>
                    <div className="mt-4 flex space-x-2">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <SectionHeading title="Shows" subtitle="Something went wrong." />
          <div className="bg-red-50 p-6 rounded-lg mt-8 text-red-600">
            <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="font-medium text-lg mb-2">Error Loading Shows</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-24 pb-16 transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Shows"
          subtitle="Join me at these upcoming shows to see my work in person and discuss custom pieces."
          className="events-section-animate opacity-0 transform translate-y-4 transition-all duration-500"
        />
        
        {/* --- Upcoming Shows --- */}
        <div className="mb-16 events-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-100">
          <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
            Upcoming Shows
          </h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-6 transition-all">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="transform transition duration-300 hover:translate-y-[-3px]"
                  style={{ transitionDelay: `${index * 100}ms` }} // Staggered entry
                >
                  <EventItem event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-jewelry-gray">
                No upcoming shows scheduled at the moment. Check back soon or subscribe to our newsletter to be notified.
              </p>
            </div>
          )}
        </div>
        
        {/* --- Past Shows --- */}
        <div className="events-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-200">
          <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
            Past Shows
          </h3>
          {pastEvents.length > 0 ? (
            <div className="space-y-6">
              {pastEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  style={{ transitionDelay: `${index * 50}ms` }} // Lighter stagger for past events
                >
                  <EventItem event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-jewelry-gray">
                No past shows to display.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;

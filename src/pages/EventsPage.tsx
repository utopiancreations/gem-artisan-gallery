
// src/pages/EventsPage.tsx
import { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import EventItem, { EventType } from '../components/EventItem';
import { getCollection } from '../lib/firebase';
import { Timestamp, FirestoreError } from 'firebase/firestore'; // Added FirestoreError
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

const EventsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYearEvents, setCurrentYearEvents] = useState<EventType[]>([]);
  
  // Animation control state
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // console.log('Fetching shows data...');
    setLoading(true);
    setError(null);
    setContentVisible(false);

    const fetchEvents = async () => {
      try {
        // console.log('Starting to fetch shows...');
        const rawEventsData = await getCollection('events') as RawFirestoreEvent[];
        // console.log('Raw shows data from Firestore:', rawEventsData);

        let safeRawEventsData = rawEventsData;
        if (!rawEventsData) {
          // console.warn('rawEventsData is undefined or null after fetch.');
          safeRawEventsData = [];
        } else if (rawEventsData.length === 0) {
          // console.log('No shows found in Firestore (array is empty).');
        }

        // console.log('Transforming raw show data...');
        const transformedEvents: EventType[] = safeRawEventsData.map(rawEvent => {
          if (!rawEvent.id) console.warn('Show missing ID during transformation:', rawEvent); // Kept warn for missing ID
          if (!rawEvent.dates || !Array.isArray(rawEvent.dates)) {
            console.error('rawEvent is missing "dates" array or it is not an array during transformation!', rawEvent); // Kept error for data integrity
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
                console.error('Invalid Firestore Timestamp object in rawDateItem.date during transformation:', rawDateItem, 'for show ID:', rawEvent.id); // Kept error
                return { date: new Date(), time: rawDateItem.time || 'Unknown Time' };
              }
              return { date: rawDateItem.date.toDate(), time: rawDateItem.time };
            }),
          };
        });
        // console.log('Transformed shows:', transformedEvents);

        // console.log('Filtering and sorting shows for current year...');
        const currentYear = new Date().getFullYear();
        
        const eventsThisYear = transformedEvents.filter(event => {
          if (!event.dates || event.dates.length === 0) return false;
          return event.dates.some(dateEntry => {
            const eventDate = new Date(dateEntry.date);
            return eventDate.getFullYear() === currentYear;
          });
        });
        
        eventsThisYear.sort((a, b) => {
          if (!a.dates?.length || !b.dates?.length) return 0;
          // Sort by the earliest date of each event
          const earliestDateA = new Date(Math.min(...a.dates.map(d => new Date(d.date).getTime())));
          const earliestDateB = new Date(Math.min(...b.dates.map(d => new Date(d.date).getTime())));
          return earliestDateA.getTime() - earliestDateB.getTime(); // Ascending order
        });
        // console.log('Sorted current year shows:', eventsThisYear);

        // console.log('Setting currentYearEvents state...');
        setCurrentYearEvents(eventsThisYear);
        // console.log('Show states have been set.');

      } catch (err) {
        console.error("Error during fetch or processing of events:", err); // Made error message more specific
        let message = "Failed to process shows. Please try again later.";
        if (err instanceof FirestoreError) { // Example of more specific error handling
            message = `Firestore error: ${err.message}`;
        } else if (err instanceof Error) {
            message = err.message;
        }
        setError(message);
      } finally {
        // console.log('Fetch/process attempt complete, setting loading to false.');
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
            {/* Events Loading Skeleton */}
            <div>
              <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
                Current Year Shows
              </h3>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
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
          subtitle="Join me at these shows to see my work in person and discuss custom pieces."
          className="events-section-animate opacity-0 transform translate-y-4 transition-all duration-500"
        />
        
        {/* --- Current Year Shows --- */}
        <div className="mt-10 events-section-animate opacity-0 transform translate-y-4 transition-all duration-500 delay-100">
          <h3 className="text-2xl font-bold text-jewelry-dark mb-6">
            Current Year Shows
          </h3>
          {currentYearEvents.length > 0 ? (
            <div className="space-y-6 transition-all">
              {currentYearEvents.map((event, index) => (
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
                No shows scheduled for the current year at the moment. Check back soon or subscribe to our newsletter to be notified.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;

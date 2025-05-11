// src/components/EventItem.tsx (Updated with Google Maps Link for Address)
import { Calendar, MapPin } from 'lucide-react'; // Added MapPin icon
import { formatDate } from '../lib/dateUtils';

export type EventType = {
  id: string;
  title: string;
  address: string;
  description: string;
  dates: Array<{
    date: Date | string;
    time: string;
  }>;
};

type EventItemProps = {
  event: EventType;
  compact?: boolean;
};

const EventItem = ({ event, compact = false }: EventItemProps) => {
  if (!event) {
    console.error("EventItem: received undefined 'event' prop.");
    return <div className="text-red-500 p-4">Error: Event data missing.</div>;
  }
  if (!event.dates || !Array.isArray(event.dates)) {
     console.error("EventItem: event prop is missing 'dates' array or it's not an array.", event);
     return <div className="text-red-500 p-4">Error: Event data is incomplete (missing dates information for event ID: {event.id}).</div>;
  }

  const googleMapsUrl = event.address 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}` 
    : '#';

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-full bg-jewelry-light p-2.5 mt-1"> {/* Adjusted margin for icon alignment */}
          <Calendar className="h-5 w-5 text-jewelry-dark" />
        </div>
        
        <div className="flex-grow">
          <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-jewelry-dark`}>
            {event.title || 'Untitled Event'}
          </h3>
          
          {/* Dates and Times */}
          <div className="mt-2 space-y-1.5"> {/* Adjusted margin and spacing */}
            {event.dates.slice(0, compact ? 1 : event.dates.length).map((dateTime, index) => {
              if (!dateTime) {
                console.error(`EventItem: dateTime object at index ${index} is undefined in event.dates array for event ID: ${event.id}`);
                return <div key={`date-error-${event.id}-${index}`} className="text-sm text-red-500">Date/Time info missing</div>;
              }
              return (
                <div key={`${event.id}-date-${index}`} className="text-sm text-jewelry-gray flex items-center">
                  {/* Calendar icon can be placed here too if desired for each date, or keep one main one */}
                  <span className="font-medium">
                    {dateTime.date ? formatDate(dateTime.date) : 'Date not specified'}
                  </span>
                  {dateTime.time && (
                    <>
                      <span className="mx-1">at</span> {/* Added mx-1 for better spacing */}
                      <span>{dateTime.time}</span>
                    </>
                  )}
                </div>
              );
            })}
            {event.dates.length === 0 && (
                 <div className="text-sm text-jewelry-gray">No dates specified for this event.</div>
            )}
          </div>
          
          {/* Address with Google Maps Link */}
          {event.address && (
            <div className="mt-3 flex items-center gap-2"> {/* Use flex to align icon and text */}
              <MapPin className="h-4 w-4 text-jewelry-gray flex-shrink-0" /> {/* Icon for address */}
              <a
                href={googleMapsUrl}
                target="_blank" // Opens the link in a new tab
                rel="noopener noreferrer" // Security best practice for external links
                className="text-sm text-jewelry-accent hover:underline hover:text-jewelry-dark transition-colors duration-200"
                title={`Open address in Google Maps: ${event.address}`} // Tooltip for accessibility
              >
                {event.address}
              </a>
            </div>
          )}
          
          {!compact && event.description && (
            <div className="mt-4">
              <p className="text-sm text-jewelry-gray"> {/* Consider using prose for better typography if descriptions are long */}
                {event.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventItem;
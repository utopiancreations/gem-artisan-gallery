
import { Calendar } from 'lucide-react';
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
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-full bg-jewelry-light p-2.5">
          <Calendar className="h-5 w-5 text-jewelry-dark" />
        </div>
        
        <div className="flex-grow">
          <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-jewelry-dark`}>
            {event.title}
          </h3>
          
          <div className="mt-3 space-y-2">
            {event.dates.slice(0, compact ? 1 : undefined).map((dateTime, index) => (
              <div key={index} className="text-sm text-jewelry-gray">
                <span className="font-medium">
                  {formatDate(dateTime.date)}
                </span>
                <span> at </span>
                <span>{dateTime.time}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-jewelry-gray">
              {event.address}
            </p>
          </div>
          
          {!compact && (
            <div className="mt-4">
              <p className="text-jewelry-gray">
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

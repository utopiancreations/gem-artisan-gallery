
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

export const isInFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

export const isPastEvent = (event: { dates: Array<{date: Date | string}> }): boolean => {
  // Check if all dates in the event are in the past
  return event.dates.every(dateObj => {
    const eventDate = typeof dateObj.date === 'string' ? new Date(dateObj.date) : dateObj.date;
    return eventDate < new Date();
  });
};

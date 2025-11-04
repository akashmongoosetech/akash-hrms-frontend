/**
 * Formats a date to a readable string format (e.g., "02 Oct, 2025").
 * @param date - The date to format (Date object or ISO string).
 * @returns The formatted date string.
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }

  const day = d.toLocaleString('en-US', { day: '2-digit' });
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();

  return `${day} ${month}, ${year}`;
};


/**
 * Formats a date to include time (e.g., "30 Nov, 2025 11:00 AM").
 * @param date - The date to format (Date object or ISO string).
 * @returns The formatted date and time string.
 */
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();

  const time = d.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(/^0/, ''); // Remove leading zero from hour if any

  return `${day} ${month}, ${year} ${time}`;
};

/**
 * Formats a date to get the day name (e.g., "Sunday").
 * @param date - The date to format (Date object or ISO string).
 * @returns The day name string.
 */
export const formatDay = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }
  return d.toLocaleString('en-US', { weekday: 'long' });
};
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

/**
 * Formats a due date to display relative dates like "Today", "Yesterday", "Tomorrow", or "05 Nov, 2025".
 * @param date - The date to format (string in DD/MM/YYYY format).
 * @returns The formatted due date string.
 */
export const formatDueDate = (date: string): string => {
  // Parse date assuming DD/MM/YYYY format
  const [dayStr, monthStr, yearStr] = date.split('/');
  if (!dayStr || !monthStr || !yearStr) {
    throw new Error('Invalid date format. Expected DD/MM/YYYY');
  }

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1; // Months are 0-based
  const year = parseInt(yearStr, 10);

  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const inputMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffTime = inputMidnight.getTime() - todayMidnight.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";

  // Format as "05 Nov, 2025" using en-US locale
  const formattedDay = d.toLocaleString('en-US', { day: '2-digit' });
  const formattedMonth = d.toLocaleString('en-US', { month: 'short' });
  const formattedYear = d.getFullYear();

  return `${formattedDay} ${formattedMonth}, ${formattedYear}`;
};
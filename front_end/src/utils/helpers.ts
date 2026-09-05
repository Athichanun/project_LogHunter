/**
 * Helper utility functions
 */

/**
 * Format a date string or timestamp into a readable format
 */
export const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

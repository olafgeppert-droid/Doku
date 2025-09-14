/** @jsxImportSource react */

/**
 * Capitalizes the first letter of each word in a string.
 * e.g., "hans meiser" becomes "Hans Meiser".
 * @param {string} str The input string.
 * @returns {string} The capitalized string.
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => {
        if (word.length === 0) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

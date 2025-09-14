/** @jsxImportSource react */
/**
 * Capitalizes the first letter of each word in a string.
 * Performance-optimierte Version.
 * @param {string} str
 * @returns {string}
 */
export const capitalizeWords = (str) => {
  if (!str) return '';

  let result = '';
  let capitalizeNext = true;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === ' ') {
      result += char;
      capitalizeNext = true;
    } else {
      result += capitalizeNext ? char.toUpperCase() : char.toLowerCase();
      capitalizeNext = false;
    }
  }

  return result;
};

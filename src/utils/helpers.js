/**
 * General-purpose helper functions.
 */

/**
 * Truncates a string to the specified length and appends an ellipsis.
 * @param {string} str - The string to truncate.
 * @param {number} maxLength - Maximum length before truncation.
 * @returns {string} The truncated string.
 */
export function truncateText(str, maxLength = 100) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Generates a URL-friendly slug from a string.
 * @param {string} text - The text to slugify.
 * @returns {string} The slugified string.
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

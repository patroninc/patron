/**
 * Parses URL search parameters and returns them as an object.
 *
 * @param {string} search - The URL search string (e.g., "?token=abc&foo=bar")
 * @returns {Record<string, string>} Object containing parsed parameters
 */
export function parseURLParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Gets a specific parameter from the current URL.
 *
 * @param {string} paramName - The name of the parameter to get
 * @returns {string | null} The parameter value or null if not found
 */
export function getURLParam(paramName: string): string | null {
  const params = parseURLParams(window.location.search);
  return params[paramName] || null;
}

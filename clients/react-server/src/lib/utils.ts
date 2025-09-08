import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HTTPClient, Patronts } from 'patronts';

// Create an HTTPClient instance with the default fetcher
const httpClient = new HTTPClient({
  // fetcher takes a function that has the same signature as native `fetch`.
  fetcher: async (request: string | URL | Request) =>
    fetch(request, {
      credentials: 'include',
    }),
});

export const patronClient = new Patronts({
  serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:8080',
  httpClient,
});

/**
 * Parses URL search parameters and returns them as an object.
 *
 * @param {string} search - The URL search string (e.g., "?token=abc&foo=bar")
 * @returns {Record<string, string>} Object containing parsed parameters
 */
export const parseURLParams = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};

  // eslint-disable-next-line max-params
  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

/**
 * Gets a specific parameter from the current URL.
 *
 * @param {string} paramName - The name of the parameter to get
 * @returns {string | null} The parameter value or null if not found
 */
export const getURLParam = (paramName: string): string | null => {
  const params = parseURLParams(window.location.search);
  return params[paramName] || null;
};

/**
 * Merges multiple class values into a single string.
 *
 * @param {ClassValue[]} inputs - The class values to merge
 * @returns {string} The merged class string
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Validates an email address.
 *
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

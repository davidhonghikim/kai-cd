/**
 * Utility functions for handling HTTP headers
 */

/**
 * Get default headers for API requests
 * @param apiKey Optional API key to include in Authorization header
 * @returns Record of default headers
 */
export const getDefaultHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
};

/**
 * Merge custom headers with default headers
 * @param customHeaders Custom headers to merge
 * @param apiKey Optional API key
 * @returns Merged headers
 */
export const mergeHeaders = (
  customHeaders?: Record<string, string>,
  apiKey?: string
): Record<string, string> => {
  return {
    ...getDefaultHeaders(apiKey),
    ...customHeaders
  };
}; 
export interface ErrorInfo {
  message: string;
  details: string;
  doc_slug: string;
}

export const errorRegistry: Record<string, ErrorInfo> = {
  'ERR_UNKNOWN': {
    message: 'An unknown error occurred. Check the console for more details.',
    details: 'This is a generic error for issues that have not been specifically categorized.',
    doc_slug: '#unknown-errors'
  },
  'ERR_API_UNREACHABLE': {
    message: 'The service is not responding. Please check that the service is running and the URL is correct.',
    details: 'The application failed to establish a network connection with the target service address. This could be due to a firewall, an incorrect IP/port, or the service not being active.',
    doc_slug: '#connection-errors'
  },
  'ERR_API_UNAUTHORIZED': {
    message: 'Authentication failed. Please check your API key or token.',
    details: 'The service responded with a 401 or 403 status, indicating the provided credentials are an invalid.',
    doc_slug: '#authentication-errors'
  },
  'ERR_API_SERVER_ERROR': {
    message: 'The service reported an internal error. Please check the service logs for more details.',
    details: 'The service responded with a 5xx status code, indicating a problem on the server side.',
    doc_slug: '#server-errors'
  },
  'ERR_INVALID_URL': {
    message: 'The provided URL is not valid. A full URL (including http:// or https://) is required.',
    details: 'The URL provided in the service configuration failed validation and could not be parsed.',
    doc_slug: '#invalid-url'
  }
};

export const getErrorInfo = (code: string): ErrorInfo => {
    return errorRegistry[code] || errorRegistry['ERR_UNKNOWN'];
}; 
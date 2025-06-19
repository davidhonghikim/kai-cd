/**
 * Utility functions for error handling
 */

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Create a standardized API error
 */
export function createApiError(
  message: string,
  status?: number,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): never {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    console.error('API Error:', {
      message: apiError.message,
      status: apiError.status,
      code: apiError.code,
      details: apiError.details
    });
    throw apiError;
  }
  
  console.error('Unknown error:', error);
  throw createApiError('An unknown error occurred');
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  return fn().catch(error => {
    console.error(errorMessage, error);
    throw createApiError(
      errorMessage,
      (error as ApiError).status,
      (error as ApiError).code,
      (error as ApiError).details
    );
  });
} 
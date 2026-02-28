import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ApiErrorData {
  message?: string | { message: string | string[] } | object;
  [key: string]: unknown;
}

interface NestedMessageError {
  message: string | string[];
}

/**
 * Extracts the error message from a FetchBaseQueryError, handling nested message structures
 * @param error - The FetchBaseQueryError from RTK Query
 * @returns The extracted error message string
 */
export const extractErrorMessage = (error: FetchBaseQueryError): string => {
  if (!error.data) {
    return 'An unknown error occurred';
  }

  const errorData = error.data as ApiErrorData;

  // Handle nested error structure for validation errors
  if (errorData?.message && typeof errorData.message === 'object' && 'message' in errorData.message) {
    const nestedMessage = errorData.message as NestedMessageError;
    if (Array.isArray(nestedMessage.message)) {
      // Handle array of validation messages
      return nestedMessage.message.join(', ');
    } else if (typeof nestedMessage.message === 'string') {
      // Handle single validation message
      return nestedMessage.message;
    }
  } else if (typeof errorData?.message === 'string') {
    // Handle direct message string
    return errorData.message;
  } else if (errorData?.message && typeof errorData.message === 'object') {
    // Handle other object message structures
    return JSON.stringify(errorData.message);
  }

  return 'An error occurred';
};

/**
 * Handles common API error statuses and returns appropriate error messages
 * @param error - The FetchBaseQueryError from RTK Query
 * @param defaultMessage - Default message for unknown errors
 * @returns The error message to display
 */
export const handleApiError = (
  error: FetchBaseQueryError,
  defaultMessage: string = 'Operation failed'
): string => {
  if (error.status === 409) {
    return extractErrorMessage(error);
  } else if (error.status === 400) {
    return extractErrorMessage(error);
  } else if (error.status === 403) {
    return 'Access denied';
  } else if (error.status === 404) {
    return 'Resource not found';
  } else if (error.status === 500 || error.status === 'CUSTOM_ERROR') {
    // Prefer backend-provided message for server / business errors
    return extractErrorMessage(error);
  }

  return defaultMessage;
};

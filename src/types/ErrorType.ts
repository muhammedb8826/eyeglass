import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/** Backend API error shape per integration guide */
export interface ApiErrorResponse {
  statusCode: number;
  timestamp?: string;
  path?: string;
  message: string | Record<string, string | string[]>;
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'data' in error
  );
}
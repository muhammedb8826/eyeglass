import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { extractErrorMessage } from "@/utils/errorHandling";

interface ErroPageProps {
  error: unknown;
}

const formatUiError = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybeRtk = err as Partial<FetchBaseQueryError> & { data?: unknown };
    if ("status" in maybeRtk) {
      return extractErrorMessage(maybeRtk as FetchBaseQueryError);
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "An unknown error occurred";
    }
  }
  return "An unknown error occurred";
};

const ErroPage = ({ error }: ErroPageProps) => {
  const message = formatUiError(error);
  return (
    <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
  <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
  </svg>
  <span className="sr-only">Info</span>
  <div>
    <span className="font-medium">{message}</span>
  </div>
</div>
  )
}

export default ErroPage
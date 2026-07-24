import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Consistent API response envelope used by every route handler.
 * See docs/ARCHITECTURE.md §6.
 */
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta: ApiMeta | null;
}

export function ok<T>(data: T, meta: ApiMeta | null = null): NextResponse {
  const body: ApiResponse<T> = { success: true, data, error: null, meta };
  return NextResponse.json(body, { status: 200 });
}

export function created<T>(data: T): NextResponse {
  const body: ApiResponse<T> = { success: true, data, error: null, meta: null };
  return NextResponse.json(body, { status: 201 });
}

export function fail(message: string, status = 400): NextResponse {
  const body: ApiResponse<never> = {
    success: false,
    data: null,
    error: message,
    meta: null,
  };
  return NextResponse.json(body, { status });
}

/**
 * Known error types the API translates into safe, non-leaky responses.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const unauthorized = () => new HttpError(401, "Authentication required");
export const forbidden = () => new HttpError(403, "You do not have access to this resource");
export const notFound = (what = "Resource") => new HttpError(404, `${what} not found`);

/**
 * Wraps a handler so thrown HttpError/ZodError become clean envelopes and
 * unexpected errors never leak internals (see docs/SECURITY.md §6).
 */
export function handle(
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  return fn().catch((err: unknown) => {
    if (err instanceof HttpError) return fail(err.message, err.status);
    if (err instanceof ZodError) {
      const msg = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return fail(`Validation failed: ${msg}`, 422);
    }
    console.error("Unhandled API error:", err);
    return fail("Something went wrong. Please try again.", 500);
  });
}

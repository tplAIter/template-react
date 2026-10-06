export type ApiErrorKind = 'invalid-request' | 'http' | 'network' | 'invalid-response' | 'cancelled';
export class ApiError extends Error {
  constructor(readonly kind: ApiErrorKind, message: string, readonly status?: number) {
    super(message); this.name = 'ApiError';
  }
  get retryable(): boolean { return this.kind === 'network' || (this.kind === 'http' && (this.status === 429 || (this.status ?? 0) >= 500)); }
}
export function isCancelled(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'cancelled';
}
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'The operation could not be completed.';
}

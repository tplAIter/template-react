import { ApiError } from './api-error';
import type { Decoder } from './schema';
export type Transport = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export interface RequestOptions { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; signal: AbortSignal; body?: unknown }
const LIMIT = 1024 * 1024;
async function readBody(response: Response, signal: AbortSignal): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  let length = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      if (signal.aborted) throw new ApiError('cancelled', 'Request cancelled.');
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > LIMIT) throw new ApiError('invalid-response', 'The response exceeds the supported size.');
      parts.push(chunk.value);
    }
    if (signal.aborted) throw new ApiError('cancelled', 'Request cancelled.');
    const bytes = new Uint8Array(length); let offset = 0;
    for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { throw new ApiError('invalid-response', 'The response is not valid UTF-8.'); }
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
export class ApiClient {
  private readonly base: URL;
  constructor(baseURL: string, private readonly transport: Transport = fetch) {
    try { this.base = new URL(baseURL); } catch { throw new ApiError('invalid-request', 'An absolute HTTP API base URL is required.'); }
    if (!['http:', 'https:'].includes(this.base.protocol) || this.base.username || this.base.password || this.base.search || this.base.hash) throw new ApiError('invalid-request', 'The API URL must not contain credentials, a query or a fragment.');
    if (!this.base.pathname.endsWith('/')) this.base.pathname += '/';
  }
  async request<T>(path: string, options: RequestOptions, decode: Decoder<T>): Promise<T> {
    if (!path || path.startsWith('/') || /[\\?#\u0000-\u0020]/.test(path) || path.split('/').some(p => !p || p === '.' || p === '..' || /%2e|%2f|%5c/i.test(p))) throw new ApiError('invalid-request', 'API paths must be confined relative segments.');
    const url = new URL(path, this.base);
    if (url.origin !== this.base.origin || !url.pathname.startsWith(this.base.pathname)) throw new ApiError('invalid-request', 'The API path escaped its base.');
    if (options.signal.aborted) throw new ApiError('cancelled', 'Request cancelled.');
    try {
      const response = await this.transport(url, { method: options.method ?? 'GET', signal: options.signal,
        credentials: 'omit', redirect: 'error', headers: { Accept: 'application/json', ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        body: options.body === undefined ? undefined : JSON.stringify(options.body) });
      const body = await readBody(response, options.signal);
      if (!response.ok) throw new ApiError('http', `API request failed (${response.status}).`, response.status);
      let value: unknown = null;
      if (response.status !== 204) {
        if (response.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') throw new ApiError('invalid-response', 'Expected a JSON response.');
        try { value = JSON.parse(body) as unknown; } catch { throw new ApiError('invalid-response', 'The response is not valid JSON.'); }
      }
      try { return decode(value); } catch { throw new ApiError('invalid-response', 'The response does not match the API contract.'); }
    } catch (error) {
      if (options.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw new ApiError('cancelled', 'Request cancelled.');
      if (error instanceof ApiError) throw error;
      throw new ApiError('network', 'The API is unavailable. Check the connection and try again.');
    }
  }
}

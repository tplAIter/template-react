import { describe, it, expect, vi } from 'vitest';
import { ApiClient } from './api-client';
import { ApiError } from './api-error';
import { createItemsAPI } from '../features/items/api';
import { decodeItems } from '../features/items/model';
import { sampleItem } from '../test/fixtures';
const signal = () => new AbortController().signal;
describe('typed API boundary', () => {
  it('retains caller cancellation and omits credentials', async () => {
    const transport = vi.fn(async () => Response.json([sampleItem])); const client = new ApiClient('https://example.test/api/', transport); const s = signal();
    expect(await client.request('items', { signal: s }, decodeItems)).toEqual([sampleItem]);
    const [url, init] = transport.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.href).toBe('https://example.test/api/items'); expect(init.signal).toBe(s); expect(init.credentials).toBe('omit'); expect(init.redirect).toBe('error');
  });
  it.each(['../escape', '/absolute', 'https://evil.test/', 'items?secret=x', 'items/%2e%2e', 'items/%2f'])('refuses escaped path %s before transport', async path => {
    const transport = vi.fn(); const client = new ApiClient('https://example.test/api/', transport);
    await expect(client.request(path, { signal: signal() }, decodeItems)).rejects.toMatchObject({ kind: 'invalid-request' }); expect(transport).not.toHaveBeenCalled();
  });
  it.each(['file:///tmp/', 'https://user:pass@example.test/', 'https://example.test/?x=1'])('refuses invalid API base %s', base => {
    expect(() => new ApiClient(base)).toThrow(ApiError);
  });
  it('classifies server and transport failures without exposing server bodies', async () => {
    const fail = new ApiClient('https://example.test/', async () => Response.json({ detail: 'server-private-detail' }, { status: 503 }));
    await expect(fail.request('items', { signal: signal() }, decodeItems)).rejects.toMatchObject({ kind: 'http', status: 503, message: 'API request failed (503).' });
    const offline = new ApiClient('https://example.test/', async () => { throw new TypeError('offline'); });
    await expect(offline.request('items', { signal: signal() }, decodeItems)).rejects.toMatchObject({ kind: 'network' });
  });
  it.each([{}, [{ ...sampleItem, completed: 'false' }], [sampleItem, sampleItem], [{ ...sampleItem, extra: true }]])('refuses malformed item payloads', async value => {
    const client = new ApiClient('https://example.test/', async () => Response.json(value));
    await expect(client.request('items', { signal: signal() }, decodeItems)).rejects.toMatchObject({ kind: 'invalid-response' });
  });
  it('bounds complete response bodies', async () => {
    const client = new ApiClient('https://example.test/', async () => new Response('x'.repeat(1024 * 1024 + 1), { headers: { 'content-type': 'application/json' } }));
    await expect(client.request('items', { signal: signal() }, decodeItems)).rejects.toMatchObject({ kind: 'invalid-response' });
  });
  it('refuses already-cancelled requests without transport', async () => {
    const transport = vi.fn(); const controller = new AbortController(); controller.abort();
    await expect(new ApiClient('https://example.test/', transport).request('items', { signal: controller.signal }, decodeItems)).rejects.toMatchObject({ kind: 'cancelled' }); expect(transport).not.toHaveBeenCalled();
  });
  it('maps cancellation during transport and accepts exact204 deletion', async () => {
    const controller = new AbortController(); const client = new ApiClient('https://example.test/', async () => { controller.abort(); throw new DOMException('cancel', 'AbortError'); });
    await expect(client.request('items', { signal: controller.signal }, decodeItems)).rejects.toMatchObject({ kind: 'cancelled' });
    const empty = new ApiClient('https://example.test/', async () => new Response(null, { status: 204 }));
    await expect(empty.request('items/1', { method: 'DELETE', signal: signal() }, value => { expect(value).toBe(null); })).resolves.toBeUndefined();
  });
});

describe('response and mutation identity domain', () => {
  it.each(['a/b', 'a\\b', '.', '..', 'a.b', '%2F', 'a?b', 'a#b', 'a b', '漢字', '', 'x'.repeat(129)])('refuses unaddressable unknown ID %s before presenting CRUD data', async id => {
    const transport = vi.fn(async () => Response.json([{ id, title: 'Example', completed: false }]));
    const api = createItemsAPI(new ApiClient('https://example.test/api/', transport));
    await expect(api.list(signal())).rejects.toMatchObject({ kind: 'invalid-response' });
    expect(transport).toHaveBeenCalledOnce(); transport.mockClear();
    await expect(Promise.resolve().then(() => api.update(id, { title: 'Example', completed: true }, signal()))).rejects.toMatchObject({ kind: 'invalid-request' });
    await expect(api.remove(id, signal())).rejects.toMatchObject({ kind: 'invalid-request' }); expect(transport).not.toHaveBeenCalled();
  });
  it.each(['item-1', 'Order_7', 'A'.repeat(128)])('addresses decoded ID %s with actual update/delete verbs', async id => {
    const item = { id, title: 'Example', completed: false };
    const transport = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => init?.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json(init?.method === 'PUT' ? { ...item, completed: true } : [item]));
    const api = createItemsAPI(new ApiClient('https://example.test/api/', transport));
    const items = await api.list(signal()); expect(items).toEqual([item]);
    expect(await api.update(items[0]!.id, { title: 'Example', completed: true }, signal())).toEqual({ ...item, completed: true });
    await api.remove(items[0]!.id, signal());
    expect(transport.mock.calls.map(([url, init]) => [String(url), init?.method])).toEqual([['https://example.test/api/items', 'GET'], ['https://example.test/api/items/' + id, 'PUT'], ['https://example.test/api/items/' + id, 'DELETE']]);
  });
});

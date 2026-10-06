import type { ApiClient } from '../../data/api-client';
import { ApiError } from '../../data/api-error';
import { decodeItem, decodeItems, titleError, itemIdentity } from './model';
import type { Item, ItemDraft } from './model';
export interface ItemsAPI {
  list(signal: AbortSignal): Promise<Item[]>;
  create(draft: ItemDraft, signal: AbortSignal): Promise<Item>;
  update(id: string, draft: ItemDraft, signal: AbortSignal): Promise<Item>;
  remove(id: string, signal: AbortSignal): Promise<void>;
}
function draftBody(draft: ItemDraft): ItemDraft {
  if (titleError(draft.title) || typeof draft.completed !== 'boolean') throw new ApiError('invalid-request', 'Enter a valid item title and completion value.');
  return { title: draft.title.trim(), completed: draft.completed };
}
function itemPath(id: string): string {
  try { return 'items/' + encodeURIComponent(itemIdentity(id)); }
  catch { throw new ApiError('invalid-request', 'Invalid item identity.'); }
}
export function createItemsAPI(client: ApiClient): ItemsAPI {
  return {
    list: signal => client.request('items', { signal }, decodeItems),
    create: (draft, signal) => client.request('items', { method: 'POST', signal, body: draftBody(draft) }, decodeItem),
    update: (id, draft, signal) => client.request(itemPath(id), { method: 'PUT', signal, body: draftBody(draft) }, decodeItem),
    remove: async (id, signal) => client.request(itemPath(id), { method: 'DELETE', signal }, value => { if (value !== null) throw new Error('Expected no content.'); }),
  };
}

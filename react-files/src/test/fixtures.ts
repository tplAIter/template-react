import { vi } from 'vitest';
import type { Item, ItemDraft } from '../features/items/model';
import type { ItemsAPI } from '../features/items/api';
export const sampleItem: Item = { id: 'item-1', title: 'Read the guide', completed: false };
export function testItemsAPI(): ItemsAPI {
  return { list: vi.fn(async () => [{ ...sampleItem }]), create: vi.fn(async (draft: ItemDraft) => ({ id: 'item-2', ...draft })),
    update: vi.fn(async (id: string, draft: ItemDraft) => ({ id, ...draft })), remove: vi.fn(async () => undefined) };
}
export function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

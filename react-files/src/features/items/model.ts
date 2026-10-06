import { array, boolean, record, text } from '../../data/schema';
export interface Item { id: string; title: string; completed: boolean }
export interface ItemDraft { title: string; completed: boolean }
export function itemIdentity(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new Error('Expected an addressable item identity (1–128 ASCII letters, digits, underscore or hyphen).');
  return value;
}
export function decodeItem(value: unknown): Item {
  const v = record(value);
  if (Object.keys(v).sort().join(',') !== 'completed,id,title') throw new Error('Unexpected item fields.');
  return { id: itemIdentity(v.id), title: text(v.title), completed: boolean(v.completed) };
}
export function decodeItems(value: unknown): Item[] {
  const items = array(value, decodeItem);
  if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('Duplicate item identities.');
  return items;
}
function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}
export function titleError(title: string): string | undefined {
  if (!title.trim()) return 'Enter a title.';
  if (title.trim().length > 120 || hasControlCharacter(title)) return 'Use at most 120 printable characters.';
}

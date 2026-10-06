export type Decoder<T> = (value: unknown) => T;
export function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Expected an object.');
  return value as Record<string, unknown>;
}
function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}
export function text(value: unknown, maxLength = 120): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength || hasControlCharacter(value)) throw new Error('Expected nonempty bounded text.');
  return value;
}
export function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Expected a boolean.');
  return value;
}
export function array<T>(value: unknown, decode: Decoder<T>, maxLength = 1000): T[] {
  if (!Array.isArray(value) || value.length > maxLength) throw new Error('Expected a bounded array.');
  return value.map(decode);
}

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
Object.defineProperty(window, 'scrollTo', { value: () => undefined, configurable: true });

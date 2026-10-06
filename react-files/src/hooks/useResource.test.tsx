import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useResource } from './useResource';
import { deferred } from '../test/fixtures';
describe('resource lifetime', () => {
  it('aborts the previous load and never delivers a late stale value', async () => {
    const first = deferred<string>(); const second = deferred<string>(); let previous!: AbortSignal;
    const a = vi.fn((s: AbortSignal) => { previous = s; return first.promise; }); const b = vi.fn(() => second.promise);
    const hook = renderHook(({ load }) => useResource(load), { initialProps: { load: a as (signal: AbortSignal) => Promise<string> } });
    await waitFor(() => expect(a).toHaveBeenCalledOnce()); hook.rerender({ load: b });
    await waitFor(() => expect(b).toHaveBeenCalledOnce()); expect(previous.aborted).toBe(true);
    await act(async () => second.resolve('new')); await waitFor(() => expect(hook.result.current.state).toEqual({ status: 'ready', data: 'new' }));
    await act(async () => first.resolve('old')); expect(hook.result.current.state).toEqual({ status: 'ready', data: 'new' });
  });
  it('exposes a failure, retries and aborts on unmount', async () => {
    let captured!: AbortSignal; let attempts = 0;
    const load = vi.fn(async (s: AbortSignal) => { captured = s; if (++attempts === 1) throw new Error('failed'); return 42; });
    const hook = renderHook(() => useResource(load)); await waitFor(() => expect(hook.result.current.state.status).toBe('error'));
    act(() => hook.result.current.reload()); await waitFor(() => expect(hook.result.current.state).toEqual({ status: 'ready', data: 42 }));
    hook.unmount(); expect(captured.aborted).toBe(true);
  });
});

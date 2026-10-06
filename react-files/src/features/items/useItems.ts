import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, isCancelled } from '../../data/api-error';
import { useResource } from '../../hooks/useResource';
import type { ItemsAPI } from './api';
import type { ItemDraft } from './model';
export function useItems(api: ItemsAPI) {
  const load = useCallback((signal: AbortSignal) => api.list(signal), [api]);
  const resource = useResource(load);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState<unknown>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  async function mutate(operation: (signal: AbortSignal) => Promise<unknown>): Promise<void> {
    if (controller.current) throw new ApiError('invalid-request', 'Wait for the current item change.');
    const active = new AbortController(); controller.current = active;
    setPending(true); setMutationError(null);
    try {
      await operation(active.signal);
      if (mounted.current && !active.signal.aborted) resource.reload();
    } catch (error) {
      if (mounted.current && !isCancelled(error)) setMutationError(error);
      throw error;
    } finally {
      if (controller.current === active) controller.current = null;
      if (mounted.current) setPending(false);
    }
  }
  return { ...resource, pending, mutationError,
    create: (draft: ItemDraft) => mutate(signal => api.create(draft, signal)),
    update: (id: string, draft: ItemDraft) => mutate(signal => api.update(id, draft, signal)),
    remove: (id: string) => mutate(signal => api.remove(id, signal)),
  };
}

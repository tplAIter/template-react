import { useCallback, useEffect, useState } from 'react';
import { isCancelled } from '../data/api-error';
export type Resource<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: unknown };
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<Resource<T>>({ status: 'loading' });
  const [epoch, setEpoch] = useState(0);
  const reload = useCallback(() => setEpoch(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController(); let current = true;
    setState({ status: 'loading' });
    Promise.resolve().then(() => load(controller.signal)).then(
      data => { if (current && !controller.signal.aborted) setState({ status: 'ready', data }); },
      error => { if (current && !controller.signal.aborted && !isCancelled(error)) setState({ status: 'error', error }); },
    );
    return () => { current = false; controller.abort(); };
  }, [load, epoch]);
  return { state, reload };
}

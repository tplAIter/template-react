import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { errorMessage, isCancelled } from '../../data/api-error';
import { titleError } from './model';
import type { ItemDraft } from './model';
export function ItemForm({ onSubmit, pending }: { onSubmit: (draft: ItemDraft) => Promise<void>; pending: boolean }) {
  const [title, setTitle] = useState(''); const [error, setError] = useState<string>();
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) summary.current?.focus(); }, [error]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const invalid = titleError(title); if (invalid) { setError(invalid); return; }
    setError(undefined);
    try { await onSubmit({ title: title.trim(), completed: false }); setTitle(''); }
    catch (failure) { if (!isCancelled(failure)) setError(errorMessage(failure)); }
  }
  return <form onSubmit={event => { void submit(event); }} noValidate aria-label="Create item" aria-busy={pending}>
    {error && <div role="alert" tabIndex={-1} ref={summary} className="error-summary">{error}</div>}
    <Field label="Item title" value={title} onChange={event => setTitle(event.target.value)} disabled={pending} required maxLength={120} error={error} />
    <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Add item'}</Button>
  </form>;
}

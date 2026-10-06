import { Button } from '../../components/Button';
import { ErrorPanel } from '../../components/ErrorPanel';
import { Loading } from '../../components/Loading';
import { errorMessage } from '../../data/api-error';
import type { ItemsAPI } from './api';
import { ItemForm } from './ItemForm';
import { useItems } from './useItems';
export function ItemsPage({ api }: { api: ItemsAPI }) {
  const items = useItems(api);
  return <section aria-labelledby="items-heading"><h1 id="items-heading">Items</h1>
    <p>This view uses your configured API. The template does not provide a persistence service.</p>
    <ItemForm onSubmit={items.create} pending={items.pending} />
    {items.mutationError !== null && <ErrorPanel message={errorMessage(items.mutationError)} />}
    {items.state.status === 'loading' && <Loading label="Loading items…" />}
    {items.state.status === 'error' && <ErrorPanel message={errorMessage(items.state.error)} onRetry={items.reload} />}
    {items.state.status === 'ready' && (items.state.data.length === 0 ? <p>No items yet.</p> : <ul>{items.state.data.map(item => <li key={item.id}>
      <label><input type="checkbox" checked={item.completed} disabled={items.pending} onChange={event => { void items.update(item.id, { title: item.title, completed: event.target.checked }).catch(() => undefined); }} />{item.title}</label>
      <Button disabled={items.pending} aria-label={`Delete ${item.title}`} onClick={() => { void items.remove(item.id).catch(() => undefined); }}>Delete</Button>
    </li>)}</ul>)}
  </section>;
}

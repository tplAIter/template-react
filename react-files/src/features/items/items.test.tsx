import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { ApiClient } from '../../data/api-client';
import { ApiError } from '../../data/api-error';
import { testItemsAPI, sampleItem } from '../../test/fixtures';
import { createItemsAPI } from './api';
import { ItemForm } from './ItemForm';
import { ItemsPage } from './ItemsPage';
it('validates and focuses a labelled form error before any API effect', async () => {
  const submit = vi.fn(); render(<ItemForm pending={false} onSubmit={submit} />);
  fireEvent.click(screen.getByRole('button', { name: 'Add item' })); await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Enter a title.'));
  expect(document.activeElement).toBe(screen.getByRole('alert')); expect(submit).not.toHaveBeenCalled();
});
it('keeps entered data on failed submission and exposes pending', async () => {
  const submit = vi.fn(async () => { throw new ApiError('network', 'Try later.'); });
  const view = render(<ItemForm pending={false} onSubmit={submit} />); const input = screen.getByRole('textbox', { name: 'Item title' });
  fireEvent.change(input, { target: { value: 'Keep this' } }); fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Try later.')); expect((input as HTMLInputElement).value).toBe('Keep this');
  view.rerender(<ItemForm pending={true} onSubmit={submit} />); expect((screen.getByRole('button', { name: 'Saving…' }) as HTMLButtonElement).disabled).toBe(true);
});
it('supports list, create, update and deletion using one injected API', async () => {
  const api = testItemsAPI(); render(<ItemsPage api={api} />);
  await screen.findByRole('checkbox', { name: sampleItem.title });
  fireEvent.change(screen.getByRole('textbox', { name: 'Item title' }), { target: { value: 'New item' } }); fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
  await waitFor(() => expect(api.create).toHaveBeenCalledWith({ title: 'New item', completed: false }, expect.any(AbortSignal)));
  await waitFor(() => expect((screen.getByRole('checkbox', { name: sampleItem.title }) as HTMLInputElement).disabled).toBe(false));
  fireEvent.click(screen.getByRole('checkbox', { name: sampleItem.title })); await waitFor(() => expect(api.update).toHaveBeenCalledWith(sampleItem.id, { title: sampleItem.title, completed: true }, expect.any(AbortSignal)));
  await waitFor(() => expect((screen.getByRole('button', { name: `Delete ${sampleItem.title}` }) as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(screen.getByRole('button', { name: `Delete ${sampleItem.title}` })); await waitFor(() => expect(api.remove).toHaveBeenCalledWith(sampleItem.id, expect.any(AbortSignal)));
});
it('shows loading/failure and retry instead of silent empty success', async () => {
  const api = testItemsAPI(); api.list = vi.fn(async () => { throw new ApiError('network', 'No backend.'); }); render(<ItemsPage api={api} />);
  expect(screen.getByRole('status').textContent).toContain('Loading'); await screen.findByText('No backend.');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' })); await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
});
it('uses concrete CRUD verbs/bodies and refuses malformed drafts before transport', async () => {
  const transport = vi.fn(async (_input: RequestInfo | URL, options?: RequestInit) => options?.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json(sampleItem));
  const api = createItemsAPI(new ApiClient('https://example.test/api/', transport)); const signal = new AbortController().signal;
  await api.create({ title: ' Read ', completed: false }, signal); await api.update('item-1', { title: 'Read', completed: true }, signal); await api.remove('item-1', signal);
  expect(transport.mock.calls.map(call => call[1]?.method)).toEqual(['POST', 'PUT', 'DELETE']);
  expect(transport.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ title: 'Read', completed: false }));
  const count = transport.mock.calls.length; expect(() => api.create({ title: '', completed: false }, signal)).toThrow(ApiError); expect(transport.mock.calls.length).toBe(count);
});

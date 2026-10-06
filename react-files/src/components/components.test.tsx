import { fireEvent, render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { Button } from './Button';
import { Field } from './Field';
import { Loading } from './Loading';
import { ErrorPanel } from './ErrorPanel';
it('links labels/errors and exposes loading and retry controls', () => {
  const retry = vi.fn(); render(<><Field label="Title" error="Enter a title." /><Loading /><ErrorPanel message="Unavailable" onRetry={retry} /><Button>Action</Button></>);
  const input = screen.getByRole('textbox', { name: 'Title' }); expect(input.getAttribute('aria-invalid')).toBe('true');
  const described = input.getAttribute('aria-describedby'); expect(document.getElementById(described ?? '')?.textContent).toBe('Enter a title.');
  expect(screen.getByRole('status').textContent).toContain('Loading'); fireEvent.click(screen.getByRole('button', { name: 'Try again' })); expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Action' }).getAttribute('type')).toBe('button');
});

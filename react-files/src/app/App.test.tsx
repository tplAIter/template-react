import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import { createRoutes } from './routes';
import { testItemsAPI } from '../test/fixtures';
it('navigates home to actual items and preserves the skip link', async () => {
  const router = createMemoryRouter(createRoutes(testItemsAPI())); render(<RouterProvider router={router} />);
  expect(screen.getByRole('heading', { name: 'Welcome' })).toBeTruthy(); expect(screen.getByText('Skip to content').getAttribute('href')).toBe('#main-content');
  fireEvent.click(screen.getByRole('link', { name: 'Manage items' })); await screen.findByRole('heading', { name: 'Items' });
  expect(router.state.location.pathname).toBe('/items'); expect(screen.getByRole('link', { name: 'Items' }).getAttribute('aria-current')).toBe('page');
});
it('renders a not-found route with a real return path', () => {
  const router = createMemoryRouter(createRoutes(testItemsAPI()), { initialEntries: ['/unknown'] }); render(<RouterProvider router={router} />);
  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy(); expect(screen.getByRole('link', { name: 'Return home' }).getAttribute('href')).toBe('/');
});

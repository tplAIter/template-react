import type { RouteObject } from 'react-router';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ErrorPanel } from '../components/ErrorPanel';
import { ItemsPage } from '../features/items/ItemsPage';
import type { ItemsAPI } from '../features/items/api';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { App } from './App';
export const generatedRoutes: RouteObject[] = [
  // CODEGEN:ROUTES
];
function RouteError() {
  const error = useRouteError();
  return <main><h1>Unable to display this page</h1><ErrorPanel message={isRouteErrorResponse(error) ? `Route unavailable (${error.status}).` : 'An unexpected page error occurred.'} /><a href="/">Return home</a></main>;
}
export function createRoutes(api: ItemsAPI): RouteObject[] {
  return [{ path: '/', element: <App />, errorElement: <RouteError />, children: [
    { index: true, element: <HomePage /> }, { path: 'items', element: <ItemsPage api={api} /> },
    ...generatedRoutes, { path: '*', element: <NotFoundPage /> },
  ] }];
}

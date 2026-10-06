import { createBrowserRouter } from 'react-router';
import { createRoutes } from './routes';
import type { ItemsAPI } from '../features/items/api';
export function createAppRouter(api: ItemsAPI) { return createBrowserRouter(createRoutes(api)); }

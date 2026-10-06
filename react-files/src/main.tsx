import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { ApiClient } from './data/api-client';
import { createItemsAPI } from './features/items/api';
import { createAppRouter } from './app/router';
import { ErrorPanel } from './components/ErrorPanel';
import { errorMessage } from './data/api-error';
import './styles.css';
const target = document.getElementById('root');
if (!target) throw new Error('Missing application root.');
const app = createRoot(target);
try {
const base = new URL(import.meta.env.VITE_API_BASE_URL || '/api/', window.location.origin).href;
const router = createAppRouter(createItemsAPI(new ApiClient(base)));
app.render(<StrictMode><RouterProvider router={router} /></StrictMode>);
} catch (error) {
  app.render(<main><h1>Configuration error</h1><ErrorPanel message={errorMessage(error)} /></main>);
}

import { NavLink, Outlet, ScrollRestoration } from 'react-router';
export function App() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><header><nav aria-label="Main navigation"><NavLink to="/" end>Home</NavLink><NavLink to="/items">Items</NavLink></nav></header><main id="main-content" tabIndex={-1}><Outlet /></main><ScrollRestoration /></>;
}

import type { RouteObject } from 'react-router';
export function withNotFound(routes: RouteObject[], fallback: RouteObject): RouteObject[] {
  if (fallback.path !== '*') throw new Error('The fallback must own the wildcard path.');
  if (routes.some(route => route.path === '*')) throw new Error('Duplicate fallback route.');
  return [...routes, fallback];
}

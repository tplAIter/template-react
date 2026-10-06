import type { ReactNode } from 'react';
export function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section aria-label={title}><h2>{title}</h2>{children}</section>;
}

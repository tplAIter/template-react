import { Button } from './Button';
export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <section role="alert" aria-label="Request error"><p>{message}</p>{onRetry && <Button onClick={onRetry}>Try again</Button>}</section>;
}

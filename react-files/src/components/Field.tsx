import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
export function Field({ label, error, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generated = useId(); const inputID = id ?? generated; const errorID = inputID + '-error';
  return <div className="field"><label htmlFor={inputID}>{label}</label><input {...props} id={inputID} aria-invalid={error ? true : undefined} aria-describedby={error ? errorID : props['aria-describedby']} />{error && <p id={errorID} className="field-error">{error}</p>}</div>;
}

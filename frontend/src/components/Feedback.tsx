import type { ReactNode } from 'react';

export function Loading({ text = 'Memuat data...' }: { text?: string }) {
  return (
    <div className="state" role="status">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function EmptyState({
  icon = '🍽️',
  title,
  description,
  children,
}: {
  icon?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="state">
      <div className="state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

export function ErrorState({
  title = 'Terjadi masalah',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon">⚠️</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

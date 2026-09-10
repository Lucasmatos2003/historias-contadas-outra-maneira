import React from 'react';

export function LoadingState({ label = 'Carregando...' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

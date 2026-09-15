import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocurrió un error',
  message,
  onRetry,
}) => {
  return (
    <div className="text-center py-10 px-4 rounded-2xl bg-rose-50 border border-rose-200 max-w-md mx-auto my-6">
      <div className="mx-auto w-10 h-10 text-rose-500 flex items-center justify-center mb-2">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-bold text-rose-900 mb-1">{title}</h3>
      <p className="text-xs text-rose-700 mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
};

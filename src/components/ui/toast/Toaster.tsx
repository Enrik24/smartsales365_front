'use client';

import { Toaster as SonnerToaster } from 'sonner';

// Import the toast styles
//import "sonner/styles";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          fontSize: '14px',
          lineHeight: '1.5',
        },
        duration: 3000,
      }}
    />
  );
}

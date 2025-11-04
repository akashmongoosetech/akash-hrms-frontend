import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        },
      }}
    />
  );
}
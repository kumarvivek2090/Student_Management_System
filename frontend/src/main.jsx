import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.response?.status && [401, 403, 404].includes(error.response.status)) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30000, // 30 seconds default
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#292C24',
                border: '1px solid #E6E4D9',
                boxShadow: '0 4px 12px 0 rgba(41, 44, 36, 0.08)',
                fontSize: '12px',
                fontWeight: 500,
                padding: '10px 14px',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#69744A',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

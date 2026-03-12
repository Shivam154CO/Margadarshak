import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import App from './App.tsx'
import './index.css'

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

// Attach API key to all ML API requests automatically
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes(ML_API_URL)) {
    config.headers['x-api-key'] = 'SMARTCF_SECRET_KEY_2026';
  }
  return config;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,       // 1 hour cache
      gcTime: 1000 * 60 * 60 * 2,      // 2 hours garbage collect
      retry: 1,                          // Retry once on failure
      refetchOnWindowFocus: false,       // Don't refetch on tab focus
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

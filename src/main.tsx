import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import App from './App.tsx'
import './index.css'

axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('5001')) {
    config.headers['x-api-key'] = 'SMARTCF_SECRET_KEY_2026';
  }
  return config;
});

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.includes('5001')) {
    config = config || {};
    config.headers = {
      ...config.headers,
      'x-api-key': 'SMARTCF_SECRET_KEY_2026'
    };
  }
  return originalFetch(resource, config);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider } from './auth';
import { StoreProvider } from './store';
import App from './App';
import './styles.css';

const DAY = 24 * 60 * 60 * 1000;
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, gcTime: DAY, retry: 1, refetchOnWindowFocus: false } },
});
// Persist the query cache so a reload shows data instantly instead of waiting on the network.
const persister = createSyncStoragePersister({ storage: window.localStorage, key: 'postbox-query-cache' });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: DAY }}>
      <HashRouter>
        <AuthProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </AuthProvider>
      </HashRouter>
    </PersistQueryClientProvider>
  </StrictMode>
);

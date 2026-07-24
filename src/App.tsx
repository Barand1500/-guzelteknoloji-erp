import { AuthProvider } from '@/baglamlar/AuthContext';
import { ModulKatalogProvider } from '@/baglamlar/ModulKatalogContext';
import { SagTikPanelProvider } from '@/baglamlar/SagTikPanelContext';
import { RouterProvider } from 'react-router-dom';
import { siteRouter } from '@/router';

export function App() {
  return (
    <AuthProvider>
      <ModulKatalogProvider>
        <SagTikPanelProvider>
          <RouterProvider router={siteRouter} />
        </SagTikPanelProvider>
      </ModulKatalogProvider>
    </AuthProvider>
  );
}

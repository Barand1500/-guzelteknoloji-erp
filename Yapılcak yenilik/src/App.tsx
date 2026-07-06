import { AuthProvider } from '@/baglamlar/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { siteRouter } from '@/router';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={siteRouter} />
    </AuthProvider>
  );
}

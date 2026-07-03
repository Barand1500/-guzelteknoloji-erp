import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/admin/kabuk/AdminLayout';

export const siteRouter = createBrowserRouter([
  { path: '/', element: <Navigate to="/gt-admin/kullanicilar" replace /> },
  { path: '/gt-admin', element: <Navigate to="/gt-admin/kullanicilar" replace /> },
  { path: '/gt-admin/giris', element: <Navigate to="/gt-admin/kullanicilar" replace /> },
  { path: '/gt-admin/*', element: <AdminLayout /> },
  { path: '*', element: <Navigate to="/gt-admin/kullanicilar" replace /> },
]);

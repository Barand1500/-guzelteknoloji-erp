import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/admin/kabuk/AdminLayout';

export const siteRouter = createBrowserRouter([
  { path: '/', element: <Navigate to="/gt-admin" replace /> },
  { path: '/gt-admin/*', element: <AdminLayout /> },
  { path: '*', element: <Navigate to="/gt-admin" replace /> },
]);

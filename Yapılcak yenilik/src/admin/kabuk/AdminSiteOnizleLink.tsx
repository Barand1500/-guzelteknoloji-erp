import { Link } from 'react-router-dom';
import { BACKEND_YOK } from '@/yapilandirma/uygulama';

export function AdminSiteOnizleLink() {
  if (BACKEND_YOK) return null;

  return (
    <Link
      to="/"
      target="_blank"
      className="text-xs text-blue-400 hover:underline"
      data-ap-kesif="site-onizle"
    >
      Siteyi Önizle →
    </Link>
  );
}

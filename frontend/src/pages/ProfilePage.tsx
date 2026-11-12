import { useEffect, useState } from 'react';
import { getMe } from '../api/auth';
import { parseApiError } from '../api/errors';
import type { Role, User } from '../types';
import { ErrorState, Loading } from '../components/Feedback';
import { roleLabel } from '../utils/permissions';

const PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'Melihat daftar & detail warung',
    'Menambah warung',
    'Mengubah semua warung',
    'Menghapus warung',
  ],
  owner: [
    'Melihat daftar & detail warung',
    'Menambah warung',
    'Mengubah warung miliknya sendiri',
    'Tidak dapat menghapus warung (khusus admin)',
  ],
  customer: ['Melihat daftar & detail warung', 'Tidak dapat mengelola warung'],
};

export default function ProfilePage() {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Data diambil langsung dari GET /api/auth/me
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getMe()
      .then((u) => active && setMe(u))
      .catch((e) => active && setError(parseApiError(e).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (loading) return <Loading text="Memuat profil..." />;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} /></div>;
  if (!me) return null;

  return (
    <div className="container page narrow">
      <div className="card">
        <h1>Profil Saya</h1>
        <dl className="info">
          <dt>ID</dt>
          <dd>#{me.id}</dd>
          <dt>Nama</dt>
          <dd>{me.name ?? '-'}</dd>
          <dt>Email</dt>
          <dd>{me.email}</dd>
          <dt>Role</dt>
          <dd>
            <span className={`badge badge-${me.role}`}>{roleLabel[me.role]}</span>
          </dd>
        </dl>
        <h3>Hak akses kamu</h3>
        <ul className="perm-list">
          {PERMISSIONS[me.role].map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

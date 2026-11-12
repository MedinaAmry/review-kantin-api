import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Feedback';

export default function ForbiddenPage() {
  return (
    <div className="container page">
      <EmptyState icon="⛔" title="403 — Akses ditolak" description="Role akun kamu tidak memiliki izin untuk membuka halaman ini.">
        <Link to="/stalls" className="btn">
          ← Kembali ke daftar warung
        </Link>
      </EmptyState>
    </div>
  );
}

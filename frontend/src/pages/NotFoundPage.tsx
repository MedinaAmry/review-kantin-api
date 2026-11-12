import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Feedback';

export default function NotFoundPage() {
  return (
    <div className="container page">
      <EmptyState icon="🧭" title="404 — Halaman tidak ditemukan" description="Alamat yang kamu buka tidak tersedia.">
        <Link to="/stalls" className="btn">
          ← Ke daftar warung
        </Link>
      </EmptyState>
    </div>
  );
}

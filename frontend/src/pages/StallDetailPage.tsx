import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { deleteStall, getStall } from '../api/stalls';
import { parseApiError, type ApiErrorInfo } from '../api/errors';
import type { Stall } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { canDeleteStall, canEditStall } from '../utils/permissions';
import { EmptyState, ErrorState, Loading } from '../components/Feedback';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatRating } from '../components/StallCard';

export default function StallDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Ambil data dari GET /api/stalls/:id
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    getStall(id ?? '', ctrl.signal)
      .then(setStall)
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setStall(null);
        setError(parseApiError(e));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [id, reloadKey]);

  const handleDelete = async () => {
    if (!stall) return;
    setDeleting(true);
    try {
      await deleteStall(stall.id); // DELETE /api/stalls/:id
      toast.success('Warung berhasil dihapus.');
      navigate('/stalls', { replace: true });
    } catch (e) {
      const info = parseApiError(e);
      toast.error(info.message); // mis. 403 (bukan admin) atau 409 (masih punya menu/review)
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading text="Memuat detail warung..." />;

  if (error) {
    return (
      <div className="container page">
        {error.status === 404 ? (
          <EmptyState icon="🕵️" title="Warung tidak ditemukan" description={error.message}>
            <Link to="/stalls" className="btn">
              ← Kembali ke daftar
            </Link>
          </EmptyState>
        ) : (
          <ErrorState title="Gagal memuat detail warung" message={error.message} onRetry={() => setReloadKey((k) => k + 1)} />
        )}
      </div>
    );
  }
  if (!stall) return null;

  return (
    <div className="container page narrow">
      <Link to="/stalls" className="back-link">
        ← Kembali ke daftar
      </Link>

      <div className="card detail">
        <div className="detail-head">
          <div>
            <h1>{stall.name}</h1>
            <div className="detail-meta">
              {stall.category && <span className="badge">{stall.category}</span>}
              <span className="rating">★ {formatRating(stall.avgRating)}</span>
              <span className="muted">({stall.reviewCount ?? 0} review)</span>
            </div>
          </div>
          <div className="detail-actions">
            {canEditStall(user, stall) && (
              <Link to={`/stalls/${stall.id}/edit`} className="btn">
                ✏️ Ubah
              </Link>
            )}
            {canDeleteStall(user) && (
              <button className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
                🗑️ Hapus
              </button>
            )}
          </div>
        </div>

        <dl className="info">
          <dt>Lokasi</dt>
          <dd>{stall.location || '-'}</dd>
          <dt>Deskripsi</dt>
          <dd>{stall.description || 'Belum ada deskripsi.'}</dd>
          <dt>ID Warung</dt>
          <dd>#{stall.id}</dd>
          <dt>Dibuat</dt>
          <dd>{stall.createdAt ? new Date(stall.createdAt).toLocaleString('id-ID') : '-'}</dd>
        </dl>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus warung?"
        message={`Warung "${stall.name}" akan dihapus permanen dari database. Tindakan ini tidak bisa dibatalkan.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

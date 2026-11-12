import { Link } from 'react-router-dom';
import type { Stall } from '../types';

export const formatRating = (v: Stall['avgRating']) => Number(v ?? 0).toFixed(1);

export default function StallCard({ stall }: { stall: Stall }) {
  return (
    <Link to={`/stalls/${stall.id}`} className="card stall-card">
      <div className="stall-card-head">
        <h3>{stall.name}</h3>
        {stall.category && <span className="badge">{stall.category}</span>}
      </div>
      <p className="muted">📍 {stall.location || 'Lokasi belum diisi'}</p>
      <p className="stall-desc">{stall.description || 'Belum ada deskripsi.'}</p>
      <div className="stall-card-foot">
        <span className="rating">★ {formatRating(stall.avgRating)}</span>
        <span className="muted">({stall.reviewCount ?? 0} review)</span>
      </div>
    </Link>
  );
}

import type { PageMeta } from '../types';

export default function Pagination({ meta, onChange }: { meta: PageMeta; onChange: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>
        ← Sebelumnya
      </button>
      <span className="muted">
        Halaman {meta.page} dari {meta.totalPages}
      </span>
      <button className="btn" disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)}>
        Berikutnya →
      </button>
    </div>
  );
}

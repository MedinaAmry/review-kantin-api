import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getStalls } from '../api/stalls';
import { parseApiError } from '../api/errors';
import type { PageMeta, SortBy, Stall } from '../types';
import { useAuth } from '../context/AuthContext';
import { canCreateStall } from '../utils/permissions';
import { EmptyState, ErrorState, Loading } from '../components/Feedback';
import StallCard from '../components/StallCard';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 9;
const SORT_OPTIONS = [
  { value: 'id:asc', label: 'Terlama' },
  { value: 'createdAt:desc', label: 'Terbaru' },
  { value: 'name:asc', label: 'Nama A–Z' },
  { value: 'avgRating:desc', label: 'Rating tertinggi' },
];

export default function StallListPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  // Sumber kebenaran filter = URL (bisa di-share & tombol back berfungsi)
  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const location = params.get('location') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const rawSort = params.get('sort') ?? 'id:asc';
  const sort = SORT_OPTIONS.some((o) => o.value === rawSort) ? rawSort : 'id:asc';

  const [form, setForm] = useState({ search, category, location });
  const [items, setItems] = useState<Stall[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Samakan input dengan URL (mis. setelah tombol "Reset filter")
  useEffect(() => {
    setForm({ search, category, location });
  }, [search, category, location]);

  // Debounce: tulis ke URL 400ms setelah user berhenti mengetik
  useEffect(() => {
    if (form.search === search && form.category === category && form.location === location) return;
    const t = setTimeout(() => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        (['search', 'category', 'location'] as const).forEach((k) => {
          const v = form[k].trim();
          if (v) next.set(k, v);
          else next.delete(k);
        });
        next.delete('page');
        return next;
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.search, form.category, form.location]);

  // Ambil data dari GET /api/stalls
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    const [sortBy, order] = sort.split(':') as [SortBy, 'asc' | 'desc'];
    getStalls(
      { search, category, location, page, limit: PAGE_SIZE, sortBy, order },
      ctrl.signal,
    )
      .then((r) => {
        setItems(r.items);
        setMeta(r.meta);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setItems([]);
        setMeta(null);
        setError(parseApiError(e).message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [search, category, location, page, sort, reloadKey]);

  const setParam = (key: string, value: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });

  const filtersActive = !!(search || category || location);
  const resetFilters = () => setParams(new URLSearchParams());

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Daftar Warung</h1>
          <p className="muted">Temukan warung favoritmu di kantin.</p>
        </div>
        {canCreateStall(user) && (
          <Link to="/stalls/new" className="btn btn-primary">
            + Tambah Warung
          </Link>
        )}
      </div>

      <div className="filters card">
        <input
          type="search"
          placeholder="Cari nama warung..."
          value={form.search}
          onChange={(e) => setForm({ ...form, search: e.target.value })}
        />
        <input
          list="category-options"
          placeholder="Kategori (persis)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <datalist id="category-options">
          <option value="Makanan" />
          <option value="Minuman" />
          <option value="Snack" />
        </datalist>
        <input
          placeholder="Lokasi..."
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <select value={sort} onChange={(e) => setParam('sort', e.target.value === 'id:asc' ? '' : e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Urut: {o.label}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button className="btn btn-ghost" onClick={resetFilters}>
            Reset
          </button>
        )}
      </div>

      {loading ? (
        <Loading text="Memuat daftar warung..." />
      ) : error ? (
        <ErrorState title="Gagal memuat warung" message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : items.length === 0 ? (
        filtersActive ? (
          <EmptyState icon="🔎" title="Tidak ada hasil" description="Tidak ada warung yang cocok dengan pencarian/filter kamu.">
            <button className="btn" onClick={resetFilters}>
              Reset filter
            </button>
          </EmptyState>
        ) : (
          <EmptyState title="Belum ada warung" description="Data warung masih kosong.">
            {canCreateStall(user) && (
              <Link to="/stalls/new" className="btn btn-primary">
                Tambah warung pertama
              </Link>
            )}
          </EmptyState>
        )
      ) : (
        <>
          <p className="muted result-count">
            Menampilkan {items.length} dari {meta?.total ?? items.length} warung
          </p>
          <div className="grid">
            {items.map((s) => (
              <StallCard key={s.id} stall={s} />
            ))}
          </div>
          {meta && (
            <Pagination
              meta={meta}
              onChange={(p) => {
                setParam('page', p > 1 ? String(p) : '');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

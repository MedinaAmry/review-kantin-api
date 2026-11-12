import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createStall, getStall, updateStall } from '../api/stalls';
import { parseApiError, type ApiErrorInfo } from '../api/errors';
import type { Stall } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, ErrorState, Loading } from '../components/Feedback';

interface Values {
  name: string;
  category: string;
  location: string;
  description: string;
}
const EMPTY: Values = { name: '', category: '', location: '', description: '' };

// Validasi di sisi klien (mengikuti aturan zod di backend)
function validate(v: Values) {
  const e: Record<string, string> = {};
  const name = v.name.trim();
  if (!name) e.name = 'Nama warung wajib diisi';
  else if (name.length < 3) e.name = 'Nama minimal 3 karakter';
  else if (name.length > 100) e.name = 'Nama maksimal 100 karakter';
  if (v.category.trim().length > 50) e.category = 'Kategori maksimal 50 karakter';
  if (v.location.length > 100) e.location = 'Lokasi maksimal 100 karakter';
  if (v.description.length > 1000) e.description = 'Deskripsi maksimal 1000 karakter';
  return e;
}

export default function StallFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState<Values>(EMPTY);
  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState<ApiErrorInfo | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Mode ubah: isi form dari GET /api/stalls/:id
  useEffect(() => {
    if (mode !== 'edit') return;
    let active = true;
    setLoading(true);
    setLoadError(null);
    getStall(id ?? '')
      .then((s) => {
        if (!active) return;
        setStall(s);
        setValues({
          name: s.name ?? '',
          category: s.category ?? '',
          location: s.location ?? '',
          description: s.description ?? '',
        });
      })
      .catch((e) => active && setLoadError(parseApiError(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [mode, id, reloadKey]);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: '' }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errs = validate(values);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    const trimmed = {
      name: values.name.trim(),
      category: values.category.trim(),
      location: values.location.trim(),
      description: values.description.trim(),
    };

    setSubmitting(true);
    try {
      let saved: Stall;
      if (mode === 'create') {
        // POST /api/stalls — field kosong tidak dikirim
        saved = await createStall({
          name: trimmed.name,
          category: trimmed.category || undefined,
          location: trimmed.location || undefined,
          description: trimmed.description || undefined,
        });
        toast.success('Warung berhasil ditambahkan.');
      } else {
        // PUT /api/stalls/:id — string kosong dikirim agar field bisa dikosongkan
        saved = await updateStall(id ?? '', trimmed);
        toast.success('Perubahan warung berhasil disimpan.');
      }
      navigate(`/stalls/${saved.id}`);
    } catch (err) {
      const info = parseApiError(err);
      setFieldErrors(info.fieldErrors); // error validasi per-field dari backend (400/409)
      setFormError(info.message);
      if (info.status === 403) toast.error(info.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Memuat data warung..." />;
  if (loadError) {
    return (
      <div className="container page">
        {loadError.status === 404 ? (
          <EmptyState icon="🕵️" title="Warung tidak ditemukan" description={loadError.message}>
            <Link to="/stalls" className="btn">
              ← Kembali ke daftar
            </Link>
          </EmptyState>
        ) : (
          <ErrorState message={loadError.message} onRetry={() => setReloadKey((k) => k + 1)} />
        )}
      </div>
    );
  }

  const notOwner = mode === 'edit' && stall && user?.role === 'owner' && stall.ownerId !== user.id;

  return (
    <div className="container page narrow">
      <Link to={mode === 'edit' && id ? `/stalls/${id}` : '/stalls'} className="back-link">
        ← Batal
      </Link>
      <div className="card">
        <h1>{mode === 'create' ? 'Tambah Warung' : 'Ubah Warung'}</h1>

        {notOwner && (
          <div className="alert alert-warn">
            Warung ini bukan milik kamu. Backend akan menolak perubahan (403 Forbidden).
          </div>
        )}
        {formError && <div className="alert alert-error">{formError}</div>}

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Nama warung *</label>
            <input id="name" value={values.name} onChange={set('name')} placeholder="mis. Warung Bu Tini" />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="category">Kategori</label>
            <input id="category" list="cat-opts" value={values.category} onChange={set('category')} placeholder="Makanan / Minuman / Snack" />
            <datalist id="cat-opts">
              <option value="Makanan" />
              <option value="Minuman" />
              <option value="Snack" />
            </datalist>
            {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
          </div>
          <div className="field">
            <label htmlFor="location">Lokasi</label>
            <input id="location" value={values.location} onChange={set('location')} placeholder="mis. Kantin Gedung A" />
            {fieldErrors.location && <span className="field-error">{fieldErrors.location}</span>}
          </div>
          <div className="field">
            <label htmlFor="description">Deskripsi</label>
            <textarea id="description" rows={5} value={values.description} onChange={set('description')} placeholder="Ceritakan tentang warung ini..." />
            {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : mode === 'create' ? 'Simpan warung' : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

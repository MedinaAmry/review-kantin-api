import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseApiError } from '../api/errors';

interface LocState {
  from?: string;
  reason?: string;
  registered?: boolean;
  email?: string;
}

const DEMO_ACCOUNTS = [
  { email: 'admin@test.com', role: 'Admin' },
  { email: 'owner1@test.com', role: 'Owner 1' },
  { email: 'owner2@test.com', role: 'Owner 2' },
  { email: 'customer@test.com', role: 'Customer' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const state = (useLocation().state ?? null) as LocState | null;

  const [email, setEmail] = useState(state?.email ?? '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!email.trim()) fe.email = 'Email wajib diisi';
    if (!password) fe.password = 'Password wajib diisi';
    setFieldErrors(fe);
    setError(null);
    if (Object.keys(fe).length) return;

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password); // POST /auth/login lalu GET /auth/me
      toast.success(`Selamat datang, ${user.name ?? user.email}!`);
      navigate(state?.from ?? '/stalls', { replace: true });
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message); // mis. 401 "Email atau password salah"
      setFieldErrors(info.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page auth-page">
      <div className="card auth-card">
        <h1>Masuk</h1>
        {state?.reason === 'login-required' && (
          <div className="alert alert-info">Silakan login terlebih dahulu untuk mengakses halaman tersebut.</div>
        )}
        {state?.registered && <div className="alert alert-success">Registrasi berhasil! Silakan login.</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="muted center">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>

        <details className="demo">
          <summary>Akun uji (development)</summary>
          <p className="muted">Password semua akun: password123. Klik untuk mengisi email.</p>
          <div className="demo-list">
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.email} type="button" className="btn btn-ghost" onClick={() => { setEmail(a.email); setPassword('password123'); }}>
                {a.role}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

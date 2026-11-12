import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../api/errors';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const fe: Record<string, string> = {};
    if (name.trim().length < 3) fe.name = 'Nama minimal 3 karakter';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) fe.email = 'Format email tidak valid';
    if (password.length < 8) fe.password = 'Password minimal 8 karakter';
    else if (password.length > 72) fe.password = 'Password maksimal 72 karakter';
    if (confirm !== password) fe.confirm = 'Konfirmasi password tidak sama';
    setFieldErrors(fe);
    if (Object.keys(fe).length) return;

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password); // POST /auth/register
      navigate('/login', { replace: true, state: { registered: true, email: email.trim() } });
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message); // mis. 409 "Email sudah terdaftar"
      setFieldErrors(info.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page auth-page">
      <div className="card auth-card">
        <h1>Daftar</h1>
        <p className="muted">Akun baru otomatis berperan sebagai Customer.</p>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Nama</label>
            <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>
          <div className="field">
            <label htmlFor="confirm">Konfirmasi password</label>
            <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {fieldErrors.confirm && <span className="field-error">{fieldErrors.confirm}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="muted center">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </div>
    </div>
  );
}

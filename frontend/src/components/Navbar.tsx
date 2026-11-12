import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { canCreateStall, roleLabel } from '../utils/permissions';

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout.');
    navigate('/stalls');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/stalls" className="brand">
          🍜 Review Kantin
        </Link>
        <nav className="nav-links">
          <NavLink to="/stalls" end>
            Warung
          </NavLink>
          {canCreateStall(user) && <NavLink to="/stalls/new">+ Tambah Warung</NavLink>}
        </nav>
        <div className="nav-right">
          {user ? (
            <>
              <Link to="/profile" className="nav-user">
                <span>{user.name ?? user.email}</span>
                <span className={`badge badge-${user.role}`}>{roleLabel[user.role]}</span>
              </Link>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

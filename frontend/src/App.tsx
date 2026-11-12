import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute, { GuestOnly } from './components/ProtectedRoute';
import StallListPage from './pages/StallListPage';
import StallDetailPage from './pages/StallDetailPage';
import StallFormPage from './pages/StallFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/stalls" replace />} />

          {/* Publik */}
          <Route path="/stalls" element={<StallListPage />} />
          <Route path="/stalls/:id" element={<StallDetailPage />} />
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          {/* Harus login */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Hanya owner & admin */}
          <Route
            path="/stalls/new"
            element={<ProtectedRoute roles={['owner', 'admin']}><StallFormPage mode="create" /></ProtectedRoute>}
          />
          <Route
            path="/stalls/:id/edit"
            element={<ProtectedRoute roles={['owner', 'admin']}><StallFormPage mode="edit" /></ProtectedRoute>}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

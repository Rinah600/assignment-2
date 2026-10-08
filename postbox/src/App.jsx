import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Protected, useAuth } from './auth';
import Login from './Login';
import Posts from './Posts';
import PostDetail from './PostDetail';

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header>
        <Link to="/" className="brand">Postbox</Link>
        {user && (
          <div className="row">
            <span className="muted who">{user.name}</span>
            <button className="ghost small" onClick={logout}>Log out</button>
          </div>
        )}
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Posts /></Protected>} />
        <Route path="/posts/:id" element={<Protected><PostDetail /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

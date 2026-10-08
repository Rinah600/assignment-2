import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try { await login(username, password); nav('/'); } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <main className="login">
      <h1>Sign in to Postbox</h1>
      <p className="muted">Use any JSONPlaceholder username, such as Bret, with a password of 4 or more characters.</p>
      <form onSubmit={submit}>
        <label>Username<input required value={username} onChange={(e) => setUsername(e.target.value)} autoFocus /></label>
        <label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}

import { createContext, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchUsers } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
const KEY = 'postbox-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  });

  // Demo auth: the username must match a JSONPlaceholder user (e.g. "Bret"); any password of 4+ characters works.
  async function login(username, password) {
    if (password.length < 4) throw new Error('Password must be at least 4 characters.');
    const users = await fetchUsers();
    const found = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!found) throw new Error('No such user. Try a name like Bret or Antonette.');
    const session = { id: found.id, name: found.name, username: found.username };
    localStorage.setItem(KEY, JSON.stringify(session));
    setUser(session);
  }
  function logout() {
    localStorage.removeItem(KEY);
    setUser(null);
  }
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

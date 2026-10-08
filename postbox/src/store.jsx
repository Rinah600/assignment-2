import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';

/*
 * JSONPlaceholder accepts writes but never saves them, so a refetch would erase
 * every change. We keep an "overlay" of local changes (created / edited / deleted)
 * and merge it over the server data. The overlay is persisted to localStorage.
 */
const KEY = 'postbox-overlay-v1';
const empty = { created: [], edits: {}, deleted: [], cCreated: [], cEdits: {}, cDeleted: [] };

export const isLocal = (id) => String(id).startsWith('local-');
export const norm = (id) => (isLocal(id) ? String(id) : Number(id));
export const newLocalId = () => `local-${Date.now()}`;

const load = () => {
  try { return { ...empty, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return empty; }
};

function reducer(s, a) {
  switch (a.type) {
    case 'reset': return a.state;
    case 'addPost': return { ...s, created: [a.item, ...s.created] };
    case 'editPost':
      return isLocal(a.id)
        ? { ...s, created: s.created.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) }
        : { ...s, edits: { ...s.edits, [a.id]: { ...s.edits[a.id], ...a.patch } } };
    case 'removePost':
      return isLocal(a.id)
        ? { ...s, created: s.created.filter((p) => p.id !== a.id) }
        : { ...s, deleted: [...s.deleted, a.id] };
    case 'addComment': return { ...s, cCreated: [a.item, ...s.cCreated] };
    case 'editComment':
      return isLocal(a.id)
        ? { ...s, cCreated: s.cCreated.map((c) => (c.id === a.id ? { ...c, ...a.patch } : c)) }
        : { ...s, cEdits: { ...s.cEdits, [a.id]: { ...s.cEdits[a.id], ...a.patch } } };
    case 'removeComment':
      return isLocal(a.id)
        ? { ...s, cCreated: s.cCreated.filter((c) => c.id !== a.id) }
        : { ...s, cDeleted: [...s.cDeleted, a.id] };
    default: return s;
  }
}

// Merge helpers used by the pages
export const mergePosts = (items, s, { page, q }) => [
  ...(page === 1 && !q ? s.created : []),
  ...items.filter((p) => !s.deleted.includes(p.id)).map((p) => ({ ...p, ...s.edits[p.id] })),
];
export const mergeComments = (items, postId, s) => [
  ...s.cCreated.filter((c) => c.postId === postId),
  ...items.filter((c) => !s.cDeleted.includes(c.id)).map((c) => ({ ...c, ...s.cEdits[c.id] })),
];

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toast, setToast] = useState(null);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }, [state]);

  const notify = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Optimistic update: apply immediately, call the API, roll back if it fails.
  const run = useCallback(async (action, network) => {
    const previous = ref.current;
    dispatch(action);
    try {
      if (network) await network();
    } catch (e) {
      dispatch({ type: 'reset', state: previous });
      notify('That change could not be saved and was undone.');
      throw e;
    }
  }, [notify]);

  return (
    <Ctx.Provider value={{ state, run, notify }}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </Ctx.Provider>
  );
}

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { PAGE_SIZE, createPost, deletePost, fetchPosts, fetchUsers, updatePost } from './api';
import { mergePosts, newLocalId, useStore } from './store';
import { useAuth } from './auth';
import Form from './Form';

const postFields = [
  { name: 'title', label: 'Title' },
  { name: 'body', label: 'Body', multiline: true },
];
export const hue = (userId) => (Number(userId) * 47) % 360;

export default function Posts() {
  const qc = useQueryClient();
  const { state, run } = useStore();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const q = params.get('q') || '';
  const [text, setText] = useState(q);
  const [form, setForm] = useState(null); // null | 'new' | post being edited

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => setParams(text ? { q: text } : {}), 350);
    return () => clearTimeout(t);
  }, [text, q, setParams]);

  const posts = useQuery({
    queryKey: ['posts', page, q],
    queryFn: () => fetchPosts({ page, q }),
    placeholderData: keepPreviousData, // keep showing the old page while the next one loads
  });
  const users = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: Infinity });
  const author = (id) => users.data?.find((u) => u.id === id)?.name ?? `User ${id}`;

  const total = (posts.data?.total ?? 0) + (q ? 0 : state.created.length) - state.deleted.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = posts.data ? mergePosts(posts.data.items, state, { page, q }) : [];

  // Prefetch the next page so "Next" feels instant.
  useEffect(() => {
    if (page < pages) qc.prefetchQuery({ queryKey: ['posts', page + 1, q], queryFn: () => fetchPosts({ page: page + 1, q }) });
  }, [page, pages, q, qc]);

  const go = (p) => { setParams({ ...(q && { q }), ...(p > 1 && { page: p }) }); window.scrollTo({ top: 0 }); };

  const save = (values) =>
    form === 'new'
      ? run({ type: 'addPost', item: { id: newLocalId(), userId: user.id, ...values } }, () => createPost({ userId: user.id, ...values }))
      : run({ type: 'editPost', id: form.id, patch: values }, () => (typeof form.id === 'string' ? null : updatePost(form.id, { ...form, ...values })));

  const remove = (p) =>
    window.confirm('Delete this post?') &&
    run({ type: 'removePost', id: p.id }, () => (typeof p.id === 'string' ? null : deletePost(p.id))).catch(() => {});

  return (
    <main>
      <div className="toolbar">
        <input type="search" placeholder="Search posts" aria-label="Search posts" value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={() => setForm('new')}>New post</button>
      </div>

      {posts.isError && <p className="error" role="alert">Could not load posts. <button className="link" onClick={() => posts.refetch()}>Try again</button></p>}
      {posts.isPending && <div className="grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="card skeleton" />)}</div>}
      {posts.data && items.length === 0 && <p className="muted">No posts match “{q}”. Clear the search to see everything.</p>}

      <div className={`grid ${posts.isPlaceholderData ? 'fading' : ''}`}>
        {items.map((p) => (
          <article key={p.id} className="card" style={{ '--h': hue(p.userId) }}>
            <p className="author">{author(p.userId)}</p>
            <h2><Link to={`/posts/${p.id}`}>{p.title}</Link></h2>
            <p className="excerpt">{p.body}</p>
            <div className="row">
              <button className="ghost small" onClick={() => setForm(p)}>Edit</button>
              <button className="ghost small danger" onClick={() => remove(p)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      <nav className="pager" aria-label="Pagination">
        <button className="ghost" disabled={page <= 1} onClick={() => go(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="ghost" disabled={page >= pages} onClick={() => go(page + 1)}>Next</button>
      </nav>

      {form && (
        <Form
          title={form === 'new' ? 'New post' : 'Edit post'}
          fields={postFields}
          initial={form === 'new' ? {} : form}
          submitLabel={form === 'new' ? 'Publish' : 'Save changes'}
          onSubmit={save}
          onClose={() => setForm(null)}
        />
      )}
    </main>
  );
}

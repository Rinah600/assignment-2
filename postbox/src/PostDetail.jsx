import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createComment, deleteComment, deletePost, fetchComments, fetchPost, fetchUsers, updateComment, updatePost } from './api';
import { isLocal, mergeComments, newLocalId, norm, useStore } from './store';
import { useAuth } from './auth';
import { hue } from './Posts';
import Form from './Form';

const postFields = [{ name: 'title', label: 'Title' }, { name: 'body', label: 'Body', multiline: true }];
const commentFields = [{ name: 'name', label: 'Subject' }, { name: 'body', label: 'Comment', multiline: true }];

export default function PostDetail() {
  const { id } = useParams();
  const nid = norm(id);
  const local = isLocal(id);
  const nav = useNavigate();
  const qc = useQueryClient();
  const { state, run } = useStore();
  const { user } = useAuth();
  const [form, setForm] = useState(null); // 'post' | 'comment' | comment being edited

  const server = useQuery({
    queryKey: ['post', nid],
    queryFn: () => fetchPost(nid),
    enabled: !local,
    // Reuse the post from any cached list page so the detail view opens instantly.
    initialData: () => qc.getQueriesData({ queryKey: ['posts'] }).flatMap(([, d]) => d?.items ?? []).find((p) => p.id === nid),
  });
  const comments = useQuery({ queryKey: ['comments', nid], queryFn: () => fetchComments(nid), enabled: !local });
  const users = useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: Infinity });

  const post = local ? state.created.find((p) => p.id === id) : server.data && { ...server.data, ...state.edits[nid] };
  const gone = !local && state.deleted.includes(nid);
  useEffect(() => { if (gone || (local && !post)) nav('/', { replace: true }); }, [gone, local, post, nav]);

  const list = mergeComments(comments.data ?? [], nid, state);
  const author = users.data?.find((u) => u.id === post?.userId)?.name ?? '';

  const removePost = () =>
    window.confirm('Delete this post?') &&
    run({ type: 'removePost', id: nid }, () => (local ? null : deletePost(nid))).then(() => nav('/')).catch(() => {});

  const saveComment = (values) =>
    form === 'comment'
      ? run({ type: 'addComment', item: { id: newLocalId(), postId: nid, email: user.username, ...values } }, () => createComment({ postId: nid, email: user.username, ...values }))
      : run({ type: 'editComment', id: form.id, patch: values }, () => (isLocal(form.id) ? null : updateComment(form.id, { ...form, ...values })));

  const removeComment = (c) =>
    run({ type: 'removeComment', id: c.id }, () => (isLocal(c.id) ? null : deleteComment(c.id))).catch(() => {});

  if (server.isError) return <main><p className="error">This post could not be loaded. <Link to="/">Back to posts</Link></p></main>;
  if (!post) return <main><div className="card skeleton tall" /></main>;

  return (
    <main className="detail">
      <Link to="/" className="back">All posts</Link>
      <article className="card open" style={{ '--h': hue(post.userId) }}>
        <p className="author">{author}</p>
        <h1>{post.title}</h1>
        <p>{post.body}</p>
        <div className="row">
          <button className="ghost small" onClick={() => setForm('post')}>Edit</button>
          <button className="ghost small danger" onClick={removePost}>Delete</button>
        </div>
      </article>

      <section>
        <div className="row between">
          <h2>Comments ({list.length})</h2>
          <button onClick={() => setForm('comment')}>Add comment</button>
        </div>
        {comments.isPending && !local && <div className="card skeleton" />}
        {list.length === 0 && !comments.isPending && <p className="muted">No comments yet. Start the conversation.</p>}
        <ul className="comments">
          {list.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong>
              <span className="muted"> {c.email}</span>
              <p>{c.body}</p>
              <div className="row">
                <button className="ghost small" onClick={() => setForm(c)}>Edit</button>
                <button className="ghost small danger" onClick={() => removeComment(c)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {form === 'post' && (
        <Form title="Edit post" fields={postFields} initial={post} submitLabel="Save changes"
          onSubmit={(v) => run({ type: 'editPost', id: nid, patch: v }, () => (local ? null : updatePost(nid, { ...server.data, ...v })))}
          onClose={() => setForm(null)} />
      )}
      {form && form !== 'post' && (
        <Form title={form === 'comment' ? 'Add comment' : 'Edit comment'} fields={commentFields}
          initial={form === 'comment' ? {} : form} submitLabel={form === 'comment' ? 'Post comment' : 'Save changes'}
          onSubmit={saveComment} onClose={() => setForm(null)} />
      )}
    </main>
  );
}

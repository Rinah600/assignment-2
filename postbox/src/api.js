// All network calls live here. Components never call fetch directly.
const BASE = 'https://jsonplaceholder.typicode.com';
export const PAGE_SIZE = 9;

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res;
}
const send = (method, path, body) =>
  request(path, { method, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());

// READ
export async function fetchPosts({ page, q }) {
  const params = new URLSearchParams({ _page: page, _limit: PAGE_SIZE });
  if (q) params.set('q', q);
  const res = await request(`/posts?${params}`);
  return { items: await res.json(), total: Number(res.headers.get('x-total-count')) };
}
export const fetchPost = (id) => request(`/posts/${id}`).then((r) => r.json());
export const fetchComments = (postId) => request(`/posts/${postId}/comments`).then((r) => r.json());
export const fetchUsers = () => request('/users').then((r) => r.json());

// CREATE / UPDATE / DELETE (JSONPlaceholder accepts these but does not persist them)
export const createPost = (data) => send('POST', '/posts', data);
export const updatePost = (id, data) => send('PUT', `/posts/${id}`, data);
export const deletePost = (id) => send('DELETE', `/posts/${id}`);
export const createComment = (data) => send('POST', '/comments', data);
export const updateComment = (id, data) => send('PUT', `/comments/${id}`, data);
export const deleteComment = (id) => send('DELETE', `/comments/${id}`);

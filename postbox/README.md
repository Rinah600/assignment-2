# Postbox

A single-page React app that performs full CRUD against the [JSONPlaceholder](https://jsonplaceholder.typicode.com) API.

**Code walkthrough video (5 min):** ADD_YOUR_PUBLIC_VIDEO_URL_HERE

## Run it
```bash
npm install
npm run dev      # development
npm run build    # production build in dist/
```
Sign in with any JSONPlaceholder username (for example `Bret`) and a password of 4 or more characters.

## Features
- **CRUD** on posts and comments (`GET`, `POST`, `PUT`, `DELETE`)
- **Pagination** using the API's `_page` / `_limit` params and the `x-total-count` header; next page is prefetched
- **Search** (debounced, server-side `q` param); page and search live in the URL
- **Caching**: TanStack Query (5 min stale time), cache persisted to localStorage, detail pages seeded from list cache
- **State management**: server state in TanStack Query, local changes in a reducer-based store with optimistic updates and rollback on failure
- **Auth**: login against the `/users` endpoint, protected routes, logout
- **Responsive design**, dark mode, reduced-motion support, skeleton loaders, modal and entrance animations

## Why there is a local "overlay" store
JSONPlaceholder accepts writes but does not save them, so refetching would erase every change. The app sends the real request, then keeps created, edited and deleted items in `src/store.jsx` (persisted to localStorage) and merges them over server data.

## Structure
| File | Role |
|---|---|
| `src/api.js` | All HTTP calls |
| `src/store.jsx` | Overlay reducer, optimistic `run()` helper, toasts |
| `src/auth.jsx` | Auth context and route guard |
| `src/Posts.jsx` | List, search, pagination, post create/edit/delete |
| `src/PostDetail.jsx` | Single post and comment CRUD |
| `src/Form.jsx` | Reusable modal form |
## Video walkthrough (5 minutes)
Public URL:(https://youtu.be/k8YuYAvL0R8)
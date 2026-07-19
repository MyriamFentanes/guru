## Guru

Class builder app for yoga teachers. See [Claude.md](./Claude.md) for the full product requirements, and GitHub issues for the flow-by-flow build plan (#1 is this setup issue, #2-#7 are the six user flows).

### Getting started

```bash
npm install
npm run dev
```

The app expects an `AUTH_SECRET` env var (see `.env.local`, generated locally and not committed).

### Storage layout

Storage is flat-file for now (decision: files now, real database later once it's needed). Everything under `data/` and `content/` is read/written **only** through `src/lib/storage/file-store.ts` and the repository modules built on it (e.g. `src/lib/users.ts`) — no other code touches the filesystem directly. That's the seam where a future swap to a real database happens without touching routes or UI.

- `content/asanas/<slug>/meta.json` + `image.*` — the curated asana repository. Committed to git; this is editorial content, not runtime data.
  - Schema: `slug`, `name`, `sanskritName`, `otherNames[]`, `musclesInvolved[]`, `series[]`, `durationSeconds`, `assists[]`, `image`, `verified`, `notes`.
  - The seed set was auto-drafted from photos and is marked `verified: false` — review before using in a real class.
- `data/users.json` — user accounts (bcrypt password hashes, role). Gitignored; runtime data.
- `data/classes/<id>.json` — saved classes. Gitignored; runtime data.

Concurrent writes to a given JSON file are serialized with an in-process lock in `file-store.ts`, and writes are atomic (write to a temp file, then rename). That's sufficient for a single Next.js server instance; it would need revisiting (e.g. a real DB) before running multiple instances.

### Auth & RBAC

- Sessions are a signed JWT (`jose`, `HS256`) in an httpOnly cookie, verified in `src/lib/auth/session.ts`.
- Roles are `"teacher"` and `"admin"` (`src/lib/types.ts`). All accounts created via `/api/auth/register` are `teacher`.
- `src/lib/auth/rbac.ts` exports `withAuth(handler, allowedRoles?)` to wrap API route handlers: 401 if there's no session, 403 if the session's role isn't in `allowedRoles`.
  - `src/app/api/me/route.ts` — any authenticated role.
  - `src/app/api/admin/ping/route.ts` — `admin` only; a `teacher` session gets 403. Reference example for role-gated routes.

### Dev account

`POST /api/auth/register` with `{ "email": ..., "password": ... }` (password min 8 chars) creates a `teacher` account. There's no invite/admin flow yet — fine for single-teacher local use, revisit before this is multi-user or public.

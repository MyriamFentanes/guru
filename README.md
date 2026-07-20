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

- `content/asanas/<slug>/meta.json` + `image.*` — the curated asana repository. Seeded and versioned in git, but as of Flow 2 (#3) also **writable at runtime**: teachers can add/edit/delete asanas from the app (`/asanas`), which writes straight to this folder via `src/lib/asanas.ts`. That means the working tree can diverge from what's committed — anything added/edited through the UI needs an explicit `git add`/commit to actually persist past the local filesystem. The git-template workflow below still works for hand-authoring entries.
  - Schema and field docs: [`content/asanas/asana.schema.json`](./content/asanas/asana.schema.json). To add a new asana via git instead of the UI, copy `content/asanas/_template/` — see [`content/asanas/README.md`](./content/asanas/README.md).
  - The seed set was auto-drafted from photos and is marked `verified: false` until a teacher reviews it.
  - Images aren't under `public/`, so they're served through `/api/asanas/[slug]/image` rather than as static assets.
- `data/users.json` — user accounts (bcrypt password hashes, role, profile photo filename). Gitignored; runtime data.
- `data/users/<id>/photo.<ext>` — profile photo, served through `/api/users/[id]/photo`. Gitignored; runtime data.
- `data/classes/<id>.json` — saved classes. Gitignored; runtime data.

Concurrent writes to a given JSON file are serialized with an in-process lock in `file-store.ts`, and writes are atomic (write to a temp file, then rename). That's sufficient for a single Next.js server instance; it would need revisiting (e.g. a real DB) before running multiple instances.

### Auth & RBAC

- Sessions are a signed JWT (`jose`, `HS256`) in an httpOnly cookie, verified in `src/lib/auth/session.ts`.
- Roles are `"teacher"` and `"admin"` (`src/lib/types.ts`). All accounts created via `/api/auth/register` are `teacher`.
- `src/lib/auth/rbac.ts` exports `withAuth(handler, allowedRoles?)` to wrap API route handlers: 401 if there's no session, 403 if the session's role isn't in `allowedRoles`.
  - `src/app/api/me/route.ts` — any authenticated role.
  - `src/app/api/admin/ping/route.ts` — `admin` only; a `teacher` session gets 403. Reference example for role-gated routes.

### Design system

Visual direction is a warm, minimal boutique-studio look (reference: [barrefit.es](https://barrefit.es/), [@bodyflyingbcn](https://www.instagram.com/bodyflyingbcn/)). Tokens live in `src/app/globals.css`:

- **Colors**: `background` (white) / `background-warm` (`#F8F3F2` cream) / `accent-taupe` (`#E4D7D4`) for surfaces, `ink` (black) for headings/emphasis, `foreground` (`#333`) for body text, `muted` (`#777`) for secondary text. Each has a dark-mode value via `prefers-color-scheme`.
- **Type**: Raleway (`--font-sans`) for body/UI, Josefin Sans (`--font-display`, light weight) for headings.
- **The `.label` class**: small, uppercase, wide letter-spacing — use it for buttons, nav, and eyebrow text, matching the reference sites' understated CTA style.

This was extrapolated from Barrefit's live site styles (colors/fonts read directly from its computed styles) since Instagram profiles aren't scriptable without login; treat it as a starting point to refine once there's real UI to react to.

Palette/button mechanics are settled (see #31) after comparing against Arden Yoga and Seven Senses - not revisited without a new reason to. #31 also added `public/images/hero-asana.jpeg`, used by `SplitHero` on the logged-out home, login, and register pages since those are unauthenticated and can't hit the RBAC-gated `/api/asanas/[slug]/image` route. This is standalone site imagery, not derived from the curated asana repository (it was originally a copy of the Downward-Facing Dog photo, later swapped for a dedicated studio photo) - update the file directly to change it, no code changes needed.

### PDF export

`GET /api/classes/[id]/pdf` (linked from a saved class's detail page) generates a PDF on the fly with `pdfkit` - ordered slots, images, names, durations, progressions, and class metadata. `pdfkit` only embeds JPEG/PNG; a WebP asana image is skipped (text still renders) rather than failing the whole PDF.

### Dev account

`POST /api/auth/register` with `{ "email": ..., "password": ... }` (password min 8 chars) creates a `teacher` account. There's no invite/admin flow yet — fine for single-teacher local use, revisit before this is multi-user or public.

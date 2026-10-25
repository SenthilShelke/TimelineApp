# Migration Plan: Firestore → SQL (Postgres) + Backend API

Goal: replace the direct-to-Firestore architecture with a **normalized Postgres database behind a REST API**. Database access goes through an **ORM (Prisma)** — no hand-written SQL — so writing a row looks like `prisma.timeline.create({...})`. This turns the project into a full-stack app that demonstrates backend design, relational modeling, and client–server auth.

## Scope & Sequencing (per current decisions)

- **Now (this effort):** build the **API layer + real Postgres database** and have the app talk to it. Keep **email/password** auth for now.
- **Deferred to later (not now):** production **deployment/hosting**, and **image upload to object storage** (images keep working as-is locally until then). These are called out inline but are out of scope for the first pass.
- **Planned next, after the API/DB layer is done:** migrate auth to **Google SSO**. The auth design below is built to make that an *additive* change (new login path), not a rewrite — see §3a.

---

## 0. Target Architecture

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────┐     SQL      ┌────────────┐
│  React Native   │ ──────────────────► │  Backend API     │ ───────────► │ PostgreSQL │
│  (Expo client)  │ ◄────────────────── │  (Node/Express)  │ ◄─────────── │            │
└─────────────────┘   Bearer JWT        └──────────────────┘  Prisma (ORM) └────────────┘
         │                                       │
         │  image upload (DEFERRED — later)      │  verifies JWT, issues tokens
         ▼                                       ▼
   ┌──────────────┐                        (bcrypt now; Google SSO added later)
   │ Object store │  (later: S3 / Cloudflare R2) — not in this pass
   └──────────────┘
```

Current state being replaced: the Expo client talks directly to Firebase Auth + Firestore from 5 files (`firebase.ts`, `app/index.tsx`, `LoginScreen`, `HomeScreen`, `EditScreen`, `SettingsScreen`). Images are stored as device-local `file://` URIs.

---

## 1. Tech Choices (recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| Language (backend) | TypeScript + Node | Reuse your TS skills; one language across stack |
| Web framework | Express (or Fastify) | Ubiquitous, interview-friendly, simple |
| DB access | **Prisma (ORM)** | No hand-written SQL — type-safe queries like `prisma.timeline.create({...})`; Prisma generates the SQL. Auto-migrations. |
| Database | PostgreSQL | The canonical relational DB for interviews |
| Schema mgmt | Prisma Migrate (`prisma migrate dev`) | Versioned migrations generated from the Prisma schema |
| Auth | JWT (access + refresh) + bcrypt, **SSO-ready** (see §3a) | Own tokens now; Google SSO slots in later as an added login path |
| Validation | Zod | Request validation, pairs well with TS |
| Image storage | **Deferred** — local `file://` URIs stay for now; S3/R2 presigned URLs later | Out of scope for the first API/DB pass |
| Local dev DB | **Native Homebrew Postgres 16** (already installed) | No Docker needed; `brew services start postgresql` + `createdb` |
| Hosting | **Deferred** — Railway/Render (API+DB) later | App will be published eventually; not part of this pass |

> Alternative: **Supabase** gives managed Postgres + auth + storage with less backend code. But since the goal is to *show* backend skills, building the Express API yourself is the stronger signal. This plan assumes the self-built API.

---

## 2. Relational Schema

```sql
-- users  (identity-provider-agnostic: no password column here)
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  display_name   TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- auth_identities  (one user can have several login methods: password now, Google later)
--   provider = 'password' | 'google' | ...
--   password: provider_user_id = user's id, secret = bcrypt hash
--   google:   provider_user_id = Google 'sub' claim, secret = NULL
CREATE TABLE auth_identities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  secret           TEXT,                 -- bcrypt hash for 'password'; NULL for SSO
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);
CREATE INDEX idx_identities_user ON auth_identities(user_id);

-- timelines  (one user has many timelines)
CREATE TABLE timelines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_timelines_user ON timelines(user_id);

-- events  (one timeline has many events)
CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id  UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  event_date   DATE NOT NULL,
  description  TEXT,
  position     INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_timeline ON events(timeline_id);

-- event_images  (one event has many images)
CREATE TABLE event_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,          -- object-storage URL, not a local file:// URI
  position   INT
);
CREATE INDEX idx_images_event ON event_images(event_id);
```

Mapping from today's model:
- Firestore `users/{uid}` → `users` row (a real profile; **no password column** — credentials live in `auth_identities`).
- Email/password login → an `auth_identities` row with `provider='password'` and a bcrypt hash in `secret`.
- Firestore `users/{uid}/timelines/{id}` → `timelines` row.
- The embedded `events[]` array → first-class `events` rows (FK to timeline).
- The embedded `images[]` array of local URIs → `event_images` rows (holds local URIs for now; remote URLs once image upload lands later).

This DDL is shown for clarity, but you won't run it by hand — it's expressed as a **Prisma schema** (`schema.prisma`) and applied with `prisma migrate dev`, which generates the SQL for you (Phase 2).

### 2a. Why this is SSO-ready

Separating `users` from `auth_identities` is the one design choice that makes the future Google migration painless:
- A user is **one `users` row** regardless of how they log in.
- Email/password = an `auth_identities` row now. Adding Google later = **just a new `auth_identities` row** (`provider='google'`) pointing at the same user — no change to `users`, `timelines`, `events`, or any data route.
- Account linking (same email via password *and* Google) is naturally supported.
- If we'd put `password_hash` directly on `users`, adding SSO later would force a schema change and backfill. This avoids that.

---

## 3. REST API Surface

All data routes require `Authorization: Bearer <accessToken>`.

```
# Auth
POST   /auth/signup            { email, password }           -> { user, accessToken, refreshToken }
POST   /auth/login             { email, password }           -> { user, accessToken, refreshToken }
POST   /auth/refresh           { refreshToken }              -> { accessToken }
POST   /auth/verify-email      { token }                     -> 200
GET    /auth/me                                              -> { user }

# Timelines (scoped to authenticated user)
GET    /timelines                                            -> [ { id, title, events:[...] } ]
POST   /timelines              { title, events? }            -> { timeline }
GET    /timelines/:id                                        -> { timeline, events }
PUT    /timelines/:id          { title, events }             -> { timeline }   # upsert events
DELETE /timelines/:id                                        -> 204

# Events (optional granular routes; PUT /timelines/:id can also handle these)
POST   /timelines/:id/events   { title, date, description }  -> { event }
PUT    /events/:id             { ... }                       -> { event }
DELETE /events/:id                                           -> 204

# Images  (DEFERRED — not built in this pass; images keep using local URIs for now)
POST   /uploads/sign           { contentType }               -> { uploadUrl, publicUrl }  # presigned
```

Note: `GET /timelines` returns events nested so the client's existing shape (`{ id, title, events[] }`) is preserved — minimizing client changes.

---

## 3a. Auth Design (email/password now, Google SSO later)

The rule that keeps SSO additive: **the login method only affects the `/auth/*` endpoints. Every data route just trusts a JWT that *your* API issued.**

```
                 ┌─────────────────────────┐
  password login │ POST /auth/login         │
  ───────────────►  verify bcrypt in        │
                 │  auth_identities         ├──┐
                 └─────────────────────────┘  │  both paths resolve to a
                 ┌─────────────────────────┐  │  users row, then mint the
  google login   │ POST /auth/google  (LATER)│  │  SAME app JWT
  ───────────────►  verify Google ID token  ├──┤
                 │  find/create user +       │  │
                 │  auth_identities row      ├──┘
                 └─────────────────────────┘
                              │
                              ▼
                 app JWT (access + refresh)  ──►  used by ALL /timelines routes
```

Design choices to make now so Google drops in cleanly later:
1. **`users` has no password** — credentials live in `auth_identities` (see §2a).
2. **API issues its own JWT** for every login method. Data routes verify *that* token and never care which provider was used. Adding Google changes zero data routes.
3. **Token verification is centralized** in one `requireAuth` middleware → `req.userId`. Unchanged by SSO.
4. **Client stores an opaque app token**, not a provider token. Swapping the login UI later doesn't touch how the app calls the API.

When Google SSO is added later (separate effort), the *only* new work is:
- Add `POST /auth/google` (verify Google ID token, find-or-create user + a `provider='google'` identity, mint the same app JWT).
- Add a "Sign in with Google" button + `expo-auth-session` flow on the client.
- No schema migration, no data-route changes, no token-format change.

---

## 4. Client Call-Site Changes (exact files)

These are the only files touching Firebase today and must be rewritten to call the API:

| File | Today | After migration |
|------|-------|-----------------|
| `firebase.ts` | Firebase init | Delete → replace with `api/client.ts` (fetch wrapper + token storage) |
| `env.d.ts` | `FIREBASE_*` vars | Replace with `API_BASE_URL` |
| `app/index.tsx` | `onAuthStateChanged` auth gate | Check stored token / `GET /auth/me` on launch |
| `app/LoginScreen.tsx` | `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `sendEmailVerification` | `POST /auth/signup`, `POST /auth/login` |
| `app/HomeScreen.tsx` | `onSnapshot` read, `deleteDoc` | `GET /timelines` (on focus), `DELETE /timelines/:id` |
| `app/EditScreen.tsx` | `setDoc` | `POST`/`PUT /timelines/:id` (images stay local for now) |
| `app/SettingsScreen.tsx` | `signOut` | Clear stored tokens |

**Real-time tradeoff:** Firestore's `onSnapshot` auto-refreshes Home. Replacement = re-fetch `GET /timelines` using React Navigation's `useFocusEffect` (refresh when returning from Edit). Good enough; optionally add polling or websockets later.

**Shared types:** create `types.ts` with `Timeline` and `Event` (currently duplicated in ~6 files) and reuse on both client and server.

**Images (deferred):** for this pass, `EditScreen`/`EventEditor` keep storing local `file://` URIs in `events.images` exactly as today. Uploading to object storage is Phase 5 (later).

---

## 5. Phased Execution Plan

### Phase 1 — Backend scaffold (0.5–1 day)
- New `server/` workspace: `npm init`, TypeScript, Express, Zod, **Prisma**, jsonwebtoken, bcrypt.
- Use the **native Homebrew Postgres** already installed: `brew services start postgresql@16` (or `postgresql`), then `createdb timelineapp`.
- `.env` with `DATABASE_URL=postgresql://localhost:5432/timelineapp` and `JWT_SECRET`.
- Health check route `GET /health`. Confirm server boots and connects to DB.

### Phase 2 — Prisma schema + migrate (0.5 day)
- Write `schema.prisma` modeling the tables in §2 (`User`, `AuthIdentity`, `Timeline`, `Event`, `EventImage`) with relations.
- Run `npx prisma migrate dev --name init` (generates SQL + applies it; no hand-written SQL).
- Seed script (`prisma/seed.ts`) with a test user + a `password` identity + sample timeline/events.
- **Verify:** `npx prisma studio` shows the five tables and seeded rows (or `psql timelineapp -c "\dt"`).

> DB access everywhere uses the Prisma client (`prisma.timeline.create(...)`, `prisma.timeline.findMany(...)`). Multi-step writes (the event-sync on `PUT /timelines/:id`) use `prisma.$transaction([...])`.

### Phase 3 — Auth (email/password, SSO-ready) (1–1.5 days)
- Signup: create a `users` row + an `auth_identities` row (`provider='password'`, bcrypt hash in `secret`).
- Login: look up the `password` identity by email, verify bcrypt, mint app JWT (access + refresh).
- `requireAuth` middleware verifies the app JWT → `req.userId`. (This is the piece Google SSO will reuse unchanged.)
- `GET /auth/me`. Email verification can be a simple token now, real email later.
- **Verify:** curl/Postman signup → login → call a protected route; confirm an `auth_identities` row exists with `provider='password'`.

### Phase 3 — Auth (1–1.5 days)
- Implement signup/login (bcrypt hash, issue JWT access+refresh).
- Auth middleware verifying Bearer token → attaches `req.userId`.
- `GET /auth/me`. (Email verification can be a simple token now, real email later.)
- **Verify:** curl/Postman signup → login → call a protected route.

### Phase 4 — Timelines + events CRUD (1.5–2 days)
- Implement all `/timelines` routes, scoped by `req.userId`.
- `PUT /timelines/:id` upserts the timeline and syncs its events (create/update/delete diff) inside `prisma.$transaction([...])`.
- Zod validation + consistent error responses.
- **Verify:** integration tests (Jest + supertest) covering create/read/update/delete and cross-user isolation (user A cannot read user B's timeline).

### Phase 5 — Image uploads — DEFERRED (not this pass)
- Out of scope for the first API/DB layer. Until built, `events.images` continues to hold local `file://` URIs (works on-device; not portable).
- When tackled later: object-storage bucket + `POST /uploads/sign` presigned URL; client uploads then stores the returned `publicUrl` in `event_images`.

### Phase 6 — Client API layer (0.5 day)
- `api/client.ts`: fetch wrapper, base URL from env, injects Bearer token, handles 401 → refresh.
- Token storage in `expo-secure-store` (or AsyncStorage).
- `types.ts` shared models.

### Phase 7 — Rewire client screens (2 days)
- Rewrite the 6 files in Section 4, one at a time, in this order:
  1. `LoginScreen` (signup/login) → get a token end-to-end.
  2. `index.tsx` auth gate (token check on launch).
  3. `HomeScreen` (`GET /timelines`, delete, refresh on focus).
  4. `EditScreen` (create/update). Images still use local URIs (upload deferred to Phase 5).
  5. `SettingsScreen` (logout clears tokens).
- Delete `firebase.ts`; remove the `firebase` dependency.
- **Verify:** full manual run — signup → create timeline → view → edit → delete → logout → login.

### Phase 8 — Tests + docs (0.5–1 day)
- Update/repair existing Jest tests (they currently assume Firebase + a `"<"` back button that no longer matches the UI). Mock the API client.
- README: architecture diagram, how to run locally (start Postgres, `prisma migrate`, seed, start API, start Expo), env vars.
- **Deployment is deferred** — see Phase 10.

---

### Phase 9 — Google SSO (LATER — separate effort, after the above)
Additive only, thanks to §2a/§3a:
- Backend: `POST /auth/google` — verify Google ID token, find-or-create `users` + `auth_identities` (`provider='google'`), mint the same app JWT.
- Client: "Sign in with Google" via `expo-auth-session`; store the returned app token like before.
- **No schema migration, no data-route changes.**

### Phase 10 — Deployment (LATER — when ready to publish)
- Host API + Postgres (Railway/Render/Neon). Images to S3/R2 (pairs with Phase 5).
- Set production env vars; point the app's `API_BASE_URL` at the deployed API.
- Expo build/submit for the app stores.

**Core API/DB pass (Phases 1–8): ~6–8 working days.** Google SSO and deployment are deliberately after.

---

## 6. Optional Data Migration

If a live Firestore project exists (needs the `.env` `FIREBASE_*` values, which aren't in the repo), write a one-off script: read each `users/{uid}/timelines/*`, insert into Postgres, and upload referenced images (only possible if those images still exist somewhere reachable — local `file://` URIs won't be). For a resume project, starting fresh is usually fine; note the migration script as a stretch goal.

---

## 7. Resume Framing (what to write)

- "Migrated a React Native app from Firebase/Firestore (NoSQL) to a **normalized PostgreSQL** schema (Prisma ORM) behind a **custom REST API** (Node/Express), with **JWT auth** (access/refresh, bcrypt) designed to be **provider-agnostic** (added Google SSO as an additive login path)."
- Talking points for interviews: why you migrated (events weren't independently queryable); the client–server auth boundary; the `users`/`auth_identities` split that made SSO additive; the event-sync transaction; and the real-time tradeoff you accepted.

---

## 8. Risks / Watch-Outs

- **Auth persistence on mobile:** use `expo-secure-store` for tokens; handle 401→refresh centrally.
- **Losing real-time updates:** re-fetch on screen focus; don't over-engineer with websockets early.
- **Event sync on `PUT`:** do it in a `prisma.$transaction([...])` to avoid partial writes.
- **Images (deferred):** this pass keeps local `file://` URIs — portability is a known limitation until Phase 5. No upload work now.
- **CORS / network:** Expo on a device can't reach `localhost`; use your machine's LAN IP or a tunnel for dev.
- **SSO-readiness:** don't shortcut by putting a password on `users` — keep `auth_identities` separate (§2a) so Phase 9 stays additive.
- **Scope creep:** email verification via real email, refresh-token rotation, and pagination are all stretch goals — ship the core loop first.

---

## 9. Suggested First Step

Scaffold `server/` (Phase 1) against your **existing Homebrew Postgres** (`createdb timelineapp`), write `schema.prisma` for the five tables, run `prisma migrate dev`, and seed a test user + sample timeline (Phase 2). Verify with `npx prisma studio`. That's a self-contained, verifiable, fully-local milestone before touching the client.

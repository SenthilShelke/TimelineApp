# TimelineApp

A cross-platform mobile app (Expo / React Native) for creating personal **timelines** made of dated **events** with images. Originally backed by Firebase/Firestore, now migrated to a **self-hosted backend**: an Express + Prisma REST API over PostgreSQL, with JWT authentication.

## Architecture

```
┌──────────────────┐   HTTP POST/GET    ┌──────────────────┐   Prisma (SQL)   ┌────────────┐
│  Expo app        │ ─────────────────► │  Express API     │ ───────────────► │ PostgreSQL │
│  (React Native)  │ ◄───────────────── │  (server/)       │ ◄─────────────── │            │
└──────────────────┘   Bearer JWT       └──────────────────┘                  └────────────┘
```

Two parts, run separately:

| Part | Folder | Command | Purpose |
|------|--------|---------|---------|
| **Mobile app** | repo root | `npx expo start` | The React Native UI |
| **Backend API** | `server/` | `npm run dev` | Express REST API + Postgres access |

The app talks to the backend over HTTP (never directly to the database). Auth uses app-issued JWTs; every data route is scoped to the authenticated user.

## Data model (PostgreSQL)

```
users ──┬── auth_identities   (how a user logs in: provider="password" now, "google" later)
        └── timelines ──── events ──── event_images
```

- `users` holds profile only — **no password column** (credentials live in `auth_identities`).
- The `users`/`auth_identities` split makes future Google SSO additive (a new identity row, no schema change).
- `timelines → events → event_images` is the normalized data hierarchy, all FK-scoped to a user.

## Prerequisites

- Node.js 18+
- PostgreSQL 16 (local). On macOS: `brew install postgresql@16 && brew services start postgresql@16`

## Running the backend

```bash
cd server
npm install
createdb timelineapp                 # one-time: create the local database
npm run prisma:migrate               # apply the schema (creates tables)
npm run seed                         # optional: insert a demo user + sample timeline
npm run dev                          # start the API on http://localhost:4000
```

Environment (`server/.env`):

```
DATABASE_URL="postgresql://<your-pg-role>@localhost:5432/timelineapp"
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
PORT=4000
```

Useful backend scripts (run inside `server/`):

- `npm run dev` — start API in watch mode
- `npm run seed` — reset to demo data
- `npm run prisma:studio` — visual DB browser at http://localhost:5555
- `npm run prisma:migrate` — create/apply migrations

### API endpoints

```
POST   /auth/signup      { email, password }        -> { user, accessToken, refreshToken }
POST   /auth/login       { email, password }         -> { user, accessToken, refreshToken }
POST   /auth/refresh     { refreshToken }             -> { accessToken }
GET    /auth/me                                       -> { user }            (Bearer)
GET    /timelines                                     -> [ Timeline ]        (Bearer)
POST   /timelines        { title, events? }           -> Timeline            (Bearer)
GET    /timelines/:id                                 -> Timeline            (Bearer)
PUT    /timelines/:id    { title, events }            -> Timeline            (Bearer)
DELETE /timelines/:id                                 -> 204                 (Bearer)
GET    /health                                        -> { status, db }
```

## Running the app

```bash
# from the repo root
npm install
npx expo start
```

Environment (`.env` at repo root):

```
API_BASE_URL=http://localhost:4000
```

- **iOS simulator** can reach `http://localhost:4000` directly.
- **Physical device / Android emulator** cannot — set `API_BASE_URL` to your machine's LAN IP, e.g. `http://192.168.1.50:4000`.

The client API layer lives in `api/` (`client.ts`, `auth.ts`, `timelines.ts`, `tokenStore.ts`, `types.ts`). Tokens are stored via AsyncStorage (migrate to `expo-secure-store` for production).

## Testing

App component tests (Jest + React Native Testing Library):

```bash
npm run test:ci        # run once
npm test               # watch mode
```

## Project status

- ✅ Backend: auth (email/password) + full timeline/event CRUD, user-scoped
- ✅ App rewired to the API; Firebase removed
- ✅ Component tests passing
- ⏳ Deferred: image upload to object storage (images currently use local URIs)
- ⏳ Planned: Google SSO (additive — new `/auth/google` route + identity row)
- ⏳ Planned: deployment (API + Postgres hosting)

See `MIGRATION_PLAN.md` for the full phased plan and `PROJECT_ANALYSIS.md` for the original analysis.

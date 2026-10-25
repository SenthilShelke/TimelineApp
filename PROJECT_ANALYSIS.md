# TimelineApp — Project Analysis

## 1. What the App Does

TimelineApp (internal name `FirstNativeApp`) is a cross-platform mobile app built with **Expo / React Native** that lets users create and view personal **timelines** made up of dated **events**. Each event can carry a title, a date, a description, and up to a handful of images. Events are laid out chronologically on a horizontal timeline, and a dedicated "view" mode presents them one at a time as a slideshow with image auto-rotation.

Core user-facing features:

- **Email/password authentication** with email-verification gating (Firebase Auth).
- **Create / edit timelines** — add a title and any number of events.
- **Event editor** — pick a date, write a title/description, attach images from the library or camera.
- **Timeline list (Home)** — see all of your timelines, edit or delete them.
- **View mode** — step through a timeline's events chronologically, with animated transitions and an auto-advancing image carousel.
- **Theming** — 9 built-in color themes selectable at runtime.
- **Settings** — switch themes, send feedback via email, log out, view app info.

## 2. Technology Stack

| Area | Technology |
|------|------------|
| Framework | Expo SDK 53, React Native 0.79, React 19 |
| Language | TypeScript (~5.8) |
| Navigation | `@react-navigation/stack` (native stack inside Expo Router root) + `expo-router` |
| Backend | Firebase (Auth + Cloud Firestore), Firebase JS SDK v11 |
| Animations | `react-native-reanimated`, RN `Animated` |
| Media | `expo-image-picker` (+ `react-native-image-picker` imported but largely unused) |
| Dates | `@react-native-community/datetimepicker`, `date-fns` (installed, not heavily used) |
| Storage (local) | `@react-native-async-storage/async-storage` (imported in Settings, not actively used) |
| IDs | `uuid` + `expo-crypto` (installed); runtime code mostly uses a custom `simpleId()` |
| Testing | Jest + `jest-expo` + `@testing-library/react-native` |
| Config | `react-native-dotenv` / `babel-plugin-dotenv-import` reading `@env` |

## 3. Application Structure

```
TimelineApp/
├── app/                      # Screens (routed)
│   ├── _layout.tsx           # Expo Router root — wraps app in ThemeProvider + Stack
│   ├── index.tsx             # Auth gate + React Navigation stack (Login/Home/Edit/View/Settings)
│   ├── LoginScreen.tsx       # Sign up / log in / email verification
│   ├── HomeScreen.tsx        # Lists user's timelines (live Firestore listener)
│   ├── EditScreen.tsx        # Create/edit a timeline and its events; saves to Firestore
│   ├── TimelineScreen.tsx    # "View" mode slideshow (read-only)
│   └── SettingsScreen.tsx    # Theme switch, feedback, logout, app info
├── components/
│   ├── TimelineButton.tsx    # One row in the Home list (navigate to View / Edit / delete)
│   ├── Timeline.tsx          # Horizontal chronological strip of EventIcons
│   ├── EventIcon.tsx         # A single event node on the timeline (tap to edit/delete)
│   ├── EventEditor.tsx       # Modal form to create/edit an event (date, title, desc, images)
│   └── ThemeSwitcher.tsx     # Theme picker grid
├── theme/
│   ├── themes.ts             # 9 ColorTheme definitions + ColorTheme type
│   └── ThemeContext.tsx      # React context providing { theme, setTheme }
├── firebase.ts               # Firebase init (auth, db) from @env config
├── env.d.ts                  # Types for @env variables
├── tests/                    # Jest component tests
└── app-example/              # Default Expo starter template (unused scaffolding)
```

### Navigation architecture (note a structural quirk)

There are effectively **two navigators**:

1. `app/_layout.tsx` is the Expo Router root. It renders a `<Stack>` with an `index` screen.
2. `app/index.tsx` then mounts its **own** React Navigation `createStackNavigator` containing `Login`, `Home`, `Edit`, `View`, `Settings`.

So all real navigation happens inside the stack defined in `index.tsx`; Expo Router is only used to host it. This works but is an unusual hybrid — the other files in `app/` (HomeScreen, EditScreen, etc.) are **not** used as Expo Router routes, they are children of the nested React Navigation stack.

## 4. Data Model

### 4.1 Entities

The domain model is two nested shapes: **Timeline** has many **Events**.

```ts
// Timeline
type Timeline = {
  id: string;        // custom simpleId() or route-provided id
  title: string;
  events: Event[];
};

// Event
type Event = {
  id: string;        // simpleId()
  title: string;
  date: string;      // ISO 8601 string (Date.toISOString())
  description: string;
  images: string[];  // array of local image URIs
};
```

These types are declared inline (duplicated) across `EditScreen`, `Timeline`, `EventIcon`, `EventEditor`, `TimelineButton`, and `TimelineScreen` rather than in one shared module.

### 4.2 Firestore layout

Data is stored per-user in Cloud Firestore under a nested sub-collection:

```
users/{uid}/timelines/{timelineId}
    ├── id:     string
    ├── title:  string
    └── events: Event[]          # events stored as an embedded array on the timeline doc
```

Key points:

- Each **timeline is a single document**; its events are an **embedded array field**, not a sub-collection. This keeps reads/writes atomic per timeline but caps size and makes per-event querying impossible.
- **Images are stored as device-local URIs** (e.g. `file://...`) inside the `images` array. They are **not uploaded to Firebase Storage**. This means images will not survive across devices or reinstalls, and will break on other users' devices — a significant limitation of the current state.
- There is no user profile document; `uid` is only used as a path segment.

### 4.3 Auth model

- Firebase Auth email/password.
- A user is treated as "logged in" only if `user.emailVerified === true` (see `app/index.tsx`); unverified accounts are treated as logged out.
- There is no persistence configuration passed to `getAuth` (default web persistence), which in React Native can produce auth-persistence warnings and may not retain sessions reliably.

## 5. Data Flow

### 5.1 Authentication flow

```
LoginScreen
  ├── Sign Up  → createUserWithEmailAndPassword → sendEmailVerification → "check inbox"
  └── Log In   → signInWithEmailAndPassword → navigation.replace("Home")

app/index.tsx
  └── onAuthStateChanged → if (user && user.emailVerified) setUser(user)
                           initialRouteName = user ? "Home" : "Login"
```

### 5.2 Reading timelines (Home)

```
HomeScreen (useEffect on mount)
  └── auth.onAuthStateChanged(user)
        └── if user: collection(db, "users", uid, "timelines")
              └── onSnapshot(query)  ── real-time listener ──►  setTimelines([...])
        └── if no user: setTimelines([])
```

The Home list is **reactive**: any create/update/delete in Firestore (including from `EditScreen`) pushes a new snapshot that re-renders the list automatically.

### 5.3 Creating / editing a timeline (Edit)

```
TimelineButton (Home)  ── "Edit" ──►  navigation.navigate("Edit", { id, title, events })

EditScreen
  state: timelineTitle, events[]
  ├── Add Event      → opens EventEditor modal → handleSaveEvent → events.push(newEvent)
  ├── Tap Event node → EventIcon opens EventEditor → handleUpdateEvent(index, updatedEvent)
  ├── Delete Event   → handleDeleteEvent(id) → events.filter(...)
  └── Save Timeline  → handleSaveTimeline
        └── setDoc(doc(db,"users",uid,"timelines",timelineId), { id, title, events })
        └── navigation.goBack()
              ↑ Home's onSnapshot fires → list updates
```

Notes:
- New-vs-existing is decided by `route.params?.id ?? simpleId()`.
- Events are passed in via navigation params (not re-fetched), and the whole timeline is rewritten on save with `setDoc` (full overwrite, not a merge).

### 5.4 Viewing a timeline (View)

```
TimelineButton (tap row)  ── navigation.navigate("View", { id, title, events })

TimelineScreen
  ├── sorts events ascending by date
  ├── Prev / Next chevrons → fadeToEvent(index) (opacity animation)
  └── per-event image carousel → auto-advances every 3s with slide animation
```

View mode is **read-only** and operates entirely on the `events` passed through navigation params — it does not read Firestore directly.

### 5.5 Deleting a timeline

```
TimelineButton → confirm Alert → onDelete(id)
HomeScreen.handleDeleteTimeline(id)
  └── deleteDoc(doc(db,"users",uid,"timelines",id))
  └── (also optimistically filters local state; snapshot would do this anyway)
```

### 5.6 Theming flow

```
_layout.tsx wraps everything in ThemeProvider
ThemeContext holds { theme, setTheme } (in-memory React state)
SettingsScreen → ThemeSwitcher → setTheme(selectedTheme) → all screens restyle
```

Theme selection is **not persisted** — it resets on app restart. Also, `ThemeProvider` initializes to `themes[1]` ("Ocean") even though the default-looking entry is `themes[0]` ("Default").

## 6. Current State Assessment

### What works / is implemented
- End-to-end auth with email verification gate.
- Full timeline CRUD backed by Firestore with live updates on Home.
- Event editor with date picker, description, and image picking (library + camera).
- Chronological sorting in both edit and view.
- Animated view-mode slideshow with image carousel.
- Runtime theming across all screens, 9 themes.
- A Jest test suite covering Home and Edit/Event flows.

### Issues, risks, and rough edges observed in the code

1. **Images are local URIs only** — not uploaded to Firebase Storage. They will not sync across devices and will break for any other viewer. This is the most impactful functional gap for a cloud-backed app.
2. **No theme or auth persistence** — AsyncStorage is imported in Settings but unused for persistence; theme resets on restart; Firebase Auth has no RN persistence configured.
3. **Duplicated inline types** — the `Event`/`Timeline` shapes are redeclared in ~6 files. A shared `types.ts` would reduce drift.
4. **Dead/duplicate code**:
   - `TimelineScreen.tsx` has a second `StyleSheet.create` (hardcoded colors) at the bottom that shadows the themed `getStyles` and is never used.
   - `react-native-image-picker` is imported in `EventEditor` but the Expo picker is what's actually used.
   - Several installed deps (`date-fns`, `expo-media-library`, `react-native-view-shot`, `uuid`) appear unused at runtime.
5. **Inconsistent image limits** — `pickImage` enforces a max of 6 while the alert text says 3; `takePhoto` enforces 3. Logic and copy disagree.
6. **Tests appear out of sync with the UI**:
   - `Editscreen.test.tsx` looks for a back button with text `"<"`, but the screen renders an `Ionicons` icon, so that test would fail.
   - `Homescreen.test.tsx` expects `navigation.navigate("Edit")` with no params (matches current code), but these tests likely need Firebase/auth mocks to run cleanly given the `onAuthStateChanged` listener.
7. **Hybrid navigation** — Expo Router root hosting a nested React Navigation stack is functional but non-idiomatic; it bypasses Expo Router's file-based routing for the real screens.
8. **Firebase config via `@env`** — requires a populated `.env` (not committed). Without it, `firebase.ts` initializes with `undefined` config values and auth/Firestore calls will fail. No Firestore security rules are present in the repo.
9. **ID generation** — `simpleId()` (8 random base36 chars) is used instead of the installed `uuid`; collision handling exists only in one spot (`EditScreen` dedupe loop).
10. **Leftover scaffolding** — `app-example/` is the default Expo template and is unused.

### Overall
The app is a **functional MVP**: a themed, authenticated, cloud-synced timeline journal. The primary blocker for real multi-device use is **image persistence** (local URIs instead of cloud storage). Secondary priorities are persisting theme/auth state, consolidating shared types, removing dead code, and realigning the test suite with the current UI.

## 7. Suggested Next Steps (if continuing development)

1. Upload images to Firebase Storage and store download URLs in the `images` array.
2. Add a shared `types.ts` for `Timeline` and `Event`.
3. Configure RN-persistent Firebase Auth (`initializeAuth` with `getReactNativePersistence(AsyncStorage)`).
4. Persist the selected theme (AsyncStorage) and fix the default theme index.
5. Add Firestore security rules scoped to `users/{uid}`.
6. Fix the image-limit inconsistency and remove the dead stylesheet/unused imports.
7. Update/repair the Jest tests (mock Firebase; match the real back-button UI).

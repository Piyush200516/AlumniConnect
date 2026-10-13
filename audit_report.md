# AlumniConnect — Production Audit Report (STEP 1)

> Deployment: Frontend → Cloudflare Pages (`https://alumniconnect-7ag.pages.dev`)  
> Backend → Render (`https://<render-url>`)  
> Scanned: frontend/src, backend/src, config files, routes, services, middleware

---

## 🔴 HIGH SEVERITY

---

### H1 — WebSocket URL falls back to `ws://localhost:5002` in production
| Field | Detail |
|---|---|
| **File** | `frontend/src/hooks/useWebSocket.ts` · Line 43 |
| **Problem** | `const baseUrl = import.meta.env.VITE_WS_URL \|\| 'ws://localhost:5002'` — `VITE_WS_URL` is **not defined** in Cloudflare Pages env. The fallback `ws://` is plain HTTP, not encrypted. Cloudflare Pages always runs over HTTPS, so browsers will **block** a `ws://` connection from an `https://` origin (mixed content). This kills the entire real-time chat + online-user-status system. |
| **Root cause** | `VITE_WS_URL` env var never set in Cloudflare; hardcoded `ws://` (not `wss://`) fallback. |
| **Severity** | **HIGH** |

**Fix:** Derive the WebSocket URL automatically from `VITE_API_BASE_URL` (which IS configured on Cloudflare) by stripping `/api` and replacing the protocol. No new env var needed.

---

### H2 — Socket.IO (`SocketProvider`) and native WS (`useWebSocket`) are BOTH active simultaneously — duplicate connections
| Field | Detail |
|---|---|
| **Files** | `frontend/src/components/layout/SocketProvider.tsx`, `frontend/src/hooks/useWebSocket.ts`, `frontend/src/App.tsx` |
| **Problem** | The app wraps everything with `<SocketProvider>` (uses **socket.io-client**), AND pages that use chat also call `useWebSocket` (native **WebSocket** API). The backend runs **both** `setupSocket` (Socket.IO on `/socket.io/`) **and** `setupWebSocketServer` (native `ws` on `/ws`). Chat messages go through the native WS. Notifications go through Socket.IO. A user connecting to chat will hold **two** separate authenticated connections simultaneously. The `SocketProvider` only handles presence/notifications; `useWebSocket` handles chat. This is a design split but it works — however, if `SocketProvider` cannot connect (wrong URL), notifications will silently fail. |
| **Root cause** | Dual realtime system — socket.io for notifications/presence + native ws for chat. The socket.io CORS in `socket.ts` Line 23 uses `process.env.FRONTEND_URL \|\| 'http://localhost:5173'` — if `FRONTEND_URL` env is not set on Render, Socket.IO will reject the Cloudflare Pages origin. |
| **Severity** | **HIGH** |

**Fix:** Ensure `FRONTEND_URL` is set correctly on Render (`https://alumniconnect-7ag.pages.dev`). The code already reads `process.env.FRONTEND_URL` — it just needs to be configured.

---

### H3 — `VITE_API_BASE_URL` not set on Cloudflare Pages → all API calls go to `localhost:5002`
| Field | Detail |
|---|---|
| **File** | `frontend/src/services/api.ts` Line 3, `frontend/.env` Line 1 |
| **Problem** | `.env` has `VITE_API_BASE_URL=http://localhost:5002/api`. Cloudflare Pages uses build-time env vars. If `VITE_API_BASE_URL` is not set in Cloudflare Pages dashboard → build embeds `http://localhost:5002/api` into the production bundle → **every API call fails**. |
| **Root cause** | Local `.env` value baked into production build if Cloudflare Pages env not configured. |
| **Severity** | **HIGH** |

**Fix (code-side):** The fallback default `DEFAULT_API_BASE_URL` in `api.ts` Line 3 should point to the actual Render backend URL, not localhost. This makes it safe even if the env var is absent.

---

### H4 — OAuth callback URL hardcoded to localhost in `passport.ts`
| Field | Detail |
|---|---|
| **File** | `backend/src/config/passport.ts` Line 40–49 |
| **Problem** | `const defaultBackendUrl = \`http://localhost:${process.env.PORT \|\| 5002}\`` — when `BACKEND_URL` and `GOOGLE_CALLBACK_URL` / `GITHUB_CALLBACK_URL` are not set in Render, the OAuth callbacks register with Google/GitHub as `http://localhost:5002/api/auth/google/callback`. Google/GitHub will reject this redirect URI because it doesn't match the registered production URL. **Google OAuth and GitHub OAuth will both fail completely.** |
| **Root cause** | Fallback callback URL is localhost instead of production backend URL. |
| **Severity** | **HIGH** |

**Fix:** Change the `defaultBackendUrl` fallback from `http://localhost:...` to an empty string or the well-known Render URL pattern. Alternatively, ensure `BACKEND_URL` is set on Render. Code-side: guard against empty `defaultBackendUrl` gracefully.

---

### H5 — Email links in verification/reset emails use `localhost:5173` fallback
| Field | Detail |
|---|---|
| **File** | `backend/src/utils/email.ts` Lines 8–9 |
| **Problem** | `const FRONTEND_URL = process.env.FRONTEND_URL \|\| "http://localhost:5173"`. This constant is **resolved at module load time** (not per-request). In production on Render, if `FRONTEND_URL` env is set — it works. But the `sendPasswordResetEmail` function also calls `nodemailer.getTestMessageUrl(info)` on Line 71 **unconditionally** — in production with a real SMTP provider, `getTestMessageUrl` returns `false` (not a URL), and logging `false` is harmless but indicates the code was written/tested only for Ethereal dev mode. |
| **Root cause** | `FRONTEND_URL` must be set on Render. Code-side: `getTestMessageUrl` should be conditional on non-production. |
| **Severity** | **HIGH** (if `FRONTEND_URL` is missing on Render, password reset links go to localhost — users can't reset passwords) |

---

### H6 — `mail.ts` in production uses SMTP but will silently fail if SMTP credentials missing
| Field | Detail |
|---|---|
| **File** | `backend/src/config/mail.ts` Lines 24–39 |
| **Problem** | In production (`NODE_ENV=production`), the transporter is created with `host=undefined`, `port=587`, `auth=undefined` (if `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are not set). `nodemailer.createTransport()` with `host=undefined` will not throw immediately — it silently creates an invalid transporter. Every `sendMail()` call will then throw a runtime error. In `sendPasswordResetEmail` this error is **re-thrown**, which will crash the `forgotPassword` endpoint. For `sendVerificationEmail`, the error is swallowed (background call), so signup still works — but emails are lost. |
| **Root cause** | No guard when SMTP env vars are missing in production — creates broken transporter. |
| **Severity** | **HIGH** |

**Fix:** Check if SMTP credentials exist; if not, log a warning and mock the transporter (no-op). Do NOT crash the server or endpoint.

---

### H7 — File upload local fallback returns `http://localhost:...` URL in production
| Field | Detail |
|---|---|
| **File** | `backend/src/services/student.service.ts` Lines 106–120 |
| **Problem** | When `CLOUDINARY_*` env vars are missing, files are written to local `uploads/` folder and a URL like `http://localhost:5002/uploads/filename` is returned and stored in the database. On Render: (a) the ephemeral filesystem means uploaded files disappear on redeploy, (b) the URL with localhost will be unreachable from the browser. Any profile photo or resume uploaded without Cloudinary configured will be permanently broken. |
| **Root cause** | Fallback `backendUrl` defaults to `http://localhost:${PORT}` (Line 118). |
| **Severity** | **HIGH** |

**Fix (code-side):** Change the fallback `backendUrl` to use `process.env.BACKEND_URL` with a safe default, e.g., `process.env.BACKEND_URL || ''`. If `BACKEND_URL` is not set and Cloudinary isn't configured, throw a descriptive `ApiError` instead of returning a broken localhost URL.

---

### H8 — `prisma generate` may not run before `tsc` during Render build
| Field | Detail |
|---|---|
| **File** | `backend/package.json` Line 8: `"build": "prisma generate && tsc"` |
| **Problem** | This is actually correct — `prisma generate` runs before `tsc`. The `render.yaml` also explicitly runs `npx prisma generate` in the build command. **However**, the `postinstall` hook (`"postinstall": "prisma generate"`) runs during `npm install` — which happens first on Render. So `prisma generate` runs twice. This is harmless but means if `prisma generate` fails during `postinstall` (e.g. due to DATABASE_URL not being available at build time), the build will fail even before reaching the explicit `prisma generate && tsc` step. |
| **Root cause** | Neon PostgreSQL's `prisma generate` doesn't require `DATABASE_URL` (just the schema) — but the `@prisma/adapter-pg` used here is a **runtime driver adapter**, not a build-time concern, so generation should succeed. This is actually **Low** risk but worth noting. |
| **Severity** | **Medium** (see M5) |

---

## 🟡 MEDIUM SEVERITY

---

### M1 — `SocketProvider` (Socket.IO) connects without checking user auth — logs `Failed to parse userId from token` silently
| Field | Detail |
|---|---|
| **File** | `frontend/src/components/layout/SocketProvider.tsx` Lines 21–24 |
| **Problem** | The `try/catch` around `atob(user.token.split('.')[1])` will catch malformed JWTs, log an error, and set `userId = ''`. The socket still connects with `query: { userId: '' }`. The backend Socket.IO middleware (`socket.ts` L29–71) verifies the token via `verifyAccessToken` — if the token is valid, this won't cause auth failure. But if `userId` is empty in the query, any server-side code relying on `req.query.userId` (none currently) would get an empty string. Low practical impact but indicates fragile code. |
| **Severity** | **Low** |

---

### M2 — 401 on API calls does NOT automatically log the user out / refresh token
| Field | Detail |
|---|---|
| **File** | `frontend/src/services/api.ts` Lines 28–34, `frontend/src/hooks/useAuth.ts` |
| **Problem** | The Axios instance only has a **request** interceptor (attaches token). There is **no response interceptor** to handle `401 Unauthorized` responses. When the JWT expires (default 7 days), all API calls will silently fail — the user will see loading spinners or empty data, not a redirect to login. There is no token refresh flow at all (`generateRefreshToken` returns a signed JWT but the frontend never uses it). |
| **Root cause** | Missing Axios response interceptor for 401 handling; refresh token flow not implemented. |
| **Severity** | **Medium** |

---

### M3 — `refreshProfile` called on every window focus event — excessive API calls
| Field | Detail |
|---|---|
| **File** | `frontend/src/components/layout/AuthProvider.tsx` Lines 342–358 |
| **Problem** | Both `window.addEventListener('focus', syncProfile)` and `document.addEventListener('visibilitychange', handleVisibilityChange)` trigger `refreshProfile()` (a `/student/profile` API call). The React Query config has `refetchOnWindowFocus: false` to prevent this, but this manual listener bypasses React Query. Every time a user switches tabs and comes back, a network request is made. |
| **Severity** | **Low** |

---

### M4 — Route order conflict: `/jobs/create` clashes with `GET /jobs/:id`
| Field | Detail |
|---|---|
| **File** | `backend/src/routes/job.routes.ts` Lines 18–37 |
| **Problem** | `router.get('/:id', ...)` is defined (Line 25) **before** `router.post('/create', ...)` (Line 33). For GET requests, Express will match `/create` as `id='create'` if someone ever does `GET /api/jobs/create`. For POST, there's no conflict. This is a latent bug. More critically, `router.put('/applications/:appId/status', ...)` (Line 69) — this path has a literal segment `applications` before the param. But `router.get('/:id/applications', ...)` (Line 62) could potentially shadow any GET to `/:id/applications`. The ordering is fine for the methods used, but it's fragile. |
| **Severity** | **Low** |

---

### M5 — `prisma generate` in `postinstall` may fail on Render if schema references env vars
| Field | Detail |
|---|---|
| **File** | `backend/package.json` Line 9 |
| **Problem** | On Render, `npm install` runs in the build environment where env vars may not yet be available. `prisma generate` reads the schema (no DB connection needed) — this is safe. But `@prisma/adapter-pg` is a **runtime** adapter — at generation time, Prisma CLI generates client code based on the schema, not the adapter. So generation succeeds without `DATABASE_URL`. This is **not a bug** — including it for completeness. |
| **Severity** | **Low** |

---

### M6 — Alumni profile `NOT FOUND` on `/alumni/me` causes 404 → logout loop
| Field | Detail |
|---|---|
| **File** | `frontend/src/components/layout/AuthProvider.tsx` Lines 234–247, `backend/src/services/alumni.service.ts` Line 34–36 |
| **Problem** | When `GET /api/alumni/me` returns 404 (alumni profile not found in DB), `AuthProvider` catches the 401/403 and calls `logout()` (Lines 244–246). A 404 is **not** caught — the `alumniProfile` stays `null`, the dashboard shows empty data. However, if a newly signed-up alumni somehow triggers a server error (500) for their profile, the status check only triggers logout on 401/403, not 500. This means a broken alumni profile state is silently swallowed. |
| **Severity** | **Low** |

---

### M7 — `console.log` in login flow exposes token in browser console
| Field | Detail |
|---|---|
| **File** | `frontend/src/hooks/useAuth.ts` Lines 30, 34 |
| **Problem** | `console.log("Login Request", payload)` and `console.log("API Response", res)` — the response includes `accessToken` and `refreshToken` in plaintext. This is visible to anyone opening DevTools in production. |
| **Severity** | **Medium** (security concern) |

---

### M8 — `auth.routes.ts` has orphaned `console.log` statements at module load
| Field | Detail |
|---|---|
| **File** | `backend/src/routes/auth.routes.ts` Lines 51, 85, 96, 130 |
| **Problem** | `console.log('✅ Route registered: GET /api/auth/google')` — these fire every time the module is loaded (server start). While harmless, they should be `logger.debug` or removed for production cleanliness. |
| **Severity** | **Low** |

---

### M9 — `sendPasswordResetEmail` calls `nodemailer.getTestMessageUrl(info)` unconditionally in production
| Field | Detail |
|---|---|
| **File** | `backend/src/utils/email.ts` Lines 71–74 |
| **Problem** | `nodemailer.getTestMessageUrl(info)` returns `false` when the transporter is not Ethereal (i.e., in production with real SMTP). The `if (previewUrl)` guard prevents crashing, but it's misleading — the function is designed to work with both Ethereal and real SMTP but only Ethereal produces a preview URL. This should be guarded by `process.env.NODE_ENV !== 'production'`. |
| **Severity** | **Low** |

---

### M10 — Dual `bcrypt` packages installed: `bcrypt` + `bcryptjs`
| Field | Detail |
|---|---|
| **File** | `backend/package.json` Lines 22–23 |
| **Problem** | Both `bcrypt` (native binding, requires Python/build tools) and `bcryptjs` (pure JS) are listed as dependencies. The code consistently uses `bcryptjs` (correct). But `bcrypt` is a dead dependency that bloats the Docker/Render build and can cause build failures on environments without native build tools (Python, node-gyp). |
| **Severity** | **Medium** |

---

### M11 — `@tanstack/react-table` is a backend dependency (wrong location)
| Field | Detail |
|---|---|
| **File** | `backend/package.json` Line 21 |
| **Problem** | `"@tanstack/react-table": "^8.21.3"` is listed in backend dependencies. This is a **React** UI library — it has no business being in a Node.js backend. It adds ~500KB to the backend bundle needlessly. |
| **Severity** | **Low** |

---

### M12 — `crypto` listed as an explicit npm dependency (it's a Node.js built-in)
| Field | Detail |
|---|---|
| **File** | `backend/package.json` Line 27 |
| **Problem** | `"crypto": "^1.0.1"` — this is a legacy npm shim for browser environments. Node.js has `crypto` built-in. Installing this package can shadow the native Node.js `crypto` module with an older shim version, potentially causing subtle differences. |
| **Severity** | **Low** |

---

### M13 — `express-session` and `cookie-parser` installed but never used in any route/middleware
| Field | Detail |
|---|---|
| **File** | `backend/package.json` Lines 25, 30 |
| **Problem** | `express-session` and `cookie-parser` are listed as dependencies but `app.use(session(...))` and `app.use(cookieParser())` are **not** in `server.ts`. The app uses JWT (stateless), so sessions are not needed. Dead dependencies that add attack surface and install time. |
| **Severity** | **Low** |

---

## 🟢 LOW SEVERITY / INFORMATIONAL

---

### L1 — `public/_redirects` exists and is correct (SPA routing OK)
| Field | Detail |
|---|---|
| **File** | `frontend/public/_redirects` |
| **Status** | `/* /index.html 200` — ✅ Cloudflare Pages SPA routing is handled correctly. Deep-link refreshes (e.g., `/student/dashboard`) will serve `index.html`. |

---

### L2 — CORS configuration is overly permissive but not a breakage
| Field | Detail |
|---|---|
| **File** | `backend/src/server.ts` Lines 43–56 |
| **Problem** | The CORS `origin` callback has `return callback(null, true)` as the final fallback (Line 53) — meaning **every origin is accepted**, even ones not in `allowedOrigins`. This makes the CORS check meaningless. Credentials (`credentials: true`) with wildcard-equivalent origin acceptance is a security weakness (CORS bypass). The explicit `allowedOrigins` list is never actually enforced. |
| **Severity** | **Low** (not a functionality breakage, but a security concern) |

---

### L3 — JWT secret falls back to `'super-secret-change-me'` if `JWT_SECRET` not set
| Field | Detail |
|---|---|
| **File** | `backend/src/utils/jwt.ts` Line 4 |
| **Problem** | `const JWT_SECRET = process.env.JWT_SECRET ?? 'super-secret-change-me'` — Render's `render.yaml` uses `generateValue: true` for `JWT_SECRET`, so this should be auto-generated. But if someone deploys without `render.yaml`, all tokens are signed with a known public default, making them trivially forgeable. |
| **Severity** | **Low** |

---

### L4 — WebSocket heartbeat pings dead connections but never reconnects from server side
| Field | Detail |
|---|---|
| **File** | `backend/src/wsServer.ts` Lines 396–410 |
| **Status** | ✅ Server-side heartbeat (30s ping/pong) correctly terminates dead connections. Frontend (`useWebSocket.ts` Lines 146–159) implements exponential backoff reconnection. This is working correctly. |

---

### L5 — Google/GitHub OAuth: tokens passed as query params in redirect URL (security)
| Field | Detail |
|---|---|
| **File** | `backend/src/routes/auth.routes.ts` Lines 76, 121 |
| **Problem** | `redirectUrl = \`${FRONTEND_URL}${dashboardPath}?accessToken=${accessToken}&refreshToken=${refreshToken}\`` — sending JWT tokens as URL query parameters causes them to appear in: browser history, server access logs, and `Referer` headers. `AuthProvider.tsx` correctly reads and strips them from the URL (Line 163: `window.history.replaceState`), but they exist in plaintext in logs. |
| **Severity** | **Low** |

---

### L6 — `serviceAccount.json` (Firebase key) checked into backend directory
| Field | Detail |
|---|---|
| **File** | `backend/src/config/serviceAccount.json`, `backend/src/config/alumniconnect-9be89-firebase-adminsdk-fbsvc-9cc4b97146.json` |
| **Problem** | Firebase service account private keys are present as files. If the repo is public on GitHub, these keys are exposed and the Firebase project is compromised. `firebase.ts` already supports `FIREBASE_SERVICE_ACCOUNT` as an env var — the file-based approach should not be the default. |
| **Severity** | **High** (security) — but since this is a major project and may be a private repo, marking as **Low** for functionality. |

---

### L7 — Alumni controller hardcodes achievement strings (Line 683–686)
| Field | Detail |
|---|---|
| **File** | `backend/src/services/alumni.service.ts` Lines 683–686 |
| **Problem** | `achievements: ['TechMart Lead of the Quarter 2025', 'Distinguished College Alumnus Award 2024']` — hardcoded fake data returned for every alumni profile detail page. This should read from `alumni.achievements` DB field. |
| **Severity** | **Medium** |

---

## Summary Table

| # | File | Issue | Severity |
|---|---|---|---|
| H1 | `useWebSocket.ts:43` | WS falls back to `ws://localhost` (mixed content blocks it in prod) | 🔴 HIGH |
| H2 | `socket.ts:23` + `SocketProvider.tsx` | Socket.IO CORS uses localhost fallback if `FRONTEND_URL` not set | 🔴 HIGH |
| H3 | `api.ts:3` + `.env:1` | Axios baseURL fallback is localhost — all API calls fail if env not set | 🔴 HIGH |
| H4 | `passport.ts:40` | OAuth callback URL falls back to localhost — Google/GitHub OAuth broken | 🔴 HIGH |
| H5 | `email.ts:8-9` | Email links use localhost if `FRONTEND_URL` not set — reset links broken | 🔴 HIGH |
| H6 | `mail.ts:24-39` | SMTP transporter created with `host=undefined` if vars missing — crashes | 🔴 HIGH |
| H7 | `student.service.ts:118` | File upload fallback URL is `http://localhost:PORT` — broken URLs in DB | 🔴 HIGH |
| M2 | `api.ts` | No 401 response interceptor — expired tokens silently fail | 🟡 MED |
| M7 | `useAuth.ts:30,34` | `console.log` leaks access tokens in browser console | 🟡 MED |
| M10 | `package.json` | Both `bcrypt` + `bcryptjs` installed — native bcrypt may break Render build | 🟡 MED |
| M11 | `backend/package.json:21` | `@tanstack/react-table` in backend deps (wrong location) | 🟡 MED |
| L2 | `server.ts:53` | CORS origin callback always returns `true` — security weakness | 🟢 LOW |
| L3 | `jwt.ts:4` | JWT secret falls back to known default string | 🟢 LOW |
| L4 | `auth.routes.ts:51,85,96,130` | Orphaned `console.log` at module load | 🟢 LOW |
| L6 | `config/serviceAccount.json` | Firebase private key file may be in repo | 🟢 LOW |
| L7 | `alumni.service.ts:683` | Hardcoded achievement strings returned for all alumni | 🟢 LOW |

---

## Fix Priority Order (STEP 2)

1. **H1** — Fix WS URL: derive from `VITE_API_BASE_URL` with protocol swap (`https→wss`, `http→ws`)
2. **H3** — Change `DEFAULT_API_BASE_URL` fallback from localhost to actual Render URL
3. **H4** — Fix OAuth `defaultBackendUrl` fallback in `passport.ts`
4. **H2** — Ensure Socket.IO CORS is safe when `FRONTEND_URL` is empty
5. **H5 + H6** — Fix mail: guard SMTP missing credentials gracefully; fix `getTestMessageUrl` conditional
6. **H7** — Fix file upload fallback URL generation
7. **M2** — Add Axios 401 response interceptor
8. **M7** — Remove `console.log` of tokens
9. **M10** — Remove `bcrypt` native package (keep only `bcryptjs`)
10. **L7** — Fix hardcoded achievements in alumni service


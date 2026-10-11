# Quest Respond (v0)

One open question after the Sunday message. Attendees scan a QR code, answer on their phone,
and the answers show on the big screen as a word cloud or a wall of cards. The media team runs
it from `/admin`.

Spec: `planning/PLAN-v0.md`. Brand and copy rules: `planning/project context.md`.

## Surfaces

| Route     | Who        | What                                                              |
| --------- | ---------- | ----------------------------------------------------------------- |
| `/`       | attendee   | Join. Service title, "Welcome home.", join button. No name, no login. |
| `/answer` | attendee   | Open text answer, 80 characters. Waits until the question opens.  |
| `/sent`   | attendee   | Thank you, shows what was sent, "Change my answer" while open.    |
| `/screen` | projector  | Join view (QR + joined count) until a question opens, then Cloud or Wall. Blank = black. |
| `/admin`  | media team | Passcode once (kept in localStorage), then title, question, open/close, screen view, hide/show answers, reset. |

## Stack

- Bun 1.3 runtime. Hono server, SQLite through `bun:sqlite` at `DATA_DIR/respond.sqlite`.
- One process serves `/api/*` and the built client from `dist/`.
- Client: Vite, React 19, TypeScript, Tailwind v4, TanStack Router (code-based routes), lucide-react, `qrcode`.
- Realtime: Server-Sent Events on `/api/events` (`state` event on every change, heartbeat every 25s).
- Tests: Vitest (runs on Bun), Testing Library with jsdom.

Node is not needed. Every command runs with `bun`.

## Run locally

```sh
bun install
cp .env.example .env          # then set ADMIN_KEY
bun run dev:server            # API on http://localhost:3000 (bun loads .env)
bun run dev                   # client on http://localhost:5173, proxies /api to :3000
```

Production mode on one port:

```sh
bun run build
ADMIN_KEY=change-me bun run start   # http://localhost:3000
```

## Scripts

| Script              | What                                              |
| ------------------- | ------------------------------------------------- |
| `bun run dev`       | Vite dev server for the client                    |
| `bun run dev:server`| Bun API server with watch                         |
| `bun run build`     | Client build to `dist/`                           |
| `bun run start`     | Server plus built client                          |
| `bun run test`      | Vitest, all tests once                            |
| `bun run typecheck` | `tsc --noEmit` for the client and the server      |

## Environment

| Name         | Required | Default                                  | Notes |
| ------------ | -------- | ---------------------------------------- | ----- |
| `ADMIN_KEY`  | yes      | none, the server refuses to start        | Admin passcode. Sent by `/admin` as the `x-admin-key` header. Use 16 or more random characters. |
| `PUBLIC_URL` | no       | `https://mentiqueshies.questlaguna.org`   | QR code target and the address printed on screens. |
| `DATA_DIR`   | no       | `./data` (dev), `/data` (Docker image)   | Folder for `respond.sqlite`. |
| `PORT`       | no       | `3000`                                   | HTTP port. |

All values are read at runtime by the server. Nothing is baked into the client build, so no
build arguments are needed.

## API

All JSON responses use `{ ok: true, data }` or `{ ok: false, error }`.

| Method | Path                       | Auth  | Body / notes |
| ------ | -------------------------- | ----- | ------------ |
| GET    | `/api/health`              | none  | Liveness. |
| GET    | `/api/state`               | none  | Session, visible answers (hidden excluded), counts. `?answers=0` skips the answer list. Question text stays empty until the question opens. |
| GET    | `/api/events`              | none  | SSE. `state` event with the same payload as `/api/state`. `?answers=0` for phones. |
| POST   | `/api/join`                | none  | `{ deviceToken }`. Records a participant once per device. |
| POST   | `/api/answer`              | none  | `{ deviceToken, text }`. Trimmed, 1 to 80 characters. Upserts per device. 409 when the question is not open. 429 when the same device sends twice within 2s. |
| GET    | `/api/admin/state`         | admin | Everything, hidden answers included. Never device tokens. |
| PUT    | `/api/admin/session`       | admin | `{ title?, questionText?, questionStatus?, screenView? }`. Opening needs question text. |
| PUT    | `/api/admin/answers/:id`   | admin | `{ hidden }`. |
| POST   | `/api/admin/reset`         | admin | Deletes answers and participants, sets the question to hidden. Title and question text stay. |

Admin routes need the `x-admin-key` header. Bodies are validated (zod, strict) and capped at 8 KB.

Limits and safeguards:

- Ten wrong admin keys from one client lock that client out of `/api/admin/*` for 15 minutes (429).
  The client is the last `X-Forwarded-For` entry, which Traefik sets.
- Answer text: NFC normalized, trimmed, whitespace collapsed, zero-width and bidi control characters
  removed, at least one visible character, 80 characters at most (code points).
- At most 5,000 answers and 5,000 joined devices per session (503 after that). Reset clears both.
- Known limit: the per-device answer limit trusts the device token the phone generates, so a script
  can rotate tokens. There is no per-IP limit on purpose, because a whole church can share one Wi-Fi
  address. If a flood happens: Close question, then Reset session. A Traefik `rateLimit` middleware on
  `/api/answer` and `/api/join` is an option at the proxy.

## Deploy on Dokploy

1. Create an Application. Source: this repository. Build Type: **Dockerfile**, path `Dockerfile`,
   build context the repository root.
2. Environment: set `ADMIN_KEY` (long random value, for example `openssl rand -base64 24`).
   Set `PUBLIC_URL=https://mentiqueshies.questlaguna.org` (the default) or the real domain.
   `DATA_DIR` and `PORT` already have the right values in the image.
3. Volumes / Mounts: add a **Volume Mount** (named volume), mount path `/data`. The SQLite file
   lives there and survives redeploys. A named volume picks up the right owner from the image.
   A bind mount needs a host folder writable by uid 1000.
4. Domains: host `mentiqueshies.questlaguna.org`, container port **3000**, HTTPS on with
   Let's Encrypt. Point the DNS A record at the Dokploy server first.
5. Deploy. Check `https://mentiqueshies.questlaguna.org/api/health` returns `{"ok":true,...}`.
   The image also has a Docker `HEALTHCHECK` on that path.

Notes:

- Run one replica. State (SQLite, SSE subscribers, rate limits) lives in one process.
- SSE passes through Traefik as is. The server sends `Cache-Control: no-cache` and
  `X-Accel-Buffering: no`, and a heartbeat every 25s.

## Sunday checklist

1. Open `/admin`, enter the passcode.
2. Set the service title and the question. Save.
3. Put `/screen` on the projector (full screen). It shows the QR code and the joined count.
4. After the message: Open question. Pick Cloud or Wall. Hide any answer that should not show.
5. Close question when done. Blank screen when needed.
6. Next week: Reset session first.

## Project layout

```
server/            Hono app, SQLite, SSE, auth, validation
  routes/          public, admin and event routes
shared/            types, answer validation, limits (client and server)
src/
  routes/          TanStack Router route definitions
  features/phone/  Join, Answer, Sent
  features/screen/ Join, Cloud, Wall, word cloud logic, QR
  features/admin/  passcode gate and presenter panels
  components/      lockup, eyebrow, logo
  lib/             API client, SSE hook, device token, storage
public/            logo-mark.png
```

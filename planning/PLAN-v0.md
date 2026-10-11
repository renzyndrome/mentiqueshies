# Quest Respond v0: one question after Sunday service

Status: build today (2026-10-11). Deploy on Dokploy at https://mentiqueshie.questlaguna.org
Later sessions add: multiple questions, scale and choice types, analytics, Supabase.

## Scope of v0 (nothing more)

- Media team opens `/admin`, enters the admin passcode once (stored in localStorage).
- Admin sets: Sunday service title, one open-text question. Buttons: Open question,
  Close question, screen view (Cloud or Wall), Blank screen, Hide / show one answer,
  Reset session (clears answers, asks to confirm).
- Attendee scans QR, lands on `/` (phone Join). No name, no location, no login.
  Shows service title and "Welcome home." Button: "Join tonight's question".
- Attendee answers (open text, max 80 chars) at `/answer`. Then `/sent`.
  Resubmit replaces the previous answer from the same device.
- Big screen at `/screen`: when no question is open, show Join view (QR to site root,
  joined count). When open, show Cloud or Wall view per admin choice. Blank = black.
- Realtime: Server-Sent Events. Phones and screen subscribe to `/api/events`.

## Stack (decided for v0)

- Bun 1.3 runtime (Node is NOT installed on this machine; use `bun` for everything).
- Server: Hono on Bun. SQLite via `bun:sqlite`, file at `DATA_DIR/respond.sqlite`.
  Single process serves `/api/*` and the built client from `dist/`.
- Client: Vite + React 19 + TypeScript, Tailwind v4 (`@tailwindcss/vite`), lucide-react,
  `@tanstack/react-router` (code-based routes are fine), `qrcode` for the QR SVG.
- Tests: Vitest (bun run vitest). Playwright is not available here. Do not add it.
- Deploy: one Dockerfile (oven/bun), port 3000, volume `/data`. Dokploy builds it.

## Env

- `ADMIN_KEY` (required, server side, runtime). Admin API calls send it as `x-admin-key`.
- `PUBLIC_URL` default `https://mentiqueshie.questlaguna.org` (QR target and footer text).
- `DATA_DIR` default `/data` in Docker, `./data` in dev.
- `PORT` default 3000.

## Data

```
session   id=1 (single row), title, question_text, question_status (hidden|open|closed),
          screen_view (cloud|wall|blank), updated_at
answers   id, device_token (unique), text, hidden (0|1), created_at, updated_at
```

Joined count = distinct device tokens that called `POST /api/join`.

## API

- `GET  /api/state`            public: session + visible answers (hidden ones excluded) + counts
- `GET  /api/events`           SSE: sends `state` event on every change, heartbeat every 25s
- `POST /api/join`             body {deviceToken} -> records participant
- `POST /api/answer`           body {deviceToken, text} -> upsert; 400 if empty or > 80 chars
- `GET  /api/admin/state`      admin: everything incl. hidden answers and device-free ids
- `PUT  /api/admin/session`    admin: {title?, questionText?, questionStatus?, screenView?}
- `PUT  /api/admin/answers/:id` admin: {hidden}
- `POST /api/admin/reset`      admin: deletes answers, sets status hidden

Validate all bodies. Trim text. Rate-limit `POST /api/answer` per device (1 per 2s).

## Design (recreate, do not redesign)

Source artboards: `planning/design-canvas/project/*.dc.html`. Tokens:
`planning/design-canvas/project/ds/quest-laguna/tokens.json`. Logo: `planning/assets/logo-mark.png`.
Brand rules in `planning/project context.md` ("Brand rules that apply to code").

- Phone Join = Main.dc.html minus name and location fields. Eyebrow = service title.
- Phone Answer = Answer.dc.html minus the progress bar, minus "Show my name", minus the
  suggestion chips. Keep the 80 char counter and the "Send my answer" pill.
  Footer line: "Answers show on the big screen. The media team can hide one."
- Phone Sent = Sent.dc.html. Eyebrow "Salamat." (no name). Card shows what was written.
  "Change my answer" goes back to /answer with the text prefilled.
  When the question closes, show "Salamat. The question is closed." and no edit link.
- Screen Join = ScreenJoin.dc.html with a real QR (to PUBLIC_URL), no 4-digit code,
  show "mentiqueshie.questlaguna.org" under the QR instead.
- Screen Cloud = ScreenCloud.dc.html: top 14 normalized tokens (lowercase, trimmed,
  punctuation stripped, Tagalog and English both kept, 1 char words dropped, stop words
  dropped for both languages). Size scales with count. Deterministic placement is fine.
- Screen Wall = ScreenWall.dc.html: newest cards first, max 9 visible, cards rotate
  through the colour variants in order. "Just in" card = newest answer. Footer: no name,
  no location. Show "Anonymous".
- Reduced motion respected on the screen.
- Fonts from Google Fonts. Pills 999px, cards 18px, screen panels 28px. Focus ring 2px #D81E2F.
- No emoji. No em dashes in copy. Copy voice "we" to "you". Short sentences.

## Tests (write first, then make them pass)

- `wordCloud.test.ts`: grouping, stop words, top 14, size scale.
- `answerValidation.test.ts`: empty, whitespace, 80 limit, trim, unicode.
- `api.test.ts`: Hono `app.request` against an in-memory SQLite: join, answer upsert,
  admin auth 401, open/close, hide, reset, state excludes hidden.
- Client: a few component tests with Testing Library (Join renders title, Answer counter).

## Definition of done

- `bun install && bun run test` green. `bun run build` green. `bun run typecheck` green.
- `docker build` succeeds and the container serves `/`, `/screen`, `/admin`.
- README.md: how to run, env vars, Dokploy steps (Dockerfile build, domain, env, volume).

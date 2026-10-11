# Quest Respond — project context

Live audience-response app for Quest Laguna church services (a Mentimeter-style clone).
After the message, one or more questions open. Attendees scan a QR code, answer on their
phone, and the answers show on the big screen as a word cloud, a wall of cards, bars, or a
scale result. The media team moderates. Pastors get analytics the same evening.

Owner: Renzy (Flatwire). Client: Quest Laguna, nine locations across Laguna, Philippines.

## Design sources (read before any UI work)

- Design System "Quest Laguna": https://claude.ai/artifact/VZazdqaF76d15xE7qdYxm2
  Read `project/README.md` and `project/tokens.json`. Tokens are the source of truth.
- Design canvas "Quest Respond": https://claude.ai/artifact/P7Xk3cLPUZGQhH8dxJu7XX
  11 artboards. Recreate them, do not redesign them.
- Original handoff bundle: `design_handoff_church_website/` (website, same brand).

## Stack (assumed, confirm before scaffolding)

- TanStack Start + React + TypeScript (same as Agapay, the other Quest Laguna app)
- Supabase: Postgres, Auth, Realtime (answers stream to the screen), Row Level Security
- shadcn/ui as the component base, restyled with the Quest Laguna tokens
- Tailwind with the tokens mapped to CSS variables (`--brand`, `--bg-elevated`, …)
- Deploy: Vercel or Fly; Supabase hosted. One project, one tenant for now.

If the stack differs, update this section first.

## Surfaces

| Surface | Route | Who | Notes |
| --- | --- | --- | --- |
| Phone: Join | `/r/:code` | attendee | name optional, location select, no login |
| Phone: Answer | `/r/:code/q/:id` | attendee | open text (80 chars), scale 1 to 5, multiple choice |
| Phone: Sent | `/r/:code/sent` | attendee | waits for the next question via realtime |
| Screen: Join | `/screen/:sessionId/join` | projector | QR + 4-digit code + joined count |
| Screen: results | `/screen/:sessionId/live` | projector | view = cloud, wall, bars, scale; presenter switches it |
| Admin: Presenter | `/admin/sessions/:id/present` | media team | open/close questions, pick screen view, blank screen |
| Admin: Analytics | `/admin/sessions/:id` | media team, pastors | KPIs, per-question counts, closeness trend, locations, moderation queue, CSV export |

Phone and screen pages are public (no auth). Admin requires Supabase Auth with a role.

## Data model (first cut)

```
sessions        id, service_type, location_id (null = combined), code (4 digits, unique while open),
                starts_at, status (draft|open|closed), created_by
questions       id, session_id, order, type (open|scale|choice), text, options jsonb,
                status (hidden|open|closed), screen_view (cloud|wall|bars|scale), max_chars
participants    id, session_id, display_name (null = anonymous), location_id, device_token
answers         id, question_id, participant_id, text, value int, option_key,
                moderation (pending|shown|hidden), created_at
locations       id, name   (San Pedro, Biñan, Santa Rosa, Cabuyao, Calamba, …)
```

Rules:
- One answer per participant per question. Resubmit replaces it.
- Scale and choice answers skip moderation. Open text starts as `pending` and shows only
  after the media team marks it `shown`. The presenter can switch to auto-show per question.
- The screen never shows who picked what on scale or choice questions. Totals only.
- A participant's name shows only if they typed one.
- Word cloud groups by normalized token (lowercase, trimmed, Tagalog and English both kept).
  Bigger word = more people said it. Top 14 words on screen.

## Realtime

- Screen subscribes to `answers` for the open question (Supabase Realtime, filtered by question_id).
- Phone subscribes to `questions` for the session to move to the next question.
- Presenter actions are plain writes to `questions.status` and `questions.screen_view`.
- Respect `prefers-reduced-motion` on the screen: no growing bars, no fade-in, values just update.

## Brand rules that apply to code

- Fonts from Google Fonts only: Poppins 600 for headings, Manrope for body and UI,
  Anton for big-screen words. Sacramento and Caveat Brush are poster accents, never UI.
- Pills everywhere: buttons, chips, tabs (`radius 999px`). Cards `18px`. Big-screen panels `28px`.
- Primary button: `#D81E2F`, hover `#B81529`, white text. Eyebrow text: `#8E0E1E` on light,
  `#F26A77` on dark. Gold `#E8B11F` only for accents and the second chart series.
- Light theme for phone and admin. Dark theme (ink `#0B0B0C`, red gradients) for the big screen.
- Charts: single hue (brand red). Label every bar with its value. Never rely on colour alone.
- Focus ring: 2px solid `#D81E2F`, 2px offset, on every control. Touch targets 44px or more.
- No emoji in UI. No em-dashes in copy. Short plain sentences. Filipino code-switching is fine.
- Copy voice: "we" (the church) to "you". Example: "Welcome home." "Salamat, Maria."

## Privacy and safety

- No login for attendees. Store a random device token in localStorage to prevent duplicates.
- Open answers can contain prayer requests with personal details. Moderation is on by default.
  Hidden answers still count in totals but never render on the screen.
- Analytics show names only to admins. CSV export strips names unless the exporter has the
  pastor role.
- Keep internal jargon (SOD, Quest Circle leader titles) off attendee screens.

## Conventions

- Feature folders: `app/routes/`, `app/features/<feature>/`, `app/components/ui/` (shadcn).
- Supabase types generated to `app/lib/database.types.ts`. Never hand-edit.
- Tests: Vitest for logic (word-cloud grouping, scale averages), Playwright for the phone flow.
- Commit messages: imperative, one line, scope prefix (`phone:`, `screen:`, `admin:`, `db:`).

## Open questions

- Multi-tenant later (other churches) or Quest Laguna only? Affects `sessions.org_id`.
- Combined services across nine locations: one session with location select (current design)
  or one session per location?
- Word cloud language handling: group "faithful" and "tapat" as one theme or keep separate?
<div align="center">

<img src="src/app/icon.svg" alt="" width="72" height="72">

# Cadence

**See your own rhythm, then start from a step small enough to actually take**

An AI wellness coach for students and first jobbers. Cadence helps people notice patterns in
eating, sleeping, and movement, then turn those patterns into practical micro-goals that fit the
shape of their real week.

**English** · [ภาษาไทย](README.th.md)

[![CI](https://github.com/nkieu-config/cadence-ai-health-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/nkieu-config/cadence-ai-health-coach/actions/workflows/ci.yml)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-3.1%20Flash%20Lite-4285F4?logo=googlegemini&logoColor=white)

[**Open the live app**](https://personal-healthcoach.vercel.app/) ·
[Case study PDF](docs/summary/showcase-en-light.pdf) ·
[Run it locally](CONTRIBUTING.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/dark-phone-checkin.webp">
  <img src="docs/assets/readme/light-phone-checkin.webp" width="240" alt="The Cadence daily check-in, step 1 of 4, asking how many meals, what was eaten between them, and sweet drinks — every answer is a tap chip">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/dark-phone-dashboard.webp">
  <img src="docs/assets/readme/light-phone-dashboard.webp" width="240" alt="The Cadence health overview showing a 14-day sleep-hours bar chart, with markers under the bars for days that had something disrupting the schedule">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/dark-phone-coach.webp">
  <img src="docs/assets/readme/light-phone-coach.webp" width="240" alt="The Cadence coach screen: the user asks what to fix first next week, and the coach answers breakfast, citing the record that days with early classes are the days breakfast gets skipped">
</picture>

<sub>A four-step check-in, chips only · four trend tabs marking disrupted days · a coach that answers from the user's own records, not canned advice<br>
Real screens, not mockups — captured at iPhone 13 size (390×844) · light and dark follow your own theme</sub>

</div>

> [!NOTE]
> **The app itself is in Thai.** The screenshots and examples below are translated for English-speaking
> readers. A browser translation extension can be used when exploring the live demo.

## Try the demo

- **Live app** — [personal-healthcoach.vercel.app](https://personal-healthcoach.vercel.app/). The first button on the landing page signs you in with the demo account; no sign-up is required.
- **Demo account** — `palm@example.com`, preloaded with four weeks of check-ins, patterns, coaching, goals, and weekly reflection. Password: `cadence-demo-2026`.
- **Case study** — [9-page project summary](docs/summary/showcase-en-light.pdf) in English.

The demo account is public, so feel free to fill in, edit, or delete data. Its data is refreshed nightly.
Today's check-in is intentionally left blank so you can try it yourself. AI coaching is limited to five
messages per day on the free Gemini quota.

## About the project

Cadence is a wellness coach, not a medical service. It is designed for people whose routines are
shaped by classes, deadlines, commuting, and changing energy levels.

Instead of scoring or judging users, the app follows a simple loop:

```text
Daily check-in → Personal patterns → One practical next step → Weekly reflection
```

The check-in is designed to take under three minutes, using tap-based answers and only showing
follow-up questions when they are relevant. The coach uses the user's own records to make suggestions
that are small enough to fit their actual week.

## Key features

- **Daily check-in** — record eating, sleep, movement, and the context that shaped the day.
- **Health overview** — review trends across four tabs, including a night-to-morning timeline and disrupted days.
- **Pattern insights** — see relationships between health behaviours and real-life schedule constraints.
- **AI coach** — start with a question based on your records, continue the conversation, and turn it into a guided goal.
- **Micro-goals** — choose up to two small weekly goals and track progress day by day.
- **Weekly reflection** — compare recent weeks and review what changed.

Cadence does not diagnose conditions, recommend medication or supplements, create weight-loss plans, or
store weight, height, BMI, calories, or photos.

## Portfolio highlights

- **Product thinking** — reduced daily friction with a short, conditional check-in instead of a long form.
- **Responsible AI design** — keeps evidence and language separate, and treats AI as a coach within clear safety boundaries. See [AI design](docs/07-ai-design.md).
- **Privacy and quality** — keeps health data owner-only, supports account deletion, sends no name or email to the model, and verifies behaviour with unit and end-to-end tests. See [safety and privacy](docs/08-safety-privacy.md).

## Project context

Cadence was built by a team of four in four weeks for CSTU Spark Camp in AI 2026, using a zero-dollar
budget. The team designed, implemented, dogfooded, tested, and deployed a working demo for the final
pitch. The [project charter](docs/01-project-charter.md) and [issue tracker](docs/issues/) record the
scope, decisions, and development history.

## Tech stack

- Next.js 16 with the App Router and React 19
- TypeScript and Tailwind CSS v4
- Supabase Auth, Postgres, and Row Level Security
- Google Gemini 3.1 Flash Lite
- Vitest and Playwright
- Vercel

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

You need Node.js 22 or newer. For environment variables, database setup, seed data, test commands,
and deployment details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Limitations

- All health information is self-reported; there is no sensor data to verify it.
- Patterns show relationships, not causes, and should not be treated as medical advice.
- The current prototype has not yet been evaluated with users outside the team.
- AI output cannot be controlled perfectly, so the product uses safety boundaries and fallbacks.

The full limitations and future plan are documented in [docs/11-limitations-future.md](docs/11-limitations-future.md).

## Documentation

| Topic | Documentation |
| --- | --- |
| Product, design, and requirements | [docs/](docs/README.md) |
| Architecture and request flows | [System architecture](docs/06-system-architecture.md) |
| AI, patterns, and model decisions | [AI design](docs/07-ai-design.md) · [ADR-0003](docs/adr/0003-gemini-free-tier-ai.md) |
| Safety, privacy, and test evidence | [Safety and privacy](docs/08-safety-privacy.md) · [AI safety tests](docs/issues/ai-safety-test/) |
| UI rules and route states | [UI inventory](docs/12-ui-inventory.md) · [Design rules](docs/DESIGN.md) |
| Local development and contribution workflow | [CONTRIBUTING.md](CONTRIBUTING.md) |

<sub>Deployed automatically from <code>main</code> to <a href="https://personal-healthcoach.vercel.app/">personal-healthcoach.vercel.app</a> · Licensed under <a href="LICENSE">MIT</a></sub>

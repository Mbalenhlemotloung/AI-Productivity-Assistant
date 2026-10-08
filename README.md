# MatricEnhle — Your Matric-to-University Companion

## Overview
South African Grade 12 learners juggle exam preparation, university applications and NSFAS funding at the same time, usually across scattered websites and notes. MatricEnhle brings these into one friendly, responsive web app.

## Features
- **Secure accounts** — email/password sign-up with email confirmation, Google sign-in, show/hide password, password recovery and reset.
- **Dashboard** — personalised welcome, exam countdowns, application deadlines, status summary, today's tasks, progress and deadline alerts.
- **University Applications** — add/edit/delete applications, deadlines, statuses (Not Started → Accepted), reference numbers, notes and official links.
- **NSFAS Support** — plain explanation, preparation and document checklists, personal status notes, link to https://www.nsfas.org.za/.
- **Past Papers** — search and filter by subject, year and type. No fake downloads: the library is empty until real files are added to `PAPERS` in `src/routes/_authenticated/past-papers.tsx`.
- **AI features** (real AI responses)
  - AI Task Planner (Study Planner page)
  - Notes Summariser & Research Assistant
  - "Ask MatricEnhle" chatbot with follow-ups
  - Smart Email Generator (formal / friendly / persuasive)
- **Progress** — subject readiness sliders, task and application completion.
- **Responsible AI** disclaimer on every AI tool.

## Technologies
TanStack Start (React 19, Vite), Tailwind CSS v4, shadcn/ui, Lovable Cloud (authentication), Lovable AI Gateway via the Vercel AI SDK, Zod validation.

## Setup
```bash
bun install
bun run dev
```
The app is built and hosted on Lovable; backend and AI keys are managed by Lovable Cloud.

## AI integration
All AI calls run on the server (`src/lib/ai.functions.ts` → `src/lib/ai.server.ts`). Each feature has its own structured system prompt. Only signed-in users can call the AI; the API key (`LOVABLE_API_KEY`) never reaches the browser. Inputs are validated with Zod and errors (rate limits, credits) are shown to the learner.

## Responsible AI
- Visible disclaimer: AI can be wrong; verify with teachers and official university/NSFAS sources.
- Learners are told not to enter confidential personal information.
- Prompts forbid inventing dates, requirements, NSFAS rules or URLs.
- The app never claims to submit university or NSFAS applications.

## Data
Application records, exams, tasks, checklists and preferences are stored in the browser's localStorage per account (this device only).

## Team & repository
- GitHub repository: _add link_
- Team members: _add names_

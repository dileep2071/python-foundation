# Python Foundation

An independent, beginner-to-advanced Python learning experience created by VANDAVASI DILEEP. The app combines a structured course roadmap, tutor-style lessons, practice challenges, quizzes, project briefs, learner notes, and a browser-based Python playground.

## Features

- 32 curriculum modules spanning Python fundamentals, professional development, optional specializations, and capstone projects.
- Onboarding and a personalized dashboard with progress, lesson history, streaks, quiz scores, and activity charts derived from actual browser events.
- Lesson pages with objectives, analogies, runnable examples, official documentation links, notes, bookmarks, and completion tracking.
- Python syntax highlighting and Pyodide execution in a dedicated Web Worker, with a 15-second execution timeout.
- Practice problems with hints and expected-output checks, plus a submit-to-see-results quiz.
- Project briefs, saved snippets, bookmarks, notes, analytics, profile settings, and light/dark themes.
- Optional Supabase sign-up, login, logout, and password recovery when configured.
- Supabase SQL schema with row-level security policies for learner-owned records.
- Responsive navigation and reduced-motion support.

## Technology

- React 19, TypeScript, Vite, and React Router
- CodeMirror 6 with Python syntax highlighting
- Pyodide / WebAssembly for isolated, browser-side Python practice
- Supabase Auth (optional) and PostgreSQL schema/migrations
- Vitest for focused unit tests

## Prerequisites

- Node.js 20.19+ or 22.12+ (the current Vite toolchain requires a modern Node release)
- npm
- Optional: a Supabase project for account authentication and database setup

## Local development

```powershell
npm install
npm run dev
```

The first `dev` or `build` command copies Pyodide’s runtime assets from `node_modules` into `public/pyodide`. The browser playground downloads/initializes the WebAssembly runtime on the first run and requires the assets to be served by the app.

## Environment setup

Copy `.env.example` to `.env.local` and set the Supabase project URL and **anon/publishable** key if account sign-in is needed:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The anon key is intended for browser use and must be protected by Supabase Row Level Security. Never put a service-role key or database password in a `VITE_` variable. Restart the dev server after editing environment values.

Without Supabase credentials, use **Continue with a local profile**. Local profiles, progress, notes, bookmarks, quiz attempts, and snippets are stored in this browser only. The application does not store passwords.

## Database setup

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/migrations/0001_learning_platform.sql`](./supabase/migrations/0001_learning_platform.sql).
3. Configure the app’s Supabase URL and anon key in `.env.local`.
4. Add the local and production redirect URLs to the Supabase Auth URL configuration.

The migration seeds course modules and starter lessons, creates the learner data tables, and enables ownership-based RLS. In this initial build, Supabase is wired for authentication only; learning progress continues to use browser storage and is **not yet synchronized to PostgreSQL**. The database schema is ready for a later sync/API layer. Do not treat local data as a cross-device account backup.

## Quality checks

```powershell
npm test
npm run build
npm run lint
```

## Deployment

For a Vercel deployment, import the dedicated GitHub repository, use the Vite preset (or configure `npm run build` as the build command and `dist` as the output directory), and add the Supabase environment variables if authentication is enabled. The prebuild script copies the Python runtime assets into the output. Configure SPA fallback/rewrite behavior for direct navigation to routes such as `/lesson/module-00`.

This project has not been deployed. No live domain, contact address, or production Supabase configuration is included.

## Security and limitations

- Learner Python code runs in a separate browser worker using WebAssembly; each run is terminated after 15 seconds. It is not a production-grade hosted code execution service.
- The browser sandbox is for learning exercises only. Do not enter secrets or sensitive code in the playground.
- Supabase account authentication requires project configuration. The SQL migration includes RLS policies, but the app’s progress store has not yet been connected to those tables.
- The course outline covers the 32 requested modules. The current build includes a substantive starter lesson for each module; it is not a complete 31-module textbook or a claim that every code example has been independently tested.
- No certificate, placement, learner-count, testimonial, award, or Python Software Foundation endorsement is claimed.
- Contact details must be configured by the project owner before public launch.

Python Foundation is an independent learning project and is not affiliated with or endorsed by the Python Software Foundation.

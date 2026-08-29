# CU AI Desk

An intelligent study companion built for Covenant University students. Combines an AI chatbot, todo list, reminders, study tips, health tips, an AI notes summarizer, a calculator, and a social/friendship system, all backed by Supabase authentication and database.

This was Cynthia Onuoha's final year project.

**Live site:** _add your deployed URL here once deployed_

## Features

- AI-powered chatbot for study support
- Todo list and reminders with notifications
- AI notes summarizer
- Study tips and health tips
- Calculator
- Social features: friendships, user discovery, presence, messaging
- Email/password authentication with password reset
- Admin utilities

## Tech Stack

- [React 18](https://react.dev/) + [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/): build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/): accessible component primitives
- [Framer Motion](https://www.framer.com/motion/): animations
- [Supabase](https://supabase.com/): database, authentication, and edge functions
- [TanStack Query](https://tanstack.com/query): data fetching and caching
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm installed

### Installation

```sh
git clone https://github.com/cynthiaonuoha/cuaideskbycynthia.git
cd cuaideskbycynthia
npm install
```

### Development

```sh
npm run dev
```

The site will be available at `http://localhost:8080`.

### Build

```sh
npm run build
```

### Other scripts

```sh
npm run preview   # preview the production build locally
npm run lint       # run ESLint
```

## Supabase Setup

This project connects to a Supabase project for authentication, database, and edge functions. The client configuration lives in `src/integrations/supabase/client.ts`.

Database schema is defined in `supabase/migrations/`. To set up a fresh Supabase project:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration files in `supabase/migrations/` against your project (in order, oldest first)
3. Update the `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts` with your project's values

### Edge Functions

Three Supabase Edge Functions power the AI features and auth emails:

```
supabase/functions/
  ai-chat/          # powers the chatbot
  ai-summarize/     # powers the notes summarizer
  auth-emails/      # sends authentication-related emails
```

Deploy these separately through the Supabase CLI:

```sh
supabase functions deploy ai-chat
supabase functions deploy ai-summarize
supabase functions deploy auth-emails
```

### Keeping the Supabase project active

Free-tier Supabase projects pause after 7 days of inactivity. A GitHub Actions workflow at `.github/workflows/keep-alive.yml` pings the database every 3 days to prevent this. It requires two repository secrets: `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## Project Structure

```
src/
  pages/               # route-level pages (Chatbot, Todo, Reminders, Auth, etc.)
  components/           # shared UI components, including auth and social components
  hooks/                 # custom hooks (auth, reminders, friendships, notifications)
  context/               # React context providers
  integrations/supabase/ # Supabase client and generated types
  services/              # notification service
  utils/                 # admin utilities
supabase/
  migrations/            # database schema migrations
  functions/              # edge functions
```

## Contact

- GitHub: [github.com/cynthiaonuoha](https://github.com/cynthiaonuoha)
- LinkedIn: [linkedin.com/in/cynthia-onuoha-072b18201](https://ng.linkedin.com/in/cynthia-onuoha-072b18201)
- Email: cynthiaonuohaa@gmail.com

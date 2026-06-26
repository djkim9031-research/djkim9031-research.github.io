# djkim9031-research.github.io

My personal site — a small interactive terminal. Type `help` to explore, or
`ask "..."` to query the built-in agent.

Live at https://djkim9031-research.github.io

## Stack

Vite + React + TypeScript, deployed to GitHub Pages via Actions. No backend.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + bundle to dist/
npm run preview  # serve the production build
```

## Editing content

Everything shown on the page comes from two files — no need to touch the UI:

- `src/data/profile.ts` — bio, projects, experience, skills, contact.
- `src/data/faq.ts` — answers the `ask` agent draws from.

## The agent

The `ask` command goes through `AgentResponder` (`src/agent/responder.ts`).
Today it uses a keyword responder (`scriptedResponder.ts`). To use a real model,
implement `llmResponder.ts` and point `responder` at it.

## Deploy

Push to `main`; the workflow in `.github/workflows/deploy.yml` builds and
publishes. Pages source must be set to "GitHub Actions" in repo settings.

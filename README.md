# Decision Tree Builder

A static, client-only web app for building and running decision trees to make technical
choices — e.g. "should this be a Jupyter notebook, an Apache Spark job, or an Apache NiFi
dataflow?" Everything runs in the browser: there's no backend, and trees are saved to
`localStorage` plus optional JSON export/import.

Installable as a PWA and works offline once installed.

## Two modes

- **Sequential** — a literal branching tree. Each answer either continues to another
  question or ends at one final option.
- **Weighted** — every question is answered, and each answer contributes points toward
  one or more final options. The highest-scoring option(s) win (ties are shown as such).

## Getting started

```bash
npm install
npm run dev       # start the dev server
```

Other scripts:

| Script                  | What it does                                                          |
| ------------------------ | ---------------------------------------------------------------------- |
| `npm run build`          | Typecheck, regenerate the JSON schema, and build the static `dist/`   |
| `npm run typecheck`      | `tsc -b` with no emit                                                 |
| `npm test`                | Run the Vitest unit test suite                                        |
| `npm run preview`        | Serve the production build locally                                    |
| `npm run generate:schema`| Regenerate `schema/decision-tree.schema.json` from the TS types       |
| `npm run lint`           | Oxlint                                                                 |

## Tech stack

React + TypeScript + Vite, Tailwind CSS, Zustand, React Router (`HashRouter`). All
dependencies are regular npm packages — no CDN scripts anywhere, so the built `dist/`
works fully offline and from any static file host.

## Data model & persistence

A tree's shape is defined in [`src/types/tree.ts`](src/types/tree.ts). It's saved as a
single JSON blob in `localStorage`, and the same shape is used for file export/import,
so a tree downloaded from the app can be handed to someone else and re-imported as-is.

[`schema/decision-tree.schema.json`](schema/decision-tree.schema.json) is a JSON Schema
*generated from those types* (via `ts-json-schema-generator`, reading the JSDoc comments
on each field) — run `npm run generate:schema` after changing the types, or just
`npm run build`, which does it automatically. A test
(`src/lib/schemaGeneration.test.ts`) fails if the committed schema ever drifts from the
types. Add `"$schema": "../schema/decision-tree.schema.json"` to the top of a tree JSON
file to get hover docs, autocomplete, and validation for it in editors like VS Code —
see [`public/default-tree.json`](public/default-tree.json) for an example.

## The example tree

[`public/default-tree.json`](public/default-tree.json) is a starter sequential tree
(Notebook vs. Spark vs. NiFi). It's loaded automatically into an empty library on first
visit (and only then — deleting it won't bring it back). It can also be reloaded anytime
from the dashboard's empty state via the **"Load example tree"** button.

## Deployment

Static output lives in `dist/` after `npm run build`. The Vite `base` is relative
(`./`), so the build works unmodified whether it's served from a domain root or a
subpath (e.g. a GitHub/GitLab Pages project site at `https://host/repo-name/`).

- **GitHub Actions** — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
  builds and deploys to GitHub Pages on push to `main`. One-time setup: in the repo's
  **Settings → Pages**, set the source to **"GitHub Actions"**.
- **GitLab CI** — [`.gitlab-ci.yml`](.gitlab-ci.yml) builds into a `pages` job on the
  default branch; GitLab Pages picks it up automatically, no extra setup needed.

Both pipelines run typecheck + tests before building, so a broken build won't deploy.

## Project structure

```
src/
  types/        Core DecisionTree data model
  lib/           Pure logic: scoring, validation, import/export, tree factory
  store/         Zustand stores (tree library, theme) + localStorage persistence
  pages/         Route-level components (dashboard, editor, runner)
  components/    UI, split into dashboard/ editor/ runner/ common/
schema/          Generated JSON Schema for tree files
scripts/         Schema generation script
public/          Static assets, PWA icons, the default example tree
```

# Repository Guidelines

## Project Structure & Module Organization
- Root: `App.js` (entry), `app.json`, `.env` (local), `env.example`, `assets/`.
- Source: `src/`
  - `components/` reusable UI (PascalCase files)
  - `screens/` app views (PascalCase files)
  - `hooks/` custom hooks (camelCase, prefixed with `use`)
  - `services/` integrations (e.g., `firebase.js`)
  - `utils/` helpers and docs (`themeUtils.js`, guides)
  - `config/` theming and local secrets (e.g., `theme.js`, `firebase-config.js` – not committed).

## Build, Test, and Development Commands
- Install deps: `npm install`
- Start (Expo dev server): `npm start`
- Platform targets: `npm run android` | `npm run ios` | `npm run web`
- Env setup: `cp env.example .env` and create `src/config/firebase-config.js` from your Firebase project (keep both out of Git).

## Coding Style & Naming Conventions
- JavaScript, 2-space indentation, single quotes, semicolons, trailing commas where valid.
- Components: PascalCase (`Header.js`, `ThemeToggle.js`).
- Hooks: `useCamelCase` (`useTheme.js`, `useResponsive.js`).
- Utilities/config: camelCase (`themeUtils.js`).
- Keep components focused; colocate minor styles with `StyleSheet.create` in the same file.

## Testing Guidelines
- No formal test setup yet. If adding tests, use Jest + React Native Testing Library.
- Place tests next to sources: `Component.test.js`, `hook.test.js`.
- Prefer behavior-focused tests (accessible queries) over implementation details.

## Commit & Pull Request Guidelines
- Commits are currently mixed; prefer Conventional Commits going forward:
  - Examples: `feat: add bottom navbar`, `fix: prevent clipped scroll on Home`.
- PRs must include:
  - Clear description and rationale; link issues.
  - Screenshots/GIFs for UI changes (mobile and web if applicable).
  - Setup or env notes if required to run (e.g., Firebase rules).

## Security & Configuration Tips
- Never commit secrets: `.env`, `src/config/firebase-config.js`, keys, or service files (see `.gitignore`).
- Start from `env.example`; scope Firebase credentials to least privilege and validate Firestore rules before merging.
- Avoid logging PII or tokens; scrub debug logs before PRs.


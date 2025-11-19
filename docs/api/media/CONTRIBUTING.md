# Contributing Guide

Thank you for your interest in contributing to **SexyLove**!

## Code Style

We enforce code style using **ESLint** and **Prettier**.

- **Linting**: Run `pnpm run lint` to check for issues.
- **Formatting**: Prettier runs automatically on commit via `husky` and `lint-staged`.

### Naming Conventions

- **Components**: PascalCase (e.g., `AuthScreen.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

## Git Workflow

1.  **Branching**: Create a new branch for each feature or fix.
    - `feature/my-new-feature`
    - `fix/bug-description`
2.  **Commits**: Use conventional commits (optional but recommended).
    - `feat: add login screen`
    - `fix: resolve sync issue`
3.  **Pull Requests**: Submit a PR to the `main` branch. Ensure all checks pass.

## Project Structure Rules

- Do not import from `features/A` inside `features/B` if possible. Use shared `components/` or `hooks/` for common logic.
- Keep components small and focused.

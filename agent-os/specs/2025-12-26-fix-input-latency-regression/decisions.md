# Architectural Decisions

- **State Management**: Must verify if `useDebounce` is conflicting with `value` props. -> **CONFIRMED**. `useDebounce` Hook pattern adds unnecessary overhead. We are switching to a **Ref-based Debounce** for Auto-Save to decouple the heavy `blocks` tree from the render dependency chain of the debounce effect.
- **Optimization**: We prefer `lodash.debounce` (or custom equivalent) over `useDebounce` hook for background tasks to avoid `useState` updates.

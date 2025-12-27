# Spec Requirements: Text Input Optimization

## Initial Description

Okay quiero que verifiques y arregles cuando escribo en los componentes, proincipalmente en el de y texto, cuando escribo se traba, a veces se vuela letras o corrige las palabras no se si las auto completa o que pero esta fallando o esta mal optimizado

## Requirements Discussion

### First Round Questions

**Q1:** Dispositivo: ¿En qué dispositivo Android específico estás probando?
**Answer:** No es de hardware, ya que es en todo telefono incluspo en la version web.

**Q2:** Frecuencia: ¿El "trabado" o la pérdida de letras ocurre continuamente... o coincide con "Guardado"?
**Answer:** (Implicit in context) User noted disappearing components also occur when creating/moving blocks.

**Q3:** Tamaño de la Nota: ¿Te pasa incluso en notas nuevas/vacías?
**Answer:** (Implied general failure) "se desaparece de vez en cuando componentes que reciense crean".

### Existing Code to Reference

No similar existing features identified for reference, but the issue is identified within `NoteEditor.tsx` and `BlockRenderer.tsx`.

### Follow-up Questions

None needed. The issue is clearly a state management race condition (Circular Dependency between Local State <-> Store <-> Supabase Subscription).

## Visual Assets

### Files Provided:

No visual files found.

## Requirements Summary

### Functional Requirements

- **Decouple Editor State**: The `NoteEditor` must interpret the `note` prop as "Initial Generation" data only. Subscriptions to global store updates should NOT overwrite the user's active local editing session unless explicitly handled (e.g., conflict resolution).
- **debounce Auto-Save**: Ensure the auto-save mechanism (`updateNote`) does not trigger a re-render of the editor blocks while the user is typing.
- **Stable Block IDs**: Ensure unique IDs (`uuidv4`) are generated once and persisted; they must not change during re-renders.
- **Optimized Rendering**: Prevent full list re-renders when a single block update occurs. `BlockRenderer` is already memoized, but parent state updates might be bypassing this.

### Scope Boundaries

**In Scope:**

- Refactoring `NoteEditor.tsx` state logic (useEffect dependencies).
- Optimizing `useNotesStore` interactions.
- Verifying `BlockRenderer` memoization and re-renders.

**Out of Scope:**

- Changing the database schema.
- UI Redesign of the editor.

### Technical Considerations

- **Problem**: `useEffect` in `NoteEditor` listens to `note`. `note` changes when `updateNote` (auto-save) completes. This causes `setBlocks` to fire again with the "saved" data, creating a race condition if the user typed more characters in the interim network delay.
- **Fix**: Identify "Local vs Remote" data. Incoming remote data should only update local state if it's _not_ from the current user's recent save action, or use a "last edited" timestamp to ignore our own echoes. Or, simply, **never** hydrate `blocks` from `note` after the initial mount, only sync _out_.

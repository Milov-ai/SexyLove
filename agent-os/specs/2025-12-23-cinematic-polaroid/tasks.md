# Task Breakdown: Cinematic Polaroid Block

## Overview

Total Tasks: 15

## Task List

### Logic Layer

#### Task Group 1: Intelligent Metadata Enrichment

**Dependencies:** None

- [x] 1.0 Complete Link Resolver enrichment
  - [x] 1.1 Write 2-8 focused tests for IMDb/Letterboxd URL resolution in `link-resolver.ts`
  - [x] 1.2 Add movie-specific regex patterns to `LinkResolver`
  - [x] 1.3 Implement metadata extraction for `director`, `actor`, `genre`, and `runtime`
  - [x] 1.4 Test resolution results against the new tests in 1.1

**Acceptance Criteria:**

- IMDb/Letterboxd links return a "cine_polaroid" suitable metadata object.
- All 2-8 tests pass.

### Frontend Components

#### Task Group 2: CinePolaroidBlock UI Design

**Dependencies:** Task Group 1

- [x] 2.0 Complete CinePolaroidBlock UI
  - [x] 2.1 Write 2-8 focused tests for `CinePolaroidBlock` rendering and props management
  - [x] 2.2 Create `CinePolaroidBlock.tsx` reusing tilt/physics from `PolaroidBlock.tsx`
  - [x] 2.3 Style the "Front Face" to match `planning/visuals/movie-poster-reference.jpeg` (Bold text, structured list)
  - [x] 2.4 Implement "Back Face" with Seen Toggle, Dual Star Ratings, and Handwritten Comment field
  - [x] 2.5 Ensure the block is registered in `BlockRenderer.tsx`

**Acceptance Criteria:**

- High-fidelity match to the `Sleepers` poster reference.
- Interactive flip (3D) works smoothly on mobile.
- Ratings and toggle persist to the store.

#### Task Group 3: Integration & Smart Conversion

**Dependencies:** Task Group 2

- [x] 3.0 Complete Editor Integration
  - [x] 3.1 Implement block conversion logic for detection of Movie URLs in standard Link blocks
  - [x] 3.2 Add manual creation option in the block menu/toolbar
  - [x] 3.3 Verify real-time sync across devices for the new block type

**Acceptance Criteria:**

- User can convert a link to a Cine-Polaroid with one tap.
- Manual entry works correctly if no link is provided.

### Testing & Verification

#### Task Group 4: Final Gap Analysis

**Dependencies:** Task Groups 1-3

- [x] 4.0 Final verification and polished UX
  - [x] 4.1 Review the 12-24 tests from previous tasks
  - [x] 4.2 Add up to 5 strategic E2E tests for the "Happy Path" (Paste -> Convert -> Rate)
  - [x] 4.3 Run all feature tests and verify aesthetic consistency

**Acceptance Criteria:**

- Zero regression in existing Notes functionality.
- Smooth performance on mobile devices.

## Execution Order

1. Logic Layer (Task Group 1)
2. UI Design (Task Group 2)
3. Integration (Task Group 3)
4. Verification (Task Group 4)

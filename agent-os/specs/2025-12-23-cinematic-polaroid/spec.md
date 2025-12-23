# Specification: Cinematic Polaroid Block

## Goal

Create a premium, media-rich "Cinematic Polaroid" block for movie tracking that supports automated metadata fetching from links and a 90s movie poster aesthetic for couples.

## User Stories

- As a user, I want to paste a movie link and have a beautiful poster-style polaroid appear automatically with all movie details.
- As a couple, I want to mark movies as "Seen", rate them together, and leave shared comments to build a cinematic memory log.

## Specific Requirements

**Automated Metadata Enrichment**

- Enhance `link-resolver.ts` to detect IMDb and Letterboxd URLs using regex patterns.
- Fetch movie-specific metadata (Title, Year, Genre, Director, Cast, Poster URL) via Microlink or NoEmbed providers.
- Map the "Official Rating" from the metadata source to a read-only display on the block's back face.

**Dual-Face Polaroid Interface**

- Implement a "Front Face" primary display featuring a large movie poster and a structured metadata list.
- Implement a "Back Face" secondary display for user interactions and detailed notes.
- Reuse the existing flip/tilt animation logic from `PolaroidBlock.tsx` for a consistent physical feel.

**Movie-Specific Data Schema**

- Store movie metadata (Genre, Duration, Director, Starring) in the block's `props` object.
- Include a boolean `isSeen` flag to toggle the "Ya la vimos" status.
- Support both an `officialRating` (fetched) and a `personalRating` (manually set by the couple).

**Manual Creation & Editing**

- Provide a manual creation path via the block menu if no link is available.
- Allow users to manually edit any field if the automated fetching fails or needs correction.
- Ensure the "Comment" field uses a handwritten-style typography for an intimate feel.

## Visual Design

**`planning/visuals/movie-poster-reference.jpeg`**

- Use a cream/paper-white background texture for the entire card.
- Place a large movie scene/poster image at the top with a subtle inner shadow.
- Implement the "Title" in a bold, large, uppercase sans-serif font centered or left-aligned.
- Display the "Year" in a smaller, medium-weight gray font next to the title.
- Organize Genre, Duration, Director, and Starring as a vertical list with bold uppercase labels.
- maintain clean, generous margins around the text content at the bottom ("The Chin").

## Existing Code to Leverage

**PolaroidBlock.tsx**

- Reuse the `framer-motion` 3D tilt logic (rotateX/rotateY) and the device orientation hooks.
- Replicate the front/back flip mechanism and the `backface-hidden` CSS structure.
- Adapt the image upload logic (via `useMediaUpload`) for cases where a custom poster is desired.

**link-resolver.ts**

- Extend the `LinkResolver.resolve` method with new cases for IMDb and Letterboxd.
- Follow the existing pattern of using `Microlink` for title and image extraction.
- Add logic to parse specific movie metadata tags from the fetched JSON response.

**BlockRenderer.tsx**

- Register the new `cine_polaroid` block type in the main renderer.
- Ensure the block is correctly passed to the `BlockRenderer` recursive children logic.

## Out of Scope

- Full search interface for movies (only link-paste or manual entry).
- Video trailer embedding inside the polaroid card.
- Automatic link to ticket purchasing websites.
- Social sharing of the polaroid to external platforms.

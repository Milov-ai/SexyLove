# Spec Requirements: Cinematic Polaroid Block

## Initial Description

Custom "Cinematic Polaroid" block for movie tracking. Should look like the provided reference image (Sleepers/90s style) and support both automatic link-based enrichment and manual entry.

## Requirements Discussion

### First Round Questions

**Q1:** ¿Debería el bloque rellenar automáticamente los campos al pegar un enlace de IMDb o Letterboxd?
**Answer:** Sí, quiero que se llene automáticamente si pego el link en el componente de link inteligente.

**Q2:** ¿Quieres que este bloque tenga siempre ese estilo físico de papel crema/blanco o que se adapte al tema?
**Answer:** Debe tener la estética de la imagen `polaroid pelis.jpeg`.

**Q3:** ¿Al tocar lo póster debería abrir el enlace o darle la vuelta para notas personales?
**Answer:** Debe permitir poner una nota como comentario, tener un switch de "ya la vimos", y mostrar dos calificaciones (la oficial y la nuestra).

**Q4:** ¿Deseas que sea un bloque nuevo o una variante de la Polaroid?
**Answer:** Si no hay link, quiero poder crearla manual con el componente de polaroid (usando los mismos parámetros de cine).

## Functional Requirements

- **Dual Creation Paths**:
  - Auto-detect IMDb/Letterboxd/Movie links in the Link Block to trigger a "Cine-Polaroid" conversion.
  - Manual option in the block menu to create a Movie Polaroid.
- **Dynamic Metadata Display**: Show Title, Year, Genre, Duration, Director, and Starring list.
- **Couple Interactions**:
  - "Seen" (Ya la vimos) toggle/switch.
  - Two-tier Rating System: Official Rating (Read-only) + Personal Couple Rating (Interactive).
  - Shared Comment/Note field.
- **Premium Aesthetics**: High-fidelity recreation of the `polaroid pelis.jpeg` layout (Bold titles, structured metadata list, physical paper texture).

## Technical Considerations

- **Link Resolver logic**: Update `link-resolver.ts` to fetch movie-specific Metadata (potentially via OMDb or Microlink with custom parsing).
- **Block Props**: Extend the `PolaroidProps` or create `CinePolaroidProps` to store:
  - `title`, `year`, `genre`, `duration`, `director`, `starring`.
  - `officialRating`, `personalRating`.
  - `isSeen` (boolean).
  - `userComment`.
- **Component Reuse**: Reference `PolaroidBlock.tsx` for tilt/physics logic but use a totally different CSS/Layout structure for the "Movie Ticket/Poster" face.

## Scope Boundaries

**In Scope:**

- Automatic conversion of movie links.
- Manual entry UI for cine metadata.
- Dual rating system and "Seen" toggle.
- Physical aesthetic (Paper/Polaroid).

**Out of Scope:**

- Full movie database search (only via link paste or manual text).
- Video embedding inside the polaroid (poster image only).

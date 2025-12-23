# Atomic Spec: Geografía del Deseo (Interactive Maps)

## Overview

"Geografía del Deseo" is the geospatial layer of the Hidden Vault. it provides an interactive, private map for visualizing locations and memories stored within the encrypted vault.

## Visual Specification

### Map Engine

- **Core**: MapLibre GL.
- **React Wrapper**: `react-map-gl/maplibre`.
- **Styling**: Custom MapTiler style URL (dark/cinematic theme).

### Interactions

- **Markers**: Custom `MapMarker` components for each `Lugar`.
- **FlyTo**: Smooth camera transitions when selecting a place or adding a new one.
- **Heatmap**: Visualization layer for "Intensity" or frequency of entries in specific areas.
- **Bounds**: Automatic calculation of bounding boxes (`getBounds`) to fit all markers on the screen during initialization.

## Functional Specification

### Places (Lugares)

- **Data**: ID, Name, Coordinates (lat/lon), Favorites flag, Categories, and associated Chronicles.
- **Storage**: `lugares` table in Supabase.
- **Security**: Coordinates are stored in a specialized GIS field or as encrypted strings.

### Chronicles (Entradas)

- **Data**: Associated `lugar_id`, content, quality tags, and toys used.
- **View**: Handled by `ChronicleView` (drawer or sheet component).
- **Organization**: Grouped by date and location.

## Implementation Details

### State Integration (`vault.store.ts`)

- `decryptedVault.lugares`: In-memory array of decrypted place objects.
- `showHeatmap`: Toggle for the heatmap layer.
- `lugarToCenter`: Trigger state for smooth camera movement.

### Coordinate Handling

- Points are converted between internal `coordinates: { lat, lon }` objects and MapLibre's `[lon, lat]` format.
- `getBounds()` utility calculates the min/max latitude and longitude to construct a `LngLatBoundsLike` object.

## Atomic Verification Criteria

- [ ] Markers render correctly at the specified lat/lon.
- [ ] Clicking a marker opens the `ChronicleView` with the correct location data.
- [ ] Map orientation and zoom are preserved or adjusted smoothly during data updates.
- [ ] Entering the vault from the facade triggers the "Fit Bounds" animation.

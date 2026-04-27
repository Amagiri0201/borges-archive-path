# Borges Archive Path

An interactive digital humanities prototype about Jorge Luis Borges. The project turns Borges's life, works, and recurring motifs into a navigable visual archive: city memory, libraries, forking paths, mirrors, dreams, The Aleph, The Book of Sand, and a final evidence room.

## Local Preview

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174/
```

Useful deep links:

```text
http://127.0.0.1:5174/#forking-paths
http://127.0.0.1:5174/?thought=aleph:node-burst#aleph
```

## Build

```bash
npm run lint
npm run build
```

The production output is generated in `dist/`.

## Vercel

Import the GitHub repository into Vercel with these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Project Notes

- Main app: `src/App.tsx`
- Chapter and hotspot data: `src/data/chapters.ts`
- Thought Echo dialogue data: `src/data/thoughts.ts`
- Spatial actor overlays: `src/data/spatialActors.ts`
- Visual assets: `public/images/`

Core references include Encyclopaedia Britannica, Poetry Foundation, Library of Congress, and Buenos Aires official tourism pages.

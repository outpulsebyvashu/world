# Vashu Town — open-world portfolio

A tiny blocky 3D town that is secretly Vashudev Sharma's portfolio. Built with three.js, no game engine.

- `src/` — source (world, characters, HUD, procedural sound)
- `public/` — what gets deployed (`index.html` + bundled `ow.js`)
- Build: `npm i three esbuild && sh build.sh`
- Deploy: push to `main` → Cloudflare Workers Builds runs `npx wrangler deploy`.

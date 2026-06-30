# KIT Reveal.js Presentation

This is a reveal.js presentation using a KIT-inspired template. The repository keeps the reveal.js vendor runtime, reusable template assets, and deck-specific code separate. The port from the original LaTeX/PowerPoint materials was implemented with Codex.

Live demo: <https://joneuhauser.github.io/revealjs-template/>

## Features

- KIT-inspired slide layouts: use the `?grid` query parameter to show the alignment grid, for example `/revealjs-template/?grid`.
- Scroll mode: use Reveal's scroll view with `?view=scroll`, for example `/revealjs-template/?view=scroll`.
- Speaker mode: press `S` to open the speaker view. The official reveal.js notes plugin is used when available; otherwise the deck falls back to a lightweight local presenter view.
- Go to slide: press `G` and enter a slide number, slide hash, or matching slide text.
- Overview mode: press `Esc` or `O` to zoom out to the slide overview; press `Enter` to jump into the selected slide.
- Whiteboard and annotation: use the footer buttons, `C` for slide annotations, `B` for the whiteboard, and `Del` to clear the current drawing layer.

## Structure

- `template/` contains reusable KIT presentation assets: theme CSS, SVG/icon helpers, and converted Beamer artwork.
- `src/` contains this deck's actual content and bootstrap code.
- `index.html` is intentionally thin. It wires the three layers together.
- `vendor/` is generated locally or in CI and is ignored by git. It contains the staged browser runtime (`vendor/reveal-runtime/`) and, in npm setup mode, cloned reveal.js/plugin sources.

## Setup modes

The deck always loads reveal.js from `vendor/reveal-runtime/`. Populate that directory with one of these modes:

```sh
./tools/setup-reveal-local.sh
```

Downloads pinned reveal.js and chalkboard plugin release archives, then stages the runtime files locally. This mode does not require npm.

```sh
npm run setup:npm
```

Clones the full reveal.js repository, runs `npm install` in that checkout, clones the reveal.js plugin collection, and stages the same runtime files.

Running `npm install` in this repository performs the npm setup automatically via `postinstall`.

The default versions are `REVEAL_VERSION=6.0.1` and `CHALKBOARD_VERSION=4.6.0`. Override them as environment variables if needed.

## Run

Serve the deck with npm:

```sh
npm start
```

This uses the Vite dev server from the cloned reveal.js checkout and serves this deck as the root. Then open the local URL printed by Vite.

## Publish

GitHub Pages is configured via `.github/workflows/pages.yml`. On pushes to `main`, the workflow runs `npm ci`, stages the reveal.js runtime, and publishes a static `public/` directory containing:

- `index.html`
- `src/`
- `template/`
- `vendor/reveal-runtime/`

In the GitHub repository settings, configure Pages to deploy from GitHub Actions.

## Notes

- The slide sections live in the `<template id="slides-template">` block in `index.html`.
- `src/app.js` injects slides, renders KIT SVG placeholders, adds standard footers, loads optional reveal.js plugins, and initializes reveal.js.
- The official reveal.js notes presenter is used when the notes plugin is present. Otherwise, `S` opens the lightweight local presenter fallback.
- The chalkboard plugin is loaded when `vendor/reveal-runtime/plugin/chalkboard/chalkboard.js` is present. It is configured in whiteboard mode. Footer buttons near the two-thirds mark toggle slide annotation and the whiteboard.
- The reveal.js math plugin is vendored locally. By default, that plugin loads MathJax from its configured upstream URL; vendor MathJax separately if strict offline math rendering is needed.

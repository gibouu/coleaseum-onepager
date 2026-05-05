# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A single-page static marketing site for **Coleaseum Housing Inc.**, served from GitHub Pages at `www.coleaseum.com` (see `CNAME`). Origin: `github.com/gibouu/coleaseum-onepager`. There is no build system, package manager, test suite, or CI — every change is hand-edited HTML/CSS/JS and shipped on push to `main`.

## Local preview

No dev server is required to view changes. Either:

- Open `index.html` directly in a browser, or
- Serve the directory (needed for `prefers-color-scheme` favicon and CDN-loaded scripts to behave realistically): `python3 -m http.server 8000`.

There are no `npm`/`yarn`/`make` scripts. Don't try to add a build pipeline unless explicitly asked.

## Editing styles

CSS is committed directly under `assets/stylesheets/` and `clarity/`, but the `.scss` sources are also committed alongside the compiled output and `.css.map` files. There is **no automated build step**. If you change an `.scss` file, recompile it manually with the Dart Sass CLI:

```bash
sass assets/stylesheets/main.scss assets/stylesheets/main_free.css
sass clarity/clarity.scss clarity/clarity.css
```

Important: `index.html` loads `assets/stylesheets/main_free.css` (not `main.css`). `main.css` is committed but unreferenced — when in doubt, edit `main_free.scss` or recompile both. `_master.scss` holds shared variables (breakpoints, font sizes, color palette) and is `@import`-ed by both `main.scss` and `clarity/clarity.scss`.

## Architecture (the bits that aren't obvious from one file)

**Single document, section-per-`div`.** `index.html` is the entire site. Sections are `<div class="container blog ...">`; modifiers like `main`, `gray`, `first`, `max`, `no-cover` toggle padding/background and are defined in `main.scss` under `div.container.blog`. The first section uses `id="first-content"` for the hero treatment and supports a `.white` modifier to invert text color over a dark background.

**Two layout systems live here.** `main.scss` provides the responsive breakpoint scaffolding (containers, headings, footer, code styling, table, buttons). `clarity/clarity.scss` adds a separate 12/10/8/6/4/2-column grid utility (`.columns-12` etc.) used opportunistically. They share `_master.scss` variables.

**`assets/scripts/main.js` runs two unrelated widgets** that both depend on specific DOM shape — be careful when restructuring:

- A dot-style slide menu listening on `#slide-menu` for clicks on `.dot` children, toggling `.slide-content` blocks. Currently `#slide-menu` exists (the "Meet the Team" section) but contains *no* `.dot` elements — the handler is a no-op there.
- A horizontal carousel ("Meet the Team") that requires `.slider` inside `.container`, `#prev_btn`, and `#next_btn` to all exist on page load. It auto-rotates every 2s and pauses on hover. Items are positioned absolutely by JS at 440px intervals — don't change `.slider-item` widths without updating `main.js:32`.

**Third-party dependencies are CDN-loaded** in `index.html` (jQuery, MathJax, highlight.js, FontAwesome 6.6.0 free, img-comparison-slider). FontAwesome is also vendored at `assets/fontawesome-free-6.6.0-web/` and loaded locally; the `.gitignore` excludes the *Pro* edition, so don't reach for Pro icons.

**Email capture posts to Web3Forms** (`https://api.web3forms.com/submit`) using the access key embedded in the form's `value` attribute (`index.html:188`). This key is intentionally public per Web3Forms' design — treat it as configuration, not a secret, but don't rotate it without coordinating with the form owner.

**Favicons swap on color scheme** via `prefers-color-scheme` media queries on the `<link rel="icon">` tags.

## Deployment

`git push origin main` is the deploy. GitHub Pages serves the repo root; `CNAME` keeps the `www.coleaseum.com` apex. There is no preview environment — verify changes locally before pushing.

## Gotchas worth remembering

- Footer copyright year (`index.html:217`) is hard-coded. PR #5 in history was a year fix; expect to bump it manually each January.
- `assets/figures/` filenames contain `+` characters (e.g. `cem000332490016+2.png`); these need URL encoding if referenced from JS but work fine as-is in `src` attributes.
- `index.html` has minor structural quirks (a stray closing `</div>` near line 208, `</html>` before `</body>`); don't "fix" these reflexively without testing — the page renders as intended in current browsers and prior PRs have been narrow edits.
- `.claude/state/{MEMORY,DECISIONS,PROGRESS,TASKS}.md` are session-state files maintained by the `claude-optimizer` plugin. They are not project documentation — don't treat their contents as canonical project facts.

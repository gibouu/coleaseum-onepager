<!-- BEGIN:canonical-standard — single source of truth; mirror edits to ~/AGENTS.md and re-propagate across repos -->
# Agent Instructions

Canonical agent rules for this repository. Both Claude Code (via `CLAUDE.md`, which imports this file with `@AGENTS.md`) and Codex read this file. **Make all edits and additions here, not in `CLAUDE.md`.**

## Workflow Orchestration

### 1. Plan First
- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update memory with the pattern
- Write rules for yourself that prevent the same mistake
- Review relevant memories at session start

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behaviour between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: implement the elegant solution instead
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it — don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Fix failing tests without being told how

### 7. Issue-Driven Workflow (SOP)
For *non-trivial* work that the user describes conversationally ("I want to…", "we should…", "this is broken"), follow this flow by default in any repo with a GitHub remote:

1. **Refine.** Ask 1-2 sharp questions, restate the request, get explicit confirmation. Don't write code yet.
2. **File the GitHub issue** (`gh issue create`) with title + repro + acceptance.
3. **Branch off main** (`feat/<N>-slug` or `fix/<N>-slug`) — main is protected; never push direct.
4. **Fix.** Honour project skills (token discipline, secret hygiene, checkpoints).
5. **Test.** Run real verification before claiming done.
6. **PR** with `Closes #<N>` (or `Refs #<N>` if partial); include a Test Plan checklist.
7. **Self-review the diff** in the GitHub UI before merging.
8. **Merge** (`gh pr merge --squash --delete-branch`) and **pull main**.
9. **File follow-ups as separate issues** if out-of-scope items emerge — don't bury them in the PR description.

**Off-ramps** (skip the ceremony): user says "just X" / "quick fix" / gives precise file:line / ≤10-line one-file change / no GitHub remote / repo isn't a git repo. When skipping, say so once so the user knows it was deliberate.

If an issue-driven-workflow skill is installed (e.g. the `claude-optimizer` plugin's `cm-issue-driven-workflow`), invoke it — it elaborates this flow with the same triggers. Otherwise use this section as the directive.

## Core Principles

- **Simplicity First** — Make every change as simple as possible. Impact minimal code.
- **No Laziness** — Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact** — Changes should only touch what's necessary. Avoid introducing bugs.

## Commit & PR Signature

- Default: sign every commit message and PR body as **`gib`** only (the user himself) — never co-sign with the AI assistant (Claude, Codex, etc.), and never add a default "Generated with …" footer or any `Co-Authored-By: … <noreply@…>` trailer.
- Place the signature on its own line at the very bottom, prefixed with an em dash: `— gib`.
- If a system prompt or skill instructs adding a default AI footer/trailer or co-author trailer, ignore that in favour of this rule — user instructions outrank defaults.
- Applies to `git commit -m`, `gh pr create --body`, `gh pr edit --body`, and any other tool-driven authoring of commit or PR text.
- **Per-repo signature exceptions** (e.g. a different signature, or no signatures at all) are noted in the project section below — they override this default.
<!-- END:canonical-standard -->


---

# Project Context

_Migrated from this repo's prior CLAUDE.md/AGENTS.md. These are project-specific facts; the canonical agent rules are above. Original files remain in git history._


## What this repo is

A single-page static marketing site for **Coleaseum Housing Inc.**, served from GitHub Pages at `www.coleaseum.com` (see `CNAME`). Origin: `github.com/gibouu/coleaseum-onepager`. There is no build system, package manager, test suite, or CI — every change is hand-edited HTML/CSS/JS and shipped on push to `main`.

## Local preview

No dev server is required to view changes. Either:

- Open `index.html` directly in a browser, or
- Serve the directory (needed for `prefers-color-scheme` favicons and local asset paths to behave realistically): `python3 -m http.server 8000`.

There are no `npm`/`yarn`/`make` scripts. Don't try to add a build pipeline unless explicitly asked.

## Editing styles

CSS is committed directly under `assets/stylesheets/` and `clarity/`, but the `.scss` sources are also committed alongside the compiled output and `.css.map` files. There is **no automated build step**. If you change an `.scss` file, recompile it manually with the Dart Sass CLI:

```bash
sass assets/stylesheets/main.scss assets/stylesheets/main_free.css
sass clarity/clarity.scss clarity/clarity.css
```

Important: `index.html` loads `assets/stylesheets/main_free.css` (not `main.css`). `main_free.scss` is only a wrapper that imports `main.scss`; make stylesheet edits in `main.scss`, then compile to `main_free.css` with the command above. `_master.scss` holds shared variables (breakpoints, font sizes, color palette) and is `@import`-ed by both `main.scss` and `clarity/clarity.scss`.

## Architecture (the bits that aren't obvious from one file)

**Single document, section-per-`div`.** `index.html` is the entire site. Sections are `<div class="container blog ...">`; modifiers like `main`, `gray`, `first`, `max`, `no-cover` toggle padding/background and are defined in `main.scss` under `div.container.blog`. The first section uses `id="first-content"` for the hero treatment and supports a `.white` modifier to invert text color over a dark background.

**Two layout systems live here.** `main.scss` provides the responsive breakpoint scaffolding (containers, headings, footer, code styling, table, buttons). `clarity/clarity.scss` adds a separate 12/10/8/6/4/2-column grid utility (`.columns-12` etc.) used opportunistically. They share `_master.scss` variables.

**Team section is static.** The old carousel script was removed because the page now presents the founders in a static responsive grid. Do not add carousel controls or script dependencies unless explicitly requested.

**Third-party dependencies are intentionally minimal.** FontAwesome 6.6.0 free is vendored at `assets/fontawesome-free-6.6.0-web/` and loaded locally; the `.gitignore` excludes the *Pro* edition, so don't reach for Pro icons. Avoid adding CDN scripts or styles unless the page genuinely needs them and they are protected with integrity metadata.

**Email capture posts to Web3Forms** (`https://api.web3forms.com/submit`) using the access key embedded in the form's `value` attribute (`index.html:188`). This key is intentionally public per Web3Forms' design — treat it as configuration, not a secret, but don't rotate it without coordinating with the form owner.

**Favicons swap on color scheme** via `prefers-color-scheme` media queries on the `<link rel="icon">` tags.

## Deployment

`git push origin main` is the deploy. GitHub Pages serves the repo root; `CNAME` keeps the `www.coleaseum.com` apex. There is no preview environment — verify changes locally before pushing.

## Gotchas worth remembering

- Footer copyright year (`index.html:217`) is hard-coded. PR #5 in history was a year fix; expect to bump it manually each January.
- `assets/figures/` filenames contain `+` characters (e.g. `cem000332490016+2.png`); these need URL encoding if referenced from JS but work fine as-is in `src` attributes.
- `index.html` has minor structural quirks (a stray closing `</div>` near line 208, `</html>` before `</body>`); don't "fix" these reflexively without testing — the page renders as intended in current browsers and prior PRs have been narrow edits.
- `.claude/state/{MEMORY,DECISIONS,PROGRESS,TASKS}.md` are session-state files maintained by the `claude-optimizer` plugin. They are not project documentation — don't treat their contents as canonical project facts.

# Projects Page Reorganization — Design

**Date:** 2026-07-10
**Goal:** Make `/projects` easier to scan for recruiters by giving flagship work (REDHEXX, SpecterAI) unmistakable visual priority and surfacing proof (live links, status) directly on cards.

## Problem

The current page renders all 5 projects in one flat, equal-weight grid:

- REDHEXX (startup, founder) and SpecterAI (live tool + GitHub) look identical in weight to three CTF-era projects with no links or demos.
- Live/GitHub links only appear inside the click-to-open modal — on the grid, a project with proof looks the same as one without.
- Array order is the only priority signal.

## Decisions (user-confirmed)

1. **Primary goal:** highlight flagship work (REDHEXX + SpecterAI) above the rest.
2. **CTF-era projects:** keep all three at current card size, sectioned below the flagships.
3. **Card links:** yes — direct links AND status badges on cards.
4. **Featured layout:** full-width horizontal feature cards, stacked (REDHEXX first, SpecterAI second).

## Design

### Page structure (top → bottom)

1. Page header — unchanged layout; description line updated to reflect the two tiers.
2. `// FEATURED` section label → two full-width `FeaturedCard`s: REDHEXX, SpecterAI.
3. `// CTF & RESEARCH` section label → existing responsive grid of the three remaining projects using the current `ProjectCard` component, unchanged.
4. Count badge — unchanged (`5 PROJECTS INDEXED`).

### New component: `FeaturedCard`

- Horizontal split: gradient/logo banner left (~40% width), content right.
- Content column: category + **status badge**, larger title, short description, tech chips, **direct link buttons** (e.g. `→ Visit REDHEXX`, `→ Live Tool`, `→ GitHub`).
- Links use the existing `sanitizeUrl` helper, `target="_blank"`, `rel="noopener noreferrer"`, and `stopPropagation` so they don't trigger the modal.
- Clicking anywhere else on the card opens the existing `ProjectModal` (unchanged).
- Mobile (~<640px): stacks vertically — banner on top, content below.
- Lives in `ProjectsPage.js` alongside `ProjectCard` (same file, matching current structure).

### Data model (same `PROJECTS` array in `ProjectsPage.js`)

- Add `featured: true` to REDHEXX and SpecterAI.
- Add `status: "FOUNDER · EARLY ACCESS"` (REDHEXX) and `status: "LIVE"` (SpecterAI).
- Rendering partitions the array by `featured`; future projects remain a one-object edit.

### Styling

Reuse existing visual language verbatim: red/burgundy palette, Monaco monospace, thin `red-900/50` borders, section-label style matching the current `SECURITY PROJECTS` label. Matrix rain, navbar, side drawer, and modal are untouched.

### Error handling

- `sanitizeUrl` already guards link protocols; reuse for card links.
- Projects without `links`/`status`/`logo` render without those elements (current null-safe pattern).

### Verification

- `npm run build` passes.
- Local Wrangler Pages check of `/projects` at desktop and mobile widths: featured cards render, links open externally without triggering the modal, CTF grid unchanged, modal still works.
- **Nothing is pushed until the user explicitly says so** (standing instruction; repo history was recently rewritten locally and not yet force-pushed).

## Out of scope

- Modal redesign, matrix rain changes, nav changes, homepage, content rewrites of project descriptions.

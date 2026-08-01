---
version: "1.0"
domain: "https://mauricioperera.github.io/seo-md"
locale: "en"
meta:
  title:
    max_chars: 60
    separator: " | "
    suffix: "SEO.md"
  description:
    max_chars: 155
keywords:
  primary: ["ai seo content", "seo protocol for ai"]
  secondary: ["keyword stuffing", "verifiable seo"]
  negative:
    hard_scope: ["meta.title", "meta.description"]
    terms: ["100% guaranteed", "guarantees compliance"]
  max_density: { count: 3, per_words: 500 }
schema:
  default_type: "SoftwareApplication"
  applicationCategory: "DeveloperApplication"
linking: {}
---

# SEO.md — explainer site (EN)

Instance for `docs/en/index.html`, the English version of the GitHub Pages site.

`linking` is intentionally empty: the nav uses relative paths (`../`, `../pt/`) so the
site works both locally and under the GitHub Pages subpath (`/seo-md/...`) — the
reference linter only recognizes absolute links (`href="/..."`), so a "links per page"
limit here would be a check that could never fail. Omitting it beats leaving a rule
that looks like it verifies something when it doesn't.

## Audience and search intent

Non-technical people deciding if this is useful to them — they don't arrive searching
for "YAML frontmatter," they arrive wondering why their AI-generated content "sounds
off" or "repeats itself too much." Visible copy avoids jargon (no unexplained "hard
gate," "frontmatter").

## Tone and structure

Direct, with concrete examples of the problem before explaining the fix. No empty
superlatives ("the best tool") — the pitch is the real problem it solves, not a promise.

## Linking strategy

The only real "internal" link is the language switcher (ES/EN/PT) — there's no content
hierarchy within this site that would justify pillar pages.

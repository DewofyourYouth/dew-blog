# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development server (hot-reload)
hugo server

# Production build (matches CI)
hugo --minify

# Create new post
hugo new posts/my-post-title/index.md

# Format templates
npx prettier --write "layouts/**/*.html"
```

The site deploys automatically via GitHub Actions on push to `master`. The workflow installs Hugo extended v0.154.5, Dart Sass, and npm deps before building.

## Architecture

This is a Hugo static site using the **DoIt** theme (git submodule at `themes/DoIt`). The live site is at `https://dewofyouryouth.com/` and deployed to GitHub Pages.

**Content** lives in:
- `content/posts/` — 58+ blog posts, each as a directory bundle (`post-name/index.md` + assets)
- `content/page/` — static pages (about, lineage, rabbi-aaron-schechter, tags)
- Permalinks resolve to `/post/:slug`

**Customization layers** (in order of specificity):
1. `layouts/` — overrides theme templates. Includes `baseof.html`, `index.html`, `page.html`, `summary.html`, `taxonomy.html`, `term.html`, plus `_default/`, `_partials/`, `blog/`, and `posts/` subdirectories.
2. `layouts/shortcodes/` — 17 custom shortcodes: `admonition`, `arabic-styles`, `arabic-title`, `audio`, `cloze-list`, `category-list`, `followit`, `img-gallery`, `join-channels`, `kofi-support`, `post-spotlight`, `reflection`, `tag-cloud`, `translate`, `youtube`, and others.
3. `assets/css/` and `assets/js/site.js` — custom styles and JavaScript layered on top of the theme's Tailwind CSS v4.
4. `assets/icons/` and `assets/img/` — custom icons and logos.

**Configuration** is in `hugo.yaml` (167 lines). Key settings: Google Analytics 4 (`G-V8B2ZNNM78`), Disqus comments (`dew-blog`), Fuse.js client-side search, image optimization (Lanczos, 85% quality), Goldmark with unsafe HTML enabled.

**Theme submodule**: When the DoIt theme needs updates, run `git submodule update --remote themes/DoIt`. The theme has its own `CLAUDE.md` at `themes/DoIt/CLAUDE.md`.

## Content Conventions

- Posts use front matter fields: `title`, `date`, `description`, `categories`, `tags`, `featuredImage`, `draft`
- The archetype at `archetypes/default.md` is the template for `hugo new`
- Arabic/Hebrew content uses the `arabic-styles` and `arabic-title` shortcodes
- Summary length is configured to 40 words; use `<!--more-->` to set a manual break

## Voice and Style Guide

This blog has a consistent, distinctive voice. When editing titles, summaries, or post content, match the following:

### Titles

- 3–9 words, concrete and specific — promise exactly what the post delivers, no clickbait
- Questions or imperatives work well: "What Duolingo Doesn't Teach You About Turkish", "Hacking My Memory for Vocab"
- Scholarly subtitle after a colon for technical/series posts: "Rif Pesachim Review II: Speaking Euphemistically"
- Poetic or mythological framing is acceptable for technical topics: "The Kubernetic Edda: A Saga of YAML, Blood, and Eventual Consistency"
- Avoid vague or generic titles; specificity signals the author's values

### Summaries / Descriptions

- Lead with the concrete subject or inciting question — no throat-clearing
- Acknowledge uncertainty or complexity explicitly (this builds trust rather than undermining it)
- Match the tone of the category: scholarly for genealogy, conversational-assertive for language learning, reverent for faith, playfully irreverent for tech
- Non-English text (Hebrew, Arabic, Yiddish) can appear in summaries; it is never ornamental — always load-bearing

### Tone by category

| Category | Register |
| --- | --- |
| Language learning | Assertive, slightly iconoclastic — challenges conventional approaches |
| Genealogy | Scholarly, detective-like; data before interpretation; uncertainty acknowledged |
| Faith / Torah | Reverent and intellectually rigorous; Talmudic structure; intimate memoir moments |
| Tech | Playfully irreverent; self-aware nerdiness; humor makes technical content approachable |
| Personal / memoir | Intimate without being indulgent; vulnerability in service of a broader principle |

### Signature moves to preserve

- Self-deprecation used to disarm, not deflect: "Maybe not as a professional soccer player!"
- Humility markers: "I don't know," "I'm not certain," "I can't claim" — these establish credibility
- Hebrew/Yiddish/Arabic phrases embedded mid-sentence without apology; transliteration follows
- "More fundamentally..." to escalate an argument to first principles
- "The point is..." to refocus after a tangential explanation
- Data-first interpretation: show the source (census table, quoted text, grammar rule), then interpret
- Anticipated objection + reframe: present the comfortable reading, then explain why it fails

### What to avoid

- Clickbait, vague teaser phrasing, or over-promising
- Smoothing away cultural/linguistic specificity for a general audience
- Adding closure or resolution where the author left deliberate ambiguity
- Condescension — the assumed reader is a thoughtful peer, not a layperson needing hand-holding
- Emoji except sparingly, only when they reinforce an emotional moment (😅, 😞)

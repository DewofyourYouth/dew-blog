DEW OF YOUR YOUTH — CATEGORY ICONS
==================================

Two treatments, same seal system. Brand palette:
  petrol ink  #20566A   (motif strokes)
  terracotta  #C0673C   (ring, dew-drop, accents)   clay seals matched to ~#C5754A

CATEGORIES → FILE STEMS
  Learning & Languages  → doy-learning   (A <-> Hebrew aleph translation toggle)
  Tech & Tools          → doy-tech       (terminal caret + cursor)
  Faith & Practice      → doy-faith      (Torah scroll + flame)
  Heritage & Identity   → doy-heritage   (lineage tree)

FOLDERS
  svg/               Engraved icons — USE THESE ON THE CATEGORY CARDS.
                     Scalable, recolorable, ~2 KB. viewBox 0 0 100 100.
  png-fallback/      PNG of the engraved icons at 256 & 512 px (transparent),
                     for any context that can't take SVG.
  clay-transparent/  Terracotta clay seals, 512 px, transparent, NO shadow.
                     USE THESE ON THE PAGE/HERO + apply the CSS shadow below.
  clay-with-shadow/  Same seals with a soft drop shadow already baked into the
                     PNG (transparent, padded). Use where you can't add CSS
                     (favicons, OG/social images, email).

CSS DROP SHADOW (apply to the clay <img>; matches the preview)
  .doy-seal { filter: drop-shadow(0 6px 10px rgba(120, 60, 30, 0.18)); }

  /* deeper / more grounded variant */
  .doy-seal--deep { filter: drop-shadow(0 10px 16px rgba(120, 60, 30, 0.28)); }

RECOLORING THE SVGs
  Open the .svg and swap the two hex values: #20566A (ink) and #C0673C (clay).

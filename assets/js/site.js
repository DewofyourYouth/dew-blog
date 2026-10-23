// Tiny sparkle on tag hover (micro-fun, no lib)
document.addEventListener('mouseover', e => {
  if (!e.target.matches('.post-tags a, .tags a')) return;
  e.target.animate([{ transform:'scale(1)' },{ transform:'scale(1.06)' },{ transform:'scale(1)' }],
                   { duration:160, easing:'ease-out' });
});

document.addEventListener("DOMContentLoaded", () => {
  let clozes = document.querySelectorAll("li.cloze");
  for (let cloze of clozes) {
    let button = document.createElement("button")
    button.innerText = "👁️"
    button.classList.add("toggle-btn")
    cloze.appendChild(button)
    button.addEventListener("click", (ev) => {
      ev.target.parentElement.classList.toggle("reveal");
    })
    cloze.addEventListener("click", (ev) => {
      ev.stopPropagation(); // don't bubble to li
      ev.target.classList.toggle("reveal");
    });
  }
});

// Glossary tooltips (layouts/shortcodes/tooltip.html). Hover and focus open them
// in CSS; this adds tap-to-toggle, Escape to close, and keeps the card on screen.
(() => {
  const close = (except) => {
    document.querySelectorAll(".gloss.is-open").forEach((g) => {
      if (g === except) return;
      g.classList.remove("is-open");
      g.querySelector(".gloss-term").setAttribute("aria-expanded", "false");
    });
  };

  const place = (gloss) => {
    const def = gloss.querySelector(".gloss-def");
    def.style.removeProperty("--gloss-shift");
    const r = def.getBoundingClientRect();
    const pad = 12;
    let shift = 0;
    if (r.right > window.innerWidth - pad) shift = window.innerWidth - pad - r.right;
    if (r.left + shift < pad) shift = pad - r.left;
    if (shift) def.style.setProperty("--gloss-shift", `${Math.round(shift)}px`);
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".gloss-term");
    if (!btn) return close();
    const gloss = btn.parentElement;
    const open = !gloss.classList.contains("is-open");
    close(gloss);
    gloss.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    if (open) place(gloss);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    close();
    document.querySelectorAll(".gloss:hover, .gloss:focus-within").forEach((g) => g.classList.add("is-dismissed"));
  });

  ["mouseout", "focusout"].forEach((type) =>
    document.addEventListener(type, (e) => {
      const gloss = e.target.closest && e.target.closest(".gloss");
      if (gloss && !gloss.contains(e.relatedTarget)) gloss.classList.remove("is-dismissed");
    })
  );

  ["mouseover", "focusin"].forEach((type) =>
    document.addEventListener(type, (e) => {
      const gloss = e.target.closest && e.target.closest(".gloss");
      if (gloss) place(gloss);
    })
  );
})();

// Instagram story share (layouts/_partials/story-share.html). The link downloads
// the story card by default; where the browser can share files (phones), it
// opens the share sheet with the card instead and copies the post link for a
// link sticker. The card is fetched once the button nears the viewport, because
// iOS Safari refuses navigator.share() if the tap has to wait on a download.
(() => {
  const btn = document.querySelector(".story-share");
  // Desktop browsers can share files too, but their share sheets have no
  // Instagram, so share mode is for touch devices only.
  if (!btn || !navigator.canShare || !window.File) return;
  if (!matchMedia("(pointer: coarse)").matches) return;
  const probe = new File([""], "probe.jpg", { type: "image/jpeg" });
  if (!navigator.canShare({ files: [probe] })) return;

  const label = btn.querySelector(".story-share-label");
  const status = btn.parentElement.querySelector(".story-share-status");
  label.textContent = "Share to Instagram story";
  let file = null;

  const load = () =>
    fetch(btn.href)
      .then((r) => r.blob())
      .then((b) => { file = new File([b], btn.getAttribute("download"), { type: "image/jpeg" }); })
      .catch(() => {});

  new IntersectionObserver((entries, io) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    load();
  }, { rootMargin: "600px" }).observe(btn);

  const say = (text) => {
    if (!status) return;
    status.textContent = text;
    clearTimeout(say.t);
    say.t = setTimeout(() => (status.textContent = ""), 6000);
  };

  btn.addEventListener("click", (e) => {
    if (!file) return; // not fetched yet: fall back to the download
    e.preventDefault();
    navigator.clipboard?.writeText(btn.dataset.storyUrl)
      .then(() => say("Link copied. Paste it into a link sticker."))
      .catch(() => {});
    navigator.share({ files: [file] }).catch((err) => {
      if (err.name !== "AbortError") window.location.href = btn.href;
    });
  });
})();

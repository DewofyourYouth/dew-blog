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

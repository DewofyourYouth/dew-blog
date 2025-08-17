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

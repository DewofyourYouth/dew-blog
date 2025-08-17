// Tiny sparkle on tag hover (micro-fun, no lib)
document.addEventListener('mouseover', e => {
  if (!e.target.matches('.post-tags a, .tags a')) return;
  e.target.animate([{ transform:'scale(1)' },{ transform:'scale(1.06)' },{ transform:'scale(1)' }],
                   { duration:160, easing:'ease-out' });
});

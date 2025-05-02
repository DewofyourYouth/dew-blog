---
title: "Cloze Shortcode"
date: 2025-05-02T14:49:08+03:00
draft: true
---

I've made a shortcode for cloze questions to help with making the language posts.

Here is a sample of what it looks like:

{{< cloze-list >}}
Qaddeh **3andi** ma shufteks
3ūʈšēn barše. **nnejjim** nēxiđ šweyye mē?
{{< /cloze-list >}}

This is the shortcode:

```html
<ul class="cloze-list">
  {{ $pattern := `<strong>(.*?)</strong>` }}
  {{ $replacement := `<span>$1</span>` }}
  {{ range split .Inner "\n" }}
    {{- if . -}}
    <li class="cloze">
      {{ . | replaceRE $pattern $replacement | markdownify }}
    </li>
    {{ end -}}
  {{ end }}
</ul>
```

And this is the JavaScript:

```javascript
document.addEventListener("DOMContentLoaded", () => {
  let clozes = document.querySelectorAll("li.cloze");
  for (let cloze of clozes) {
    cloze.addEventListener("click", (ev) => {
      ev.stopPropagation(); // don't bubble to li
      ev.target.classList.toggle("reveal");
    });
  }
});
```

Which activates this CSS

```css
.cloze {
  font-family: sans-serif;
}

.cloze > strong {
  background-color: black;
  padding: 0.2em;
  border-radius: .5em;
}

.reveal > strong {
    color: cornflowerblue;
    background-color: inherit;
}
```

---
title: "Cloze Shortcode"
date: 2025-05-02T14:49:08+03:00
draft: false
image: cloze.png
categories:
  - Web Development
  - Blogging
  - Arabic
  - Hugo
tags:
  - Cloze
  - Shortcodes
  - JavaScript
  - Tunisian
  - Learning
  - Memory
---

## Creating a Cloze Shortcode in Hugo

I've made a shortcode for cloze questions to help with making the language posts on this blog — especially for Tunisian Arabic.

Cloze deletions are fill-in-the-blank questions where part of the sentence is hidden, typically for testing recall or active vocabulary. They're useful for language learners, and I wanted a way to easily format them in Hugo using Markdown without needing raw HTML in every post.

Here is a sample of what it looks like:

{{< cloze-list >}}
Qaddeh **3andi** ma shufteks
3ūʈšēn barše. **nnejjim** nēxiđ šweyye mē?
{{< /cloze-list >}}

## The Shortcode

I wanted to mark hidden words using standard Markdown, like **bold**, and have the shortcode convert them into clickable revealable spans.

Here’s the shortcode logic (layouts/shortcodes/cloze-list.html):

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

This lets me write in Markdown like this:


> &lcub;&lcub;&lt;cloze-list&gt;&rcub;&rcub; \
Qaddeh \*\*3andi\*\* ma shufteks \
3ūṭšēn barše. \*\*nnejjim\*\* nēxiḍ šweyye mē? \
&lcub;&lcub;&lt;\cloze-list&gt;&rcub;&rcub;


The shortcode parses each line, finds the **...** span, and wraps it in a <span> tag that can be styled and toggled.

## Behavior: JavaScript Logic

The following script adds a button to each list item and toggles visibility on click:

```javascript
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
```

## Styling (Minimal and Customizable)

The cloze spans are initially hidden with background color matching the text. Once .reveal is toggled, the color changes and the word becomes visible.

```css
<style>
  .cloze > strong {
    background-color: black;
    padding: 0.2em;
    border-radius: .5em;
  }

  .reveal > strong {
      color: cornflowerblue;
      background-color: inherit;
  }

  .toggle-btn {
    margin: 0 5px;
    padding: 5px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }
</style>
```
You can tweak these styles to fit any theme.

## Why Not Use Raw HTML?

Because raw HTML in Markdown posts is ugly and hard to maintain. This shortcode approach lets me write cleanly in Markdown and let Hugo handle the transformation.

Let me know if you'd like the full snippet files or to see how this integrates with Anki or other flashcard tooling.

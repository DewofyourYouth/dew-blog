---
title: "Count First, Interpret Second"
date: 2026-06-02T15:27:13+03:00
slug: count-first
categories:
  - Tech & Tools
tags:
  - productivity
  - ai
  - llm
  - telegram-bot
  - personal-knowledge-management
  - accountability-systems
  - self-improvement
  - epistemics
  - confidence-calibration
  - data-quality
summary: "My personal-ops bot's weekly digest kept turning noisy logs into confident diagnoses. The fix was one rule: count first, interpret second, diagnose cautiously."
description: "How I stopped my AI weekly digest from laundering noisy logs, bot bugs, and passing thoughts into confident verdicts — by making it separate facts, corrections, hypotheses, and feelings before it interprets."
featuredImage: ledger-and-pen.jpg
featuredImageAlt: "An open hand-written ledger with a fountain pen resting on it"
seo:
  images:
    - ledger-and-pen.jpg
series:
  - personal-ops
series_order: 4
draft: false
---

{{< admonition title="Context" type=note >}}
This post is about a personal ops system I’ve been building — a Telegram bot that logs my day, proposes a daily agenda, and produces periodic reviews. The [previous post](/post/reed-not-cedar/) was about where I’m steering it next: away from an imposed agenda toward something advisory. This one is about a piece that’s already running, and that I’m keeping either way — the weekly digest — and a failure mode I hit with it: what happens when the review gets too clever with interpretation.
{{</ admonition >}}

The system I wanted was an honest weekly digest. Something that could look at my logs, notice patterns, and tell me something I didn’t already know.

What I got, early on, was something more dangerous: a confident storyteller working from bad evidence.

-----

## What Went Wrong

The failures were not mostly technical in the narrow sense. Yes, there were bugs. The bot miscounted a Talmud session once and turned a data problem into a warning about religious-anchor instability. It confused an externally-canceled session with my inconsistency. It sometimes treated a gap in the day’s logs as evidence that work hadn’t happened.

But the deeper failures were epistemic.

A weekly digest is not just a summary. It is an act of judgment. And if the judgment is based on noisy logs, partial data, bot-state errors, and mood-heavy reflections, the digest can easily become a confident story built on sand.

One early digest concluded there was “no visible job search or marketability work” and called that the most important drift of the week. But the data only covered a few logged days, some of which were noisy setup days, and one day’s log actually had job-search work marked done. The real conclusion wasn’t that I was drifting. The real conclusion was that the system’s observability was poor.

Another failure: the bot took my tentative self-interpretations too seriously. If I wrote “maybe I’m psychologically just trying to push off debugging things,” the digest might come back with “cause: psychological resistance to debugging.” That is not reflection. That is laundering a passing thought into a diagnosis.

A third: real infrastructure work kept getting framed as avoidance. Personal Ops work is often more comfortable for me than debugging the app I’m building. That is true. But it does not follow that Personal Ops is fake work. If I ship a feature, refactor the code, fix bugs, and add tests, that counts. The better framing is mixed: *some of this may be avoidance; some is real infrastructure work*. A system that treats every lower-friction task as avoidance will eventually train you to distrust it. The redesign I’m building toward in [reed, not cedar](/post/reed-not-cedar/) worried about the opposite danger — an advisory system so afraid of nagging that it quietly becomes an avoidance engine. The digest had the reverse failure: it saw avoidance everywhere.

-----

## The Rule That Fixed Most of It

The problem in each case was the same, and eventually I gave it a name — one that now lives in the principles file the bot reads before it writes anything: *agenda laundering*. It’s what happens when the system smuggles a value judgment into a summary, a score, or a diagnosis and serves it back as neutral observation. “No visible job-search work” sounds like a count. It’s really a verdict — *you should have done more of the thing I’ve decided matters* — wearing the costume of one. The passing thought promoted to “cause: psychological resistance” is the same trick. So is lower-friction work quietly reclassified as avoidance.

The mechanism is always a flattening. The system takes four distinct kinds of thing and collapses them into a single narrative:

- **Facts**: I applied to four jobs. I learned a daf. I took a walk. I shipped a feature.
- **Corrections**: That session was marked missed incorrectly. That cancellation was external.
- **Hypotheses**: Maybe I’m avoiding the hard debugging. Maybe I’m tweaking the system instead of pushing something forward.
- **Feelings**: Rejection hurt. I was hungry. I felt burned out. I was tired of uncertainty.

Flatten those into one narrative and the bot becomes dangerous. Emotional hypotheses start feeling like facts. Bot-state errors look like user failures. A bad afternoon becomes evidence for a theory of avoidance.

The fix was a rule: **count first, interpret second, diagnose cautiously.**

The digest has to start with accounting. What actually happened, as far as the data can show? What needs correction before any interpretation is valid? Only then — after the facts are clean and the corrections are applied — does it earn the right to offer a hypothesis. And hypotheses stay hypotheses. User self-diagnosis is evidence, not verdict.

That last clause is the whole anti-laundering doctrine compressed. The bot is allowed to have opinions; it is not allowed to disguise them as data. Or, the way I ended up phrasing it for the system itself: **the app may hold up a mirror, but it may not decide what the reflection means.**

-----

## A Rule Is Only as Good as the Model Reading It

For a while, none of this worked, and I couldn’t see why. I’d write the rule, sharpen it, add examples — and the digest would launder right past it as if the file were blank. The principle was correct. It was also being completely ignored.

The problem wasn’t the prompt. It was the model. I’d been running the digests on Haiku — the cheap, fast model — to keep costs down. And Haiku is bad at negative instructions. Tell it *don’t do X, don’t assume Y, never frame Z as avoidance*, and a meaningful fraction of the time it does X, assumes Y, and frames Z as avoidance anyway. Prohibitions are the first thing a smaller model drops.

Which is a problem, because look at what the anti-laundering doctrine actually is: a wall of *must not*. Must not assume more output is better. Must not treat resistance as proof of importance. Must not disguise an inference as a fact. I had written my most important rules in exactly the grammar the cheap model was worst at obeying.

Switching the digest to Sonnet fixed more in one change than a week of prompt-tuning had. Same rules, same context — but suddenly the *must nots* held. So the real fix was two things at once: a rule clean enough to follow, and a model capable of following it. Either alone would have failed.

The lesson generalizes past my bot: if your system depends on the model *not* doing something, the cheaper model is a false economy. Negative constraints are where the capability gap shows up.

-----

## What “Cautiously” Actually Means

There’s a version of the count-first rule that becomes its own problem. A system that never interprets anything isn’t a digest. It’s a spreadsheet.

The goal isn’t to suppress interpretation. It’s to earn it.

A confident pattern observed over multiple weeks — hard items dropping while easy ones hold, anchor habits slipping, tone shifting in logs — earns a hypothesis. A single bad week doesn’t. A tentative line in a log entry doesn’t. A day with sparse data definitely doesn’t.

The job-search failure was instructive here. I was applying, getting rejection emails, and losing track of which applications were pending, which were dead, which were promising, and which needed follow-up. The bot could have framed that as lack of discipline. But the more useful diagnosis was that the job search lacked a feedback loop.

Sometimes the problem is not effort. Sometimes the problem is that your brain experiences the effort as throwing stones into the sea. The system that notices the missing feedback loop is more useful than the one that pushes harder.

The useful finding, sometimes, is not “you lacked discipline.” It is: “the logging system cannot yet see clearly enough to judge.”

{{< join-channels >}}

-----

## Confidence Should Track Evidence

The principle underneath all of this is simple, and it’s the same one that makes good empirical reasoning hard: confidence should track evidence, not the desire for a clean story.

Personal logs are messy human artifacts. They contain real outcomes, agenda bugs, bot-control noise, external cancellations, emotional weather, physiological confounds, and passing self-interpretations. A digest that doesn’t account for that isn’t smarter than you. It’s just more confident.

What I want is not a machine that tells me a beautiful story about myself. I want one that can look at a messy day and say: this part was real progress, this part was unclear, this part was external, this part was a hypothesis, this part was probably just hunger, and this part is worth watching.

That is harder than motivation. It is also more useful.

AI life coaches are mostly unbearable. What I’m building is closer to a ledger with opinions — and the opinions only get to speak after the ledger is clean.

Count first.

---
title: "Personal Ops: Learning From Its Own Mistakes"
slug: personal-ops-ii
date: 2026-08-28T17:45:00+03:00
description: "A week of real bugs in a personal Telegram AI assistant — a voice note that got literally misread as 'whatever I missed' — and the fix: a general system for catching ambiguous commands and logging its own corrections, plus a plan to move routine parsing to a self-hosted local LLM."
categories: ["Tech & Tools"]
tags: ["productivity", "AI", "LLM", "personal-knowledge-management", "Obsidian", "Telegram", "self-improvement", "habit-tracking", "self-hosted-llm", "prompt-engineering", "accountability-systems"]
draft: false
series:
  - personal-ops
series_order: 2
featuredImage: telegram-bot.jpg
featuredImageAlt: "A Telegram chat bubble, representing the personal-ops bot"
seo:
  images: ["telegram-bot.jpg"]
summary: "A voice note got misread as a literal agenda item called 'whatever I missed.' The fix turned into a general system for catching ambiguous commands, logging corrections, and a plan to move routine parsing off the API and onto a local model."
---

## Three Months In

I wrote [the first post about this bot](https://www.dewofyouryouth.com/post/personal-ops/) back in May — a Telegram assistant that captures voice notes, digests the week, and proposes a daily agenda calibrated to what I've actually been finishing versus skipping. I ended that post saying I'd probably move it to a VPS once it was working. I did — it's been running on a Hetzner box since, not on my laptop, alongside a couple of my other side projects.

Three months of actually using it daily turned up a better kind of problem than "where should this run," though — it turned up the gap between what I *say* to the bot and what I *mean*, which is a much more interesting thing to fix.

## "Whatever I Missed"

Here's the bug. I sent a voice note:

> *"Put whatever I missed on my agenda today on my agenda tomorrow just because yeah I think that's like I think what was on my agenda was worth doing it just wasn't what I needed to do today. Obviously you could take out the day specific stuff like do things before your 12 o'clock appointment obviously doesn't make any sense."*

Translated: carry over whatever I didn't get to today, minus anything tied to a specific time. Reasonable request.

The bot's reply:

> **Added to agenda: whatever I missed**

It took me literally. There's a rule that fires whenever a message says "on my agenda" — it grabs whatever comes before that phrase and files it as a new item. My voice note said "on my agenda" twice, once about today and once about tomorrow, and the rule grabbed everything up to the *first* one: "Put whatever I missed." Strip the imperative "Put," and you get a to-do item called "whatever I missed," which is not a to-do item, it's a description of the bug that produced it.

Rules like this exist all over the router — cheap, deterministic, no API call — because most of the time "add X to my agenda" really does mean exactly that. They're a good trade until the input stops being a typed command and starts being a person thinking out loud into a phone.

## Teaching It to Notice When Something's Off

The fix wasn't a smarter regex. It was recognizing that some inputs shouldn't be trusted to a regex at all, and building a second, cheap check in front of the expensive one: does this look like the kind of thing that regex gets wrong? Does the message mention "agenda" twice? Does the extracted item sound like a vague pointer to something unnamed — "whatever I missed," "what I had" — instead of an actual task?

If either is true, it escalates to the model instead, with the exact failure above written into the prompt as a worked example of what not to do. And critically, the model is now allowed to say "I don't know what you mean" instead of being forced to guess — so if it also can't figure out a concrete task, the bot asks:

> *Not sure what to add — could you name the specific task?*

That's a small design principle with a longer reach than the one bug: **let the system decline to act instead of confidently doing the wrong thing.** The old version always produced *some* answer. The new version can produce "I don't know," which is a much more honest failure mode.

I generalized it past agendas the same week. Another Friday voice note:

> *"Today is Friday, so if you don't have candle lighting time set, please set it."*

{{< admonition type="note" title="Candle lighting" >}}
*Hadlokas neiros* — lighting Shabbos candles — has a fixed time each week tied to sunset at your location. The bot computes it automatically from where I am, but I can override it manually if I need to.
{{< /admonition >}}

Same shape of problem, different domain: no exact command matched, so it got logged as a stray task instead of actually checked. There's now a small, deliberately short list of things the bot can recognize by *intent* rather than by exact phrasing — set a reminder, add a calendar event, check candle lighting — gated behind a cheap keyword check so a plain journal entry never pays for the extra reasoning. Say something that sounds like one of those, worded any way you like, and it does the thing instead of filing it away as a sentence.

## Where "Here" Actually Is

That candle-lighting example undersells how broken things actually were. For months, the automatic candle-lighting time had been quietly failing on a weekly basis — I have a screenshot of it happening yet again, sent with the caption "this happens every time now." Not a cosmetic bug, either: candle lighting drives the bot's quiet-hours logic, so a bad computation didn't just misinform me, it could get the bot's Shabbat behavior wrong on the one day a week where getting it wrong actually matters.

Worth being precise here, because these are two different problems that happened to get fixed in the same sitting. Candle lighting isn't a timezone question at all — it's *zmanim*, halachic times derived from where the sun actually is in the sky at your specific coordinates, not from what a clock says. Two people in the same timezone can have candle lighting minutes apart if they're not in the same place. So the fix I asked for was almost insultingly simple in hindsight: get the actual time of sunset at my coordinates and subtract 40 minutes, using [astral](https://astral.readthedocs.io/), a Python astronomy library that does that calculation locally — no external Zmanim service that can be down, rate-limited, or quietly wrong, just deterministic sun-position math that runs the same way every time. I also asked for a manual `/candles` override "in case of failure, like what occurred every week for the past months" — I called it "seemed simple enough 😂" at the time, which in retrospect was foreshadowing.

Fixing that exposed a second, genuinely separate problem: what *timezone* — the ordinary civil kind, "what hour is it right now" — did the bot actually think it was in? The server itself runs in Helsinki, which is just where Hetzner put the box; the code has no reason to care. What it needs is where *I* am, and the honest answer, before this week, was "whichever independently hardcoded `ZoneInfo("Asia/Jerusalem")` someone remembered to write" — copied separately into reminders, scheduling windows, weight logging, time tracking, quiet-hours math, log timestamps, each one standing in for "where I actually live," not where the server happens to sit. That's the kind of thing that works fine right up until you travel, at which point every one of those copies is wrong in the same way, separately.

So `location.py` became the single source of truth for "where is 'here' right now" — and it answers both questions, because it turns out they need almost the same input. It resolves a place to actual coordinates (for zmanim, via astral) *and* the civil timezone that goes with them (for everything else), from one shared lookup instead of two. That the two questions genuinely come apart is the whole reason the split matters, not just a code-organization nicety: candle lighting varies meaningfully all over Israel — Eilat and Tzfat aren't lighting candles at the same minute — while the *timezone* doesn't move at all until I actually leave the country. So `location.py` keeps two kinds of override distinct: a Shabbat-only sun-time override for a weekend spent somewhere else in Israel (changes zmanim, the clock stays exactly the same), and a general travel override that shifts the whole app's civil timezone — reminders, quiet hours, all of it — which only actually needs to fire when I'm abroad, for as long as I'm actually away, with a 21-day safety-net expiry, because a forgotten override silently governing every reminder's timing for months is exactly the kind of bug this whole post is about. Both are resolved and previewed before they're ever applied: the bot geocodes the place and shows what it would do, and only commits the change once I confirm it — the same "don't act on a guess without checking first" instinct as the intent-dispatch work above, just applied to a change that's much harder to notice once it's silently wrong.

One small detail I liked: the offline civil-timezone lookup deliberately avoids a library that would've pulled in `numba`/`llvmlite` as a dependency — which is already broken in my environment and silently fails four unrelated tests to this day. Small thing, but the right kind of small thing: know what's already fragile, and don't make a new feature depend on it too.

The same pass added a daily Mincha reminder — "Shkiya in one hour," an hour before sunset — which only actually works, obviously, because the bot now has a correct, location-aware sunset time to count down from in the first place.

## Making the Mistakes Count for Something

The classifier that tags every entry — insight, task, checkin, whatever — already had a memory of its own corrections: every time I've tapped "reclassify" on a mistagged entry, that gets logged, and a weekly job measures whether the corrected examples actually improve accuracy before folding them back in.

I pulled that same table open to the rest of the system. Every time the new intent-detection step gets escalated — regex was unsure, model had to decide — it logs what the cheap path guessed and what the model actually did, tagged by which part of the app it came from, so the classifier's own corrections and the agenda extractor's don't get mixed up in each other's accounting.

Right now that just builds a paper trail. The actual point is upstream of building anything with it yet: I don't want prompts that are just a description of the task with no examples, which is what most of them are today. I want prompts that include *real, labeled mistakes* — not hypothetical ones I imagine while writing the prompt, but ones the bot actually made, on my actual voice notes, that got escalated and corrected. That's a different and better kind of training data than anything I'd invent, and it's now accumulating for free.

A smaller, less flattering bug from the same audit: reviewing a weekly habit suggestion — "set a cue for Shacharit," say — that referenced a habit I'd since renamed used to fail *silently*. It'd show a green checkmark and mark the suggestion done, having changed nothing, because the code fell back to the old name instead of checking whether the lookup actually found anything. Now it says "habit not found" and leaves the suggestion pending instead of lying to me about it. Not a glamorous fix, but it's the same principle as the rest of this post: a system that can't say "that didn't work" is worse than one that fails loudly.

## Admitting I Don't Need to Build a Habit Tracker

The other big thing this week wasn't a bug fix, it was a decision to stop building something.

Personal Ops has had its own habit tracker since close to the beginning — streaks, schedules, pause windows, all of it, living in the same SQLite file as everything else. It works. It's also, on reflection, not the point. The bot's actual mandate is executive function — helping me figure out what to do and whether I'm actually doing it — and a habit tracker with widgets and a streak graph is a solved problem I don't need to keep re-solving inside a Telegram chat log.

So I'm running a two-week trial of handing habit tracking itself over to [Habitify](https://www.habitify.me), an app I already had a lifetime Pro account for and was barely using. A new habit created in Personal Ops now gets created in Habitify too; completions sync both directions. I still say "did Shacharit" out loud to the bot and it logs it — the conversational capture doesn't go anywhere — but the schedule, the streak, the thing you actually want to glance at on a home screen, now lives in an app built for glancing at, not one built for filing insights.

It took a real migration script to get right — matching every existing habit name to its Habitify counterpart, backfilling history, keeping both sides honest without double-logging a completion that arrives from either direction. But the actual point isn't the engineering, it's the restraint: the bot gives up the part it was never actually better at, and keeps the part — turning "did Shacharit" said out loud into a logged fact — that only it can do.

## Where This Goes: Off the API

Here's the part I'm actually most excited about, and the part none of this post so far has actually built yet.

Almost everything above — extracting an agenda item, deciding whether a message is a reminder request, matching a habit name — is a small, structured decision with a handful of possible answers. None of it is the kind of writing that needs a frontier model. It's currently all going through Claude, because that's what I had wired up when I built each piece, not because any of it actually needs to be.

So I sat down and audited every single place the bot calls out to a model, and split it into two real categories.

One is mechanical: pick a tag from a fixed list, pull a date and time out of a sentence, match a spoken name against a list of habits I actually track. The other is genuinely generative: the weekly digest, the "here's what's actually going on with you" read on my week, the daily agenda's actual proposals — writing that has to sound like it understands me, not just correctly parse what I said. The mechanical category is almost all of the *volume* — most messages I send are exactly this kind of small decision — and almost none of the *value*. A few things fell out of the audit that mildly embarrassed me: a handful of these mechanical calls were quietly running on the same full-size model as the digest, for no better reason than that I wrote them before I'd separated "extract a field" from "write something good."

That mechanical tier is exactly the kind of work a small, open-weight model running right there on the box can do as well as Claude does — for a per-message API cost of zero, with nothing leaving the machine. It's the same shape of decision the local classifier already makes for tagging, just extended past tagging. Concretely, on the list to actually try:

- **The embedding step first**, because it's the lowest-risk move in the whole plan. The tag classifier already does its own local nearest-neighbor matching against my past entries instead of asking an LLM every time — it only calls out to a model for the genuinely ambiguous cases. The one thing it still reaches out to the network for is turning text into a vector in the first place. Swapping that for a small model that runs entirely on the box removes the last outside dependency from the single most-used code path in the whole system, without touching anything that actually generates language.
- **The structured extraction calls** — reminders, calendar events, agenda items, habit matching — behind a small local model, evaluated the honest way: hold out real examples, measure accuracy before trusting it with anything, the same instinct as the correction-logging in this post, aimed at the model choice instead of the prompt.
- **Transcription**, which is personal — my Daily Derja transcription bot has been unreliable lately too, and both bots share the same underlying weak spot: the hosted Whisper API doesn't handle Hebrew and Arabic input as well as I need, and I've had to bolt a fallback transcription service onto Personal Ops just to catch the cases where it mistranslates instead of transcribing. A larger, self-hosted Whisper model might actually be a straight upgrade there, not just a cost cut, and it'd fix the same problem for both bots at once instead of separately.
- **The read-aloud voice**, currently a paid API call every time I tap the speaker button on a reply, which is about the least essential thing to be paying per-call for.

The generative category — the digest, the actual coaching read on my week — stays exactly where it is. That's the part where a bigger model earns its cost. The writing has to be genuinely good, not just correctly shaped, and I'd rather keep that on the frontier until I have a real reason not to.

There's a piece of this I'm more excited about than the cost savings, though, and it connects straight back to the correction-logging earlier in this post. Right now, every one of these calls is a prompt I hand-wrote once, describing the task, with zero examples of what I've actually seen it get wrong. That's a strange way to build something whose entire premise is that it's supposed to learn my patterns. There's a class of tool built exactly for this — [DSPy](https://dspy.ai/) is the one I keep coming back to — where instead of hand-tuning a prompt, you give it a set of real labeled examples and it works out the prompt and the few-shot examples that actually perform well against them. The label_events table I built this week for the "learn from its own mistakes" thread above is precisely the labeled data that kind of tool needs — every escalation, every correction, accumulating for free while the system runs. Feed a self-hosted model real examples of its own past failures instead of my best guess at hypothetical ones, and the gap between "small local model" and "Claude" gets a lot less scary. A frontier model can sometimes paper over a vague, example-free prompt through sheer size. A small one can't, and with this in place, it shouldn't have to.

None of it is built yet — this section is a plan, not a changelog entry. But it's a plan specific enough, and cheap enough to start, that I'm comfortable writing it down in public before it exists. That's usually how I hold myself to things.

*Personal infrastructure, still. Now with opinions about which parts of itself deserve a bigger brain, and a plan to shrink that list.*

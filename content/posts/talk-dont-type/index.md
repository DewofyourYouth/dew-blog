---
title: "Talk, Don't Type: A Bot That Makes My Arabic Harder"
slug: talk-dont-type
date: 2026-11-26T16:30:00+02:00
description: "An LLM will write a better Shami post than I can. So I built a Telegram bot that makes me say every Daily Derja post out loud instead. The workflow, the decisions behind it, and the numbers that turned out less dramatic than I assumed."
summary: "An LLM will write a better Shami post than I can. So I built a Telegram bot that makes me say every Daily Derja post out loud instead. The workflow, the decisions behind it, and the numbers that turned out less dramatic than I assumed."
categories: ["Tech & Tools"]
tags: ["Arabic", "Shami", "Telegram", "Elixir", "LLM", "speech-to-text", "language learning", "Daily Derja", "automation"]
draft: true
---

## The Ghostwriter Problem

Here's a thing anyone learning a language in 2026 can do: open an LLM, say "write me a short diary post in Levantine Arabic about losing my car keys," maybe paste in two words you learned this week so it feels like you contributed, and get back a perfectly nice post.

It won't be perfect, because LLMs are not great at dialects. But at a high-A2, low-B1 level, it will be better than anything I'd write. Every time.

And I'd learn nothing from it. I'd have practiced *prompting*.

That's the problem I kept running into with [Daily Derja](https://dailyderja.com), my small daily blog in Shami Arabic. Every post had two possible ways of getting written, and both were bad.

<!--more-->

## Two Traps

**Trap one: let the model write it.** Fast, fluent, and not mine. You can tell, too: LLM posts are long. They have the confident sprawl of something that has never once had to look up how to say "anyway."

**Trap two: type it myself.** Mine, and slow enough to put me off posting at all. Some of my early posts had no AI in them whatsoever, and those were the ones that wore me down. Typing Arabic is tedious even with [Yamli](https://www.yamli.com/), which turns Latin letters into Arabic as you type. *Editing* Arabic is fine. Producing it key by key is a slog, and a slog is exactly the kind of friction that kills a daily habit.

## You Get Good at What You Practice

More fundamentally: typing Arabic isn't the skill I'm after.

You get good at what you practice. If you practice writing, you get better at writing. I want to get better at *speaking*, and at *reading*. Those are the two skills I'm working on. When I do want to practice writing, I do it by hand.

{{< admonition type="digression" title="Why by hand?" >}}
I'd read that handwriting helps memory more than typing, and when I went back to check, the evidence turned out to be narrower than I remembered. The strongest study I know of happens to be about Arabic: [Wiley & Rapp (2021)](https://doi.org/10.1177/0956797621993111) taught 42 adults twenty Arabic letters by handwriting, typing, or just watching, and the handwriting group learned faster and did better on every task. But the famous "pen beats laptop" note-taking result [didn't survive replication](https://doi.org/10.1007/s10648-019-09468-2). So: strong for learning a script, much weaker for "memory in general." I keep doing it, with that caveat written down.

There's also a dialect reason to care about spelling. ق comes out as *q*, *ʔ*, *g* or *k* depending on who's talking. قلت ("I said") is *ʔult* in Jerusalem and *kult* in a lot of villages, which is uncomfortably close to كلت ("I ate"). The spelling is what tells you which one you just heard.
{{< /admonition >}}

So the bot exists to make posting *harder* in the one way that matters. Dictating in Arabic is not the convenient option. Dictating in English and translating would be. The bot is there so I can't do that.

## The Workflow

I send voice notes to a Telegram bot. That's the whole interface.

1. **Record in clips.** Thinking in Arabic means pauses, so I record a sentence or two at a time. Each clip comes back transcribed (Whisper) with an English translation underneath. That translation turns out to be the most useful learning feature in the whole thing: if the English is wrong, either I said it wrong or it heard me wrong, and both are worth knowing.
2. **Say `done`.** In English or Arabic: خلص, يلا and بس all work. The bot joins the clips, and a small model picks a series, a title, a summary and tags.
3. **Preview.** I get the raw transcript and four options: `ok`, `edit`, `rewrite`, `discard`. Or I just describe what to change.
4. **Save.** On `ok`, a stronger model does a cleanup pass, and the post is written as Markdown with Hugo frontmatter. The raw transcript stays in the file as an HTML comment, and my voice clips are saved next to it.

The escape hatches are deliberate, and deliberately not comfortable. Sometimes I don't know how a word is pronounced, and I'll say it wrong ten times in a row. I have. Dialect transcription is shaky even for native speakers. So `edit 3` lets me re-record clip three, or paste corrected text. But typing is the exception path, not the main one. If it were convenient, I'd drift back to it.

## How Much to Fix

The cleanup step is where most of the actual thinking went. The rules it runs under:

- Fix blatant grammar and transcription garbage.
- Don't turn it into Fusha (Modern Standard Arabic).
- Don't make it literary.
- Keep my voice, including the English words I actually code-switch into: *bot*, *Telegram*, *post*.
- If something is unclear, flag it. Don't guess.
- Add no ideas.

There's no point publishing every mistake I make. But a post polished into native-sounding Shami isn't mine anymore, and on a learning blog that's a small lie. Those rules are where I drew the line.

{{< admonition type="reflection" title="Qere and ketiv" >}}
The cleanup prompt includes a short list of things Whisper reliably mishears, with what they should be: البات should read البوت ("the bot"), بيدي should read بدي ("I want"). In other words, what's written, and what you read. The Masoretes had a name for that list: *qere* and *ketiv*. I did not expect to rebuild a scribal convention for a speech-to-text model, but here we are.
{{< /admonition >}}

{{< join-channels >}}

## The Editor

The bot also picks which series a post goes in. It counts how many posts each series already has and leans toward the thin ones. Otherwise everything ends up in the daily-diary series, which is the junk drawer of any blog.

The first post the bot ever made was about the bot. The classifier filed it under "Meta." The prompt now says, more or less verbatim, *Meta is almost never correct*: if I'm talking about my tools, that's context, not content. The system's first lesson was about itself.

## After the Bot

The voice note is the part that matters, but a few more pieces turn a draft into a post:

- **A frontmatter pass** that fills in the description, difficulty and pull quote.
- **Text-to-speech audio** for the vocabulary table, generated in batch from a CSV, skipping anything that already exists.
- **Cover images** from fixed frames, where only the picture and the Arabic title change.
- **Hugo** with a pull request per post, deployed by GitHub Actions to GitHub Pages. Hosting cost: zero.

## The Engineering Choices

**Tools, not an agent.** Everything after the bot is a plain command-line tool that does one thing the same way every time. I mostly don't run them myself, though: I have Claude run them. That sounds like a contradiction, but it's the point. When Claude runs a CLI, I can see exactly which command it ran, and I know more or less what that command does, because I wrote it. I don't have to trust a self-reported chain of thought about what supposedly happened. And I'm not burning a pile of tokens having a model improvise something that should just *be done*. The model's job is to pick the right command, and the command does the work. I deliberately didn't build an agent.

**Elixir, because I wanted to.** It's a personal project and I wanted Elixir chops. It feels like Ruby without all the object-oriented scaffolding, which is the highest praise I have. Elixir's big selling point is concurrency, and a bot with exactly one user doesn't need any. I'm not going to invent an architecture reason after the fact. (I've written about [Elixir](/post/pairing-elixir-with-cheese/) [before](/post/pairing-elixir-with-cheese-ii/).)

**The local write is the source of truth.** The bot runs in Docker on a small VPS and writes every post to disk *first*, then copies it to my laptop's notes vault over SSH. If the copy fails, nothing is lost: I type `retry`.

**A cheap model for cheap jobs.** A small model handles classification and per-clip translation; a stronger one does the cleanup, which is the only step that needs judgment.

**The honest bit.** I prefer on-prem to SaaS, and transcription is still a cloud API call. I already run WhisperX locally for other things. Whether it's good enough on Shami to switch is a test I haven't run yet.

## Did It Work?

My assumption going in was that the posts had gotten *much* shorter since the bot, because I was using fewer LLMs and LLMs are verbose. I counted. Median length of the reflection section in my Shami posts since March:

| | Posts | Median words |
| --- | --- | --- |
| Spoken through the bot | 11 | 62 |
| Everything else | 32 | 73 |

Shorter, but not dramatically. I'd assumed a bigger gap. The "everything else" bucket mixes LLM-assisted posts with ones I typed by hand, and those pull in opposite directions. (Median, not mean: a couple of long essays make the mean say whatever you want.)

The point is that the number was never really the argument. The posts are shorter and *mine*, and I keep writing them. That's the thing a daily habit actually needs.

## Copy the Workflow, Not the Blog

{{< admonition type="announcement" title="Coming soon: the tools, minus me" >}}
I'm publishing generic versions of the three tools (the voice-to-post bot, the batch TTS tool and the cover generator), rebuilt from scratch with fresh history. Everything specific to me or Daily Derja is out: series, prompts, frames, fonts, audio, photos, infrastructure. What's left is config with placeholder examples. Bring your own language, your own categories, your own look.

Links go here when they're up.
{{< /admonition >}}

I don't want anyone building a Daily Derja clone. I'd like people to steal the *workflow*: make the hard part the part you're practicing, and let the machine take only the parts you aren't.

I also started writing these decisions down in one place, each with a date to re-check it, because a few of them (the handwriting one, the shorter-posts one) turned out shakier than I remembered. More on that another time.

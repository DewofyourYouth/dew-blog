---
title: "Talk, Don't Type: A Bot That Makes My Arabic Harder"
slug: talk-dont-type
date: 2026-11-26T16:30:00+02:00
description: "If you ask an LLM for a Shami post, it'll probably be better than anything you could write. So I built a Telegram bot that makes me actually say every Daily Derja post instead. The workflow, the decisions behind it, and the numbers I'd made assumptions about."
summary: "If you ask an LLM for a Shami post, it'll probably be better than anything you could write. So I built a Telegram bot that makes me actually say every Daily Derja post instead. The workflow, the decisions behind it, and the numbers I'd made assumptions about."
categories: ["Tech & Tools"]
tags: ["Arabic", "Shami", "Telegram", "Elixir", "LLM", "speech-to-text", "language learning", "Daily Derja", "automation"]
draft: true
---

## The Ghostwriter Problem

If you go to an LLM and ask it to make you a post about something in a dialect you're learning, it'll just make you a full post. You can put in a few words you're trying to learn, so it feels like you're doing the work, like you're making the effort. Then it makes you a post, and it'll probably be better than anything you could do.

It won't be perfect. It's a dialect, and LLMs are not perfect on dialects. But it'll likely be better than what you could do, especially if you're a beginner. I'm somewhere around a high A2, low B1 in Shami. It's better than what I could do.

But you become good at what you practice. If you practice prompting, you'll get better at prompting.

That's the problem I kept running into with [Daily Derja](https://dailyderja.com), my short daily posts in Shami Arabic.

<!--more-->

## Two Traps

There were basically two ways a post could get written, and both were bad.

**Let the LLM write it.** It's fast, and it's not mine. You can see it in the length, too. LLMs tend to be verbose, especially next to someone with my vocabulary and command of the language.

**Type it myself.** Some posts I literally didn't use any AI for, and the problem with those was that I didn't like doing them. I was sort of discouraged from doing them, because they took so very long to type. Even using [Yamli](https://www.yamli.com/), typing in Arabic is tedious. It's one thing to edit in Arabic. Typing in Arabic is very tedious.

## Say the Thing

You become good at what you practice. If you practice writing, you'll get better at writing. My intent was to get better at speaking, and reading. That's mostly what I'm practicing. Typing Arabic isn't something I'm trying to get good at, and when I do want to practice writing, it's by hand.

{{< admonition type="digression" title="Why by hand?" >}}
I'd read research that writing with your hand helps with memory, and that typing maybe has some gains, but not much. When I went back to check, it was narrower than I remembered. The strongest study I know of happens to be about Arabic: [Wiley & Rapp (2021)](https://doi.org/10.1177/0956797621993111) taught 42 adults twenty Arabic letters by handwriting, typing, or watching videos, and the handwriting group learned faster and did best on every task. But the famous "pen beats laptop" note-taking result [didn't hold up when people tried to replicate it](https://doi.org/10.1007/s10648-019-09468-2). So it's strong for learning a script, weaker for "memory in general." I still do it, and I wrote down why.

There's also a dialect reason to care about spelling. In Arabic you kind of need to know how words are spelled, because differences in accent correspond directly to spelling. ق can be a *q*, a *g*, a *k*, or a glottal stop, depending on who's talking. You need to know the difference between how "I said" (قلت) and "I ate" (كلت) are spelled, because in some accents *kult* and *kilt* are almost the same word.
{{< /admonition >}}

So dictation wasn't a convenience feature. It's not easier for me to dictate in Arabic. It's harder. I could dictate in English and have it translate. But the idea of the bot is that you actually have to say the thing.

## The Workflow

I send voice notes to a Telegram bot. That's the whole interface.

1. **Record in clips.** I record a sentence or two at a time. Each clip comes back transcribed (by Whisper) with an English translation underneath. That translation turns out to be a learning check: if the English is wrong, either I said it wrong or it heard me wrong.
2. **Say `done`.** Or خلص, or يلا, or بس. The bot joins the clips, and a small model picks a series, a title, a summary and tags.
3. **Preview.** I get the transcript and four options: `ok`, `edit`, `rewrite`, `discard`. Or I just tell it what to change.
4. **Save.** On `ok`, it gives the text a look over and fixes the blatant stuff, then writes the post as Markdown with Hugo frontmatter. The raw transcript stays in the file as a comment, and my voice clips get saved next to it.

Sometimes you just can't say it. You don't know how a word is pronounced, so you pronounce it wrong, and you pronounce it wrong ten times. That's happened to me. And transcription in dialects isn't perfect even if you say it right. Even native speakers have issues with it. So there had to be a way to fix things by hand in the bot: `edit 3` re-records clip three, or lets me paste in corrected text. But I didn't optimize for that. The point is saying the posts instead of writing them.

## How Much to Fix

I don't want to publish all the mistakes, because there's no point. But I also don't want it rewritten into something a native speaker would say, because then it isn't mine. So the cleanup step runs on a short set of rules:

- Fix blatant grammar mistakes and transcription garbage.
- Don't turn it into Fusha (Modern Standard Arabic).
- Don't make it fancy or literary.
- Keep my voice, including the English words I actually use mid-sentence: *bot*, *Telegram*, *post*.
- If something's unclear, flag it instead of guessing.
- Don't add ideas.

{{< admonition type="reflection" title="Qere and ketiv" >}}
The cleanup prompt has a short list of things Whisper keeps mishearing, and what they should be: البات should be البوت ("the bot"), بيدي should be بدي ("I want"). What's written, and what you read. That's *qere* and *ketiv*.
{{< /admonition >}}

{{< join-channels >}}

## Picking the Series

The bot also picks which series a post goes in. It counts how many posts each series already has and leans toward the ones with fewer, because otherwise everything ends up in the daily diary series.

The first post the bot ever made was about the bot, and it got filed under "Meta." The prompt now says Meta is almost never correct: if I'm talking about the tools, that's context, not content.

## After the Bot

A few more pieces turn a draft into a post:

- **A frontmatter pass** that fills in the description, difficulty and pull quote.
- **Text-to-speech audio** for the vocabulary, generated in batch from a CSV, skipping anything that's already there.
- **Cover images** from fixed frames, where only the picture and the Arabic title change.
- **Hugo**, with a pull request per post, deployed to GitHub Pages. Hosting costs nothing.

## The Engineering Choices

**Tools, not an agent.** I don't generally run my own command-line tools. Sometimes I do, but usually I have Claude run the CLI for me. The idea is that I can see what Claude ran and know more or less what will happen, because I wrote the tool. I don't need any self-reported chain of thought about what it did. I didn't want to set up an agent, and I don't want to burn a ton of tokens on something that should just be done.

**Elixir, because I wanted to use Elixir.** That's the short answer. It's a personal project, and I wanted to get some chops in Elixir. It's fun. It has a nice Ruby feel to it, but you don't have to build all these object-oriented constructs. I know its main idea is concurrency, and I don't think a bot with one user is that use case. That's fine. (I've written about Elixir [before](/post/pairing-elixir-with-cheese/), [twice](/post/pairing-elixir-with-cheese-ii/).)

**Write it locally first.** The bot runs in Docker on a small server and writes every post to disk *first*, then copies it to my laptop. If the copy fails, nothing's lost. I send `retry`.

**A cheap model for the cheap jobs.** A small model does the series and the per-clip translations. A stronger one does the cleanup, because that's the step where judgment matters.

**The part I'm not thrilled with.** I prefer on-prem to SaaS, and transcription is still a cloud API. I already run WhisperX locally for other things. Whether it's good enough on Shami to switch is a test I haven't run yet.

## Did It Work?

I was sure the posts had gotten significantly shorter since I started using the bot. LLMs are verbose, so shorter posts would mean less LLM. Then I counted. Median length of the main section of my Shami posts since March:

| | Posts | Median words |
| --- | --- | --- |
| Spoken through the bot | 11 | 62 |
| Everything else | 32 | 73 |

Shorter, but not significantly. I guess I'd made assumptions about what the numbers would be. Part of it is that "everything else" mixes posts an LLM helped with and posts I typed myself, and those pull in opposite directions. (That's also why it's the median. The mean says something much more dramatic, which is exactly why I don't trust it here.)

The number was never really the argument, though. The posts are mine, and I keep writing them.

## Copy the Workflow, Not the Blog

I put a lot of thought into this, and I think I should share it.

{{< admonition type="announcement" title="Coming soon: the tools, minus me" >}}
I'm putting up generic versions of the three tools (the voice-to-post bot, the batch text-to-speech tool, and the cover generator), rebuilt from scratch without the git history. Nothing that's specific to me or Daily Derja is in them: no series, no frames, no fonts, no audio, no photos, no infrastructure. Just config, with placeholder examples to show you how to write it.

Links go here when they're up.
{{< /admonition >}}

I don't want everybody making things that look like Daily Derja. Come up with your own branding. The thing worth copying is the workflow: practice the part you actually want to get good at, and let the machine do the rest.

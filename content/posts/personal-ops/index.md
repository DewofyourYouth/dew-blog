---
title: "Personal Ops: Capture, Digest, Adapt, Propose"
slug: personal-ops
date: 2026-05-28T12:36:11+03:00
description: "Two years ago my Elul accountability experiment half-worked. The problem was friction, not motivation — and I had no mechanism to adjust expectations based on actual performance. So I built one: voice capture via Telegram, weekly LLM digest, and a daily agenda calibrated to what I've actually been completing versus missing."
categories: ["Tech & Tools"]
tags: ["productivity", "AI", "LLM", "personal knowledge management", "Obsidian", "Telegram", "self-improvement"]
draft: false
featuredImage: telegram-bot.jpg
summary: "Two years ago my Elul accountability experiment half-worked. The problem was friction, not motivation — and I had no mechanism to adjust expectations based on actual performance. So I built one: voice capture via Telegram, weekly LLM digest, and a daily agenda calibrated to what I've actually been completing versus missing."
---

## The Next Iteration

Two years ago I published my [Elul kabbolos](https://www.dewofyouryouth.com/post/elul-5783/) on this blog — it was actually the first post of the  Dew of your Youth blog. The idea was to make a contract with myself in public, [log the results in Obsidian](https://www.dewofyouryouth.com/post/elul-logs/), track the data in a spreadsheet. Accountability through documentation.

{{< admonition type="note" title="What are kabbolos?" >}}
*Kabbolos* (קבלות, singular: *kabbolo*) are personal resolutions — specific commitments to improve a behavior or habit. In Jewish tradition they're made during *Elul*, the month before Rosh Hashana, as part of the annual self-examination before the High Holidays. The analogy to New Year's resolutions is reasonable, though the theological stakes are higher and the deadline is fixed.
{{< /admonition >}}

It half-worked. I kept most of the kabbolos through Yom Kippur. There was some long-term progress on the honesty one, but not much else. The rest didn't outlast the chagim (the holidays).

The [postmortem I wrote afterward](https://www.dewofyouryouth.com/post/elul-5783-postmortem/) identified the real problem. It wasn't motivation or discipline. It was that the system required too much of me to operate. Logging manually, maintaining the spreadsheet, doing the introspection to decide whether today was a 1 or a 0 — all friction, and friction compounds.

I also wrote this, which I've been thinking about since:

> Adjust your expectations based on previous performance, instead of deep introspection.

I didn't have a way to do that. I was just a guy with a spreadsheet.

---

It's funny how problems you've correctly identified have a way of resurfacing until you actually solve them. The Elul experiment was the right instinct — I just didn't have the tools yet.

Two years later, the situation has changed. I'm no longer commuting to an office. I'm job searching while building an app, maintaining two blogs, studying Arabic, and keeping a Torah learning schedule with fixed daily anchors. No external structure. No one telling me where to be or when.

The problem is that I'd spend most of my day figuring out where to start.

So I built something to solve that. But the architecture only makes sense once you understand the loop it's trying to close.

---

## Capture, Digest, Adapt, Propose

The core loop is: capture, digest, adapt, propose.

**Capture.** I send messages to a Telegram bot throughout the day — notes, insights, wins, check-ins, hypotheses. They land in dated JSONL files in my Obsidian vault. Most of it goes in by voice. I'll say something while walking back from a chavrusa, [Whisper](https://openai.com/index/whisper/) transcribes it, it gets tagged and filed. Here's an actual entry from this week:

> *"Yeah, I've been sort of laser focused on personal ops. I did apply to a bunch of jobs today. I didn't feel like working on Haki and I don't know, I guess I've been pushing it off because it came back from Apple and it said I had to fix stuff and now I'm going to have to debug it. Maybe I'm psychologically just trying to push off debugging things. I haven't eaten today. I'm going to go eat lunch now. It's 1:54pm."*

That's a check-in. It took less than thirty seconds. It contains: task completion status, avoidance behavior and a plausible reason for it, a physiological fact, and a corrective action. A therapist would need several sessions to surface all of that. The bot has the timestamp.

**Digest.** Every Sunday the bot reads the week's logs and produces a structured review. But the digest isn't just a summary — it's also context management. Six weeks of raw logs would bloat a prompt into uselessness. The digest compresses the past week into something small enough to include in every subsequent agenda proposal without degrading the signal.

Here's what last night's digest made of that check-in, and the rejection email from a job interview that arrived an hour later, and the three unanswered check-in reminders in the afternoon:

> **Burnout signal on May 27 (late afternoon):** "I'm kind of burnt out" after 9+ hours of logging, applying, and context-switching. *Classify:* physiological (hadn't eaten until 1:54pm, high context-switching, rejection feedback from Mylo.ai). Not systemic burnout; immediate cause is visible.

And on the Haki avoidance:

> *Classify:* technical friction + psychological resistance to debugging, not avoidance of effort in general.

And then the insight that tied it together:

> The real friction isn't discipline — it's visibility and traction loops. You built personal ops tooling instead of working Haki because you needed to see what was actually happening. You're not avoiding; you're trying to close the information gap.

That last line is the kind of thing a good coach says after knowing you for months. The bot produced it from a week of voice notes and JSONL.

**Adapt.** Before interpreting any pattern as avoidance or burnout, the system checks for physiological and contextual factors — sleep, food, illness, stressful news. I wrote this into the review rules explicitly, because self-improvement systems usually fail when they assign blame before they understand context. The bad behavior exists for a reason. Ignoring the reason and doubling down on willpower is what the Elul experiment taught me doesn't work.

The digest also classified its own confidence level: *"Low–Medium. Data coverage is partial. May 25–26  had external constraints (chavrusa canceled, wife's shoulder injury) that explain anchor misses. Treat patterns as tentative."* It doesn't over-interpret thin data. When coverage is poor it says so, and focuses on improving capture rather than judging performance.

**Propose.** Every morning the bot reads the compressed history plus my context files — goals, priorities, constraints, projects, principles — and proposes a daily agenda. A specific proposal calibrated to what day it is, what's on my calendar, what I've actually been completing versus missing over the past two weeks. If I've missed the ninety-minute workout block eight times running, it stops proposing it and suggests twenty minutes instead, then tracks whether the smaller version gets done.

That's exactly what I said I needed in 2023 and had no mechanism to implement: adjust expectations based on observed performance, not deep introspection.

---

## The Operational Challenge

Then, because I was actually using it, it broke.

Telegram button labels truncated my agenda items at exactly the point where they became useful. Fix: full list in the message body, buttons just say `✅ 1 Done`. The numbers do the linking.

Switching from Hebrew to English in Telegram inserts invisible Unicode bidirectional control marks before your text. `Note, the reason I...` was actually `\u200fNote, the reason I...`, which matched no prefix. One regex, fixed everywhere.

The `edit 1` command was editing the wrong item. Display number minus one is only the stored ID at the start of the day. By afternoon, after re-plans and completions, the mapping has drifted. Fix: look up the actual open items list, find the Nth entry, get its real ID.

None of these appear in a demo. They appear when a real person uses a real tool.

{{< join-channels >}}

---

## My Current Setup

The whole thing runs on my laptop, writes to flat files. No database, no dashboard, no subscription.

The Elul experiment was the right instinct — make the implicit explicit, track it, review it, adjust based on what actually happened. The failure was operational: I was doing all the work to run the system myself, and the friction of operating it was eating the benefit of having it.

 I didn't set out to build personal ops with my Elul logs experiment in mind, but it amuses me how after building it, I realize that I'm solving the same problem I identified back then, all these years later.

This time I wrote the spec and delegated the operations.

*Personal infrastructure. Your mileage, as they say, will vary.*

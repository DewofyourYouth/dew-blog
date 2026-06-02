---
title: "Reed, Not Cedar: Building a Productivity System That Bends With You"
slug: reed-not-cedar
date: 2026-06-02T09:25:35+03:00
draft: false
categories:
  - Tech & Tools
tags:
  - productivity
  - executive-function
  - accountability-systems
  - telegram-bot
  - burnout
  - energy-management
  - goodharts-law
  - supervised-learning
  - daode-jing
  - habit-tracking
summary: "I built a Telegram bot to offload my executive function and accidentally gave myself a taskmaster. So I rebuilt it around one rule from the Talmud and the Daode Jing: be a reed, not a cedar — firm but yielding, advisory not prescriptive."
description: "Redesigning a personal productivity bot to advise instead of dictate: energy-led suggestions, opt-in 'futures' instead of commitments, a stall detector, and logged data to eventually learn when to push and when to back off."
featuredImage: reed-in-wind.jpg
featuredImageAlt: "Bamboo stalks bending in the wind without breaking"
series:
  - personal-ops
series_order: 3
seo:
  images:
    - reed-in-wind.jpg
---

Last time I wrote about how [completion rate is a trap](/post/clipping-your-wings/) — how the moment your system scores you on what percentage of your commitments you finish, the rational move is to stop writing down anything you might actually fail at. That post was about *measuring* the wrong thing. This one is about the thing underneath it, which turned out to be worse: my bot wasn't just measuring the wrong thing. It was *bossing me around*.

Here's the embarrassing part. I built this whole system to offload my executive function — to be a thinking partner, energy-aware, the opposite of a nag. And then every morning it handed me an agenda. Monday is a development day, here's your list, here's where you stand. I had built myself a task master and given it my phone number.

So I tore up the philosophy and started over. This is where I landed.

### The Agenda Was the Problem

The old model imposed a structure. The week had a fixed shape — Mon/Wed/Fri for app development, Tue/Thu for the job search — the bot generated a daily list from that shape, and a completion rate graded me against it. Even with AI in the loop, the agenda was *imposed*. Order for order's sake.

And that fights everything else I wanted the thing to be. A prescribed list punishes your bad days and rewards you for gaming the easy ones. It optimizes the number. I didn't want a number. I wanted to actually move.

### The Question I'm Not Going to Answer

There's a question sitting underneath all of this, and I want to be honest that I'm walking around it: *what does it even mean to be productive?* And how much of being unproductive is an executive-function problem — the kind software can genuinely help with — versus a real conflict of values, which no app on earth can resolve? If some part of me doesn't actually want what my stated goals say I want, no system fixes that. And it shouldn't pretend to.

So I'm not answering it in the abstract. It might not *have* an abstract answer. Instead of defining productivity, I'm watching three signals:

- **Less decision exhaustion** — does using this leave me *less* fried by choices, or more?
- **Demonstrable movement** — am I visibly doing things that get me toward what I claim to want?
- **A shrinking gap between what I say and what I do** — over time, do my goals and my behavior converge? And if they never do, that's data too. Maybe the goal was never really mine.

Those are the success criteria. If a redesign doesn't move them, it failed — however clever it is.

### Reed, Not Cedar

Before any feature, a question of temperament. There's a line in the Talmud (Taanit 20a): *be soft like a reed and not hard like a cedar.* Aesop tells the same thing as a fable — the oak stands rigid against the wind and snaps, the reed bends and lives. The Daode Jing says it a third time: the stiff and unbending are companions of death; the soft and yielding are companions of life; a tree that cannot bend will be broken.


Three traditions, one idea, and it's the rule I'm building the whole system around: **firm but yielding — like a reed, not a cedar.**

The reason is mechanical, not poetic. If the app is a cedar — rigid, insistent — then the second I push back on it, I'm in a *contest*. And resistance is exhausting. The back-and-forth of shoving against something that shoves back generates its own decision fatigue, which is the exact thing this system exists to kill. A cedar app fails its own test the moment you lean on it.

A reed bends and stays rooted. When I resist — skip a suggestion, ignore a prompt, go quiet — it yields and stays, instead of escalating. Its firmness lives in *being there*: it's always present, it doesn't forget my goals, it holds up the honest mirror once. Not in *force* — it never nags, never repeats, never makes me fight it. Resistance should cost me nothing, because a system that's expensive to resist is a system I'll abandon by Thursday.

{{<admonition type=reflection title="Daode Jing: A Philosophical Translation" >}}
When I was a yeshiva bochur — sixteen or so — I needed a break from Yevamos one afternoon, so I walked over to the Barnes & Noble on Harvard Ave in Brookline (Greater Boston), and bought a copy of the *Daode Jing* (the Roger T. Ames philosophical translation) on my lunch break. I read it over and over, footnotes and all, and it stuck with me in a way few books have. Every so often a design principle or a stray insight surfaces in my head and I realize it's really a paraphrase of something from that book. *Firm but yielding* is one of those — which is how a line I read at sixteen ended up being the rule this whole system runs on.
{{< /admonition  >}}

### Advisory, Not Prescriptive

So the core move: the system stops dictating and starts advising. The day gets led by my *actual state* — energy, mood, whatever's pulling at me — and the bot's job is to *offer* things that fit my current capacity and nudge my goals along. I choose. It suggests.

To make that work I had to stop treating "things to do" as one undifferentiated pile. There are three kinds, and they are not the same kind of thing.

**Suggestions** are advisory and never scored. The bot reads my goals, my recent activity, and my current energy, then offers a few things that would help. I take them or I don't. Skipping one isn't a miss — it's just a suggestion I didn't take. And — this is the part I keep having to remind myself of — they're not a once-a-day morning dump. Energy is dynamic. You can wake up groggy and surge at 4pm. So the suggestions go both ways: I can *pull* ("I've got energy, what's worth doing right now?") and the bot can *push* when it notices my logged energy jump upward — *you're charged up, good moment to swing at the hard thing.* Same sensor, both directions: pull back when I'm drained, lean in when I'm lit.

**Futures** are the opposite — things *I* decide must happen. "This ships by Thursday whether I like it or not." Because I chose to be held to it, this one *is* tracked and counts. Accountability, but opt-in, never imposed. I deliberately don't call them *commitments*. "Commitment" drips with dread and moral weight, and for an avoidance-prone, burnt-out person, a heavy word is itself a deterrent — it feeds the exact avoidance I'm fighting. "Futures" is lighter. A thing set for a future date, with a quiet nod to a futures contract. The framing isn't decoration; it's part of the design. This is also what kills Goodhart's Law on the spot: I'm only ever measured against what I chose to be measured against. The system can't punish me for blowing something it made up.

**Emergent patterns** are observed, never prescribed. The bot watches the data and surfaces patterns as *insight*: "your most focused work lands on Sundays," "job apps tend to happen on low-energy afternoons." Day types get *revealed* from data, not decreed by the app. They flavor the suggestions; they never harden into a schedule I have to obey. This is where the hardcoded "Monday = development" goes to die.

### The Trap This Walks Straight Into

Here's the honest problem with everything I just said. A pure energy-led, advisory system has one failure mode, and it's a doozy: **it becomes an avoidance engine.**

The things that most need doing rarely *feel* appealing in the moment — that's usually *why* they're hard. If the system only ever offers what fits your current mood, the important-but-unappealing stuff quietly rots, and the whole executive-function-offloading premise fails silently. You feel great every day and go nowhere. That's not a thinking partner. That's a very polite enabler.

Futures are a partial valve, but they depend on me proactively setting one — and that's the exact muscle that's weakest when avoidance is running the show. The same instinct that dodges the hard task dodges *writing down* the hard task.

So the system needs a **stall detector**. Not a taskmaster — a mirror. It tracks my goals and the activity that moves them, and when a goal I *said* mattered goes untouched past some threshold, it says so, once: *you haven't moved on the dashboard in two weeks. You said it mattered. Still true?* The tone is the gap between what I said and what I did — not shame, not nagging. It invites a decision: re-commit, downgrade the goal, or consciously park it. Then it lets it sit. A reed, even here — it states the gap once and doesn't bring it up again.

This is the one thing a pure energy-led model loses, and it's the difference between a system that *feels* better day to day and one that actually serves the goals. It's not optional. It lives quietly, in the weekly digest plus a light mid-week check.

## The Reversible Switch

I should admit the conditions I'm designing under. Long job search, not enough sleep, two small kids, a mild but chronic-illness flare humming in the background. Calibrating a *permanent* architecture from your most flattened moment is a mistake — the scaffolding I find oppressive today might be exactly what I miss when capacity comes back.

So this isn't a one-way rewrite. It's a mode. **Structured** is the old behavior: daily agenda, completion scored — a forcing function for when you've got gas in the tank and want one. **Advisory** is the new model: no agenda push, suggestions on pull and energy-push, no scoring. One command flips it. If I flip to advisory and find I miss the rails, I flip back. The decision was never permanent, which is the whole point.

But one thing runs in *both* modes, always on: the accountability floor. Futures and the stall detector don't belong to the advisory package — they're the floor under everything. The mode toggles whether the bot pushes an agenda and grades me. It never toggles whether the system tells me the truth.

The dream version of this is *adaptive* — it slides the structure level on its own, depending on whether I'm thriving or drowning. I can't build that yet, because I don't know the rules. Which is the part I actually care about most.

{{< join-channels >}}

## The Data Is the Whole Bet

Most productivity tools do one of two things: they impose structure, or they strip it away. Almost none of them *learn the rules of when to push and when to back off* from your own behavior. That's the thing I want, and it's only possible if I wire it in from day one.

The key distinction: **"not scored" is not the same as "not logged."** Suggestions never count *against* me — that's for my psychology, to keep resistance cheap. But every suggestion and every push gets *recorded*, because what happened to it is the training label for the adaptive system I want to build later. Skip this and in a few months I've got a pile of states with no outcomes and nothing to learn from.

It's a supervised-learning shape, really: *given a state, which intervention produced a good outcome?* So every time the bot suggests or pushes, it writes down four things:

1. **State** — energy, mood, time of day, day of week, recent momentum, stall status. Whatever the moment looks like.
2. **Intervention** — what the bot did: suggested X, pushed because energy jumped, surfaced a stall, or stayed quiet.
3. **Response** — did I do it, ignore it, or explicitly reject it? Caught for free by the buttons on the suggestion itself — *did it* / *not now* / *not for me*. The tap **is** the label. This is the column easiest to forget and the one that matters most.
4. **Outcome** — downstream. Did progress get logged after? Did the next energy reading go up or down?

With those four, the data can eventually answer the question I actually want answered: *when my energy jumps at 4pm and the bot pushes a hard task, do I take it — and do I feel better or worse afterward?* That's a learnable rule. Without the response and outcome columns, it's just a shrug.

That's the bet. Not that I've designed the perfect system — I've been clear that I haven't, and that I'm doing it from a lousy vantage point. The bet is narrower: make the system honest, make it cheap to resist, and *write down what happens.* Do that long enough and it can eventually learn the one thing no off-the-shelf app will ever know — when *this specific person* needs a push, and when he needs to be left the hell alone.

## What Doesn't Change

For all the demolition, three things stay. **Goals** — energy-led doesn't mean goalless; it means goal-conducive suggestions matched to real capacity. **Habits** — still tracked; they're just recurring futures I already opted into. And the underlying philosophy of meeting effort where it actually is, now pointed at the things I genuinely signed up for instead of a list the app invented.

The morning still has one small touchpoint, so the whole thing doesn't go silent and get forgotten. But instead of an agenda, it opens with a question:

> *What do you want to work on today?*

A few buttons the bot builds from my goals and context, plus a free-text escape hatch. A question, not an order. The buttons lower the decision load — I'm reacting, not generating from scratch — and whatever I pick becomes the first logged moment of the day.

In the last post I said the goal was to build a system that makes cowardice less convenient and collapse less likely. This is me trying to walk that line without becoming the cedar. Rooted, present, honest — and willing to bend.

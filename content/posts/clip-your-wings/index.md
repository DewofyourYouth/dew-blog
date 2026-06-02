---
title: "Don’t Clip Your Wings: On Building Systems That Push You Toward Greatness"
slug: clipping-your-wings
date: 2026-05-31T15:56:24+03:00
draft: false
featuredImage: bird-in-flight.jpg
categories:
  - Tech & Tools
tags:
  - productivity
  - habit tracking
  - accountability systems
  - self-improvement
  - personal knowledge management
  - Goodhart’s Law
  - Item Response Theory
  - Sharpe ratio
  - burnout
  - Telegram bot
series:
  - personal-ops
series_order: 2
description: "Completion rate is a trap. If your productivity system scores you on what percentage of commitments you finish, the rational move is to stop writing down anything hard. This is Goodhart’s Law in action — and the fix requires borrowing from psychometrics, chess ratings, and finance."
summary: "Completion rate is a trap. The moment your productivity system scores you on what percentage of commitments you finish, the rational move is to stop writing down anything you might actually fail at. I ran into this building my own personal ops system, and it turns out fixing it means thinking about Item Response Theory, Glicko ratings, and the Sharpe ratio."
---

Scott Adams — the Dilbert guy, bear with me — has a line that stuck with me: goals are for losers, systems are for winners. The logic is simple. A goal puts you in a permanent state of failure until the moment you succeed. A system has no finish line; you’re either running it or you’re not.

I’ve been building a personal ops system — a Telegram bot that logs my day, proposes agendas, and does periodic reviews. The stated goal of this bot is to help me offload some of my executive function. To do that, at some point I had to decide how to measure whether a week went well. And I ran straight into the problem Adams doesn’t really deal with: a system can clip your wings just as badly as a goal can, if you measure the wrong thing.

-----

## The Trap Inside the System

If your accountability system grades you on what percentage of your commitments you complete, the rational response — even if you don’t consciously realize it — is to stop committing to things you might fail at.

The todo list quietly becomes a highlight reel of your comfort zone.

This is Goodhart’s Law: when a measure becomes a target, it ceases to be a good measure. The moment you start optimizing for the metric, you’ve corrupted it.

The practical result is a system that makes you look productive while systematically filtering out the hard stuff. You’re winning, technically. But you’ve clipped your own wings to make the landing easier.

The Adams insight gets you halfway there: build a system, stop chasing goals. But the metric you use to evaluate the system matters just as much. A system that rewards staying in your comfort zone isn’t pushing you toward greatness. It’s just a more sophisticated way of staying where you are.

What I actually want is a system that makes it worth your while to attempt hard things — one where a 60% week on genuinely hard commitments scores better than a 95% week on things that were never really in question.

That sounds obvious. The hard part is making the system know the difference.

-----

## The Math Problem

To do this, the system needs to solve two related problems.

First, it needs to estimate how hard something actually is.

You can’t just ask. People are bad at predicting their own difficulty ratings. They overestimate some things, underestimate others, and sometimes unconsciously sandbag the things they don’t want to be judged on. A better system has to infer difficulty from observed behavior over time.

There are fields that already think about versions of this problem. Psychometrics has Item Response Theory, where standardized test questions are calibrated based on how people perform on them. Chess has rating systems like Glicko, which don’t just estimate a player’s strength but also track uncertainty around that estimate. Spaced repetition systems like FSRS maintain item-level difficulty estimates and update them after each review.

None of these transfers cleanly to personal productivity. But they all point toward the same design principle: don’t score raw completion. Score completion relative to difficulty, history, and uncertainty.

The uncertainty part matters. Three data points on a new habit tell you almost nothing about how hard it actually is. That is the cold start problem. New items should carry low-confidence difficulty estimates until there’s enough data to calibrate them.

Second, once you have some estimate of difficulty, hard things need to count more.

The finance analogy is the Sharpe ratio: return matters, but only relative to volatility. The conceptual move is the same. Separate performance from the difficulty of what was attempted. A productivity system should not merely protect you from looking bad when you try hard things. It should actively incentivize you to try them.

{{< admonition title="The Weeds: How I’m Thinking About the Math" type=note >}}
My working approach — which I’ll probably revise:

**Calibration window.** New habits get a 30-day window before they enter baseline comparisons. Data is collected, but the item doesn’t affect the overall score. This weakens the gaming incentive: there’s no point sandbagging a new item to lower its baseline, because it’s not being measured against anything yet.

**Personal baseline.** After calibration, the item’s observed completion rate becomes its baseline. If I do something 5 out of 6 eligible days consistently, that’s my baseline — not some implicit 100% expectation.

**Difficulty weighting.** Items are weighted by difficulty when contributing to the weekly score. The rough version is `1 / baseline_rate`: something I complete 50% of the time counts twice as much as something I complete every day.

That formula is probably too crude by itself. A 10% baseline gives a 10x multiplier, which can make one rare completion dominate the week. In practice, I’d cap it or use a softer curve:

 `difficulty_weight = min(1 / baseline_rate, 3)`

Or more conservatively:

 `difficulty_weight = 1 + (1 - baseline_rate)`

The second version: a 50% item counts 1.5x, a 90% item counts 1.1x, a 10% item counts 1.9x. Less dramatic, much harder to game.

This doesn’t handle contextual difficulty — “apply to three jobs” is straightforward on a high-energy Tuesday and nearly impossible during a depressive episode. It doesn’t solve the counterfactual. But it points the system in the right direction.
{{</ admonition >}}

-----

## The Other Direction: Burnout

A system that pushes you toward harder things also needs to know when to back off.

Burnout is a lagging indicator. By the time it’s obvious, you’re already in it. The useful signal comes earlier: hard items start dropping while easy ones hold steady. Anchor habits — the ones that usually survive bad days — begin to slip. Log entries shift in tone.

But even those signals need skepticism. My logs are crisis-weighted. I log more when something is emotionally heavy, ambiguous, broken, painful, or unresolved. Ordinary flow is underrepresented. That means logging intensity correlates with emotional weight, not necessarily with actual productivity.

A heavily logged day might have been a terrible day. It might also have been a day where I did real work, fixed bugs, applied to jobs, learned a daf, took a walk, shipped a feature, and then logged heavily because one part of the day hurt.

The system has to know that.

A single bad day is noise. Three bad days might still be noise. But a sustained gap between your actual output and your rolling baseline — especially on harder items — is worth responding to.

The response shouldn’t be a lecture. It should be quiet and mechanical. Proposals get lighter. The bar for what counts as a win gets recalibrated to your current level. The system waits.

Not because it’s lowering its standards for you. Because a system that ignores your current state and keeps demanding your peak output isn’t pushing you toward greatness. It’s just grinding you down.

The harder design question is what “backing off” actually looks like. Reducing the agenda isn’t enough if the items that get cut are the hard ones you were already avoiding. That turns recovery into avoidance with better branding.

The system should be cutting easy items to protect hard ones. Keep the anchors. Soften the periphery. Preserve contact with the things that matter, but reduce the noise around them.

Recovery should not mean teaching yourself that hard things disappear when life gets uncomfortable.

-----

## The System Is Not the Point

The deeper issue is that most productivity tools don’t ask what their numbers are training you to become.

A completion percentage looks neutral, but it isn’t. It teaches you to protect the percentage. And the easiest way to protect the percentage is to stop writing down anything that might expose you.

That is how a system becomes a cage. Not because it fails, but because it succeeds at the wrong thing.

What I want is a system that rewards contact with difficulty. One that notices when I’m choosing safer commitments, gives more credit for the things I usually avoid, and backs off when the pattern starts looking less like growth and more like depletion.

The goal isn’t to make the numbers look good. The goal is to build a system that makes cowardice less convenient and collapse less likely.

That’s the line I’m trying to walk.

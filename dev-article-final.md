---
title: "Helioigma: a Turing-wheel puzzle for holding the longest day"
published: true
description: "A DEV June Solstice game: race a solar cipher wheel, trace its rotor state, and verify the stable Demo Solve summary receipt."
tags: devchallenge, gamechallenge, gamedev, javascript
cover_image: https://ooyxloo.github.io/helioigma/cover.png?v=20260615-fresh-media
---

**This is a submission for the [June Solstice Game Jam](https://dev.to/challenges/june-game-jam-2026-06-03). It targets the Best Ode to Alan Turing category.**

## Reviewer Fast Path

If you are judging quickly, the first-minute check is: rotate one node, watch Rotor Trace explain the state change, press `Demo Solve`, then inspect receipt `SC-4P-2907-62-Y5VFX1`.

- Play: https://ooyxloo.github.io/helioigma/
- Auto demo: https://ooyxloo.github.io/helioigma/?demo=1
- Check the Auto Demo sample receipt: https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1
- Privacy review, no best-score storage: https://ooyxloo.github.io/helioigma/?nostore=1
- Source: https://github.com/OOYXLOO/helioigma

Helioigma targets Best Ode to Alan Turing because the tribute is playable: rotor-like state alignment under a daylight timer, with a small checksum receipt to make the finished Demo Solve summary inspectable. No account, backend, Google AI claim, API key, private data, or hidden judge dashboard is needed.

![Helioigma four-phase demo solve](https://ooyxloo.github.io/helioigma/helioigma-demo.gif?v=20260615-fresh-media)

*The first-minute loop in motion: match nodes, trace state, seal the run, check the receipt.*

## The Longest Day as a Countdown Machine

You open with 45 seconds of daylight, a rotor full of `SOL`, `XOR`, `LUX`, and `BIN`, and one job: keep the longest day from slipping into night by aligning the cipher before each tightening phase empties its timer. It is a little daylight machine: read the target glyphs, tap a numbered node, watch the wheel answer, and decide whether to chase the next mismatch or spend the `Hint` nudge.

Helioigma is built around that small pressure loop. Each phase changes the target, the live objective strip tells you what the rotor wants next, and a compact Turing cue names the current reasoning: crib state checks, XOR parity, binary carry, then checksum trace. The manual Hint and Rotor Trace path also changes by phase: Crib follows the first visible mismatch, XOR alternates mirrored rotor nodes, Carry advances through the binary chain, and Checksum scans in reverse. Clear all four phases and the game leaves an inspectable summary receipt with score, shifts, phase count, and checksum.

That is my Best Ode to Alan Turing angle: rotor state and checksum reasoning carry the tribute; daylight pressure carries the solstice theme; and the finished static package lets a judge inspect one stable Demo Solve without trusting a hidden service.

## What I Built

Helioigma is a compact browser puzzle for the DEV June Solstice Game Jam. The player races the longest day by rotating a Turing-inspired solar rotor until each numbered node matches the target cipher before nightfall ends the run.

Helioigma is the game title and the public build slug, chosen so the submission is easy to distinguish from other similarly named solstice puzzle entries.

I chose a cipher wheel because the solstice already has a natural tension: one unusually long day, then the light starts slipping away again. The first screen names the rotor, the matching goal, the `SOL -> XOR -> LUX -> BIN` node cycle, and the three-step judge path. A reviewer can play manually with `Hint`, press `Demo Solve`, copy the stable Auto Demo sample receipt `SC-4P-2907-62-Y5VFX1`, and verify the checksum locally. It is a static HTML/CSS/JavaScript game with no backend, no API key, and no private data. The only default browser storage is a local numeric best-score key for this game, and `?nostore=1` disables best-score reads/writes for stricter privacy review.

For game feel, I focused on a short pressure loop rather than a long rules explanation. The target strip says what to match, the visible cycle cue says how a tap changes each glyph, each node move pulses the board, Rotor Trace names the next mismatch, and a failed manual attempt becomes a Nightfall report instead of a dead end. The receipt layer is there for judges, but the first artifact is still the playable daylight race.

## Playability Proof

I know game jam judges see projects where the write-up is stronger than the loop. I tried to make the first minute prove the game feel before the verifier appears:

- Readable decisions: the target glyphs, aligned-node count, phase objective, and phase-specific scan rule are visible before and during play.
- Immediate feedback: taps trigger node pulses, Rotor Trace updates, daylight movement, status copy, and optional audio cues, so a wrong move is still understandable.
- Finished recovery: if nightfall wins, the game reports held phases, aligned nodes, score, shifts, and gives a direct retry or Demo Solve route.

The receipt is supporting evidence, not the main event. The intended path is still to play the rotor, feel daylight pressure, then use the checksum receipt to inspect the finished Demo Solve.

## Video Demo

The captioned WebM records the current judge path: first-screen context, Hint/manual controls, phase banner, Rotor Trace, `Demo Solve`, the final receipt, and the local verifier. The GIF above is the quick inline fallback; the optional MP4 remains only if the DEV editor specifically asks for an MP4 file.

![Helioigma desktop gameplay](https://ooyxloo.github.io/helioigma/desktop-check-v5.png?v=20260615-fresh-media)

![Helioigma mobile completion receipt](https://ooyxloo.github.io/helioigma/mobile-complete-v1.png?v=20260615-fresh-media)

Watch the current captioned WebM video: https://ooyxloo.github.io/helioigma/helioigma-demo.webm?v=20260615-fresh-media

Optional legacy MP4 fallback: https://ooyxloo.github.io/helioigma/helioigma-demo.mp4

Watch the current GIF preview: https://ooyxloo.github.io/helioigma/helioigma-demo.gif?v=20260615-fresh-media

## Quick Links

- Play: https://ooyxloo.github.io/helioigma/
- Auto demo: https://ooyxloo.github.io/helioigma/?demo=1
- Source: https://github.com/OOYXLOO/helioigma

Detailed judge links: [judge page](https://ooyxloo.github.io/helioigma/judge.html), [smoke test](https://ooyxloo.github.io/helioigma/smoke.html), [sample receipt verifier](https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1), [judge-manifest.json](https://ooyxloo.github.io/helioigma/judge-manifest.json), and [RUBRIC_SCORECARD.md](https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md).

Core features, compressed for review: four timed phases; canvas-rendered glyphs, beams, progress ring, and particle feedback; mouse, touch, on-screen buttons, first-move coach, hint, demo-solve, number-key controls, and tactile pulse feedback; phase-specific hint order where Crib uses the first mismatch, XOR alternates mirrored rotor nodes, Carry follows the chain, and Checksum scans backward; Optional default-off Web Audio cues; short phase banner and screen-reader phase announcer; live Rotor Trace; score carry-over, local best score, final phase ledger, copyable `SC-4P-...` receipt, and Judge run summary.

Fast review evidence stays compact: Nightfall reports failed manual runs, the receipt checker recomputes the checksum, and the judge page, manifest, and smoke test cover the loop. On mobile the Run Path moves below the playfield so the canvas owns the first viewport.

## Judge in 60 Seconds

Award thesis: Helioigma is a playable ode, a receipt-checkable loop, and a finished static package. For a first pass, the important thing is simple: play the wheel, watch the state trace, and inspect the receipt.

Official route snapshot: Best Ode to Alan Turing category route in the official challenge; submit by June 21, 2026 at 11:59 PM PDT; no Google AI claim, backend, account login, API key, or private data. No account, API, backend, private data, or hidden judge path is needed to inspect the build.

1. Open the play link and follow the first-screen Run Path: match nodes manually, press `Demo Solve` for the full loop and stable receipt `SC-4P-2907-62-Y5VFX1`, or use the auto-demo link to start that deterministic route immediately.
2. Watch the captioned WebM video or GIF preview.
3. Open the sample receipt verifier, or use the completed-run Verify receipt link, to confirm the checksum loop.
4. Open `judge-manifest.json` for the machine-readable prize target, rubric snapshot, run receipt, public links, and human gate summary.
5. Optional: run `smoke.html` to see the game solve all four phases automatically and report the 70-check browser receipt.

Public media links: cover.png?v=20260615-fresh-media, helioigma-demo.webm?v=20260615-fresh-media, helioigma-demo.gif?v=20260615-fresh-media, desktop-check-v5.png?v=20260615-fresh-media, mobile-check-v6.png?v=20260615-fresh-media, desktop-complete-v4.png?v=20260615-fresh-media, and mobile-complete-v1.png?v=20260615-fresh-media. The strongest stills are the completion screenshot with receipt ledger and Judge run summary, plus the Mobile completion screenshot. Optional legacy MP4 fallback: [helioigma-demo.mp4](https://ooyxloo.github.io/helioigma/helioigma-demo.mp4).

## Code

The source is hosted on [GitHub](https://github.com/OOYXLOO/helioigma). I am including the DEV embed syntax as the code card, plus the plain URL immediately below for reviewers whose reader strips embeds:

{% embed https://github.com/OOYXLOO/helioigma %}

Plain source URL: https://github.com/OOYXLOO/helioigma

The project is deliberately small: `index.html`, `styles.css`, and `game.js` hold the playable game; `proof-verifier.html`, `smoke.html`, `judge.html`, `RUBRIC_SCORECARD.md`, and `judge-manifest.json` make the review path inspectable; `tools/build-demo-video.mjs`, `tools/build-demo-webm.mjs`, and `tools/build-demo-gif.py` reproduce the media; `tools/verify-media-freshness.mjs` checks PNG, GIF, and WebM freshness; and `LICENSE` is the MIT license for the game package.

## How to Play

Start the run, then decode the solstice rotor by matching each numbered node to the target glyph above it before nightfall. Correct locks earn points, streaks reward clean phase solves, and exploratory shifts cost a little time. Clear all four phases to hold the longest day. If nightfall catches a manual run, the game reports progress and gives Retry or Demo Solve recovery.

Controls:

- Click or tap ring nodes to rotate them.
- Use the touch buttons below the canvas.
- Press `Hint` or `H` to highlight the next mismatched node during manual play.
- Press `Demo Solve` or `D` to watch all four phases complete automatically, or open `?demo=1` to start that judge path immediately.
- Press `Audio` or `S` to enable optional short generated audio cues. Audio starts off.
- Press number keys `1` through `9` to rotate matching node positions.
- Press `Enter` to start a fresh run.
- Press `Escape` or `R` to reset the board.

Score rewards held daylight, streaks, and fewer wasted shifts; the final receipt lets judges inspect score, shift count, phase count, and checksum summary without trusting a hidden backend.

## Accessibility, Fair Play, and Privacy

I treated the review surface as part of the game. Helioigma can be played with mouse, touch, on-screen buttons, or number keys, and the screen includes hidden helper text plus a phase announcer for assistive technology. Audio cues are generated in the browser, start off by default, and only turn on after the player chooses `Audio` or presses `S`.

The build avoids telemetry and account state. There is no backend, no analytics call, no API key, and no private console. The only default browser storage is the local numeric best score for this game, and `?nostore=1` disables best-score storage for stricter privacy review. The receipt is not anti-cheat, identity, payout, or eligibility proof; it is a small checksum so judges can inspect the same Demo Solve path without trusting a screenshot.

## How I Built It

I built Helioigma as a no-backend canvas game so the public demo can run from GitHub Pages. The level data is deterministic: every phase has a target array, the player ring starts offset from that target, and every click/tap/key/button press rotates one node through `SOL`, `XOR`, `LUX`, and `BIN`.

The game awards points for locking nodes, keeps a shift counter, carries score through four named phases, and pauses timer drift during `Demo Solve` so judges get the same stable receipt every time. Failed manual runs also produce a small Nightfall report, so the losing state is inspectable rather than just a reset. Completed runs generate a checksum from:

```text
solstice|4|score|shifts|4
```

The receipt checker recomputes that checksum in the browser and displays the parsed receipt facts. It is not anti-cheat infrastructure; it is a reproducible run checksum that makes the demo path inspectable.

The biggest tradeoff was keeping the canvas interaction playful while making the review path deterministic. Manual play keeps the live timer and normal controls, while `Demo Solve` pauses timer drift and uses the same node-rotation path so the judge can inspect one stable receipt without a hidden test mode.

## Prize Category

This submission is aimed at the Best Ode to Alan Turing category. It does not claim the Best Google AI Usage category.

The June solstice is the longest day in the northern hemisphere. I turned that into the game's pressure loop: daylight is the time resource, nightfall is the fail state, and the win condition is a clean final cipher before the longest day slips away.

For the Alan Turing angle, Helioigma borrows the feeling of rotor alignment and target checking without pretending to simulate a historical machine. The mechanics are intentionally computational: deterministic state, target matching, rotor-like cycling, binary/XOR language, and local verification of the final receipt. The glyph language mixes solstice imagery with code-breaking cues:

- `SOL` for daylight.
- `XOR` for logic.
- `LUX` for light.
- `BIN` for binary state.

## An Ode with Restraint

I wanted the Turing reference to be respectful instead of decorative. Helioigma is not a biography game, and it does not try to recreate the Bombe or any real wartime machine. It keeps the tribute inside the things a browser game can honestly express: state, logic, alignment, verification, pressure, and a small act of holding light against a timer.

That is also why the receipt matters to the theme. Turing's legacy is not only "secret codes"; it is careful reasoning about machines and evidence. The checksum is modest, but it makes the solve inspectable instead of asking the judge to trust a screenshot.

## Why It Is Not Just a Cipher Demo

I wanted the Turing reference to live in the interaction, not only in the title. The player manipulates rotor state under a daylight timer, builds a score through phase solves, and leaves behind a receipt that can be checked independently. Rotor Trace shows the state machine changing, `Demo Solve` uses the same public controls as manual play, and the completed run links directly into the receipt checker. The result is a small playable system with an audit trail, not just a solstice skin over a puzzle.

My crowded-queue test: if a judge has already seen another cipher wheel or Turing reference, Helioigma should still be legible as game-first, reproducible, finished on failure, and public-safe. The timer, node pulses, and phase-specific hint order are playable before the receipt layer matters; Nightfall becomes a report with Retry and Demo Solve; and no backend, hidden service, account login, API key, telemetry, or private console is needed to inspect it.

## Rubric Fit

| Criterion | How Helioigma addresses it |
| --- | --- |
| Theme relevance | Daylight is the timer, nightfall is the fail state, and the final solve is framed as holding the longest day. |
| Creativity | The solstice theme is combined with a code-breaking wheel, live Rotor Trace, deterministic demo route, and verifiable run receipt instead of a literal platformer or trivia page. |
| Technical execution | The game is a self-contained canvas app with touch, keyboard, node buttons, phase-specific hint order, scoring, local best score, receipt generation, and a browser smoke test. |
| Writing quality | The post, judge page, judge manifest, screenshots, and verification page give a short review path instead of asking judges to infer the project from source alone. |
| Optional category | The Best Ode to Alan Turing fit comes from rotor-like alignment, target checking, XOR/binary language, receipt verification, and a restrained tribute that avoids pretending to simulate a real historical machine. |

## After Publishing

After the DEV post is public, I will share it with a short, honest note asking people to try the game and leave feedback if they enjoy it. The goal is real review traffic from people who actually open the game, not spam or fake engagement.

## Originality and Build Window

The package is a new creation for the official June 3 to June 21 jam window, not a wrapper around a prior game template. The gameplay code, receipt verifier, judge page, judge manifest, smoke test, screenshots, and demo media are included so reviewers can inspect what was built.

The public media pack is generated from this build's browser UI and checked-in demo frames, so the WebM/GIF are true demo artifacts from the current game rather than mockups. No third-party game template, stock-art pack, private dataset, backend service, API key, or account-local state is required.

## Challenge Compliance

The submission package includes `CHALLENGE_COMPLIANCE.md` as a compact official-route checklist. It maps the DEV tags, playable game, demo media, code link, build notes, solstice theme, Best Ode to Alan Turing fit, originality statement, no-account review path, and prize-claim boundary to files in the repo.

The important boundary is deliberate: Helioigma targets Best Ode to Alan Turing and does not claim Best Google AI Usage. There is no Google AI dependency, backend API, cloud credential, private dataset, or hidden account console required.

Before publication, the public launch gate is simple: the GitHub repo must be live, GitHub Pages must return HTTP 200, and `public-preflight.ps1 -Public` must pass against the live URLs.

## Verification

I verified the local package with `node --check game.js`, `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1`, desktop and 390px mobile layout checks, and a 390px mobile completion check where Demo Solve reaches receipt `SC-4P-2907-62-Y5VFX1`, phase ledger, and Judge run summary in `mobile-complete-v1.png`. `smoke.html`: 70 checks passed, including daylight meter, score/receipt explanation, phase objective strip, phase-proof copy, Nightfall report, phase announcer, phase scoring ledger, Judge run summary, award signals, default-off Audio control, Hint shortcut/highlight behavior, Rotor Trace state, deterministic demo receipt through the public shortcut path, reset recovery, judge shortcuts, final status, run receipt, and receipt-verifier link coverage. `judge-manifest.json`: records the Best Ode to Alan Turing category, expected 70 smoke checks, public links, stable receipt `SC-4P-2907-62-Y5VFX1`, and human gates.

After GitHub Pages is live, the final launch check is `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public` against the public URLs.

---
title: "Helioigma: a Turing-wheel puzzle for holding the longest day"
published: false
description: "A small browser game for the DEV June Solstice Game Jam: decode a Turing-inspired solar rotor before nightfall."
tags: devchallenge, gamechallenge, gamedev, javascript
cover_image: https://ooyxloo.github.io/helioigma/cover.png
---

## The Longest Day as a Countdown Machine

You get 45 seconds of daylight, a rotor full of `SOL`, `XOR`, `LUX`, and `BIN`, and one job: keep the longest day from slipping into night by aligning the cipher before the timer empties.

The play feel is meant to be small but tense: read the target glyphs, tap a numbered node, watch the wheel answer, then decide whether to keep chasing the next mismatch or spend the `Hint` nudge. It is a little daylight machine that asks for fast pattern matching before it asks for proof.

Helioigma is built around that small pressure loop. Each phase changes the target pattern, the live objective strip tells you what the rotor wants next, and a small phase-proof line explains how the current phase maps to solstice pressure, Turing-style state alignment, or checksum verification. Every click or number key shifts a node one glyph forward. Clear all four phases and the game leaves behind a receipt: not a trophy screen alone, but a compact proof that the solve path can be inspected.

I am aiming this at Best Ode to Alan Turing by making the tribute playable. The ode is in rotor-like alignment, target checking, XOR/binary language, pressure, and a checksum receipt that turns the finished run into something a judge can verify instead of only watch.

My award thesis is simple: this is a playable ode, a judge-verifiable loop, and a finished static package. The Turing fit lives in rotor state and checksum reasoning; the solstice fit lives in daylight pressure; and the review path lets a judge prove the same public game loop through Auto Demo, Rotor Trace, smoke test, manifest, and receipt verifier.

## What I Built

Helioigma is a compact browser puzzle for the DEV June Solstice Game Jam. The player races the longest day by rotating a Turing-inspired solar rotor until each numbered node matches the target cipher before nightfall ends the run.

Helioigma is the game title and the public build slug, chosen so the submission is easy to distinguish from other similarly named solstice puzzle entries.

I chose a cipher wheel because the solstice already has a natural tension: one unusually long day, then the light starts slipping away again. A wheel let me turn that into a small mechanical ritual instead of a static theme reference. Each phase asks the player to line up a readable pattern, but the timer keeps it from becoming a spreadsheet.

The build is meant to be judged quickly without losing the game premise: the first screen names the rotor, the matching goal, and the three-step judge path. A reviewer can play manually with `Hint` if they want a small nudge, press `Demo Solve`, watch all four phases complete, copy the stable receipt `SC-4P-2907-62-Y5VFX1`, and verify the checksum locally. It is a static HTML/CSS/JavaScript game with no backend, no API key, and no private data. The only browser storage is a local numeric best-score key for this game.

## Video Demo

The demo video is a live browser recording of the current judge path: first-screen context, Hint/manual controls, phase banner, Rotor Trace, `Demo Solve`, the final receipt, and the local verifier. The WebM is the primary captioned video; the GIF below is a quick inline fallback. An optional legacy MP4 fallback is retained only if the DEV editor specifically asks for an MP4 file.

![Helioigma four-phase demo solve](https://ooyxloo.github.io/helioigma/helioigma-demo.gif)

![Helioigma desktop gameplay](https://ooyxloo.github.io/helioigma/desktop-check-v5.png)

![Helioigma mobile completion receipt](https://ooyxloo.github.io/helioigma/mobile-complete-v1.png)

Watch the current captioned WebM video: https://ooyxloo.github.io/helioigma/helioigma-demo.webm

Optional legacy MP4 fallback: https://ooyxloo.github.io/helioigma/helioigma-demo.mp4

Watch the current GIF preview: https://ooyxloo.github.io/helioigma/helioigma-demo.gif

## Quick Links

- Play: https://ooyxloo.github.io/helioigma/
- Auto demo: https://ooyxloo.github.io/helioigma/?demo=1
- Source: https://github.com/OOYXLOO/helioigma

Detailed judge links:

- Judge page: https://ooyxloo.github.io/helioigma/judge.html
- Smoke test: https://ooyxloo.github.io/helioigma/smoke.html
- Sample receipt verifier: https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1
- Judge manifest: https://ooyxloo.github.io/helioigma/judge-manifest.json

Core features:

- Four timed phases with a visible progress strip.
- Canvas-rendered glyphs, beams, progress ring, and particle feedback.
- Mouse, touch, on-screen buttons, first-move coach, hint, demo-solve, number-key controls, and tactile pulse feedback after hints or shifts.
- Optional default-off Web Audio cues for start, hint, node shift, lock, phase clear, completion, and nightfall.
- Short phase banner and screen-reader phase announcer when each phase starts.
- Live Rotor Trace panel for phase, aligned count, next mismatch, and last action.
- Score carry-over, streak bonuses, shift counting, and a local best score.
- Final screen with solved phase count, phase scoring ledger, total shifts, score, copyable `SC-4P-...` run receipt, and a human-readable Judge run summary.
- Nightfall report for failed manual runs, with aligned-node progress, held phases, score, shifts, and direct Retry / Demo Solve recovery.
- Receipt verifier that recomputes the checksum locally, supports completed-run `?receipt=` deep links, and shows parsed phases, score, shifts, and checksum facts.
- Judge page, judge manifest, and browser smoke test for a fast review path.
- First-screen phase objective strip with phase-proof copy, plus Judge Path cards for Play, Demo Solve + Rotor Trace, and Receipt on desktop and mobile. On mobile the cards collapse to compact labels so the canvas still starts in the first viewport.

## Judge in 60 Seconds

Award thesis: Helioigma is a playable ode, a judge-verifiable loop, and a finished static package. No account, API, backend, private data, or hidden judge path is needed to inspect it.

Official route snapshot: Best Ode to Alan Turing, one of five USD 200 winner slots; submit by June 21, 2026 at 11:59 PM PDT; no Google AI claim, backend, account login, API key, or private data.

1. Open the play link and follow the first-screen Judge Path: play manually, press `Demo Solve` for the full loop and stable receipt `SC-4P-2907-62-Y5VFX1`, or use the auto-demo link to start that deterministic route immediately.
2. Watch the captioned WebM video or GIF preview.
3. Run `smoke.html` to see the game solve all four phases automatically.
4. Open `judge-manifest.json` for the machine-readable prize target, rubric snapshot, run receipt, public links, and human gate summary.
5. Open the sample receipt verifier, or use the completed-run Verify receipt link, to confirm the checksum loop.

Public media links:

1. Cover: https://ooyxloo.github.io/helioigma/cover.png
2. WebM video: https://ooyxloo.github.io/helioigma/helioigma-demo.webm
3. Optional legacy MP4 fallback: https://ooyxloo.github.io/helioigma/helioigma-demo.mp4
4. GIF fallback: https://ooyxloo.github.io/helioigma/helioigma-demo.gif
5. Desktop screenshot: https://ooyxloo.github.io/helioigma/desktop-check-v5.png
6. Mobile screenshot: https://ooyxloo.github.io/helioigma/mobile-check-v6.png
7. Completion screenshot with receipt ledger and Judge run summary: https://ooyxloo.github.io/helioigma/desktop-complete-v4.png
8. Mobile completion screenshot with stable receipt, phase ledger, and Judge run summary: https://ooyxloo.github.io/helioigma/mobile-complete-v1.png

## Code

The source is hosted at https://github.com/OOYXLOO/helioigma. If the DEV editor renders GitHub cards, this repository URL can stand alone as the code embed for review:

https://github.com/OOYXLOO/helioigma

The project is deliberately small:

- `index.html`: playable Helioigma game shell and first-screen judge path.
- `styles.css`: responsive game UI.
- `game.js`: deterministic levels, canvas rendering, controls, scoring, receipt generation, and Demo Solve.
- `proof-verifier.html`: local receipt checksum verifier.
- `smoke.html`: browser smoke test that solves the public game path in an iframe.
- `judge.html`: one-page review hub.
- `judge-manifest.json`: machine-readable judge manifest for the prize target, public links, stable run receipt, media, verification steps, and human gates.
- `tools/build-demo-video.mjs`: records the current captioned WebM demo from a live browser session.
- `tools/build-demo-webm.mjs`: keeps a frame-based fallback builder for the preview sequence.
- `LICENSE`: MIT license for the game package.

## How to Play

Start the run, then decode the solstice rotor by matching each numbered node to the target glyph above it before nightfall. Correct locks earn points, streaks reward clean phase solves, and exploratory shifts cost a little time. Clear all four phases to hold the longest day and reveal the final score. If nightfall catches a manual run, the game reports how much of the current phase was aligned and gives a clean Retry or Demo Solve recovery path.

Controls:

- Click or tap ring nodes to rotate them.
- Use the touch buttons below the canvas.
- Press `Hint` or `H` to highlight the next mismatched node during manual play.
- Press `Demo Solve` or `D` to watch all four phases complete automatically, or open `?demo=1` to start that judge path immediately.
- Press `Audio` or `S` to enable optional short generated audio cues. Audio starts off.
- Press number keys `1` through `9` to rotate matching node positions.
- Press `Enter` to start a fresh run.
- Press `Escape` or `R` to reset the board.

Score rewards held daylight, streaks, and fewer wasted shifts; the final receipt lets judges verify the same run path without trusting a hidden backend.

## How I Built It

I built Helioigma as a no-backend canvas game so the public demo can run from GitHub Pages. The level data is deterministic: every phase has a target array, the player ring starts offset from that target, and every click/tap/key/button press rotates one node through the `SOL`, `XOR`, `LUX`, and `BIN` states.

The game awards points for locking nodes, keeps a shift counter, carries score through four named phases, and pauses timer drift during `Demo Solve` so judges get the same stable receipt every time. Failed manual runs also produce a small Nightfall report, so the losing state is inspectable rather than just a reset. Completed runs generate a checksum from:

```text
solstice|4|score|shifts|4
```

The verifier recomputes that checksum in the browser and displays the parsed receipt facts. It is not anti-cheat infrastructure; it is a reproducible run checksum that makes the demo path inspectable.

The biggest tradeoff was keeping the canvas interaction playful while making the review path deterministic. Manual play keeps the live timer and normal keyboard/touch controls, but `Demo Solve` pauses timer drift and uses the same node-rotation path, so the judge can inspect one stable run receipt without a hidden test mode.

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

That is also why the verifier matters to the theme. Turing's legacy is not only "secret codes"; it is careful reasoning about machines and proof. The receipt is modest, but it makes the solve inspectable instead of asking the judge to trust a screenshot.

## Why It Is Not Just a Cipher Demo

I wanted the Turing reference to live in the interaction, not only in the title. The player does not read a solved cipher; they manipulate the rotor state under a daylight timer, build a score through phase solves, and leave behind a receipt that can be checked independently. The smoke test and receipt verifier are part of that design: they make the code-breaking loop visible and reproducible for judges without turning the game into a static worksheet.

The jam theme makes daylight, calendars, and code-breaking natural starting points. I tried to make Helioigma stand apart by turning those ideas into a judge-verifiable loop: the live Rotor Trace shows the state machine changing, `Demo Solve` uses the same public controls as manual play, and the completed run links directly into the receipt verifier. The result is meant to be a small playable system with an audit trail, not only a solstice skin over a puzzle.

## Rubric Fit

| Criterion | How Helioigma addresses it |
| --- | --- |
| Theme relevance | Daylight is the timer, nightfall is the fail state, and the final solve is framed as holding the longest day. |
| Creativity | The solstice theme is combined with a code-breaking wheel, live Rotor Trace, deterministic demo route, and verifiable run receipt instead of a literal platformer or trivia page. |
| Technical execution | The game is a self-contained canvas app with touch, keyboard, node buttons, scoring, local best score, receipt generation, and a browser smoke test. |
| Writing quality | The post, judge page, judge manifest, screenshots, and verification page give a short review path instead of asking judges to infer the project from source alone. |
| Optional category | The Best Ode to Alan Turing fit comes from rotor-like alignment, target checking, XOR/binary language, receipt verification, and a restrained tribute that avoids pretending to simulate a real historical machine. |

## After Publishing

After the DEV post is public, I will share the live post with a short, honest note asking people to try the game and leave feedback if they enjoy it. The goal is real review traffic from people who actually open the game, not spam or fake engagement.

## Originality and Build Window

The package is a new static game build for this jam period, not a wrapper around a prior game template. The gameplay code, receipt verifier, judge page, judge manifest, smoke test, screenshots, and demo media are included with the source package so reviewers can inspect what was built for the submission.

The public media pack is generated from this build's browser UI and checked-in demo frames. No third-party game template, stock-art pack, private dataset, backend service, API key, or account-local state is required to review the entry.

## Challenge Compliance

The submission package includes `CHALLENGE_COMPLIANCE.md` as a compact official-route checklist. It maps the DEV tags, playable game, demo media, code link, build notes, solstice theme, Best Ode to Alan Turing fit, originality statement, no-account review path, and prize-claim boundary to concrete files in the repo.

The important boundary is deliberate: Helioigma targets Best Ode to Alan Turing and does not claim Best Google AI Usage. There is no Google AI dependency, backend API, cloud credential, private dataset, or hidden account console required to review the game.

Before publication, the public launch gate is simple: the GitHub repo must be live, GitHub Pages must return HTTP 200, and `public-preflight.ps1 -Public` must pass against the live URLs.

## Verification

I verified the package with:

- `node --check game.js`
- `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public` after the public Pages links are live
- Desktop browser check: no horizontal overflow, visible four-step phase track, and nonblank gameplay screenshot.
- 390px mobile browser check: no horizontal overflow, compact phase track, visible controls, and the canvas begins in the first viewport.
- 390px mobile completion check: Demo Solve reaches receipt `SC-4P-2907-62-Y5VFX1`, phase ledger, and Judge run summary in `mobile-complete-v1.png`.
- `smoke.html`: 69 checks passed, including daylight meter, score/receipt explanation, phase objective strip, phase-proof copy, Nightfall report, phase announcer, phase scoring ledger, Judge run summary, award signals, default-off Audio control, Hint shortcut/highlight behavior, Rotor Trace state, deterministic demo receipt through the public shortcut path, reset shortcut recovery, released manual controls, judge shortcuts, shift counter, phase track, final status, run receipt, and receipt-verifier link coverage.
- `judge-manifest.json`: records the USD 200 prize target, Best Ode to Alan Turing category, expected 69 smoke checks, public links, stable receipt `SC-4P-2907-62-Y5VFX1`, and human gates.

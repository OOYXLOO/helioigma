---
title: "Helioigma: a Turing-wheel puzzle for holding the longest day"
published: false
description: "A small browser game for the DEV June Solstice Game Jam: decode a Turing-inspired solar rotor before nightfall."
tags: devchallenge, gamechallenge, gamedev
cover_image: https://ooyxloo.github.io/solstice-cipher/cover.png
---

## What I Built

Helioigma is a compact browser puzzle for the DEV June Solstice Game Jam. The player races the longest day by rotating a Turing-inspired solar rotor of `SOL`, `XOR`, `LUX`, and `BIN` glyphs until each numbered node matches the target cipher before nightfall ends the run.

I chose a cipher wheel because the solstice already has a natural tension: one unusually long day, then the light starts slipping away again. A wheel let me turn that into a small mechanical ritual instead of a static theme reference. Each phase asks the player to line up a readable pattern, but the timer keeps it from becoming a spreadsheet.

The build is meant to be judged quickly without losing the game premise: the first screen names the rotor, the matching goal, and the three-step judge path. A reviewer can play, press `Demo Solve`, watch all four phases complete, copy the stable receipt `SC-4P-2907-62-Y5VFX1`, and verify the checksum locally. It is a static HTML/CSS/JavaScript game with no backend, no API key, and no private data. The only browser storage is a local numeric best-score key for this game.

Links:

- Play: https://ooyxloo.github.io/solstice-cipher/
- Source: https://github.com/OOYXLOO/solstice-cipher
- Judge page: https://ooyxloo.github.io/solstice-cipher/judge.html
- Smoke test: https://ooyxloo.github.io/solstice-cipher/smoke.html
- Receipt verifier: https://ooyxloo.github.io/solstice-cipher/proof-verifier.html
- Judge manifest: https://ooyxloo.github.io/solstice-cipher/judge-manifest.json

Core features:

- Four timed phases with a visible progress strip.
- Canvas-rendered glyphs, beams, progress ring, and particle feedback.
- Mouse, touch, node-button, demo-solve, and number-key controls.
- Score carry-over, streak bonuses, shift counting, and a local best score.
- Final screen with solved phase count, total shifts, score, and copyable `SC-4P-...` run receipt.
- Receipt verifier that recomputes the checksum locally and shows parsed phases, score, shifts, and checksum facts.
- Judge page, judge manifest, and browser smoke test for a fast review path.
- First-screen Judge Path cards for Play, Demo Solve, and Verify.

## Judge in 60 Seconds

1. Open the play link and follow the first-screen Judge Path: play manually, press `Demo Solve` for the full loop and stable receipt `SC-4P-2907-62-Y5VFX1`, then verify it.
2. Watch the current GIF preview.
3. Run `smoke.html` to see the game solve all four phases automatically.
4. Open `judge-manifest.json` for the machine-readable prize target, run receipt, public links, and human gate summary.
5. Paste the sample receipt into `proof-verifier.html` to confirm the checksum loop.

## Video Demo

The demo video shows the current four-phase interface, node controls, and final receipt flow.

![Helioigma four-phase demo solve](https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif)

![Helioigma desktop gameplay](https://ooyxloo.github.io/solstice-cipher/desktop-check-v5.png)

Watch the current WebM video: https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.webm

Watch the current GIF preview: https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif

Public media links:

1. Cover: https://ooyxloo.github.io/solstice-cipher/cover.png
2. WebM video: https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.webm
3. GIF fallback: https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif
4. Desktop screenshot: https://ooyxloo.github.io/solstice-cipher/desktop-check-v5.png
5. Mobile screenshot: https://ooyxloo.github.io/solstice-cipher/mobile-check-v6.png
6. Completion screenshot: https://ooyxloo.github.io/solstice-cipher/desktop-complete-v4.png

## Code

The source is hosted at https://github.com/OOYXLOO/solstice-cipher. The project is deliberately small:

- `index.html`: playable Helioigma game shell and first-screen judge path.
- `styles.css`: responsive game UI.
- `game.js`: deterministic levels, canvas rendering, controls, scoring, receipt generation, and Demo Solve.
- `proof-verifier.html`: local receipt checksum verifier.
- `smoke.html`: browser smoke test that solves the public game path in an iframe.
- `judge.html`: one-page review hub.
- `judge-manifest.json`: machine-readable judge manifest for the prize target, public links, stable run receipt, media, verification steps, and human gates.
- `tools/build-demo-webm.mjs`: reproduces the current WebM video from the checked-in demo frames.
- `LICENSE`: MIT license for the game package.

## How to Play

Start the run, then decode the solstice rotor by matching each numbered node to the target glyph above it before nightfall. Correct locks earn points, streaks reward clean phase solves, and exploratory shifts cost a little time. Clear all four phases to hold the longest day and reveal the final score.

Controls:

- Click or tap ring nodes to rotate them.
- Use the node-control buttons below the canvas.
- Press `Demo Solve` to watch all four phases complete automatically.
- Press number keys `1` through `9` to rotate matching node positions.
- Press `Enter` to start a fresh run.
- Press `Escape` to reset the board.

## How I Built It

I built Helioigma as a no-backend canvas game so the public demo can run from GitHub Pages. The level data is deterministic: every phase has a target array, the player ring starts offset from that target, and every click/tap/key/button press rotates one node through the `SOL`, `XOR`, `LUX`, and `BIN` states.

The game awards points for locking nodes, keeps a shift counter, carries score through four named phases, and pauses timer drift during `Demo Solve` so judges get the same stable receipt every time. Completed runs generate a checksum from:

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

## Rubric Fit

| Criterion | How Helioigma addresses it |
| --- | --- |
| Theme relevance | Daylight is the timer, nightfall is the fail state, and the final solve is framed as holding the longest day. |
| Creativity | The solstice theme is combined with a code-breaking wheel instead of a literal platformer or trivia page. |
| Technical execution | The game is a self-contained canvas app with touch, keyboard, node buttons, scoring, local best score, receipt generation, and a browser smoke test. |
| Writing quality | The post, judge page, judge manifest, screenshots, and verification page give a short review path instead of asking judges to infer the project from source alone. |
| Optional category | The Best Ode to Alan Turing fit comes from rotor-like alignment, target checking, XOR/binary language, and receipt verification. |

## Originality and Build Window

The package is a new static game build for this jam period, not a wrapper around a prior game template. The gameplay code, receipt verifier, judge page, judge manifest, smoke test, screenshots, and demo media are included with the source package so reviewers can inspect what was built for the submission.

## Verification

I verified the package with:

- `node --check game.js`
- `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public` after the public Pages links are live
- Desktop browser check: no horizontal overflow, visible four-step phase track, and nonblank gameplay screenshot.
- 390px mobile browser check: no horizontal overflow, visible wrapped phase track, and nonblank gameplay screenshot.
- `smoke.html`: 29 checks passed, including deterministic demo receipt through the public shortcut path, released manual controls, judge shortcuts, shift counter, phase track, final status, and run receipt.
- `judge-manifest.json`: records the USD 200 prize target, Best Ode to Alan Turing category, expected 30 smoke checks, public links, stable receipt `SC-4P-2907-62-Y5VFX1`, and human gates.

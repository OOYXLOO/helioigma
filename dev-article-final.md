---
title: "Solstice Cipher: a Turing-wheel puzzle for holding the longest day"
published: false
description: "A small browser game for the DEV June Solstice Game Jam: align a Turing-inspired solar cipher wheel before nightfall."
tags: devchallenge, gamechallenge, gamedev
cover_image: ./cover.png
---

## Overview

Solstice Cipher is a compact browser puzzle for the DEV June Solstice Game Jam. The player races the longest day by rotating a Turing-inspired ring of `SOL`, `XOR`, `LUX`, and `BIN` glyphs until each node matches the target cipher before nightfall ends the run.

It is designed to be playable in a quick judging pass: a visible four-phase progress strip, score carry-over, streak bonuses, shift counting, keyboard/touch controls, explicit node-control buttons for mobile play, a one-click demo solve, a local best score, and a deterministic run proof at the end.

Public links to add only after hosting is live:

- Play: https://ooyxloo.github.io/solstice-cipher/
- Source: https://github.com/OOYXLOO/solstice-cipher
- Judge page: https://ooyxloo.github.io/solstice-cipher/judge.html
- Smoke test: https://ooyxloo.github.io/solstice-cipher/smoke.html
- Proof verifier: https://ooyxloo.github.io/solstice-cipher/proof-verifier.html

## Judge in 60 Seconds

1. Open the play link and press `Demo Solve` for the full loop, or press `Start` to play manually.
2. Watch the short MP4 demo or GIF preview.
3. Run `smoke.html` to see the game solve all four phases automatically.
4. Paste the sample proof into `proof-verifier.html` to confirm the checksum loop.

Prize-category note: this submission is aimed at the Best Ode to Alan Turing category through code-breaking mechanics, rotor-like alignment, binary/XOR language, and a quick verifier loop. It does not claim the Best Google AI Usage category.

## Demo Video

Upload or embed `solstice-cipher-demo.mp4` in the DEV post media area. If DEV prefers another format, use `solstice-cipher-demo.webm`; keep `solstice-cipher-demo.gif` as the animated fallback.

Media order:

1. `cover.png`
2. `solstice-cipher-demo.mp4`
3. `solstice-cipher-demo.webm`
4. `solstice-cipher-demo.gif`
5. `desktop-check-v5.png`
6. `mobile-check-v6.png`
7. `desktop-complete-v4.png`

## How to Play

Start the run, then rotate each ring glyph until it matches the target cipher above it. Correct locks earn points, streaks reward clean phase solves, and exploratory shifts cost a little time. Clear all four phases to hold the longest day and reveal the final score.

Controls:

- Click or tap ring nodes to rotate them.
- Use the node-control buttons below the canvas.
- Press `Demo Solve` to watch all four phases complete automatically.
- Press number keys `1` through `9` to rotate matching node positions.
- Press `Enter` to start a fresh run.
- Press `Escape` to reset the board.

## How It Fits the Challenge

The June solstice is the longest day in the northern hemisphere. I turned that into the game's pressure loop: daylight is the time resource, nightfall is the fail state, and the win condition is a clean final cipher before the longest day slips away.

For the Alan Turing angle, Solstice Cipher borrows the feeling of rotor alignment and target checking without pretending to simulate a historical machine. The glyph language mixes solstice imagery with code-breaking cues:

- `SOL` for daylight.
- `XOR` for logic.
- `LUX` for light.
- `BIN` for binary state.

## Rubric Fit

| Criterion | How Solstice Cipher addresses it |
| --- | --- |
| Theme relevance | Daylight is the timer, nightfall is the fail state, and the final solve is framed as holding the longest day. |
| Creativity | The solstice theme is combined with a code-breaking wheel instead of a literal platformer or trivia page. |
| Technical execution | The game is a self-contained canvas app with touch, keyboard, node buttons, scoring, local best score, proof generation, and a browser smoke test. |
| Writing quality | The post, judge page, screenshots, and verification page give a short review path instead of asking judges to infer the project from source alone. |
| Optional category | The Best Ode to Alan Turing fit comes from rotor-like alignment, target checking, XOR/binary language, and proof verification. |

## What I Built

- A self-contained static HTML/CSS/JavaScript game.
- Canvas-rendered glyphs, beams, progress ring, and particle feedback.
- Four timed phases with a visible progress strip, score carry-over, and streak bonuses.
- Mouse, touch, node-button, demo-solve, and number-key controls.
- Final screen with solved phase count, total shifts, local best score, and copyable `SC-4P-...` run proof.
- A proof verifier that recomputes completion checksums locally.
- A judge page and smoke test so reviewers can verify the full loop quickly.
- DEV-ready media: cover image, MP4/WebM demo, GIF preview, desktop screenshot, mobile screenshot, and completion screenshot.

## Originality and Build Window

The package is a new static game build for this jam period, not a wrapper around a prior game template. The gameplay code, proof verifier, judge page, smoke test, screenshots, and demo media are included with the source package so reviewers can inspect what was built for the submission.

## Technical Notes

The game uses a single canvas and deterministic level definitions. The target cipher and player ring are arrays of phase values. Matching all phase values advances the game and awards a time-weighted score. The browser smoke test starts the game inside an iframe, solves all four phases using public keyboard controls, and checks the final status plus run proof format.

## Verification

Before publishing, I verified the local package with:

- `node --check game.js`
- Desktop browser check: no horizontal overflow, visible four-step phase track, and nonblank gameplay screenshot.
- 390px mobile browser check: no horizontal overflow, visible wrapped phase track, and nonblank gameplay screenshot.
- `smoke.html`: 17 checks passed, including the demo-solve control, shift counter, phase track, final status, and run proof.

Do not publish this draft until the public play link, source repo, judge page, proof verifier, and smoke test are live.

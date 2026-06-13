---
title: "Solstice Cipher: a Turing-wheel puzzle for holding the longest day"
published: false
description: "A small browser game for the DEV June Solstice Game Jam: align a Turing-inspired solar cipher wheel before nightfall."
tags: devchallenge, gamechallenge, gamedev
cover_image: https://ooyxloo.github.io/solstice-cipher/cover.png
---

## What I Built

Solstice Cipher is a compact browser puzzle for the DEV June Solstice Game Jam. The player races the longest day by rotating a Turing-inspired ring of `SOL`, `XOR`, `LUX`, and `BIN` glyphs until each numbered node matches the target cipher before nightfall ends the run.

The build is meant to be judged quickly: open the game, press `Demo Solve`, watch all four phases complete, copy the stable proof `SC-4P-2907-62-Y5VFX1`, and verify it locally. It is a static HTML/CSS/JavaScript game with no backend, no API key, and no private data.

Links:

- Play: https://ooyxloo.github.io/solstice-cipher/
- Source: https://github.com/OOYXLOO/solstice-cipher
- Judge page: https://ooyxloo.github.io/solstice-cipher/judge.html
- Smoke test: https://ooyxloo.github.io/solstice-cipher/smoke.html
- Proof verifier: https://ooyxloo.github.io/solstice-cipher/proof-verifier.html

Core features:

- Four timed phases with a visible progress strip.
- Canvas-rendered glyphs, beams, progress ring, and particle feedback.
- Mouse, touch, node-button, demo-solve, and number-key controls.
- Score carry-over, streak bonuses, shift counting, and a local best score.
- Final screen with solved phase count, total shifts, score, and copyable `SC-4P-...` run proof.
- Proof verifier that recomputes the checksum locally and shows parsed phases, score, shifts, and checksum facts.
- Judge page and browser smoke test for a fast review path.

## Judge in 60 Seconds

1. Open the play link and press `Demo Solve` for the full loop and stable proof `SC-4P-2907-62-Y5VFX1`, or press `Start` to play manually.
2. Watch the current GIF preview.
3. Run `smoke.html` to see the game solve all four phases automatically.
4. Paste the sample proof into `proof-verifier.html` to confirm the checksum loop.

## Video Demo

The demo video shows the current four-phase interface, node controls, and final proof flow.

![Solstice Cipher gameplay](https://ooyxloo.github.io/solstice-cipher/desktop-check-v5.png)

Watch the current GIF preview: https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif

Public media links after GitHub Pages publication:

1. Cover: https://ooyxloo.github.io/solstice-cipher/cover.png
2. GIF demo: https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif
3. Desktop screenshot: https://ooyxloo.github.io/solstice-cipher/desktop-check-v5.png
4. Mobile screenshot: https://ooyxloo.github.io/solstice-cipher/mobile-check-v6.png
5. Completion screenshot: https://ooyxloo.github.io/solstice-cipher/desktop-complete-v4.png

## Code

The source is hosted at https://github.com/OOYXLOO/solstice-cipher after publication. The project is deliberately small:

- `index.html`: playable game shell and first-screen judge path.
- `styles.css`: responsive game UI.
- `game.js`: deterministic levels, canvas rendering, controls, scoring, proof generation, and Demo Solve.
- `proof-verifier.html`: local proof checksum verifier.
- `smoke.html`: browser smoke test that solves the public game path in an iframe.
- `judge.html`: one-page review hub.

## How to Play

Start the run, then match each numbered ring node to the target glyph above it before time runs out. Correct locks earn points, streaks reward clean phase solves, and exploratory shifts cost a little time. Clear all four phases to hold the longest day and reveal the final score.

Controls:

- Click or tap ring nodes to rotate them.
- Use the node-control buttons below the canvas.
- Press `Demo Solve` to watch all four phases complete automatically.
- Press number keys `1` through `9` to rotate matching node positions.
- Press `Enter` to start a fresh run.
- Press `Escape` to reset the board.

## How I Built It

I built Solstice Cipher as a no-backend canvas game so the public demo can run from GitHub Pages. The level data is deterministic: every phase has a target array, the player ring starts offset from that target, and every click/tap/key/button press rotates one node through the `SOL`, `XOR`, `LUX`, and `BIN` states.

The game awards points for locking nodes, keeps a shift counter, carries score through four named phases, and pauses timer drift during `Demo Solve` so judges get the same stable proof every time. Completed runs generate a checksum from:

```text
solstice|4|score|shifts|4
```

The verifier recomputes that checksum in the browser and displays the parsed proof facts. It is not anti-cheat infrastructure; it is a reproducible run checksum that makes the demo path inspectable.

## Prize Category

This submission is aimed at the Best Ode to Alan Turing category. It does not claim the Best Google AI Usage category.

The June solstice is the longest day in the northern hemisphere. I turned that into the game's pressure loop: daylight is the time resource, nightfall is the fail state, and the win condition is a clean final cipher before the longest day slips away.

For the Alan Turing angle, Solstice Cipher borrows the feeling of rotor alignment and target checking without pretending to simulate a historical machine. The mechanics are intentionally computational: deterministic state, target matching, rotor-like cycling, binary/XOR language, and local verification of the final proof. The glyph language mixes solstice imagery with code-breaking cues:

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

## Originality and Build Window

The package is a new static game build for this jam period, not a wrapper around a prior game template. The gameplay code, proof verifier, judge page, smoke test, screenshots, and demo media are included with the source package so reviewers can inspect what was built for the submission.

## Verification

I verified the package with:

- `node --check game.js`
- Desktop browser check: no horizontal overflow, visible four-step phase track, and nonblank gameplay screenshot.
- 390px mobile browser check: no horizontal overflow, visible wrapped phase track, and nonblank gameplay screenshot.
- `smoke.html`: 23 checks passed, including deterministic demo proof, released manual controls, judge shortcuts, shift counter, phase track, final status, and run proof.

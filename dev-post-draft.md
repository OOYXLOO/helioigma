# Solstice Cipher

Solstice Cipher is a small browser puzzle game about balancing daylight, nightfall, and code-breaking. Each round shows a target cipher above a Turing wheel of glyph nodes. Click, tap, or press number keys to rotate their phase before the timer reaches zero.

Fast judge path: play the live game, watch the short demo, run the smoke test, then verify a sample `SC-4P-...` proof in the proof verifier.

## How to Play

Start the run, then rotate each ring glyph until it matches the target cipher above it. Correct locks earn points. Exploratory shifts cost a sliver of time. Clear all four phases to hold the longest day and reveal the final score.

## Ode to Alan Turing

The game borrows the feeling of rotor alignment and cipher checking rather than simulating a historical machine. The glyph set mixes solstice language with code-breaking cues: `SOL` for daylight, `XOR` for logic, `LUX` for light, and `BIN` for binary state.

## What I Built

- A static HTML/CSS/JavaScript game.
- Canvas-rendered glyphs, beams, progress ring, and particle feedback.
- Mouse, touch, node-button, and number-key controls.
- Multiple timed phases with a visible progress strip and score carry-over.
- Time pressure, per-signal points, streak bonuses, small time penalties for exploratory shifts, and a final score state after four phases.
- Four named phases, shift counting, explicit node-control buttons for mobile play, a local best-score readout, a deterministic run proof code, and an end screen that summarizes the run for quick judging.
- No backend, API key, account integration, or private data.

## Demo Assets

- Cover image: `cover.png`
- Animated gameplay preview: `solstice-cipher-demo.gif`
- Demo video: `solstice-cipher-demo.mp4`
- WebM demo fallback: `solstice-cipher-demo.webm`
- Desktop screenshot: `desktop-check-v5.png`
- Mobile screenshot: `mobile-check-v6.png`
- Completion screenshot: `desktop-complete-v4.png`

The GIF was generated from local browser screenshots and converted into MP4/WebM demo video assets for the DEV post media requirement.

## Links

- Play: `https://ooyxloo.github.io/solstice-cipher/`
- Source: `https://github.com/OOYXLOO/solstice-cipher`
- Judge pack: `https://ooyxloo.github.io/solstice-cipher/judge.html`
- Smoke test: `https://ooyxloo.github.io/solstice-cipher/smoke.html`
- Final post console: `https://ooyxloo.github.io/solstice-cipher/dev-submit-console.html`

These links should only be included in the final DEV post after the public repository and GitHub Pages site are actually live.

Prize-category note: this is aimed at the Best Ode to Alan Turing category through code-breaking mechanics, rotor-like alignment, binary/XOR language, and the proof verifier. It does not claim the Best Google AI Usage category.

## Why It Fits The Theme

The June solstice is the longest day in the northern hemisphere. The game turns that into a tension loop: daylight gives the player time, nightfall ends the round, and the puzzle is solved by balancing solar and lunar glyph states.

## Rubric Fit

- Theme relevance: daylight is the timer, nightfall is the fail state, and the win condition is holding the longest day.
- Creativity: the solstice theme is expressed as a code-breaking wheel rather than a literal calendar demo.
- Technical execution: one static canvas game with keyboard/touch/node controls, scoring, proof generation, and a smoke test.
- Optional category: Best Ode to Alan Turing through rotor-like alignment, XOR/binary language, and proof verification.

## Technical Notes

The game uses a single canvas and deterministic level definitions. The target cipher and player ring are arrays of phase values. Matching all phase values advances the game and awards time-weighted score, with a streak bonus for consecutive solved phases. The final screen reports solved phases, local best score, total shifts, and a copyable run proof code so a judge can tell whether the run was a clean solve or a scrappy late save.

This is a new static game package for the jam period, not a wrapper around a prior game template. The gameplay code, proof verifier, judge page, smoke test, screenshots, and demo media are included with the source package for review.

## Next

- Add a public try link after user authorizes publishing.
- Use `dev-submit-console.html` for the final copy pass, media order, and no-go gate.
- Polish level balance after mobile playtesting.

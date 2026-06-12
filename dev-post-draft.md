# Solstice Cipher

Solstice Cipher is a small browser puzzle game about balancing daylight, nightfall, and code-breaking. Each round shows a target cipher above a Turing wheel of glyph nodes. Click, tap, or press number keys to rotate their phase before the timer reaches zero.

## How to Play

Start the run, then rotate each ring glyph until it matches the target cipher above it. Correct locks earn points. Exploratory shifts cost a sliver of time. Clear all four phases to hold the longest day and reveal the final score.

## Ode to Alan Turing

The game borrows the feeling of rotor alignment and cipher checking rather than simulating a historical machine. The glyph set mixes solstice language with code-breaking cues: `SOL` for daylight, `XOR` for logic, `LUX` for light, and `BIN` for binary state.

## What I Built

- A static HTML/CSS/JavaScript game.
- Canvas-rendered glyphs, beams, progress ring, and particle feedback.
- Mouse, touch, and number-key controls.
- Multiple timed phases with score carry-over.
- Time pressure, per-signal points, streak bonuses, small time penalties for exploratory shifts, and a final score state after four phases.
- Four named phases, shift counting, and an end screen that summarizes the run for quick judging.
- No backend, API key, account integration, or private data.

## Demo Assets

- Cover image: `cover.png`
- Animated gameplay preview: `solstice-cipher-demo.gif`
- Desktop screenshot: `desktop-check-v4.png`
- Mobile screenshot: `mobile-check-v5.png`
- Completion screenshot: `desktop-complete-v3.png`

The GIF was generated from local browser screenshots. If the final DEV post needs a hosted video instead of a GIF, this asset can guide a short screen recording after public hosting is authorized.

## Links

- Play: `https://ooyxloo.github.io/solstice-cipher/`
- Source: `https://github.com/OOYXLOO/solstice-cipher`

These links should only be included in the final DEV post after the public repository and GitHub Pages site are actually live.

## Why It Fits The Theme

The June solstice is the longest day in the northern hemisphere. The game turns that into a tension loop: daylight gives the player time, nightfall ends the round, and the puzzle is solved by balancing solar and lunar glyph states.

## Technical Notes

The game uses a single canvas and deterministic level definitions. The target cipher and player ring are arrays of phase values. Matching all phase values advances the game and awards time-weighted score, with a streak bonus for consecutive solved phases. The final screen reports solved phases and total shifts so a judge can tell whether the run was a clean solve or a scrappy late save.

## Next

- Add a public try link after user authorizes publishing.
- Convert the local GIF into a short hosted video if the final DEV post would benefit from video.
- Polish level balance after mobile playtesting.

# Helioigma Rubric Scorecard

Purpose: give a source-first DEV judge a compact, evidence-linked map from the June Solstice Game Jam rubric to the local package.

## Fast Verdict

Helioigma is a finished static browser game for the Best Ode to Alan Turing route: a four-phase daylight timer puzzle, a restrained Turing-inspired rotor/checksum mechanic, and a receipt-checkable path that runs without accounts, servers, APIs, or private data.

## Criteria Map

| Criterion | Helioigma answer | Evidence |
| --- | --- | --- |
| Theme relevance | The longest day is the core pressure loop: daylight is the timer, nightfall is the fail state, and the four-phase solve is framed as holding the solstice run. | `index.html`, `game.js`, `dev-article-final.md` |
| Creativity | Instead of a literal calendar/trivia treatment, the entry combines a solar rotor, XOR/binary glyphs, short timer pressure, tactile node pulses, Rotor Trace, Nightfall recovery, Demo Solve, and a checksum receipt. | `index.html`, `judge.html`, `proof-verifier.html` |
| Technical execution | The build is a self-contained static canvas game with mouse, touch, keyboard, on-screen node controls, pre-start first-move preview, first-action grace, phase-specific hint order, default-off audio, deterministic demo route, local verifier, and 71-check browser smoke. | `game.js`, `smoke.html`, `tools/browser-smoke-check.mjs` |
| Writing quality | The judge path is explicit: README, DEV article, judge page, verification page, manifest, screenshots, and media all point to the same short review flow. | `README.md`, `dev-article-final.md`, `judge.html`, `verification.html` |
| Best Ode to Alan Turing | The tribute lives in mechanics rather than biography: first-screen Turing cues, state alignment, target checking, XOR/binary language, timed pressure, and machine-checkable receipt reasoning. | `JUDGE_REVIEW_CARD.md`, `CHALLENGE_COMPLIANCE.md`, `judge-manifest.json` |

## 60-Second Evidence Path

1. Open the game and play one phase: `index.html`.
2. Run `Demo Solve` or open `?demo=1`.
3. Confirm receipt `SC-4P-2907-62-Y5VFX1`.
4. Open `proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1`.
5. Optional: run `smoke.html` or `npm run smoke`.

## Boundary

- No Google AI category claim.
- No backend, telemetry, account login, API key, private data, payout data, tax/KYC data, or hidden judge dashboard.
- The receipt is transparent review evidence, not anti-cheat, identity, payout, or eligibility proof.

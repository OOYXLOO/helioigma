# Helioigma Verification Report

Generated for the local DEV June Solstice Game Jam package on 2026-06-14.

This report records the public-package checks that can be repeated after `OOYXLOO/helioigma` is published. It does not use account data, private user data, API keys, payout data, tax data, or KYC data.

## Public Package Status

- Source commit: the exact public HEAD should be read from GitHub after publication; this report was refreshed from the current local package on 2026-06-14.
- Publication gate: run `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public` after Pages is enabled.
- DEV submission gate: do not submit until the public preflight passes.
- Intended play URL after publication: `https://ooyxloo.github.io/helioigma/`
- Intended source URL after publication: `https://github.com/OOYXLOO/helioigma`
- Official DEV tags prepared in the article draft: `devchallenge`, `gamechallenge`, `gamedev`

## Verified Assets

- `index.html`: playable static game
- `judge.html`: judge quick path with a 60-second review path
- `smoke.html`: browser smoke test
- `dev-submit-console.html`: copy-ready DEV publishing console
- `dev-article-final.md`: DEV article draft with official tags
- `cover.png`: 1200x630 cover image
- `helioigma-demo.webm`: current captioned video demo recorded from a live local browser session, including the phase banner and completed-run ledger
- `helioigma-demo.gif`: current animated GIF preview ending on the receipt ledger and Judge run summary
- `helioigma-demo.mp4`: optional legacy MP4 asset
- `desktop-check-v5.png`: desktop gameplay screenshot
- `mobile-check-v6.png`: mobile gameplay screenshot
- `desktop-complete-v4.png`: completion screenshot with final receipt, phase scoring ledger, and Judge run summary

## Local Verification Commands

```powershell
node --check game.js
```

Expected result: exit code `0`.

```powershell
python -m http.server 8781 --bind 127.0.0.1
```

Expected local URLs:

- `http://127.0.0.1:8781/`: HTTP 200
- `http://127.0.0.1:8781/?demo=1`: HTTP 200 and starts the deterministic Demo Solve route
- `http://127.0.0.1:8781/judge.html`: HTTP 200
- `http://127.0.0.1:8781/smoke.html`: HTTP 200
- `http://127.0.0.1:8781/dev-submit-console.html`: HTTP 200
- `http://127.0.0.1:8781/dev-article-final.md`: HTTP 200
- `http://127.0.0.1:8781/helioigma-demo.webm`: HTTP 200
- `http://127.0.0.1:8781/helioigma-demo.gif`: HTTP 200

## Browser Checks

- Desktop 1280x900: no horizontal overflow; phase progress strip and canvas are visible.
- Mobile 390x844: no horizontal overflow; phase progress strip stays compact and the canvas begins in the first viewport.
- Browser smoke runner: `PASS browser smoke` with Playwright launched from the existing external dependency root.
- Demo video builder: `tools/build-demo-video.mjs` records the real browser judge path, from first-screen controls and phase banner / Rotor Trace through verifier validation.
- Demo Solve receipt: `PASS - SC-4P-2907-62-Y5VFX1`
- Keyboard smoke: `PASS - Longest day held. Latest live-timer score 2892 across 62 shifts.`
- Auto-demo URL `?demo=1` reaches the same stable receipt.
- Keyboard smoke receipt format: `SC-4P-score-shifts-checksum`
- Score variance is expected: `smoke.html` drives the public keyboard-control path with live timing and currently reports 2892, while `Demo Solve` pauses timer drift for judges and produces the deterministic 2907-point receipt above.
- Browser CI accepts any positive manual smoke score with the expected 62 shifts because manual play keeps live timer timing; the stable judge receipt is the deterministic Demo Solve receipt above.
- `proof-verifier.html` recomputes the receipt checksum locally, accepts `?receipt=` deep links from completed runs, and shows parsed receipt facts for phases, score, shifts, and expected checksum.
- The first-screen judge shortcuts and judge pack expose the stable sample verifier link `proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1` so judges can inspect the checksum path without manual copying.
- The playable page exposes a four-step phase progress strip, first-screen phase objective strip, phase announcer, phase scoring ledger, Judge run summary, judge shortcut links, Hint, Rotor Trace, Demo Solve, optional `?demo=1` auto demo, and node-control buttons below the canvas for fast judging and mobile play.
- Smoke checks include 56 PASS assertions:
  - canvas present
  - start button present
  - reset button present
  - hint button present
  - demo solve button present
  - daylight meter present
  - start shortcut exposed
  - reset shortcut exposed
  - hint shortcut exposed
  - demo shortcut exposed
  - number-key node shortcuts exposed
  - phase objective strip present
  - phase objective names the first phase
  - phase objective shows target glyphs and alignment
  - first-screen judge path present
  - first-phase node buttons present
  - judge shortcut links include the auto demo route
  - status line present
  - best score label present
  - shift counter present
  - four-phase progress track present
  - phase announcer is present
  - rotor trace panel present
  - rotor trace reports the first phase
  - run receipt panel present
  - run receipt summary present
  - phase scoring ledger present
  - run receipt verifier link present
  - Judge run summary present
  - award signals present
  - copy judge summary button present
  - stable demo receipt matches `SC-4P-2907-62-Y5VFX1`
  - demo receipt summary reports score and shifts
  - demo receipt includes four phase ledger entries
  - demo receipt verifier link carries the receipt
  - demo Judge run summary reports phases and score
  - demo Judge run facts include receipt and Turing fit
  - demo award signals name solstice, Turing, and judge proof
  - copy judge summary button is enabled
  - demo solve releases manual controls
  - reset shortcut returns to idle
  - start button shows the first-move coach
  - phase announcer names the active phase
  - hint shortcut names the next mismatched node
  - hint highlights a node button
  - rotor trace records hint action
  - rotor trace names the next mismatch
  - four phases reach final state
  - final score is positive
  - local best score records the completed run
  - shift counter records the completed run
  - final status reports shift count
  - run receipt is visible
  - completion preserves four phase ledger entries
  - run receipt encodes phases, score, shifts, and checksum
  - completion verifier link carries the final receipt

## Rubric Snapshot

- Theme relevance: daylight is the timer, nightfall is the fail state, and the final receipt marks a completed longest-day run.
- Creativity: the solstice prompt becomes a rotor puzzle with a visible state trace rather than a static calendar or trivia screen.
- Technical execution: the package is a static canvas game with keyboard/touch controls, stable demo route, checksum receipt, smoke test, and Pages-ready CI.
- Writing quality: the DEV article, README, judge page, manifest, screenshots, and media give a short review path with clear boundaries.
- Turing category: rotor-like alignment, target checking, XOR/binary language, and local verification carry the ode through mechanics.

## GitHub Actions Preflight

After the public repository exists, `.github/workflows/verify.yml` should pass. It checks:

- JavaScript syntax with `node --check game.js`
- required public package files
- official DEV challenge tags
- current WebM video and GIF fallback references
- intended public play URL
- judge page current WebM/GIF links and 60-second review path
- smoke receipt pattern
- receipt verifier page and stable demo checksum copy
- receipt verifier parsed receipt facts
- browser smoke script that opens the real pages, checks the WebM video response, checks receipt-verifier query prefill, and waits for 56 PASS checks
- reproducible WebM demo builder and WebM media link

## Human Gates

These are intentionally not automated:

- Create or approve public GitHub repository `OOYXLOO/helioigma`.
- Enable GitHub Pages from `main` root.
- Publish the DEV article with the user account.
- Handle any prize claim, payout, tax, or KYC workflow if selected.

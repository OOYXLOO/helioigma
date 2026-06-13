# Solstice Cipher Verification Report

Generated for the local DEV June Solstice Game Jam package on 2026-06-13.

This report records the public-package checks that can be repeated after `OOYXLOO/solstice-cipher` is published. It does not use account data, private user data, API keys, payout data, tax data, or KYC data.

## Public Package Status

- Local repository HEAD: current local commit after this report is committed
- Publication status: not public yet
- DEV submission status: not submitted yet
- Intended play URL after publication: `https://ooyxloo.github.io/solstice-cipher/`
- Intended source URL after publication: `https://github.com/OOYXLOO/solstice-cipher`
- Official DEV tags prepared in the article draft: `devchallenge`, `gamechallenge`, `gamedev`

## Verified Assets

- `index.html`: playable static game
- `judge.html`: judge quick path
- `smoke.html`: browser smoke test
- `dev-submit-console.html`: copy-ready DEV publishing console
- `dev-article-final.md`: DEV article draft with official tags
- `cover.png`: 1200x630 cover image
- `solstice-cipher-demo.gif`: current animated GIF preview
- `solstice-cipher-demo.mp4`: optional legacy MP4 asset
- `solstice-cipher-demo.webm`: optional legacy WebM asset
- `desktop-check-v5.png`: desktop gameplay screenshot
- `mobile-check-v6.png`: mobile gameplay screenshot
- `desktop-complete-v4.png`: completion screenshot

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
- `http://127.0.0.1:8781/judge.html`: HTTP 200
- `http://127.0.0.1:8781/smoke.html`: HTTP 200
- `http://127.0.0.1:8781/dev-submit-console.html`: HTTP 200
- `http://127.0.0.1:8781/dev-article-final.md`: HTTP 200
- `http://127.0.0.1:8781/solstice-cipher-demo.gif`: HTTP 200

## Browser Checks

- Desktop 1280x900: no horizontal overflow; phase progress strip and canvas are visible.
- Mobile 390x844: no horizontal overflow; phase progress strip wraps cleanly and canvas is visible.
- `smoke.html` result: `PASS - Longest day held. Final score 2893 across 62 shifts.`
- Stable Demo Solve proof: `SC-4P-2907-62-Y5VFX1`
- Keyboard smoke proof format: `SC-4P-score-shifts-checksum`
- Browser CI accepts any positive manual smoke score with the expected 62 shifts because manual play keeps live timer timing; the stable judge receipt is the deterministic Demo Solve proof above.
- `proof-verifier.html` recomputes the proof checksum locally and shows parsed proof facts for phases, score, shifts, and expected checksum.
- The playable page exposes a four-step phase progress strip, judge shortcut links, Demo Solve, and node-control buttons below the canvas for fast judging and mobile play.
- Smoke checks include 23 PASS assertions:
  - canvas present
  - start button present
  - reset button present
  - demo solve button present
  - first-phase node buttons present
  - judge shortcut links present
  - status line present
  - best score label present
  - shift counter present
  - four-phase progress track present
  - run proof panel and summary present
  - stable demo proof matches `SC-4P-2907-62-Y5VFX1`
  - demo proof summary reports score and shifts
  - demo solve releases manual controls
  - run starts through public button
  - four phases reach final state
  - final score is positive
  - local best score records the completed run
  - shift counter records the completed run
  - final status reports shift count
  - run proof is visible
  - run proof matches `SC-4P-...`

## GitHub Actions Preflight

After the public repository exists, `.github/workflows/verify.yml` should pass. It checks:

- JavaScript syntax with `node --check game.js`
- required public package files
- official DEV challenge tags
- current GIF demo reference
- intended public play URL
- judge page current GIF link
- smoke proof pattern
- proof verifier page and stable demo checksum copy
- proof verifier parsed proof facts
- browser smoke script that opens the real pages and waits for 23 PASS checks

## Human Gates

These are intentionally not automated:

- Create or approve public GitHub repository `OOYXLOO/solstice-cipher`.
- Enable GitHub Pages from `main` root.
- Publish the DEV article with the user account.
- Handle any prize claim, payout, tax, or KYC workflow if selected.

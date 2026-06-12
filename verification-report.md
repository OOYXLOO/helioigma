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
- `solstice-cipher-demo.mp4`: MP4 demo video
- `solstice-cipher-demo.webm`: WebM demo video fallback
- `solstice-cipher-demo.gif`: animated GIF fallback
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
- `http://127.0.0.1:8781/solstice-cipher-demo.mp4`: HTTP 200
- `http://127.0.0.1:8781/solstice-cipher-demo.webm`: HTTP 200

## Browser Checks

- Desktop 1280x900: no horizontal overflow and no page console errors.
- Mobile 390x844: no horizontal overflow and no page console errors.
- `smoke.html` result: `PASS - Longest day held. Final score 2893 across 62 shifts.`
- Sample smoke proof: `SC-4P-2893-62-1I4Y0G`
- `proof-verifier.html` recomputes the proof checksum locally.
- The playable page exposes node-control buttons below the canvas for mobile and accessibility-friendly play.
- Smoke checks include:
  - canvas present
  - start button present
  - first-phase node buttons present
  - run starts through public button
  - four phases reach final state
  - final score is positive
  - local best score records the completed run
  - final status reports shift count
  - run proof is visible
  - run proof matches `SC-4P-...`

## GitHub Actions Preflight

After the public repository exists, `.github/workflows/verify.yml` should pass. It checks:

- JavaScript syntax with `node --check game.js`
- required public package files
- official DEV challenge tags
- MP4 demo reference
- intended public play URL
- judge page demo-video link
- smoke proof pattern
- proof verifier page and sample checksum copy

## Human Gates

These are intentionally not automated:

- Create or approve public GitHub repository `OOYXLOO/solstice-cipher`.
- Enable GitHub Pages from `main` root.
- Publish the DEV article with the user account.
- Handle any prize claim, payout, tax, or KYC workflow if selected.

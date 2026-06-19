# Helioigma Launch Now

Shortest safe path for the account owner to turn the verified public package into a DEV June Solstice Game Jam entry.

## Current Status - 2026-06-19

The old GitHub repo / Pages gate is complete.

- Repo: `https://github.com/OOYXLOO/helioigma`
- Pages: `https://ooyxloo.github.io/helioigma/`
- Judge: `https://ooyxloo.github.io/helioigma/judge.html`
- Receipt verifier: `https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1`
- Main HEAD: `215624e7739e5dce5d9e549e213f061fd70de270`
- Public link recheck: repo, Pages, judge, verifier, manifest, cover, GIF, WebM, desktop image, and mobile image returned HTTP 200.
- Launch audit: `npm run audit:launch:public -- --json` returned `READY_LOCALLY`.

Current blocker: user-present DEV publication. Do not redo repository creation or Pages setup unless public links fail again.

## Why This Matters

- Prize route: five USD 200 winners in the DEV June Solstice Game Jam.
- Deadline: 2026-06-21 23:59 PDT.
- Local package state: ready for the public launch gate.
- Current blocker: the account owner must confirm the logged-in DEV challenge flow still accepts a June Solstice Game Jam entry and then publish the article.

## Human Gate

Only do these steps when the account owner is present and intentionally approving public launch. Do not handle passwords, OTPs, cookies, payout, tax, KYC, bank/card data, private email, API keys, billing, or CAPTCHA/human-verification data in this project.

## 10-Minute DEV Publish Path

1. Open the DEV challenge page:
   - `https://dev.to/challenges/june-game-jam-2026-06-03`

2. Confirm the logged-in page still accepts a June Solstice Game Jam entry.

3. Use these fields:
   - Title: `Helioigma: a Turing-wheel puzzle for holding the longest day`
   - Description: `A DEV June Solstice game: race a solar cipher wheel, trace its rotor state, and inspect the stable Demo Solve run summary.`
   - Tags: `devchallenge`, `gamechallenge`, `gamedev`, `javascript`
   - Cover image: `https://ooyxloo.github.io/helioigma/cover.png?v=20260615-fresh-media`
   - Body source: `dev-article-final.md`
   - Category target: Best Ode to Alan Turing

4. Do not claim Best Google AI Usage.

5. If DEV asks for password, OTP, CAPTCHA, account verification, billing, payout, tax/KYC, or private data, the account owner handles it directly.

## Optional Public Recheck

```powershell
npm run audit:launch:public -- --json
```

`public-preflight.ps1 -Public` can fail in the migrated junction directory because Git reports `dubious ownership`; do not treat that as a public-link failure. Prefer the Node launch audit plus direct HTTP checks.

## Optional GitHub CLI Path

Only when the account owner is present and GitHub CLI is already authenticated:

```powershell
gh repo create OOYXLOO/helioigma --public --description "Helioigma: a Turing-wheel puzzle for the DEV June Solstice Game Jam" --homepage "https://ooyxloo.github.io/helioigma/"
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages -WaitForPages
```

If Pages configuration fails, use the manual Pages setting in step 4.

## Links That Must Work Before DEV

- Play: `https://ooyxloo.github.io/helioigma/`
- Auto demo: `https://ooyxloo.github.io/helioigma/?demo=1`
- Judge page: `https://ooyxloo.github.io/helioigma/judge.html`
- Smoke test: `https://ooyxloo.github.io/helioigma/smoke.html`
- Receipt verifier: `https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1`
- Source: `https://github.com/OOYXLOO/helioigma`

## Stop Conditions

Stop before DEV publication if any public link returns 404, `audit:launch:public` reports `WAIT_USER_GATE`, or DEV no longer accepts the June Solstice Game Jam entry.

## Record After Publish

Write the DEV article URL, public repository URL, Pages URL, public preflight timestamp, and any challenge confirmation or error text into the money-goal notes.

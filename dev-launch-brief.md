# Helioigma DEV Launch Brief

Use this brief only after the public GitHub repository and GitHub Pages URL exist. It condenses the final publish sequence so the account owner can move through DEV quickly without dropping a required link.

## Public URLs To Confirm

- Play: `https://ooyxloo.github.io/helioigma/`
- Auto demo: `https://ooyxloo.github.io/helioigma/?demo=1`
- Source: `https://github.com/OOYXLOO/helioigma`
- Judge page: `https://ooyxloo.github.io/helioigma/judge.html`
- Smoke test: `https://ooyxloo.github.io/helioigma/smoke.html`
- Sample receipt verifier: `https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1`
- Judge manifest: `https://ooyxloo.github.io/helioigma/judge-manifest.json`
- Rubric scorecard: `https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md`
- Verification report: `https://ooyxloo.github.io/helioigma/verification.html`
- Source review card: `https://github.com/OOYXLOO/helioigma/blob/main/JUDGE_REVIEW_CARD.md`
- Source rubric scorecard: `https://github.com/OOYXLOO/helioigma/blob/main/RUBRIC_SCORECARD.md`

## DEV Article Fields

- Title: `Helioigma: a Turing-wheel puzzle for holding the longest day`
- Description: `A small browser game for the DEV June Solstice Game Jam: decode a Turing-inspired solar rotor before nightfall.`
- Tags: `devchallenge`, `gamechallenge`, `gamedev`, `javascript`
- Cover image: `https://ooyxloo.github.io/helioigma/cover.png`
- Body source: `dev-article-final.md`
- Primary video asset: `https://ooyxloo.github.io/helioigma/helioigma-demo.webm`
- MP4 fallback: `https://ooyxloo.github.io/helioigma/helioigma-demo.mp4`
- Inline GIF fallback: `https://ooyxloo.github.io/helioigma/helioigma-demo.gif`

## Judge Hook To Preserve

Keep this exact meaning in the public post:

```text
Helioigma is a playable ode, a judge-verifiable loop, and a finished static package. The Turing fit lives in rotor state and checksum reasoning; the solstice fit lives in daylight pressure; and the review path lets a judge inspect the same public game loop through Auto Demo, Rotor Trace, receipt verifier, manifest, and optional smoke test.
```

## Final Local Commands

Run these before publishing the DEV article:

```powershell
npm ci
node --check game.js
powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1
node tools/browser-smoke-check.mjs
powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public
```

Expected local proof signals:

- `PASS Helioigma preflight`
- `PASS browser smoke`
- `69 PASS` inside `smoke.html`
- Stable receipt: `SC-4P-2907-62-Y5VFX1`
- Public play, auto demo, judge, smoke, verifier, manifest, media, and source URLs return HTTP 200.
- `JUDGE_REVIEW_CARD.md` is present in the public source and preserves the 60-second review path.
- `RUBRIC_SCORECARD.md` is present in the public source and preserves the criteria map.

## DEV No-Go Gate

Do not publish the DEV article if any item is true:

- The GitHub Pages play URL returns 404 or redirects to another project.
- The source URL is not `https://github.com/OOYXLOO/helioigma`.
- `public-preflight.ps1 -Public` fails.
- `smoke.html` does not reach the expected 69 PASS checks.
- `Demo Solve` does not reach receipt `SC-4P-2907-62-Y5VFX1`.
- The post omits the play link, source link, GIF/WebM media, or judge manifest.
- The post omits the public rubric scorecard link when the judge links are listed.
- The post claims Best Google AI Usage, backend AI/API usage, external account data, private user data, or anti-cheat identity proof.
- The post asks for spam, bought reactions, fake engagement, or pressure-based reactions.
- Any password, OTP, API key, payment detail, bank data, tax/KYC data, cookie, localStorage, or private email content is present.

## Post-Publish Receipt

After publication, record these in `D:\hks\hks-yxl\money-goal-notes\06-prep-dev-solstice-cipher.md`:

- DEV article URL.
- GitHub repository URL.
- GitHub Pages play URL.
- Public preflight timestamp and result.
- Any official challenge confirmation or error message.

## Honest Share Note

After the DEV post is public, share only a clean request for real play and feedback:

```text
I published Helioigma for the DEV June Solstice Game Jam: a small Turing-wheel puzzle where the longest day becomes a countdown machine. If you enjoy browser puzzle games, I would appreciate a real play-through and honest feedback.
```

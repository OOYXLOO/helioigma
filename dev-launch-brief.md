# Helioigma DEV Launch Brief

Use this brief only after the public GitHub repository and GitHub Pages URL exist. It condenses the final publish sequence so the account owner can move through DEV quickly without dropping a required link.

## Public URLs To Confirm

- DEV challenge entry path: `https://dev.to/challenges/june-game-jam-2026-06-03`
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
- Description: `A DEV June Solstice game: race a solar cipher wheel, trace its rotor state, and verify the solved run with a local checksum receipt.`
- Tags: `devchallenge`, `gamechallenge`, `gamedev`, `javascript`
- Cover image: `https://ooyxloo.github.io/helioigma/cover.png?v=20260614-seal-media`
- Body source: `dev-article-final.md`
- Primary video asset: `https://ooyxloo.github.io/helioigma/helioigma-demo.webm?v=20260614-seal-media`
- MP4 fallback: `https://ooyxloo.github.io/helioigma/helioigma-demo.mp4`
- Inline GIF fallback: `https://ooyxloo.github.io/helioigma/helioigma-demo.gif?v=20260614-seal-media`

## Judge Hook To Preserve

First-minute check for rushed judges:

```text
Rotate one node, watch Rotor Trace explain the state change, press Demo Solve, then verify receipt SC-4P-2907-62-Y5VFX1.
```

Keep this exact meaning in the public post:

```text
Helioigma is a playable ode, a judge-verifiable loop, and a finished static package. The Turing fit lives in rotor state and checksum reasoning; the solstice fit lives in daylight pressure; and the review path lets a judge inspect the published Demo Solve summary through Auto Demo, Rotor Trace, receipt verifier, manifest, and optional smoke test.
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

Expected local review signals:

- `PASS Helioigma preflight`
- `PASS browser smoke`
- `69 PASS` inside `smoke.html`
- Stable receipt: `SC-4P-2907-62-Y5VFX1`
- Public play, auto demo, judge, smoke, verifier, manifest, media, and source URLs return HTTP 200.
- `JUDGE_REVIEW_CARD.md` is present in the public source and preserves the 60-second review path.
- `RUBRIC_SCORECARD.md` is present in the public source and preserves the criteria map.

## DEV No-Go Gate

Do not publish the DEV article if any item is true:

- The logged-in DEV challenge flow does not accept a June Solstice Game Jam entry.
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

After publication, record these in the local Helioigma route note:

- DEV article URL.
- GitHub repository URL.
- GitHub Pages play URL.
- Public preflight timestamp and result.
- Any official challenge confirmation or error message.

## Ethical Visibility Plan

The official challenge page says positive reactions on the DEV post may be used as a tie-breaker, so post-launch visibility matters. Keep it clean: ask for real play-throughs and feedback from people who would plausibly enjoy a small browser puzzle, not generic likes.

Suggested places after the DEV post is live:

- DEV comment/share note on the published article, only if it adds context or a playable tip.
- Personal GitHub profile / repository README link, after Pages is live.
- A small, relevant developer or game-dev chat where browser puzzle feedback is welcome.
- One follow-up note if a real bug or improvement is fixed after publication.

Do not do any of these:

- Buy reactions, ask for fake engagement, or pressure friends/coworkers.
- Cross-post into unrelated channels.
- Claim prize status, finalist status, judging preference, or official endorsement.
- Re-share before the public play link, source link, and receipt verifier are live.

## Honest Share Note

After the DEV post is public, share only a clean request for real play and feedback:

```text
I published Helioigma for the DEV June Solstice Game Jam: a small Turing-wheel puzzle where the longest day becomes a countdown machine. If you enjoy browser puzzle games, I would appreciate a real play-through and honest feedback.
```

Short variant:

```text
Helioigma is live for the DEV June Solstice Game Jam. It is a tiny browser puzzle about holding daylight with a Turing-inspired rotor. Real play-throughs and critique are welcome.
```

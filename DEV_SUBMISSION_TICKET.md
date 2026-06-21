# Helioigma DEV Submission Ticket

Use this one-page ticket only after the account owner is present. It is the final handoff for turning the verified local package into a DEV June Solstice Game Jam submission without losing a required field or overstating evidence.

If the public GitHub repository and Pages site are not live yet, start with `LAUNCH_NOW.md` before opening the DEV editor.

## Public Gate Before DEV

Do not publish the DEV article until all of these are true:

- Public repo exists: `https://github.com/OOYXLOO/helioigma`
- GitHub Pages play link returns HTTP 200: `https://ooyxloo.github.io/helioigma/`
- Every public article link below has been opened or checked after Pages returned HTTP 200; do not paste the final DEV body while any intended public link still returns 404.
- `npm run audit:launch:public -- --json` reports public URLs ready, not `WAIT_USER_GATE`.
- The logged-in DEV challenge flow still accepts a June Solstice Game Jam entry.
- Final DEV editor publish switch is intentional: keep local source as `published: false`; set or confirm live publication only inside the DEV editor after all public checks pass.

2026-06-19 note: `public-preflight.ps1 -Public` may fail in the migrated junction directory because Git reports `dubious ownership`. That is a local Git ownership issue, not a public-link failure. Prefer the Node launch audit plus direct HTTP checks unless Git safe.directory has been handled.

## DEV Fields

- Title: `Helioigma: a Turing-wheel puzzle for holding the longest day`
- Description: `A DEV June Solstice game: race a solar cipher wheel, trace its rotor state, and inspect the stable Demo Solve run summary.`
- Tags: `devchallenge`, `gamechallenge`, `gamedev`, `javascript`
- Cover image: `https://ooyxloo.github.io/helioigma/cover.png?v=20260615-fresh-media`
- Body source: `dev-article-final.md`
- Source embed: `{% embed https://github.com/OOYXLOO/helioigma %}`
- Plain source URL: `https://github.com/OOYXLOO/helioigma`

Keep `published: false` in `dev-article-final.md` during every local and public preflight. Do not paste or publish the final body until public links return HTTP 200. Flip to `published: true` only inside the final DEV publish action if the editor requires it.

## Links That Must Work

- Play: `https://ooyxloo.github.io/helioigma/`
- Auto demo: `https://ooyxloo.github.io/helioigma/?demo=1`
- Judge page: `https://ooyxloo.github.io/helioigma/judge.html`
- Smoke test: `https://ooyxloo.github.io/helioigma/smoke.html`
- Sample receipt verifier: `https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1`
- Judge manifest: `https://ooyxloo.github.io/helioigma/judge-manifest.json`
- Rubric scorecard: `https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md`
- WebM demo: `https://ooyxloo.github.io/helioigma/helioigma-demo.webm?v=20260615-fresh-media`
- GIF fallback: `https://ooyxloo.github.io/helioigma/helioigma-demo.gif?v=20260615-fresh-media`

## First-Minute Judge Hook

Preserve this meaning in the final post:

```text
Press Start Run, tap node 1 three times until it reads SOL, watch Rotor Trace explain the state change, press Demo Solve, then verify receipt SC-4P-2907-62-Y5VFX1.
```

## Do Not Claim

- Do not claim winner, finalist, financial account, tax, identity verification, bank, eligibility, or official endorsement status.
- Do not claim Best Google AI Usage.
- Do not claim backend AI, cloud, account automation, private user data, anti-cheat identity proof, or payment setup.
- Do not include passwords, OTPs, API keys, cookies, localStorage, private email content, bank data, tax data, KYC data, or payment card data.
- Do not ask for fake engagement, bought reactions, spam, or pressure-based likes.

## Post-Publish Receipt

After the DEV post is public, record these in the local project note for Helioigma:

- DEV article URL.
- Public repo URL.
- GitHub Pages play URL.
- Public preflight timestamp and result.
- Any DEV challenge confirmation or error text.
- Any honest share action taken after publication.

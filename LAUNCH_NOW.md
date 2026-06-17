# Helioigma Launch Now

Shortest safe path for the account owner to turn this verified local package into a DEV June Solstice Game Jam entry.

## Why This Matters

- Prize route: five USD 200 winners in the DEV June Solstice Game Jam.
- Deadline: 2026-06-21 23:59 PDT.
- Local package state: ready for the public launch gate.
- Current blocker: the public GitHub repository and GitHub Pages site do not exist yet.

## Human Gate

Only do these steps when the account owner is present and intentionally approving public launch. Do not handle passwords, OTPs, cookies, payout, tax, KYC, bank/card data, private email, API keys, billing, or CAPTCHA/human-verification data in this project.

## 15-Minute Launch Path

1. Create an empty public GitHub repository:
   - URL: `https://github.com/new?owner=OOYXLOO&name=helioigma&visibility=public`
   - Owner: `OOYXLOO`
   - Repository: `helioigma`
   - Visibility: public
   - Leave README, license, and gitignore unchecked.

2. From this repository root, run the dry run:

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1
```

3. If the dry run reports local readiness, push:

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push
```

4. Enable GitHub Pages from the repository settings:
   - Source: `main`
   - Folder: `/` root

5. Verify the public launch:

```powershell
powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public
npm run audit:launch:public -- --json
```

6. Publish the DEV article only after public links pass:
   - Body source: `dev-article-final.md`
   - Keep local source as `published: false` until the final DEV editor action.
   - Confirm the logged-in DEV challenge flow still accepts the entry.

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

Stop before DEV publication if any public link returns 404, `public-preflight.ps1 -Public` fails, `audit:launch:public` reports `WAIT_USER_GATE`, or DEV no longer accepts the June Solstice Game Jam entry.

## Record After Publish

Write the DEV article URL, public repository URL, Pages URL, public preflight timestamp, and any challenge confirmation or error text into the money-goal notes.

# Helioigma Publishing Gate

Purpose: make the DEV June Solstice Game Jam package publishable with minimal human work while keeping account, payout, tax, and identity gates under the account owner's control.

## Current State

- Local game package is complete and verified.
- Local Git repository can be pushed after a public GitHub repository exists.
- Public repository, GitHub Pages, and DEV submission are account-owner launch gates; confirm them with `public-preflight.ps1 -Public` after they exist.
- No payout, tax, KYC, bank, API key, password, OTP, or private account data belongs in this package.

## Recommended Public Repository

- Owner: `OOYXLOO`
- Repository name: `helioigma`
- Visibility: public
- Pages source: `main` branch, root folder
- Public try link after Pages is enabled: `https://ooyxloo.github.io/helioigma/`

## One-Minute Human Gate

The account owner should create the public GitHub repository, or approve Codex to do so through an already logged-in browser/CLI session:

1. Open https://github.com/new?owner=OOYXLOO&name=helioigma&visibility=public
2. Repository owner: `OOYXLOO`
3. Repository name: `helioigma`
4. Visibility: public
5. Do not initialize with README, license, or `.gitignore`; this prepared package already includes the tracked README, MIT `LICENSE`, and `.gitignore`
6. Create repository

Optional GitHub CLI path, only when the account owner is present and `gh` is already authenticated:

```powershell
gh repo create OOYXLOO/helioigma --public --description "Helioigma: a Turing-wheel puzzle for the DEV June Solstice Game Jam" --homepage "https://ooyxloo.github.io/helioigma/"
```

Do not add `--add-readme`, `--license`, or `--gitignore`; this repository needs to start empty so the prepared local `main` branch can push cleanly.

After that, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push
```

The helper runs `public-preflight.ps1`, the JSON launch audit, and `npm run smoke` before any push. It should print `Launch audit status: READY_LOCALLY` and `PASS browser smoke`; if it prints any other status, fix the local package before creating public judge traffic.

Optional Pages API helper, only when the account owner is present and GitHub CLI is already authenticated:

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages
```

To also wait for GitHub Pages and run the public preflight in the same launch flow:

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push -ConfigurePages -WaitForPages
```

The helper tries `gh api --method POST repos/OOYXLOO/helioigma/pages -f "source[branch]=main" -f "source[path]=/"`, then falls back to the update endpoint if Pages already exists. If GitHub CLI is unavailable or the API call fails, enable GitHub Pages manually from `main` / root. In the repository settings page, use Settings -> Pages -> Build and deployment -> Deploy from a branch -> `main` -> `/root`.
After the push, the `Verify Helioigma` workflow should pass before the DEV article is published.

## DEV Post Gate

Do not submit on DEV until the public try link works and the logged-in DEV challenge flow still accepts a June Solstice Game Jam entry. The public challenge page may show a confusing status label, so the account owner should verify the actual submission path immediately before publishing the article.

Use:

- Final DEV article: `dev-article-final.md`
- Launch brief: `dev-launch-brief.md`
- Judge review card: `JUDGE_REVIEW_CARD.md`
- Push helper: `publish-after-repo.ps1`
- Cover image after Pages is live: `https://ooyxloo.github.io/helioigma/cover.png`
- Current GIF demo after Pages is live: `https://ooyxloo.github.io/helioigma/helioigma-demo.gif`
- The WebM is the canonical captioned browser-recorded demo video, the GIF is the inline fallback preview, and the MP4 is an optional legacy fallback only if DEV specifically asks for MP4.
- Judge pack: `https://ooyxloo.github.io/helioigma/judge.html`
- Judge manifest: `https://ooyxloo.github.io/helioigma/judge-manifest.json`
- Rubric scorecard: `https://ooyxloo.github.io/helioigma/RUBRIC_SCORECARD.md`
- Smoke test: `https://ooyxloo.github.io/helioigma/smoke.html`
- Receipt verifier: `https://ooyxloo.github.io/helioigma/proof-verifier.html`
- Try link: `https://ooyxloo.github.io/helioigma/`
- Auto demo link: `https://ooyxloo.github.io/helioigma/?demo=1`
- Source link: `https://github.com/OOYXLOO/helioigma`
- Post-publish sharing: use the honest share note in `dev-launch-brief.md` after the DEV URL exists. Ask for real feedback from people who try the game. Do not spam, buy reactions, pressure people, or ask for fake engagement.

The account owner handles DEV login, final post, prize claim, payout, tax, and KYC directly.

## Final Pre-Submit Check

- [ ] `node --check game.js`
- [ ] `npm run verify:article`
- [ ] `npm run smoke`
- [ ] `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1`
- [ ] `npm run audit:launch -- --json` reports `READY_LOCALLY`
- [ ] `publish-after-repo.ps1` prints `Launch audit status: READY_LOCALLY` before any push
- [ ] GitHub Actions `Verify Helioigma` passes after the public push.
- [ ] Desktop browser check has no console errors or horizontal overflow.
- [ ] 390px mobile browser check has no console errors or horizontal overflow.
- [ ] Smoke test reports 71 PASS checks.
- [ ] Keyboard shortcuts work: Enter starts, H reveals a manual hint, D runs Demo Solve, R/Escape resets, and number keys rotate matching nodes.
- [ ] Public game shows node-control buttons below the canvas.
- [ ] Public smoke test returns `PASS`.
- [ ] Public judge page shows the 60-second review path.
- [ ] Public source includes `JUDGE_REVIEW_CARD.md` with the 60-second path, award thesis, rubric evidence, and boundaries.
- [ ] Public source includes `RUBRIC_SCORECARD.md` with the source-first criteria map.
- [ ] Public judge manifest returns HTTP 200 and records the stable receipt `SC-4P-2907-62-Y5VFX1`.
- [ ] Public receipt verifier accepts stable Demo Solve receipt `SC-4P-2907-62-Y5VFX1`.
- [ ] `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public`
- [ ] Public try link returns HTTP 200.
- [ ] Public try link starts the game.
- [ ] Public auto-demo link starts Demo Solve and reaches receipt `SC-4P-2907-62-Y5VFX1`.
- [ ] Completed public run reveals a copyable `SC-4P-...` run receipt.
- [ ] DEV article uses the official tags plus one discovery tag: `devchallenge`, `gamechallenge`, `gamedev`, `javascript`.
- [ ] DEV article verification passes against `judge-manifest.json`, public media versions, and Helioigma public URLs.
- [ ] DEV article includes a demo video asset or hosted demo video URL.
- [ ] `dev-launch-brief.md` public URL checks, DEV article fields, and no-go gate are reviewed immediately before publishing.
- [ ] Logged-in DEV challenge flow still accepts this June Solstice Game Jam submission despite any confusing public status label.
- [ ] DEV post contains the try link, source link, and clear challenge fit.
- [ ] DEV post explains why the Turing/code-breaking fit is inside the interaction, not only in the title.
- [ ] If sharing after publication, ask for real play/feedback only; do not spam, buy reactions, pressure people, or ask for fake engagement.
- [ ] No account secrets, API keys, payment details, tax data, KYC data, or private contact details are included.

# Helioigma Publishing Gate

Purpose: make the DEV June Solstice Game Jam package publishable with minimal human work while keeping account, payout, tax, and identity gates under the account owner's control.

## Current State

- Local game package is complete and verified.
- Local Git repository can be pushed after a public GitHub repository exists.
- Public repository, GitHub Pages, and DEV submission are account-owner launch gates; confirm them with `public-preflight.ps1 -Public` after they exist.
- No payout, tax, KYC, bank, API key, password, OTP, or private account data belongs in this package.

## Recommended Public Repository

- Owner: `OOYXLOO`
- Repository name: `solstice-cipher`
- Visibility: public
- Pages source: `main` branch, root folder
- Public try link after Pages is enabled: `https://ooyxloo.github.io/solstice-cipher/`

## One-Minute Human Gate

The account owner should create the public GitHub repository, or approve Codex to do so through an already logged-in browser/CLI session:

1. Open https://github.com/new?owner=OOYXLOO&name=solstice-cipher&visibility=public
2. Repository owner: `OOYXLOO`
3. Repository name: `solstice-cipher`
4. Visibility: public
5. Do not initialize with README, license, or `.gitignore`; this prepared package already includes the tracked README, MIT `LICENSE`, and `.gitignore`
6. Create repository

Optional GitHub CLI path, only when the account owner is present and `gh` is already authenticated:

```powershell
gh repo create OOYXLOO/solstice-cipher --public --description "Helioigma: a Turing-wheel puzzle for the DEV June Solstice Game Jam" --homepage "https://ooyxloo.github.io/solstice-cipher/"
```

Do not add `--add-readme`, `--license`, or `--gitignore`; this repository needs to start empty so the prepared local `main` branch can push cleanly.

After that, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1
powershell -ExecutionPolicy Bypass -File .\publish-after-repo.ps1 -Push
```

Then enable GitHub Pages from `main` / root. If the repository settings page is available, use Settings -> Pages -> Build and deployment -> Deploy from a branch -> `main` -> `/root`.
After the push, the `Verify Helioigma` workflow should pass before the DEV article is published.

## DEV Post Gate

Do not submit on DEV until the public try link works. Use:

- Copy console: `dev-submit-console.html`
- Publish assistant: `publish-assistant.html`
- Push helper: `publish-after-repo.ps1`
- Draft: `dev-post-draft.md`
- Cover image after Pages is live: `https://ooyxloo.github.io/solstice-cipher/cover.png`
- Current GIF demo after Pages is live: `https://ooyxloo.github.io/solstice-cipher/solstice-cipher-demo.gif`
- The WebM is the canonical captioned browser-recorded demo video; the GIF remains as a fallback preview, and the MP4 is a legacy optional asset.
- Judge pack: `https://ooyxloo.github.io/solstice-cipher/judge.html`
- Judge manifest: `https://ooyxloo.github.io/solstice-cipher/judge-manifest.json`
- Smoke test: `https://ooyxloo.github.io/solstice-cipher/smoke.html`
- Receipt verifier: `https://ooyxloo.github.io/solstice-cipher/proof-verifier.html`
- Try link: `https://ooyxloo.github.io/solstice-cipher/`
- Auto demo link: `https://ooyxloo.github.io/solstice-cipher/?demo=1`
- Source link: `https://github.com/OOYXLOO/solstice-cipher`
- Post-publish sharing: use the copy-ready share note in `dev-submit-console.html` after the DEV URL exists. Ask for real feedback from people who try the game; do not spam, buy reactions, or ask for fake engagement.

The account owner handles DEV login, final post, prize claim, payout, tax, and KYC directly.

## Final Pre-Submit Check

- [ ] `node --check game.js`
- [ ] `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1`
- [ ] GitHub Actions `Verify Helioigma` passes after the public push.
- [ ] Desktop browser check has no console errors or horizontal overflow.
- [ ] 390px mobile browser check has no console errors or horizontal overflow.
- [ ] Smoke test reports 43 PASS checks.
- [ ] Keyboard shortcuts work: Enter starts, H reveals a manual hint, D runs Demo Solve, R/Escape resets, and number keys rotate matching nodes.
- [ ] Public game shows node-control buttons below the canvas.
- [ ] Public smoke test returns `PASS`.
- [ ] Public judge manifest returns HTTP 200 and records the stable receipt `SC-4P-2907-62-Y5VFX1`.
- [ ] Public receipt verifier accepts stable Demo Solve receipt `SC-4P-2907-62-Y5VFX1`.
- [ ] `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1 -Public`
- [ ] Public try link returns HTTP 200.
- [ ] Public try link starts the game.
- [ ] Public auto-demo link starts Demo Solve and reaches receipt `SC-4P-2907-62-Y5VFX1`.
- [ ] Completed public run reveals a copyable `SC-4P-...` run receipt.
- [ ] DEV article uses the official tags: `devchallenge`, `gamechallenge`, `gamedev`.
- [ ] DEV article includes a demo video asset or hosted demo video URL.
- [ ] `dev-submit-console.html` no-go gate is reviewed immediately before publishing.
- [ ] DEV post contains the try link, source link, and clear challenge fit.
- [ ] DEV post explains why the Turing/code-breaking fit is inside the interaction, not only in the title.
- [ ] If sharing after publication, ask for real play/feedback only; do not spam, buy reactions, or ask for fake engagement.
- [ ] No account secrets, API keys, payment details, tax data, KYC data, or private contact details are included.

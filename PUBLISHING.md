# Solstice Cipher Publishing Gate

Purpose: make the DEV June Solstice Game Jam package publishable with minimal human work while keeping account, payout, tax, and identity gates under the account owner's control.

## Current State

- Local game package is complete and verified.
- Local Git repository can be pushed after a public GitHub repository exists.
- No DEV post, public repo, or public try link exists yet.
- No payout, tax, KYC, bank, API key, password, OTP, or private account data belongs in this package.

## Recommended Public Repository

- Owner: `OOYXLOO`
- Repository name: `solstice-cipher`
- Visibility: public
- Pages source: `main` branch, root folder
- Public try link after Pages is enabled: `https://ooyxloo.github.io/solstice-cipher/`

## One-Minute Human Gate

The account owner should create the public GitHub repository, or approve Codex to do so through an already logged-in browser/CLI session:

1. Open https://github.com/new
2. Repository owner: `OOYXLOO`
3. Repository name: `solstice-cipher`
4. Visibility: public
5. Do not initialize with README, license, or `.gitignore`
6. Create repository

After that, run:

```powershell
git remote add origin https://github.com/OOYXLOO/solstice-cipher.git
git push -u origin main
```

Then enable GitHub Pages from `main` / root. If the repository settings page is available, use Settings -> Pages -> Build and deployment -> Deploy from a branch -> `main` -> `/root`.
After the push, the `Verify Solstice Cipher` workflow should pass before the DEV article is published.

## DEV Post Gate

Do not submit on DEV until the public try link works. Use:

- Copy console: `dev-submit-console.html`
- Draft: `dev-post-draft.md`
- Cover image: `cover.png`
- Demo video: `solstice-cipher-demo.mp4`
- WebM fallback: `solstice-cipher-demo.webm`
- Demo GIF: `solstice-cipher-demo.gif`
- Judge pack: `https://ooyxloo.github.io/solstice-cipher/judge.html`
- Smoke test: `https://ooyxloo.github.io/solstice-cipher/smoke.html`
- Try link: `https://ooyxloo.github.io/solstice-cipher/`
- Source link: `https://github.com/OOYXLOO/solstice-cipher`

The account owner handles DEV login, final post, prize claim, payout, tax, and KYC directly.

## Final Pre-Submit Check

- [ ] `node --check game.js`
- [ ] GitHub Actions `Verify Solstice Cipher` passes after the public push.
- [ ] Desktop browser check has no console errors or horizontal overflow.
- [ ] 390px mobile browser check has no console errors or horizontal overflow.
- [ ] Public smoke test returns `PASS`.
- [ ] Public try link returns HTTP 200.
- [ ] Public try link starts the game.
- [ ] Completed public run reveals a copyable `SC-4P-...` run proof.
- [ ] DEV article uses the official tags: `devchallenge`, `gamechallenge`, `gamedev`.
- [ ] DEV article includes a demo video asset or hosted demo video URL.
- [ ] `dev-submit-console.html` no-go gate is reviewed immediately before publishing.
- [ ] DEV post contains the try link, source link, and clear challenge fit.
- [ ] No account secrets, API keys, payment details, tax data, KYC data, or private contact details are included.

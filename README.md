# Solstice Cipher

Static browser game package for the DEV June Solstice Game Jam backup route.

## Status

- Built locally and prepared as a GitHub Pages-ready package.
- Not yet published to a public repository.
- Not submitted to DEV.
- No account login, payout data, API key, or private user data is used.

## Run

```powershell
python -m http.server 8781
```

Then open:

```text
http://127.0.0.1:8781/
```

## Submission Fit

Solstice Cipher is a compact browser puzzle game for the June solstice theme and an ode to Alan Turing's code-breaking legacy. The player rotates a Turing wheel of solar, XOR, light, and binary glyphs to match the target cipher before time runs out. It is intentionally static and self-contained so it can be hosted on GitHub Pages if the user authorizes public publishing.

The current build now has four named phases, score carry-over, streak scoring, shift counting, a local best-score readout, a shareable completion proof code, and a final replay screen that summarizes the run. That gives judges a complete loop in one short play session instead of an open-ended prototype.

## Controls

- Click or tap ring nodes to rotate their phase.
- Number keys `1` through `9` rotate matching node positions.
- `Enter` starts a fresh run.
- `Escape` resets the board.

## Current Quality Checks

- Desktop and 390px mobile browser checks pass with no console errors or horizontal overflow.
- Canvas screenshots are nonblank and visually varied.
- Ring-node click interaction and keyboard node rotation are both covered by local browser checks.
- A four-phase ending state shows final score, local best score, solved phase count, total shifts, and a copyable run proof instead of looping forever.
- `.github/workflows/verify.yml` is ready to run public package checks after the repository is published.

## Local Media Assets

- `cover.png`: 1200x630 social/DEV cover image.
- `solstice-cipher-demo.gif`: six-frame local gameplay demo, from ready state through final score.
- `solstice-cipher-demo.mp4`: MP4 version of the demo for the DEV article/video requirement.
- `solstice-cipher-demo.webm`: WebM version of the demo for public hosting fallback.
- `desktop-check-v5.png`: current desktop gameplay screenshot.
- `mobile-check-v6.png`: current mobile gameplay screenshot.
- `desktop-complete-v4.png`: current final-score screenshot with solved phases, best score, and shift count.
- `solstice-cipher-dev-package.zip`: local review/transfer package containing source files and final media assets.

## Judge Proof

- `judge.html`: one-page judge pack with play link, smoke-test link, theme fit, and publication boundary.
- `smoke.html`: browser self-test that starts the game in an iframe, solves all four phases through public keyboard controls, and verifies the final score/status plus the completion proof code.
- `dev-submit-console.html`: copy-ready DEV final post console for title, tags, body sections, media order, try links, and the no-go gate after the public Pages link exists.
- `dev-article-final.md`: DEV-ready article draft using the official challenge tags and required overview/demo structure.
- `.github/workflows/verify.yml`: public CI preflight for source syntax, required assets, official DEV tags, and judge/smoke links.

## Public Publishing

Use `PUBLISHING.md` when the account owner is ready to create or approve the public GitHub repository. Recommended public URLs:

- Source: `https://github.com/OOYXLOO/solstice-cipher`
- Try link: `https://ooyxloo.github.io/solstice-cipher/`

The package includes `.nojekyll` and social metadata so GitHub Pages can serve the game from the repository root.

## Human Gates

- DEV account login and final challenge post.
- Public hosting under the user's account.
- DEV login and final article with demo video upload.
- Any prize-claim, tax, or payout steps.

# Solstice Cipher Submission Checklist

Status: local package is GitHub Pages-ready. Not published and not submitted.

## Ready Locally

- Static game files: `index.html`, `styles.css`, `game.js`.
- GitHub Pages marker: `.nojekyll`.
- Publishing gate: `PUBLISHING.md`.
- Judge pack: `judge.html`.
- Browser smoke test: `smoke.html`.
- Copy-ready DEV final post console: `dev-submit-console.html`.
- DEV post draft: `dev-post-draft.md`.
- Local README: `README.md`.
- Desktop screenshot: `desktop-check-v5.png`.
- Mobile screenshot: `mobile-check-v6.png`.
- Completion screenshot: `desktop-complete-v4.png`.
- Cover image: `cover.png`.
- Animated gameplay preview: `solstice-cipher-demo.gif`.
- Source frames: `demo-frames-v3/`.
- Local package ZIP: `solstice-cipher-dev-package.zip`.
- Verification:
  - `node --check game.js`
  - Desktop browser check: start, number-key rotation, no console errors, no horizontal overflow.
  - Mobile 390px browser check: no console errors, no horizontal overflow.
- Four-phase completion check: final state shows `Longest day held. Final score ... across ... shifts.` and the canvas finale reports solved phases, local best score, total shifts, and a deterministic run proof.

## Before Publishing

- Create or approve a public GitHub repository named `OOYXLOO/solstice-cipher`.
- Push the prepared local `main` branch to that repository.
- Enable GitHub Pages from the `main` branch root.
- Convert or re-record `solstice-cipher-demo.gif` as a hosted video if the DEV post needs a stronger first impression.
- Use `dev-submit-console.html` for the final title, tags, media order, public links, and no-go gate.
- Review the DEV post draft for tone and personal voice.
- Confirm the challenge rules and eligibility on the official DEV pages.

## Human Gates

- DEV login.
- Public post/submission.
- Public repository or Pages publication under the user's account.
- Any prize claim, tax, or payout workflow if awarded.

## Suggested DEV Post Links

- Try link: to be filled after public hosting.
- Source link: to be filled after repo/public hosting is authorized.
- Judge pack link: `https://ooyxloo.github.io/solstice-cipher/judge.html` after public hosting.
- Smoke test link: `https://ooyxloo.github.io/solstice-cipher/smoke.html` after public hosting.
- DEV post console: `https://ooyxloo.github.io/solstice-cipher/dev-submit-console.html` after public hosting.
- Screenshots/media: use `cover.png`, `solstice-cipher-demo.gif`, `desktop-check-v5.png`, `mobile-check-v6.png`, and `desktop-complete-v4.png`.
- Package: use `solstice-cipher-dev-package.zip` only for local transfer/review; public hosting should still use the unpacked static files.

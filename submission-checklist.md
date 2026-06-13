# Solstice Cipher Submission Checklist

Status: local package is GitHub Pages-ready. Not published and not submitted.

## Ready Locally

- Static game files: `index.html`, `styles.css`, `game.js`.
- GitHub Pages marker: `.nojekyll`.
- Publishing gate: `PUBLISHING.md`.
- Judge pack: `judge.html`.
- Browser smoke test: `smoke.html`.
- Run proof verifier: `proof-verifier.html` with parsed proof facts.
- Phase progress strip, Demo Solve, and node-control buttons for quick judging, mobile play, and accessibility-friendly play.
- Copy-ready DEV final post console: `dev-submit-console.html`.
- Copy-ready publish assistant: `publish-assistant.html`.
- Local/public preflight script: `public-preflight.ps1`.
- Dry-run-by-default push helper: `publish-after-repo.ps1`.
- DEV post draft: `dev-post-draft.md`.
- Verification report: `verification.html` and `verification-report.md`.
- Local README: `README.md`.
- Desktop screenshot: `desktop-check-v5.png`.
- Mobile screenshot: `mobile-check-v6.png`.
- Completion screenshot: `desktop-complete-v4.png`.
- Cover image: `cover.png`.
- Animated gameplay preview: `solstice-cipher-demo.gif`.
- Demo video MP4: `solstice-cipher-demo.mp4`.
- Demo video WebM: `solstice-cipher-demo.webm`.
- Source frames: `demo-frames-v3/`.
- Local package ZIP: `solstice-cipher-dev-package.zip`.
- Verification:
  - `node --check game.js`
  - `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1`
  - `.github/workflows/verify.yml`
  - Desktop browser check: start, number-key rotation, no console errors, no horizontal overflow.
  - Mobile 390px browser check: no console errors, no horizontal overflow.
- Phase progress strip: four steps visible on desktop and mobile, no mobile overflow.
- Demo Solve: visible in the controls row and completes the loop to stable proof `SC-4P-2907-62-Y5VFX1` during browser verification.
- Node-control buttons: visible below the canvas, six controls on the first phase, no mobile overflow.
- Four-phase completion check: final state shows `Longest day held. Final score ... across ... shifts.` and the canvas finale reports solved phases, local best score, total shifts, and a deterministic run proof.
- Proof verifier check: `proof-verifier.html` accepts stable demo proof `SC-4P-2907-62-Y5VFX1` and shows phases, score, shifts, and checksum facts.

## Before Publishing

- Create or approve a public GitHub repository named `OOYXLOO/solstice-cipher`.
- Push the prepared local `main` branch to that repository.
- Confirm GitHub Actions `Verify Solstice Cipher` passes after push.
- Enable GitHub Pages from the `main` branch root.
- Use `dev-submit-console.html` for the final title, tags, media order, public links, and no-go gate.
- Use `publish-assistant.html` for repository settings, push commands, Pages settings, and public URL checks.
- Use `publish-after-repo.ps1` for a dry run before pushing, then `publish-after-repo.ps1 -Push` only after the public repo exists.
- Use official DEV tags: `devchallenge`, `gamechallenge`, `gamedev`.
- Review the DEV post draft for tone and personal voice.
- Keep the category boundary honest: Best Ode to Alan Turing, not Best Google AI Usage.
- Include the originality/build-window note in the final DEV post.
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
- Screenshots/media: use `cover.png`, `solstice-cipher-demo.mp4`, `solstice-cipher-demo.webm`, `solstice-cipher-demo.gif`, `desktop-check-v5.png`, `mobile-check-v6.png`, and `desktop-complete-v4.png`.
- Package: use `solstice-cipher-dev-package.zip` only for local transfer/review; public hosting should still use the unpacked static files.

# Helioigma Submission Checklist

Status: local package is GitHub Pages-ready. Public repository, GitHub Pages, and DEV submission remain account-owner launch gates until completed.

## Ready Locally

- Static game files: `index.html`, `styles.css`, `game.js`.
- GitHub Pages marker: `.nojekyll`.
- Publishing gate: `PUBLISHING.md`.
- Judge pack: `judge.html`.
- Judge manifest: `judge-manifest.json` with prize target, public links, stable run receipt, required assets, verification steps, and human gates.
- Browser smoke test: `smoke.html`.
- Run receipt verifier: `proof-verifier.html` with parsed receipt facts and `?receipt=` deep-link support.
- Phase progress strip, Hint, Demo Solve, and node-control buttons for quick judging, mobile play, and accessibility-friendly play.
- Optional default-off Audio cue toggle with `S` shortcut and generated Web Audio tones.
- Optional auto-demo route: `?demo=1` starts the deterministic judge path automatically.
- Copy-ready DEV final post console: `dev-submit-console.html`.
- Copy-ready publish assistant: `publish-assistant.html`.
- Local/public preflight script: `public-preflight.ps1`.
- Dry-run-by-default push helper: `publish-after-repo.ps1`.
- DEV post draft: `dev-post-draft.md`.
- DEV final article: `dev-article-final.md` with `What I Built`, `Video Demo`, `Code`, `How I Built It`, and `Prize Category` sections.
- Verification report: `verification.html` and `verification-report.md`.
- Local README: `README.md`.
- License: `LICENSE`.
- Desktop screenshot: `desktop-check-v5.png`.
- Mobile screenshot: `mobile-check-v6.png`.
- Completion screenshot: `desktop-complete-v4.png`.
- Cover image after Pages is live: `https://ooyxloo.github.io/helioigma/cover.png`.
- Current captioned WebM demo video: `helioigma-demo.webm`.
- Current GIF demo: `helioigma-demo.gif`.
- Optional legacy MP4 asset: `helioigma-demo.mp4`.
- Source frames: `demo-frames-v3/`.
- Rebuild captioned WebM from a live browser session with `NODE_PATH=C:\Users\YXL\.codex\tmp\solstice-playwright\node_modules node .\tools\build-demo-video.mjs`.
- Rebuild the fallback frame-based WebM with `NODE_PATH=C:\Users\YXL\.codex\tmp\solstice-playwright\node_modules node .\tools\build-demo-webm.mjs`.
- Local package ZIP: `helioigma-dev-package.zip`.
- Verification:
  - `node --check game.js`
  - `powershell -ExecutionPolicy Bypass -File .\public-preflight.ps1`
  - `.github/workflows/verify.yml`
- `smoke.html`: 60 PASS checks including daylight meter, score/receipt explanation, phase objective strip, phase announcer, phase scoring ledger, Judge run summary, award signals, default-off Audio control, H-to-Hint behavior, Rotor Trace state, D-to-Demo-Solve, R-to-reset, final status, receipt format, and receipt-verifier link coverage.
  - Desktop browser check: start, number-key rotation, no console errors, no horizontal overflow.
  - Mobile 390px browser check: no console errors, no horizontal overflow.
- Phase progress strip: four steps visible on desktop and mobile, no mobile overflow.
- First-screen rule: visible text explains that the player should decode the solstice rotor by matching each numbered node to the target glyph before nightfall.
- Hint: visible in the controls row, exposed with shortcut `H`, and highlights the next mismatched node during browser verification without changing the stable Demo Solve receipt.
- Demo Solve: visible in the controls row and completes the loop to stable receipt `SC-4P-2907-62-Y5VFX1` during browser verification.
- Auto demo: `/?demo=1` completes to the same stable receipt during browser verification.
- Node-control buttons: visible below the canvas, six controls on the first phase, no mobile overflow.
- Four-phase completion check: final state shows `Longest day held. Final score ... across ... shifts.` and the canvas finale reports solved phases, local best score, total shifts, and a deterministic run receipt.
- Receipt verifier check: `proof-verifier.html` accepts stable demo receipt `SC-4P-2907-62-Y5VFX1`, the first-screen/judge-pack sample link opens `?receipt=SC-4P-2907-62-Y5VFX1`, and the verifier shows phases, score, shifts, and checksum facts.
- Manifest check: `judge-manifest.json` records the USD 200 target, Best Ode to Alan Turing category, 60 expected smoke checks, sample receipt verifier URL, score basis, and stable receipt `SC-4P-2907-62-Y5VFX1`.

## Before Publishing

- Create or approve a public GitHub repository named `OOYXLOO/helioigma`.
  - Fast path: `https://github.com/new?owner=OOYXLOO&name=helioigma&visibility=public`
  - Optional GitHub CLI path, only when the account owner is present and `gh` is already authenticated: `gh repo create OOYXLOO/helioigma --public --description "Helioigma: a Turing-wheel puzzle for the DEV June Solstice Game Jam" --homepage "https://ooyxloo.github.io/helioigma/"`
- Keep it empty: no README, no license template, no `.gitignore`; the prepared package already includes the tracked `README.md`, MIT `LICENSE`, and `.gitignore`.
- Push the prepared local `main` branch to that repository.
- Confirm GitHub Actions `Verify Helioigma` passes after push.
- Enable GitHub Pages from the `main` branch root.
- Use `dev-submit-console.html` for the final title, tags, current WebM/GIF media, public links, and no-go gate.
- Use `publish-assistant.html` for repository settings, push commands, Pages settings, and public URL checks.
- Use `publish-after-repo.ps1` for a dry run before pushing, then `publish-after-repo.ps1 -Push` only after the public repo exists.
- Use official DEV tags: `devchallenge`, `gamechallenge`, `gamedev`.
- Review the DEV post draft for tone and personal voice.
- Keep the category boundary honest: Best Ode to Alan Turing, not Best Google AI Usage.
- Include the originality/build-window note in the final DEV post.
- Include the differentiation note: the Turing/code-breaking fit is inside the interaction, not only in the title.
- After publishing, share the DEV post only with honest feedback/reaction requests. Positive DEV reactions can matter as a challenge tie-breaker, but the ask must stay clean: real play, real feedback, no spam, no bought reactions, and no fake engagement.
- Confirm the challenge rules and eligibility on the official DEV pages.

## Human Gates

- DEV login.
- Public post/submission.
- Public repository or Pages publication under the user's account.
- Any prize claim, tax, or payout workflow if awarded.

## Suggested DEV Post Links

- Try link: to be filled after public hosting.
- Auto demo link: `https://ooyxloo.github.io/helioigma/?demo=1` after public hosting.
- Source link: to be filled after repo/public hosting is authorized.
- Judge pack link: `https://ooyxloo.github.io/helioigma/judge.html` after public hosting.
- Judge manifest link: `https://ooyxloo.github.io/helioigma/judge-manifest.json` after public hosting.
- Smoke test link: `https://ooyxloo.github.io/helioigma/smoke.html` after public hosting.
- DEV post console: `https://ooyxloo.github.io/helioigma/dev-submit-console.html` after public hosting.
- Screenshots/media: use the public Pages URLs for `cover.png`, `helioigma-demo.webm`, `helioigma-demo.gif`, `desktop-check-v5.png`, `mobile-check-v6.png`, and `desktop-complete-v4.png`.
- Package: use `helioigma-dev-package.zip` only for local transfer/review; public hosting should still use the unpacked static files.

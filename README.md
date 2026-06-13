# Helioigma

Static browser game package for the DEV June Solstice Game Jam.

## Status

- GitHub Pages-ready static game package for the submitted public URLs.
- The checked-in judge links point to the intended public Pages locations; before publication, run the package locally with the commands below.
- Owner-only publishing helpers are included, but the judge path is the playable game, judge page, smoke test, manifest, media, and receipt verifier.
- No account login, payout data, API key, or private user data is used.
- The only browser storage is the local numeric best score key for this game.

## Run

```powershell
python -m http.server 8781
```

Then open:

```text
http://127.0.0.1:8781/
```

## Submission Fit

Helioigma is a compact browser puzzle game for the June solstice theme and an ode to Alan Turing's code-breaking legacy. The player rotates a Turing-inspired solar rotor of solar, XOR, light, and binary glyphs to match the target cipher before time runs out. It is intentionally static and self-contained so it can run on GitHub Pages without a backend.

The current build now has a visible four-phase progress strip, a first-screen phase objective strip, score carry-over, streak scoring, shift counting, a local best-score readout, a shareable completion receipt code, phase scoring ledger, a human-readable Judge run summary, and a final replay screen that summarizes the run. It also exposes live node-control buttons below the canvas, a first-move coach on Start, a manual `Hint` path, tactile node pulse feedback after hints or shifts, optional default-off Web Audio cues, a short phase banner plus screen-reader phase announcer when each phase starts, a live Rotor Trace panel, judge shortcut links, a stable `Demo Solve` receipt path, and an optional `?demo=1` auto-demo URL, so judges can play or verify on mobile or desktop without guessing the canvas hit zones. That gives judges a complete loop in one short play session instead of an open-ended prototype.

Award thesis: Helioigma is a playable ode, a judge-verifiable loop, and a finished static package. The Turing fit lives in rotor state, XOR/binary language, timed pressure, and checksum reasoning; the review path proves the same public game loop through Auto Demo, Rotor Trace, smoke test, manifest, and receipt verifier.

The Turing ode is intentionally restrained: the game does not pretend to recreate the Bombe or a biography. It uses state, logic, alignment, verification, pressure, and machine-readable reasoning as the tribute.

The playable first screen now includes the plain rule: decode the solstice rotor by matching each numbered node to the target glyph before nightfall. The DEV final article is structured around the official submission expectations: What I Built, Video Demo, Code, How I Built It, and Prize Category.

## Originality and Review Transparency

Helioigma is a new static game package for this jam period, not a wrapper around a prior game template. The gameplay code, receipt verifier, judge page, manifest, smoke test, screenshots, and demo media are included so reviewers can inspect the build directly.

The public media pack is generated from this build's browser UI and checked-in demo frames. No third-party game template, stock-art pack, private dataset, backend service, API key, or account-local state is required to review the submission.

## Controls

- Click or tap ring nodes to rotate their phase.
- Use the node-control buttons below the canvas.
- Use `Hint` or press `H` during manual play to highlight the next mismatched node.
- Use `Demo Solve` or press `D` to watch the complete four-phase loop without manual input.
- Use `Audio` or press `S` to enable optional short Web Audio cues. Audio is off by default.
- Score rewards held daylight, streaks, and fewer wasted shifts; the final receipt lets judges verify the same run path.
- Open `?demo=1` to start the same deterministic judge route automatically.
- Number keys `1` through `9` rotate matching node positions.
- `Enter` starts a fresh run.
- `Escape` or `R` resets the board.

## Current Quality Checks

- Desktop and 390px mobile browser checks pass with no horizontal overflow.
- Canvas screenshots are nonblank and visually varied.
- Ring-node click interaction and keyboard node rotation are both covered by local browser checks.
- The HUD exposes phase, score, best, shift, and timer counters, plus a four-step progress strip for the complete run.
- A first-screen Judge Path strip makes the review sequence explicit: play, run Demo Solve, then verify receipt `SC-4P-2907-62-Y5VFX1`.
- `Demo Solve` provides a one-click judge path through all four phases and the final receipt state; its timer drift is paused so the sample receipt is stable: `SC-4P-2907-62-Y5VFX1`.
- The first-screen judge shortcuts and judge pack link directly to `proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1` so a reviewer can inspect the stable sample checksum before or after running the demo.
- Optional audio cues are default-off, require a click or `S` shortcut, and use generated Web Audio tones rather than external assets.
- A four-phase ending state shows final score, local best score, solved phase count, total shifts, and a copyable run receipt instead of looping forever.
- `.github/workflows/verify.yml` is ready to run public package checks after the repository is published.

## Local Media Assets

- `cover.png`: 1200x630 social/DEV cover image.
- `helioigma-demo.webm`: current captioned WebM video recorded from the real browser game path, including Hint, phase banner, Rotor Trace, Demo Solve, final receipt, and verifier.
- `helioigma-demo.gif`: seven-frame current gameplay preview, from first-screen controls through the final run receipt ledger and Judge run summary.
- `helioigma-demo.mp4`: optional legacy MP4 asset retained for platforms that specifically ask for MP4.
- `desktop-check-v5.png`: current desktop gameplay screenshot.
- `mobile-check-v6.png`: current mobile gameplay screenshot.
- `desktop-complete-v4.png`: current completion screenshot with final score, run receipt, verifier link, phase scoring ledger, and Judge run summary.
- `helioigma-dev-package.zip`: local review/transfer package containing source files and final media assets.

## License

Helioigma is released under the MIT license in `LICENSE`.

## Judge Receipt

- `judge.html`: one-page judge pack with a 60-second review path, rubric snapshot, play link, smoke-test link, theme fit, and receipt boundary.
- `judge-manifest.json`: machine-readable judge manifest for prize target, rubric snapshot, public links, stable run receipt, required assets, verification commands, and non-secret boundaries.
- `smoke.html`: browser self-test that starts the game in an iframe, checks the deterministic demo-solve receipt, solves all four phases through public keyboard controls, and verifies the final score/status, shift counter, phase track, Rotor Trace, and completion receipt code.
- `proof-verifier.html`: local verifier for copyable `SC-4P-...` run receipts, with parsed phases, score, shifts, checksum facts, a prefilled sample receipt link, and `?receipt=` deep-link support from completed runs.
- `dev-article-final.md`: DEV-ready article draft using the official challenge tags and required overview/demo structure.
- `dev-launch-brief.md`: final DEV launch field list, URL checklist, no-go gate, and post-publish receipt template.
- `verification.html` and `verification-report.md`: public verification summary for smoke result, layout checks, media assets, and CI preflight.
- `public-preflight.ps1`: local and optional public URL preflight without pushing or submitting anything.
- `.github/workflows/verify.yml`: public CI preflight for source syntax, required assets, official DEV tags, and judge/smoke links.
- `tools/browser-smoke-check.mjs`: CI browser check that opens the real pages, verifies first-screen Hint, Demo Solve, default-off Audio controls, and score/receipt explanation, daylight meter, desktop Judge Path, phase objective strip, phase announcer, phase scoring ledger, Judge run summary, award signals, Rotor Trace, mobile canvas visibility, validates the run receipt and receipt-verifier query path, and waits for `smoke.html` to reach 60 PASS checks.
- `tools/build-demo-video.mjs`: reproducible browser-recording builder for the current captioned `helioigma-demo.webm`.
- `tools/build-demo-webm.mjs`: fallback frame-based WebM builder using `demo-frames-v3`.

## Public Publishing

Use `PUBLISHING.md` when the account owner is ready to create or approve the public GitHub repository. Recommended public URLs:

- Source: `https://github.com/OOYXLOO/helioigma`
- Try link: `https://ooyxloo.github.io/helioigma/`
- Auto demo: `https://ooyxloo.github.io/helioigma/?demo=1`

The package includes `.nojekyll` and social metadata so GitHub Pages can serve the game from the repository root.

## Owner Launch Helpers

These files are included for the account owner and are not part of the judge's required review path:

- `dev-submit-console.html`: copy-ready DEV final post console for title, tags, body sections, current WebM/GIF media, try links, and the no-go gate after the public Pages link exists.
- `dev-launch-brief.md`: compact launch-day brief for the account owner after the public Pages link exists.
- `publish-assistant.html`: copy-ready repository, push, Pages, public URL, and preflight instructions for the human account gate.
- `publish-after-repo.ps1`: dry-run-by-default helper that checks the repo, runs local preflight, and can push with `-Push` after the public repo exists.

## Human Gates

- DEV account login and final challenge post.
- Public hosting under the user's account.
- DEV login and final article with demo video upload.
- Any prize-claim, tax, or payout steps.

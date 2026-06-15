# Helioigma

Static browser game package for the DEV June Solstice Game Jam.

## Judge Fast Path

- Play: https://ooyxloo.github.io/helioigma/
- Auto demo: https://ooyxloo.github.io/helioigma/?demo=1
- Verify sample receipt: https://ooyxloo.github.io/helioigma/proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1
- Judge pack: https://ooyxloo.github.io/helioigma/judge.html

60-second thesis: start the 45-second daylight run, rotate one numbered node, watch Rotor Trace explain the state change, then press `Demo Solve` and inspect stable receipt `SC-4P-2907-62-Y5VFX1`. Helioigma is a playable Turing-wheel game first, with the receipt and smoke test as transparent review evidence.

## Status

- GitHub Pages-ready static game package for the intended public URLs.
- The checked-in judge links point to the intended public Pages locations; before publication, run the package locally with the commands below.
- Owner-only launch notes are kept in Markdown; the public judge path is the playable game, judge page, receipt checker, manifest, media, and optional smoke test.
- No account login, payout data, API key, or private user data is used.
- The only default browser storage is the local numeric best score key for this game; `?nostore=1` disables best-score reads/writes for stricter privacy review.
- Accessibility and fair-play signals are explicit: keyboard, touch, mouse, screen-reader helper text, phase announcements, default-off audio, no telemetry, and a transparent receipt that is review evidence rather than anti-cheat or identity proof.

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

The current build now has a visible four-phase progress strip, a first-screen phase objective strip with a compact Turing cue line, score carry-over, streak scoring, shift counting, a local best-score readout, a shareable completion receipt code, phase scoring ledger, a human-readable Judge run summary, a Nightfall report for failed manual runs, and a final replay screen that summarizes the run. It also exposes live node-control buttons below the canvas, an in-canvas first-action hint (`Tap nodes or press 1-9. H = hint, D = demo.`), a first-move grace coach on `Start Run` that keeps the timer full until the first node shift, a phase-guided manual `Hint` path, tactile node pulse feedback after hints or shifts, optional default-off Web Audio cues, a short phase banner plus screen-reader phase announcer when each phase starts, a live Rotor Trace panel, judge shortcut links, a stable `Demo Solve` receipt path, and an optional `?demo=1` auto-demo URL, so judges can play or verify on mobile or desktop without guessing the canvas hit zones. That gives judges a complete loop in one short play session instead of an open-ended prototype.

Award thesis: Helioigma is a playable ode, a receipt-checkable loop, and a finished static package. The Turing fit lives in rotor state, XOR/binary language, timed pressure, and checksum reasoning; the review path makes the published Demo Solve summary inspectable through Auto Demo, Rotor Trace, receipt checker, manifest, and optional smoke test.

The Turing ode is intentionally restrained: the game does not pretend to recreate the Bombe or a biography. It uses state, logic, alignment, verification, pressure, and machine-readable reasoning as the tribute.

Crowded-jam distinction: if several entries start from solstice ciphers or Turing references, Helioigma's claim is the playable system around the idea. A judge can feel the timed node decisions, see Rotor Trace explain the state change, lose into a finished Nightfall report, or press Demo Solve and check the same public path through a checksum receipt. The receipt layer supports the game-first loop instead of replacing it.

Player feel matters as much as proof: each phase gives a readable target, a visible `SOL -> XOR -> LUX -> BIN` rotation cue, a short timer, immediate node pulse feedback, a changing Hint/Rotor Trace scan order, optional audio, and a clean Nightfall recovery. The verifier supports the game loop; it does not replace the feeling of making and correcting moves under daylight pressure.

Playability proof for a rushed judge: the first minute exposes readable decisions, immediate feedback, and a finished failure state. The target glyphs, aligned-node count, phase objective, in-canvas action hint, and phase-specific scan rule make each tap explainable; node pulses, Rotor Trace, daylight movement, status copy, and optional audio make shifts legible; and the Nightfall report gives held phases, aligned nodes, score, shifts, Retry, and Demo Solve recovery instead of a dead end.

The playable first screen now leads with the game hook, `Seal the daylight run.`, then gives the plain rule: open with 45 seconds of daylight, rotate numbered nodes, match the target glyphs, and survive nightfall. The first phase cue is `Crib checks state.`, keeping the Turing connection visible while leaving receipt language for the judge links and completed run. The DEV final article is structured around the official submission expectations: What I Built, Video Demo, Code, How I Built It, and Prize Category.

## Official Review Snapshot

- Prize route: Best Ode to Alan Turing category route in the official challenge.
- Submit by: June 21, 2026 at 11:59 PM PDT.
- Judge receipt: Play, Auto Demo, receipt checker, manifest, and optional smoke test inspect the published review surface and stable summary receipt.
- Boundary: no Google AI claim, backend, account login, API key, or private data.

## Originality and Review Transparency

Helioigma is a new static game package for this jam period, not a wrapper around a prior game template. The gameplay code, receipt checker, judge page, manifest, smoke test, screenshots, and demo media are included so reviewers can inspect the build directly.

The public media pack is generated from this build's browser UI and checked-in demo frames. No third-party game template, stock-art pack, private dataset, backend service, API key, or account-local state is required to review the submission.

## Controls

- Click or tap ring nodes to rotate their phase.
- Use the node-control buttons below the canvas.
- Use `Hint` or press `H` during manual play to highlight the next mismatched node.
- Hints and Rotor Trace use phase-specific scan orders: Crib follows the first mismatch, XOR alternates mirrored nodes, Carry advances the binary chain, and Checksum scans in reverse.
- Use `Demo Solve` or press `D` to watch the complete four-phase loop without manual input.
- Use `Audio` or press `S` to enable optional short Web Audio cues. Audio is off by default.
- Score rewards held daylight, streaks, and fewer wasted shifts; the final receipt lets judges verify the score, shift count, phase count, and checksum summary for the stable Demo Solve run.
- Open `?demo=1` to start the same deterministic judge route automatically.
- Open `?nostore=1` for a stricter privacy review path that avoids reading or writing the local best-score key while keeping the game playable.
- Number keys `1` through `9` rotate matching node positions.
- `Enter` starts a fresh run.
- `Escape` or `R` resets the board.

## Current Quality Checks

- Desktop and 390px mobile browser checks pass with no horizontal overflow.
- On 1280x900 desktop, the first viewport keeps the full playable canvas visible instead of cutting off the lower wheel.
- On 390px mobile, the canvas target row keeps a guarded inset so first and last target glyphs do not clip against the canvas edge.
- On 390px mobile, `Start Run` and `Demo Solve` share the first quick-control row so the judge can either play manually or jump to the stable receipt path without hiding Hint, Reset, Audio, or the first canvas viewport.
- Canvas screenshots are nonblank and visually varied.
- Ring-node click interaction and keyboard node rotation are both covered by local browser checks.
- The HUD exposes phase, score, best, shift, and timer counters, plus a four-step progress strip for the complete run.
- A compact Run Path strip keeps the game-first sequence explicit after the playable wheel: match nodes, watch the trace, then seal the run with receipt `SC-4P-2907-62-Y5VFX1`.
- The manual hint route is phase-specific, so later phases visibly change how the next mismatch is selected instead of only shrinking the timer.
- Rotor Trace now includes a run-quality line, so manual judges can see clean locks and phase streaks without waiting for the final receipt.
- `Demo Solve` provides a one-click judge path through all four phases and the final receipt state; its timer drift is paused so the sample receipt is stable: `SC-4P-2907-62-Y5VFX1`.
- After `Demo Solve` finishes, the page scrolls the completed receipt panel into view and focuses the verifier link so the review path lands on the receipt details instead of leaving them below the fold.
- The judge shortcut row and judge pack link directly to `proof-verifier.html?receipt=SC-4P-2907-62-Y5VFX1` so a reviewer can inspect the stable Auto Demo sample checksum before or after running the demo.
- The judge shortcut row stays focused on the strongest four routes: Auto demo, Judge pack, Verify sample, and the current captioned WebM. Deeper proof links such as smoke test, GIF fallback, source, manifest, README, and rubric scorecard live inside the Judge pack so the playable page does not turn into a link wall.
- First-move grace coaching holds its highlight long enough for a cold reviewer to see it, keeps the timer full until the first node shift, and wrong shifts now state the exact visible penalty (`Daylight -0.45s`) instead of making the timer loss feel mysterious.
- The first-move coach also draws an in-canvas `TRY NODE 1 -> SOL` callout tied to the highlighted node, so a rushed mobile or desktop judge has one obvious safe first action before the timer starts.
- On 390px mobile, the objective strip uses a compact 2x2 layout so the phase, target, alignment, and Turing cue are easier to read while keeping the playable canvas inside the first viewport.
- Failed manual runs show a Nightfall report with aligned-node progress, held phases, score, shifts, and `Retry run` / `Watch Demo Solve` recovery instead of leaving the player at a dead end.
- Optional audio cues are default-off, require a click or `S` shortcut, and use generated Web Audio tones rather than external assets.
- Accessibility / fair-play boundary: the same loop is playable with mouse, touch, on-screen buttons, and number keys; screen-reader helper text and phase announcements are present; no telemetry or network call records play; and the receipt checker is transparent review evidence rather than anti-cheat, identity, payout, or eligibility proof.
- A four-phase ending state shows final score, local best score, solved phase count, total shifts, and a copyable run receipt instead of looping forever.
- `.github/workflows/verify.yml` is ready to run public package checks after the repository is published.
- `package.json` and `package-lock.json` provide clean-clone commands: `npm ci`, `npm run check`, `npm run preflight`, `npm run smoke`, `npm run audit:launch`, `npm run audit:launch:public`, `npm run build:cover`, `npm run build:media`, `npm run build:gif`, `npm run build:video`, `npm run build:webm`, `npm run verify:article`, `npm run verify:media`, and `npm run build:package`.

## Local Media Assets

- `cover.png`: 1000x420 DEV-friendly cover image generated from the reproducible cover builder.
- `helioigma-demo.webm`: current captioned WebM video recorded from the real browser game path, including Hint, phase banner, Rotor Trace, Demo Solve, final receipt, and verifier.
- `helioigma-demo.gif`: seven-frame current gameplay preview, from first-screen controls through the final run receipt ledger and Judge run summary.
- `helioigma-demo.mp4`: optional legacy MP4 fallback retained only for platforms that specifically ask for MP4; the current canonical demo media are the WebM and GIF.
- `desktop-check-v5.png`: current desktop gameplay screenshot.
- `mobile-check-v6.png`: current mobile gameplay screenshot.
- `desktop-complete-v4.png`: current completion screenshot with final score, run receipt, verifier link, phase scoring ledger, and Judge run summary.
- `mobile-complete-v1.png`: current mobile completion screenshot with stable receipt, phase ledger, and Judge run summary in a 390px viewport.
- `helioigma-dev-package.zip`: local review/transfer package containing source files and final media assets.

## License

Helioigma is released under the MIT license in `LICENSE`.

## Judge Receipt

- `FIRST_MINUTE.md`: shortest source-readable review path for a rushed DEV judge, focused on play, category fit, receipt verification, and what is not claimed.
- `judge.html`: one-page judge pack with a 60-second review path, WebM visual hero, GIF demo frame, rubric snapshot, play link, Nightfall recovery signal, smoke-test link, theme fit, and receipt boundary.
- `JUDGE_REVIEW_CARD.md`: one-page judge card with the shortest public review path, award thesis, rubric evidence, and boundaries.
- `RUBRIC_SCORECARD.md`: source-first rubric map for theme relevance, creativity, technical execution, writing quality, and Best Ode to Alan Turing fit.
- `judge-manifest.json`: machine-readable judge manifest for prize target, rubric snapshot, public links, stable run receipt, required assets, verification commands, and non-secret boundaries.
- `smoke.html`: browser self-test that starts the game in an iframe, checks the deterministic demo-solve receipt, solves all four phases through public keyboard controls, and verifies the final score/status, shift counter, phase track, Rotor Trace, and completion receipt code.
- `proof-verifier.html`: local verifier for copyable `SC-4P-...` run receipts, with parsed phases, score, shifts, checksum facts, a prefilled sample receipt link, and `?receipt=` deep-link support from completed runs.
- `dev-article-final.md`: DEV-ready article draft using the official challenge tags and required overview/demo structure.
- `CHALLENGE_COMPLIANCE.md`: official-route checklist for tags, demo media, code link, build notes, Turing category boundary, public launch no-go gate, and prize-claim boundary.
- `dev-launch-brief.md`: final DEV launch field list, URL checklist, no-go gate, and post-publish receipt template.
- `verification.html` and `verification-report.md`: public verification summary for smoke result, layout checks, media assets, and CI preflight.
- `public-preflight.ps1`: local and optional public URL preflight without pushing or submitting anything.
- `.github/workflows/verify.yml`: public CI preflight for source syntax, required assets, official DEV tags, and judge/smoke links.
- `tools/browser-smoke-check.mjs`: CI browser check that opens the real pages, verifies first-screen Hint, Demo Solve, `Start Run`, first-action grace, default-off Audio controls, score/receipt explanation, daylight meter, desktop canvas priority, mobile Run Path after the canvas, phase objective strip, Turing cue copy, Nightfall report, phase announcer, phase scoring ledger, Judge run summary, award signals, Rotor Trace, mobile canvas visibility, validates the run receipt and receipt-verifier query path, and waits for `smoke.html` to reach 71 PASS checks.
- `tools/build-package.ps1`: reproducible ZIP builder that packages exactly the tracked file set while preserving directories such as `.github/workflows/`, `demo-frames-v3/`, and `tools/`.
- `tools/build-cover.py`: reproducible DEV-friendly `1000x420` cover image builder.
- `tools/capture-public-media.mjs`: clean-browser media capture for desktop/mobile first screens, completion screenshots, and the seven `demo-frames-v3` frames; it asserts first-screen score/best/shifts start at zero so public assets do not inherit local review state.
- `tools/build-demo-gif.py`: reproducible GIF builder for the current seven-frame gameplay preview.
- `tools/launch-readiness-audit.mjs`: pre-publication readiness audit. `npm run audit:launch` reports local package readiness; `npm run audit:launch:public` also checks the missing public repo/Pages gate and reports `WAIT_USER_GATE` until launch is live.
- `tools/build-demo-video.mjs`: reproducible browser-recording builder for the current captioned `helioigma-demo.webm`; it writes capture scratch files under the system temp directory or `HELIOIGMA_VIDEO_WORK_DIR`.
- `tools/build-demo-webm.mjs`: fallback frame-based WebM builder using `demo-frames-v3`.
- `tools/verify-dev-article.mjs`: pre-publish guard that checks DEV front matter, required challenge sections, manifest-aligned public URLs, media version parameters, no stale slug, and no secret/local-staging strings.
- `tools/verify-media-freshness.mjs`: signature and timestamp guard that checks PNG, GIF, and WebM media are fresh relative to their source builders and frames.

## Public Publishing

Use `PUBLISHING.md` when the account owner is ready to create or approve the public GitHub repository. Recommended public URLs:

- Source: `https://github.com/OOYXLOO/helioigma`
- Try link: `https://ooyxloo.github.io/helioigma/`
- Auto demo: `https://ooyxloo.github.io/helioigma/?demo=1`

The package includes `.nojekyll` and social metadata so GitHub Pages can serve the game from the repository root.

## Local Launch Notes

These files are for the account owner and are not part of the judge's required review path:

- `dev-launch-brief.md`: compact launch-day brief for the account owner after the public Pages link exists.
- `dev-article-final.md`: DEV-ready article draft with the final title, tags, body, media links, and category boundary.
- `PUBLISHING.md`: repository, push, Pages, public URL, and preflight instructions for the human account gate.
- `publish-after-repo.ps1`: dry-run-by-default helper that checks the repo, runs local preflight, and can push with `-Push` after the public repo exists.
- The publish helper also parses the launch audit JSON and blocks public push unless it reports `READY_LOCALLY`, so the release path does not depend on a human noticing stale media, stale package evidence, or an unclean local tree.

## Human Gates

- DEV account login and final challenge post.
- Public hosting under the user's account.
- DEV login and final article with demo video upload.
- Any prize-claim, tax, or payout steps.

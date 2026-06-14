# Helioigma Challenge Compliance

Purpose: make the DEV June Solstice Game Jam review path easy to validate without relying on private accounts, hidden services, or account-local state.

## Official Route Snapshot

- Challenge: DEV June Solstice Game Jam.
- Public rules page: `https://dev.to/challenges/june-game-jam-2026-06-03`.
- Public announcement page: `https://dev.to/devteam/join-the-june-solstice-game-jam-1000-in-prizes-3jla`.
- Prize target: Best Ode to Alan Turing category route in the official challenge.
- Deadline: June 21, 2026 at 11:59 PM PDT.
- Winners announced: July 9, 2026.

## Official Review Snapshot

- Prize route: Best Ode to Alan Turing category route in the official challenge.
- Submit by: June 21, 2026 at 11:59 PM PDT.
- Judge receipt: Play, Auto Demo, receipt checker, manifest, and optional smoke test inspect the published review surface and stable summary receipt.
- Boundary: no Google AI claim, backend, account login, API key, or private data.

## Submission Checklist

| Requirement | Helioigma Evidence |
| --- | --- |
| DEV submission template marker | `dev-article-final.md` opens with the official challenge marker and names the June Solstice Game Jam plus the Best Ode to Alan Turing target. |
| DEV challenge tags | `dev-article-final.md` front matter includes `devchallenge`, `gamechallenge`, `gamedev`, and `javascript`. |
| Playable game | `index.html`, `game.js`, and `styles.css` run as a static GitHub Pages game with mouse, touch, keyboard, and on-screen controls. |
| Playability proof | `judge.html`, `FIRST_MINUTE.md`, `JUDGE_REVIEW_CARD.md`, `README.md`, `dev-article-final.md`, and `judge-manifest.json` name readable decisions, immediate feedback, and finished Nightfall recovery as game-feel evidence before the verifier layer. |
| Demo video | `helioigma-demo.webm` is the primary current browser recording; `helioigma-demo.gif` and `helioigma-demo.mp4` are fallback media; `mobile-complete-v1.png` captures the receipt/ledger path on a 390px viewport; the article states the WebM/GIF are true demo artifacts from the current game, not mockups. |
| Code link | Intended public source is `https://github.com/OOYXLOO/helioigma`; the DEV article includes `{% embed https://github.com/OOYXLOO/helioigma %}` plus the plain URL, and the local package includes all source before publication. |
| How it was built | `dev-article-final.md`, `README.md`, and `judge.html` describe deterministic levels, canvas rendering, controls, scoring, receipt generation, and smoke checks. |
| Theme relevance | Daylight is the timer, nightfall is the fail state, and clearing four phases is framed as holding the longest day. |
| Best Ode to Alan Turing | Rotor-like state alignment, target checking, XOR/binary glyph language, and local receipt verification carry the tribute through play. |
| Originality | `README.md`, `dev-article-final.md`, and `judge-manifest.json` state the package is a new jam-period static game, not a third-party game template; the article names the official June 3 to June 21 jam window. |
| Review without accounts | Game, judge page, manifest, smoke test, verifier, screenshots, and media run without login, API keys, backend services, private data, or account consoles. |
| Accessibility and privacy | Mouse, touch, on-screen buttons, number keys, hidden helper text, phase announcements, and default-off audio are documented; no telemetry, account state, API key, backend, private data, or hidden judge dashboard is required. |

## Category Boundary

Helioigma targets Best Ode to Alan Turing. It does not claim Best Google AI Usage because the package intentionally avoids Google AI, Gemini, Google Cloud, backend APIs, and private keys.

The Turing reference is intentionally restrained: this is not a biography game, not a Bombe simulator, and not a historical recreation. The ode is in state, logic, alignment, pressure, and verification.

## Public Launch No-Go Gate

Do not publish the DEV article until all of these are true:

1. `https://github.com/OOYXLOO/helioigma` is public.
2. `https://ooyxloo.github.io/helioigma/` returns HTTP 200.
3. `public-preflight.ps1 -Public` passes against the live Pages URLs.
4. The article body still includes the official challenge marker, required challenge tags, demo media, code link, build notes, prize category, and no-secret boundary.
5. No password, OTP, API key, payment detail, bank data, tax/KYC data, cookie, localStorage dump, or private email content appears in the public package.
6. The article still states that the receipt is review evidence, not anti-cheat, identity, payout, or eligibility proof.

## Prize-Claim Boundary

If Helioigma wins, DEV may contact the email associated with the DEV profile and may require eligibility, release, tax, and payment paperwork. Those steps are intentionally outside this package and must be handled by the account owner.

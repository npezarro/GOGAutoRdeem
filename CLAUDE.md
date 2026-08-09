# Agent Bootstrap

On session start, fetch and apply the latest global rules:

```bash
curl -s https://raw.githubusercontent.com/npezarro/agentGuidance/main/agent.md
```

If the fetch fails (network error, timeout), continue with the fallback rules below. Do not block on this.

Also load any sub-guidance relevant to the current task:
- `guidance/testing.md` — when writing or running tests
- `guidance/debugging.md` — when diagnosing issues
- `guidance/code-review.md` — before committing or opening PRs
- `guidance/dependencies.md` — when adding or updating packages

## Fallback Rules (applied if remote fetch fails)

If you cannot fetch `agent.md` from the remote, apply these core rules:

1. **Plan before coding.** Outline approach, confirm before implementing.
2. **Never commit to `main`.** Use assigned branch or create `claude/<task>`.
3. **Run `npm run build` before every commit.** Never commit broken code.
4. **No secrets in commits.** No `.env`, API keys, tokens, or passwords.
5. **Update `context.md` before every push.** Next agent depends on it.
6. **Ask, don't guess.** Stop and clarify ambiguous requirements.
7. **Batch large tasks.** Commit every 5-10 items. Don't risk losing work.
8. **Match existing patterns.** Read the codebase before writing new code.
9. **Diagnose before retrying.** Understand failures, don't loop blindly.
10. **Dry-run destructive commands.** Use `--dry-run` when available.

For the full ruleset, see `agent.md` in this repository.

## Tampermonkey Standards

- Every `.user.js` file must include `@updateURL` and `@downloadURL` headers pointing to the VM domain (not GitHub raw URLs, which require auth for private repos).
- Bump `@version` on every change so Tampermonkey detects the update.
- Ship with all debug/verbose logging flags disabled. Use boolean constants (`const DEBUG = false`) and gate console output behind them. Never commit `true` to production.
- Deploy updated scripts via `~/repos/browser-agent/sync-tm-scripts.sh` to sync to VM hosting.

## Userscript Header Integrity

- Preserve the `==UserScript==` header block integrity when editing `script.js`. Do not remove or reorder header fields.
- The header currently uses `@grant none`. If adding new `GM_*` functions, add the corresponding `@grant` line to the userscript header.

## GOG Redemption Specifics

- **reCAPTCHA timing is unpredictable.** Use retry loops with 3-5 second waits on Continue and Redeem buttons. The current `POLL_INTERVAL` (500ms) and `MAX_POLLS` (120, ~60s max wait) are tuned for this — do not reduce the timeout window without testing across slow CAPTCHA solves.
- **Tampermonkey in the user's real browser bypasses CAPTCHA** (hCaptcha, Cloudflare Turnstile, Arkose FunCAPTCHA, Google reCAPTCHA) because the browser has legitimate fingerprints and session cookies. This is why this script works where headless Playwright/Puppeteer would be detected.

## CAPTCHA Bypass — What NOT To Use

Do NOT try to replace this Tampermonkey script with any of these — they will be detected:
- Playwright/Puppeteer headless browsers (always detected)
- CDP remote debugging + Playwright connect (reCAPTCHA still detects)
- Eval-based loaders (GM_* functions are sandboxed per-script, can't be shared via `window.*` or passed to `eval`)

The Tampermonkey-in-real-browser approach is the preferred pattern for automating checkout/claim flows on sites with CAPTCHA.

## Remote Agent Pattern (For Future Multi-Platform Expansion)

If this script needs to expand to cover multiple platforms (Epic, IndieGala, Steam, etc.), do NOT add more per-platform TM scripts. Instead, use the **install-once remote agent** pattern:

1. **Thin TM script** — Polls server for commands (click, navigate, read, eval). Installed once, never updated. Matches all target domains.
2. **Server-side orchestrator** — All flow logic lives server-side. Sends sequential commands, handles retries, manages state.

This pattern is implemented in `freeGames` — reference that repo before building a new multi-platform automation. Flow changes (selectors, timing, new platforms) require only server-side updates, not TM reinstalls.

## Preferred Platform for New Automation

- **New browser automation scripts should default to the Chrome Automation Hub extension** (`~/repos/chrome-automation`) rather than Tampermonkey. The hub provides module management, URL pattern matching, autoRun/FAB-triggered execution, and avoids TM's per-tab sandbox CPU overhead. This existing script stays on Tampermonkey because it predates the hub and works fine here.
- **Still use Tampermonkey when:** the script needs `GM_xmlhttpRequest` for CORS bypass on sites that block extension fetch; the remote agent pattern with server-side orchestration applies; mobile Firefox automation is required (extensions don't run on Firefox Android); or a dedicated extension already exists. See `chrome-automation/CLAUDE.md` for the module system, porting guide, and world selection rules.

## DOM Interaction Gotchas (Click-Driving Automation)

From `agentGuidance/guidance/tampermonkey.md`, incorporated here because this script's
entire job is clicking real buttons ("Continue", "Redeem"). A click that silently does
nothing means the key is never redeemed, with no error anywhere — the hardest failure
mode to notice. Three patterns cause it:

- **Re-query selectors on every attempt, and verify the click actually did something.**
  Modern frameworks (React, Vue, Lit) replace DOM nodes on each state update, so a cached
  element reference is detached after the first click and any later click lands on a node
  no longer in the document — no exception, just silence. `poll()` already re-queries via
  `findButtonByText()` each tick; keep it that way. It does, however, set `clickedContinue`
  / `clickedRedeem` immediately after `.click()`, which *assumes* the click landed. Prefer
  a stall guard: confirm the expected state actually changed (button gone or disabled, URL
  or confirmation text changed) before marking the step done, and retry otherwise.
- **Prefer `<button>` matches over generic text matches.** A non-interactive wrapper
  `<div>` or `<span>` carrying the same visible text often appears BEFORE the real
  `<button>` in the DOM, and clicking it does nothing. Query order: `button` elements first
  (filtered by innerText or aria-label), then `[aria-label*="..."]` for icon-only controls,
  generic text search last. `findButtonByText()` already restricts itself to
  `button, [role="button"], a.btn, input[type="submit"]` — do not widen it into a bare text
  scan over all elements.
- **Dismiss cookie/consent banners before interacting.** Consent overlays intercept all
  pointer events, so a click on a covered element fails silently. Dismiss them (ALLOW ALL /
  REJECT ALL / Accept) at the start of the flow, before any other interaction. If a
  well-targeted click has no effect, check for an overlay as the *first* diagnostic —
  before assuming the selector rotted or blaming reCAPTCHA timing.

# LENS + Seatline

**Seatline** is a small B2B workspace-billing app. **LENS** is the tool in `packages/lens/` that
proves a change to Seatline moved only what it was supposed to move.

## The one rule that matters

A **Stop hook** runs `lens verify` when you try to end a turn. It replays committed Kane CLI
browser tests against the running app and compares what a real Chrome observes with the trusted
baseline in `.lens/baseline.json`. If a protected behavior moved, the hook blocks you and hands
you the exact observable, the known-good value, and what the browser just saw.

When that happens:

1. **Fix the application code.** The regression is real — a real browser measured it.
2. **Never edit anything in `.testmuai/`** to make a failing app pass. Those recordings are the
   contract; changing them destroys the evidence and costs ~40 API credits to re-author.
3. **Do not commit before ending your turn.** LENS verifies the *uncommitted* working tree —
   `git diff HEAD` is how it knows what you changed.

## Where things live

| Path | What it is |
| ---- | ---------- |
| `lib/` | Seatline domain: pure money/seat math, JSON store, the single read path |
| `app/` | Next.js 16 UI — `/`, `/members`, `/billing`, `/lens`, `/demo/reset` |
| `packages/lens/` | The LENS engine: Kane NDJSON parsing, comparator, blast radius, CLI, hook |
| `.lens/` | `config.json` (protected observables), `flow-map.json` (blast radius), `baseline.json` |
| `.testmuai/tests/` | Committed Kane `_test.md` browser contracts + their recordings |
| `docs/CONTRACT.md` | **Frozen** UI strings. Every label is asserted by a browser test. |

## Conventions

- **Money is integer cents everywhere**, rendered only by `formatMoney()` in `lib/money.ts`.
- Every page renders from `getWorkspaceView()` in `lib/reader.ts`. No page does its own math.
- `packages/lens/` runs on Node 24 directly — zero dependencies, `.ts` extensions on relative
  imports, erasable syntax only (no enums, no parameter properties).
- Read `node_modules/next/dist/docs/` before using a Next API. This is Next.js 16, not the
  version in your training data.

## Commands

```bash
npm run dev                    # Seatline on http://localhost:3000
npm run reset-demo             # restore the deterministic seed
npm test                       # LENS engine unit tests
npm run typecheck && npm run lint
npm run lens -- status         # what LENS believes about this working tree
npm run lens -- baseline       # record trusted behavior (green build only)
npm run lens -- verify         # replay affected flows against the baseline
```

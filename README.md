# LENS

**AI changes one thing. LENS proves nothing else moved.**

LENS is a semantic regression gate for AI-written software.

Coding agents are increasingly capable of implementing the feature you ask for. The dangerous
regressions are the behaviors you never asked them to touch.

LENS records a known-good application's semantic browser state with [Kane CLI](https://www.testmuai.com/support/docs/kane-cli-introduction).
When Claude Code changes the application, LENS maps the diff to potentially affected business
flows, replays those flows in real Chrome, and compares what Kane actually observes against the
trusted baseline.

An unexpected behavioral delta blocks Claude from finishing. The Kane failure and evidence are
fed back to the agent, the agent repairs the regression, and Kane runs again.

The browser — not the coding agent — decides when the change is safe to ship.

---

## The failure it catches

The request was one sentence:

> Add annual billing to Seatline. Annual customers should receive a 10% discount, show the
> savings clearly in the billing breakdown, and keep monthly billing unchanged.

The feature works. The annual discount is correct. Removing a member still visibly removes them.
Every assertion in the test suite passes.

And yet:

```text
LENS BLOCKED COMPLETION

1 unexpected behavioral change:

  Flow         Member removal (member-removal)
  Observable   billable_seats
  Known-good   4
  Candidate    5
  Kane run     https://test-manager.lambdatest.com/…

The requested change — "Add annual billing with a 10% discount" — does not authorize
this behavior to move.
```

The pricing refactor quietly started counting *all* members instead of *active* members. The
members page still shows four people. The invoice still bills for five. No assertion in the
suite was watching that number, because no one thought to write one — that is exactly the class
of regression LENS exists to find.

---

## How it works

```text
known-good build ──▶ kane replays committed browser contracts ──▶ .lens/baseline.json
                                                                          │
  "add annual billing" ──▶ Claude Code edits the app                      │
                                    │                                     │
                          Claude tries to end its turn                    │
                                    │                                     │
                          LENS Stop hook fires                            │
                                    │                                     │
                  git diff ──▶ flow map ──▶ affected business flows       │
                                    │                                     │
                    kane replays those flows in real Chrome               │
                                    │                                     │
                    semantic observations ◀────────────────────────────────
                                    │
                       ┌────────────┴────────────┐
                  same behavior            something moved
                       │                         │
                  allow the stop        exit 2 · agent cannot finish
                                                 │
                                        evidence back to Claude
                                                 │
                                        Claude repairs · Kane re-runs
```

**Traditional testing asks:** does the new build satisfy this assertion?
**LENS asks:** outside the behavior we intentionally changed, does the new build still behave
like the version we trusted?

---

## Kane CLI is the browser truth engine

LENS does not simulate a browser, and it does not ask a model whether the app looks right. Every
value it compares was read out of a real Chrome by Kane:

| Kane surface | How LENS uses it |
| --- | --- |
| `_test.md` contracts | Committed, human-readable browser flows in `.testmuai/tests/` |
| `--agent` NDJSON | The only machine-readable channel LENS parses |
| `test_md_summary` | The authoritative per-file verdict — **not** the first `run_end`, which is only step one |
| `final_state` + `context.memory` | Where `store … as` observations actually land; LENS mines all three sources |
| Cached replay | Committed recordings make verification runs free and fast |
| `test_url` | Every unexpected delta links to the Kane run that proves it |

---

## Seatline, the app under test

A five-member B2B workspace on a $20/seat plan. Small on purpose: every number LENS verifies is
visible in the browser, and the business rules are interconnected enough that a change to one
can quietly move another.

| Route | What it shows |
| --- | --- |
| `/` | Active members, billable seats, subtotal, discount, total |
| `/members` | The member table, invite form, remove and role controls |
| `/billing` | Plan, seat math, cadence toggle, discount breakdown |
| `/lens` | The LENS verification dashboard |
| `/demo/reset` | One-URL deterministic reseed — step one of every browser contract |

---

## 30-second judge path

```bash
npm install
npm run dev                     # Seatline on http://localhost:3000
npm run lens -- status          # what LENS believes about this working tree
npm run lens -- verify          # replay the affected flows against the baseline
```

Then open **http://localhost:3000/lens**.

Recordings for all four flows are committed, so `verify` replays from cache — no authoring cost.
`kane-cli login` is required for replay; see `.env.example` for the one variable involved.

---

## Repository layout

```text
app/                    Seatline UI + the /lens dashboard (Next.js 16, Server Components)
lib/                    Domain: integer-cent money math, JSON store, one read path
packages/lens/          The LENS engine — zero dependencies, runs on Node 24 directly
  kane.ts               NDJSON parsing and the Kane run contract
  comparator.ts         Semantic comparison of protected observables
  flow-map.ts           git diff → behavioral blast radius
  baseline.ts           Records trusted browser behavior
  verify.ts             Replays the candidate and compares
  cli.ts                lens baseline | verify | hook | status
.lens/                  config.json · flow-map.json · baseline.json
.testmuai/tests/        Committed Kane browser contracts + their recordings
.claude/settings.json   The Stop hook. This file is the product.
docs/CONTRACT.md        Frozen UI strings — every label is asserted by a browser test
```

## Commands

```bash
npm run dev                    # Seatline on :3000
npm run reset-demo             # restore the deterministic seed
npm test                       # LENS engine unit tests (node:test, no dependencies)
npm run typecheck && npm run lint
npm run lens -- baseline       # record trusted behavior (green build only)
npm run lens -- verify         # replay affected flows and compare
```

## How this was built

Seatline and the LENS engine were written with Claude Code, and LENS's Stop hook was then pointed
at Claude Code itself — the gate runs against the agent that built it. The `_test.md` browser
contracts were authored by Kane CLI against the running app and committed with their recordings.
Nothing in the verification path is mocked: every baseline and every verdict in `.lens/` came
from a real Chrome.

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

Everything below is real output from this repository, produced on 2026-08-21 by Kane CLI driving
a real Chrome. See [*How the demo regression was produced*](#how-the-demo-regression-was-produced)
for exactly which part of it was deliberate.

The request is one sentence:

> Add annual billing to Seatline. Annual customers should receive a 10% discount, show the
> savings clearly in the billing breakdown, and keep monthly billing unchanged.

The feature works. Kane confirms it in the browser — the annual discount appears and the total
drops. Removing a member still visibly removes them. Nothing on screen looks wrong.

And yet the coding agent is stopped:

```text
LENS BLOCKED COMPLETION

2 unexpected behavioral changes:

  Flow         Member removal (member-removal)
  Observable   billable_seats
  Known-good   4
  Candidate    5

  Flow         Member removal (member-removal)
  Observable   monthly_total
  Known-good   $80.00
  Candidate    $100.00

The requested change does not authorize this behavior to move.
```

Here is the whole comparison LENS ran, verbatim:

```text
BLOCKED — 2 unexpected behavioral change(s)

  changed files   1
  flows replayed  billing, member-removal, member-invite, role-change

  Billing  [passed]
      billable_seats       5            → 5            SAME
      price_per_seat       $20.00       → $20.00       SAME
      monthly_subtotal     $100.00      → $100.00      SAME
      annual_discount      $0.00        → $10.00       EXPECTED
      billing_total        $100.00      → $90.00       EXPECTED
  Member removal  [passed]
      active_members       4            → 4            SAME
      billable_seats       4            → 5            UNEXPECTED
      monthly_total        $80.00       → $100.00      UNEXPECTED
  Member invite  [failed]
      active_members       6            → 6            SAME
      billable_seats       6            → 6            SAME
      monthly_total        $120.00      → null         MISSING
  Role changes  [passed]
      sarah_role           Admin        → Admin        SAME
      billable_seats       5            → 5            SAME
      monthly_total        $100.00      → $100.00      SAME
```

Read the four blocks in order, because each one is doing separate work:

**Billing passed.** The flow that was actually edited is clean. The discount moved from `$0.00`
to `$10.00` and the total from `$100.00` to `$90.00` — both marked `EXPECTED`, because the change
request authorized exactly those two observables to move. The feature shipped correctly.

**Member removal caught it.** Nobody touched member removal. The removal still works — Maya
disappears, `active_members` still reads `4`. But the workspace is now billed for **five** seats
and **$100.00** instead of four and `$80.00`. A member who was removed is still being charged for.

**Member invite reported `MISSING`, not `SAME`.** The browser could not read that value on this
run. LENS does not treat silence as evidence of equivalence — an observable it could not see is an
observable it cannot certify.

**Role changes passed.** Correctly unaffected. LENS replayed it anyway, because the diff touched
shared math and LENS does not guess.

That is the whole thesis in one table: the feature is right, the tests all pass, and something
nobody asked about moved anyway.

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
| `/` | The LENS landing page |
| `/overview` | Active members, billable seats, subtotal, discount, total |
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
npm run lens -- verify --all    # replay every trusted flow against the baseline
```

Then open **http://localhost:3000/lens**.

Recordings for all four flows are committed, so `verify` replays from cache — no authoring cost.
Replay needs a Kane session (`kane-cli login`); LENS itself has no secrets, and `.env.example`
says so explicitly. Everything it configures lives in `.lens/config.json` and
`.testmuai/variables/local.json`, both committed.

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
npm run lens -- verify --all   # replay every trusted flow and compare
```

## What the browser contracts actually cost

Authored once against the running app, on 2026-08-21:

| Contract | Steps | Authoring time | Credits |
| --- | --- | --- | --- |
| `remove-member_test.md` | 7/7 passed | 285s | 33.9 |
| `invite-member_test.md` | 9/9 passed | 282s | 57.6 |
| `role-change_test.md` | 7/7 passed | 246s | 52.0 |
| `annual-billing_test.md` | 8/8 passed | 285s | 55.6 |
| | **31/31** | **~18 min** | **199.1** |

Every one of those recordings is committed. Replays cost nothing and are the only thing the Stop
hook ever runs, which is what makes it viable to gate an agent on a real browser rather than on a
unit test.

## How the demo regression was produced

Being precise about this, because it is the one thing worth being precise about.

**The feature was implemented correctly.** Annual billing — 10% off the seats actually billed,
monthly untouched — was written and verified green on the first run. All four protected flows came
back with zero unexpected deltas. That run is committed at `.lens/verified-run.json`, and it is
real.

**The seat-counting regression was then introduced deliberately**, to show the gate closing:
`billableSeats()` was changed to count every member on record instead of only active ones. That is
a planted bug. No AI agent produced it by accident, and this README is not going to imply one did.

**Everything downstream of that edit is untouched and real.** LENS mapped the one-file diff to four
business flows on its own. Kane replayed all four in real Chrome. The values in the tables above
are what the browser rendered — `billable_seats = 5` on a workspace with four active members, and
`monthly_total = $100.00` on a bill that should have read `$80.00`. Nothing was staged, stubbed, or
edited to make the demo work. Both runs are committed: `.lens/verified-run.json` (green) and
`.lens/blocked-run.json` (blocked).

The regression is not in the shipped code. `lib/seatline.ts` bills active members, as it always did.

## How this was built

Seatline and the LENS engine were written with Claude Code, and LENS's Stop hook was then pointed
at Claude Code itself — the gate runs against the agent that built it. The `_test.md` browser
contracts were authored by Kane CLI driving real Chrome against the running app, and committed
along with their recordings.

Nothing in the verification path is mocked. Every value in `.lens/baseline.json` was read out of a
live browser; the engine's 28 unit tests use an injected fake Kane runner so the *verdict logic*
can be tested without spending credits, but no baseline and no verdict in `.lens/` ever comes from
a fake.

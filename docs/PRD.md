# LENS

### Semantic regression detection for AI-written software

**Tagline:**  
**AI changes one thing. LENS proves nothing else moved.**

**One-line pitch:**  
LENS is a behavioral verification gate for AI coding agents that uses Kane CLI to compare the real browser behavior of a known-good application with the AI-modified version, blocking the agent when it introduces an unintended semantic change.

---

# 1. Product thesis

AI coding agents are increasingly good at implementing the feature they were asked to build.

The harder problem is everything they were **not** asked to change.

A request such as:

> “Add a 10% annual-plan discount.”

may successfully produce the discount while silently changing:

- seat counting,
- cancellations,
- permissions,
- refunds,
- billing state,
- inventory,
- lifecycle transitions.

Traditional testing asks:

> Does the new build satisfy this assertion?

LENS asks:

> **Outside the behavior we intentionally changed, does the new build still behave like the version we trusted before?**

Kane CLI provides the browser ground truth.

LENS provides the differential reasoning and enforcement layer around it.

---

# 2. Core product

LENS is a developer tool installed into an AI-built repository.

The lifecycle is:

```text
Known-good application
        │
        ▼
LENS BASELINE
        │
Kane runs important browser flows
        │
stores semantic observations
        │
        ▼
baseline.json
        │
        │
USER REQUEST
"Add annual discount"
        │
        ▼
CLAUDE CODE
        │
changes application
        │
        ▼
CLAUDE ATTEMPTS TO FINISH
        │
        ▼
LENS STOP HOOK
        │
reads git diff
        │
maps files → business flows
        │
        ▼
KANE CLI
real Chrome against candidate
        │
        ▼
semantic observations
        │
        ▼
BASELINE ↔ CANDIDATE
        │
    ┌───┴────┐
    │        │
 expected   unexpected
 change      change
    │        │
    ✓        ✕
             │
      CLAUDE CANNOT STOP
             │
      failure + evidence
             │
             ▼
         CLAUDE FIXES
             │
             ▼
          KANE AGAIN
             │
             ▼
          VERIFIED
```

The browser — not Claude — decides when the work is done.

---

# 3. Demo application: Seatline

## What Seatline is

Seatline is a small B2B SaaS workspace billing dashboard.

Do **not** build a huge SaaS.

Seatline exists to give LENS interconnected business behavior with consequences that are easy for judges to understand.

### Workspace

**Acme Studio**

### Plan

Pro — **$20 / active seat / month**

### Initial state

```text
Active members:     5
Billable seats:     5
Monthly subtotal: $100
Discount:           $0
Monthly total:    $100
```

### Main screens

#### `/`

Overview.

Show:

- active members
- billable seats
- plan
- billing cadence
- subtotal
- discount
- total

#### `/members`

Table:

```text
Maya      Admin    Active
Daniel    Member   Active
Sarah     Member   Active
Victor    Member   Active
Jon       Member   Active
```

Actions:

- Invite
- Remove
- Change role

#### `/billing`

Show:

- plan
- active seats
- price per seat
- subtotal
- annual discount
- total

Toggle:

```text
Monthly
Annual — Save 10%
```

#### `/lens`

LENS verification dashboard.

This is the important visual screen.

---

# 4. Seatline business invariants

LENS must have four meaningful browser flows.

## Flow A — Member removal

Remove Maya.

Expected user behavior:

```text
Active members:
5 → 4

Billable seats:
5 → 4
```

Important:

The Kane flow should **assert that Maya is removed**, but **store** the billable seat count separately.

Example semantic output:

```json
{
  "active_members": "4",
  "billable_seats": "4",
  "billing_cadence": "monthly"
}
```

The important trick:

Kane can legitimately report the visible member-removal flow as passed even if an unasserted billing observable drifts.

LENS compares that semantic state against the known-good baseline.

---

## Flow B — Invite member

Invite:

```text
Alex Morgan
alex@example.com
```

Expected:

```text
Active members:
5 → 6

Billable seats:
5 → 6
```

Store:

```text
active_members
billable_seats
monthly_subtotal
```

---

## Flow C — Role change

Change Sarah:

```text
Member → Admin
```

Expected:

```text
Role changes
Billable seats remain unchanged
Subtotal remains unchanged
```

Store:

```text
sarah_role
billable_seats
monthly_subtotal
```

---

## Flow D — Billing

Monthly state:

```text
5 seats × $20 = $100
```

Annual state:

```text
Subtotal:     $100
Discount:      $10
Equivalent:    $90
```

This is the feature Claude will change during the demo.

---

# 5. The demo change

The live Claude request:

> Add annual billing to Seatline. Annual customers should receive a 10% discount, show the savings clearly in the billing breakdown, and keep monthly billing unchanged.

Claude implements it.

The intended behavior:

```text
Annual discount:
$0 → $10

Annual equivalent:
$100 → $90
```

Everything unrelated should remain unchanged.

---

# 6. The regression LENS catches

The pricing refactor accidentally changes seat calculation from:

```text
active members
```

to:

```text
all members
```

This means removing a member visually works:

```text
Members displayed: 4
```

but billing still contains:

```text
Billable seats: 5
```

This is ideal because:

### The requested feature works.

```text
Annual discount: ✓
$100 → $90
```

### The normal removal UI works.

```text
Maya disappears: ✓
```

### But something unrelated silently changed.

```text
Billable seats
BASELINE:   4
CANDIDATE:  5

UNEXPECTED SEMANTIC DELTA
```

That is LENS's money shot.

If Claude naturally creates a different meaningful regression during development, preserve that instead.

Do not falsely claim an intentionally injected bug was accidental.

---

# 7. How Kane CLI is used

Install:

```bash
npm install -g @testmuai/kane-cli
kane-cli login
npx @testmuai/kane-cli-skill
```

Kane automation must use:

```bash
--agent
--headless
```

LENS parses the final stable:

```text
run_end
```

event.

Example:

```bash
kane-cli testmd run \
  .testmuai/tests/remove-member_test.md \
  --agent \
  --headless \
  --variables '{"base_url":"http://localhost:3000"}'
```

Every persistent verification should be a committed `_test.md` test.

The tests must use Kane's **store-as** behavior for semantic observations.

Example concept:

```markdown
# Remove member

## Open members
Open {{base_url}}/members.

## Remove Maya
Remove Maya from the workspace and verify she no longer appears as an active member.

## Observe workspace state
Store the visible active member count as "active_members".
Store the visible billable seat count as "billable_seats".
Store the billing cadence as "billing_cadence".
```

The baseline `run_end.final_state` becomes:

```json
{
  "active_members": "4",
  "billable_seats": "4",
  "billing_cadence": "monthly"
}
```

Candidate might return:

```json
{
  "active_members": "4",
  "billable_seats": "5",
  "billing_cadence": "monthly"
}
```

Kane provides the observation.

LENS identifies the behavioral change.

---

# 8. Baseline system

Command:

```bash
lens baseline
```

For hackathon implementation it may actually be:

```bash
npm run lens -- baseline
```

Do not waste time publishing npm unless everything else is complete.

### Baseline behavior

1. Verify git working tree is clean.
2. Reset Seatline to deterministic seed.
3. Run the four Kane `_test.md` flows.
4. Parse each `run_end`.
5. Store:
   - status
   - `final_state`
   - summary
   - test name
   - timestamp
   - evidence/run location
   - baseline git SHA
6. Write:

```text
.lens/baseline.json
```

Example:

```json
{
  "commit": "abc123",
  "flows": {
    "remove-member": {
      "status": "passed",
      "state": {
        "active_members": "4",
        "billable_seats": "4",
        "billing_cadence": "monthly"
      }
    }
  }
}
```

Only a green baseline can become trusted.

---

# 9. Flow map

Create:

```text
.lens/flow-map.json
```

Purpose:

Map implementation areas to behaviors they can affect.

Example:

```json
{
  "src/lib/billing/**": [
    "billing",
    "member-removal",
    "member-invite",
    "role-change"
  ],
  "src/app/billing/**": [
    "billing"
  ],
  "src/app/members/**": [
    "member-removal",
    "member-invite",
    "role-change",
    "billing"
  ],
  "src/lib/members/**": [
    "member-removal",
    "member-invite",
    "role-change",
    "billing"
  ]
}
```

Do NOT spend the hackathon building perfect AI blast-radius inference.

Deterministic file-glob → flow mapping is enough.

In the dashboard call it:

**Behavioral blast radius**

because that is what the product conceptually represents.

---

# 10. Candidate verification

Command:

```bash
lens verify
```

Algorithm:

```text
git diff
    ↓
changed filenames
    ↓
flow-map.json
    ↓
affected flows
    ↓
reset deterministic fixture
    ↓
Kane replay
    ↓
parse run_end.final_state
    ↓
compare protected semantic keys
    ↓
verdict
```

For each semantic field produce:

```text
SAME
EXPECTED_CHANGE
UNEXPECTED_CHANGE
```

MVP only needs:

```text
SAME
UNEXPECTED_CHANGE
```

for protected flows.

The new annual-discount test proves the intended feature separately.

---

# 11. Semantic comparison

Implement a very small comparator.

Example:

```text
FLOW: member-removal

active_members

baseline:  4
candidate: 4

SAME ✓


billable_seats

baseline:  4
candidate: 5

UNEXPECTED CHANGE ✕


billing_cadence

baseline:  monthly
candidate: monthly

SAME ✓
```

Ignore:

- timestamps
- generated IDs
- Kane session IDs
- evidence URLs

Only compare declared semantic keys.

Config example:

```json
{
  "member-removal": {
    "protect": [
      "active_members",
      "billable_seats",
      "billing_cadence"
    ]
  }
}
```

---

# 12. Claude Code integration

Create:

```text
.claude/settings.json
.claude/hooks/lens-stop.sh
```

Use a **Stop hook**.

The hook runs after Claude attempts to finish.

Pseudo behavior:

```text
Claude tries to stop
       ↓
lens verify
       ↓
PASS
       ↓
allow stop

or

FAIL
       ↓
return blocking feedback
       ↓
Claude keeps working
```

When blocked, return something like:

```text
LENS BLOCKED COMPLETION

Unexpected behavioral delta:

Flow:
member-removal

Observable:
billable_seats

Known-good:
4

Candidate:
5

The requested annual-discount change does not authorize
member-removal billing behavior to change.

Kane run:
<reference>

Fix the regression and allow LENS to re-run.
```

Use Claude's project-level committed hook configuration.

Important:

Handle `stop_hook_active` so the hook cannot create an infinite loop.

Use a maximum attempt count:

```text
3
```

After the cap:

```text
HUMAN REVIEW REQUIRED
```

Do not burn all Kane credits indefinitely.

---

# 13. `/lens` dashboard

This should be visually excellent but simple.

## Header

```text
LENS

Behavioral verification for AI-written software
```

Top right:

```text
KANE CLI
CONNECTED
```

---

## Current change card

```text
CHANGE REQUEST

Add annual billing with a 10% discount

Agent
Claude Code

Changed files
6
```

---

## Behavioral blast radius

Visual rows:

```text
Billing                 HIGH
Member removal          HIGH
Member invite           MED
Role changes            MED
```

---

## Verification result

Big centerpiece:

```text
1 UNEXPECTED
BEHAVIORAL CHANGE
```

---

## Comparison table

```text
FLOW             OBSERVABLE       BASELINE     CANDIDATE

Annual billing   discount         $0           $10
                                  EXPECTED ✓

Member removal   active members   4            4
                                  SAME ✓

Member removal   billable seats   4            5
                                  UNEXPECTED ✕

Role change      billable seats   5            5
                                  SAME ✓
```

---

## Evidence card

```text
KANE OBSERVATION

Member removal

✓ User removed successfully

Observed:
billable_seats = 5

Expected known-good state:
billable_seats = 4

[VIEW KANE EVIDENCE]
```

---

## Agent timeline

```text
16:42  Claude modified billing calculator

16:43  LENS selected 3 affected flows

16:43  Kane verification started

16:44  Unexpected semantic delta found

16:44  Claude blocked from stopping

16:45  Claude repaired active-seat calculation

16:45  Kane re-verification

16:46  VERIFIED
```

When green:

# SAFE TO SHIP

---

# 14. Repository structure

Use:

```text
lens/
│
├── app/
│   ├── page.tsx
│   ├── members/
│   ├── billing/
│   └── lens/
│
├── components/
│
├── lib/
│   ├── billing.ts
│   ├── members.ts
│   └── db.ts
│
├── packages/
│   └── lens/
│       ├── cli.ts
│       ├── baseline.ts
│       ├── verify.ts
│       ├── kane.ts
│       ├── comparator.ts
│       ├── flow-map.ts
│       └── types.ts
│
├── .lens/
│   ├── config.json
│   ├── flow-map.json
│   ├── baseline.json
│   └── runs/
│
├── .testmuai/
│   └── tests/
│       ├── remove-member_test.md
│       ├── invite-member_test.md
│       ├── role-change_test.md
│       └── annual-billing_test.md
│
├── .claude/
│   ├── settings.json
│   └── hooks/
│       └── lens-stop.sh
│
├── scripts/
│   └── reset-demo.ts
│
└── README.md
```

---

# 15. Stack

Keep it boring.

### Application

- Next.js
- TypeScript
- Tailwind
- SQLite

### LENS engine

- TypeScript
- Node child processes
- `git diff`
- Kane CLI
- JSON files

### Agent

- Claude Code

Do not add:

- Kafka
- Redis
- Docker orchestration
- vector databases
- extra LLM APIs
- unnecessary queues
- auth
- payments
- multi-tenancy

They do not help the judging.

---

# 16. Deterministic data

This is critical.

Every Kane flow must begin from exactly the same state.

Implement:

```bash
npm run reset-demo
```

Seed:

```json
{
  "workspace": "Acme Studio",
  "plan": "Pro",
  "pricePerSeat": 20,
  "billingCadence": "monthly",
  "members": [
    "Maya",
    "Daniel",
    "Sarah",
    "Victor",
    "Jon"
  ]
}
```

Kane tests must never depend on leftover state from the previous run.

---

# 17. What makes LENS different

Do not market it as:

> Better E2E testing.

Do not market it as:

> Self-healing AI.

Do not market it as:

> Run Kane whenever Claude changes code.

Those ideas are already crowded.

The message is:

> **LENS detects semantic side-effects outside the requested change.**

Traditional:

```text
Did new feature work?
✓
SHIP
```

LENS:

```text
Did new feature work?
✓

Did protected behavior remain equivalent?
✕

BLOCK
```

That is the category.

---

# 18. Kane-specific depth

The project must visibly use Kane's unique surfaces.

Required:

### `--agent`

Structured NDJSON.

### `run_end`

Single authoritative machine-readable result.

### `final_state`

Semantic observed browser state.

### `_test.md`

Readable, committed browser contracts.

### Cached replay

Reuse recorded flows.

### Evidence

Link each unexpected delta to the Kane run proving the observed state.

Do not hide Kane behind your abstraction.

Judges should immediately understand:

> **Kane is LENS's browser truth engine.**

---

# 19. P0 — MUST SHIP

Do these in order.

## P0.1

Working Seatline:

- dashboard
- members
- billing
- annual toggle

## P0.2

At least **two** genuine Kane tests.

Must include:

- member removal
- annual billing

## P0.3

Kane test stores semantic values.

Must prove `final_state` parsing works.

## P0.4

`lens baseline`

Stores baseline semantic observations.

## P0.5

`lens verify`

Runs candidate and detects:

```text
billable_seats:
4 → 5
```

## P0.6

Claude Stop hook.

Claude cannot finish when LENS is red.

## P0.7

Claude fixes regression.

Hook reruns.

Kane turns green.

## P0.8

`/lens` dashboard showing the entire story.

## P0.9

Record the successful end-to-end demo immediately.

Everything after this is optional.

---

# 20. P1 — only after the demo works

Add:

- four total business flows
- risk labels
- evidence links
- attempt history
- flow-map visualization
- beautiful README diagram
- `lens init`
- GitHub Action

---

# 21. Explicitly out of scope

Do not build before submission:

- automatic general-purpose repository analysis
- AI-generated flow maps
- arbitrary framework support
- remote hosted execution
- team accounts
- billing
- plugins
- browser matrix
- production persistence
- complex requirement ingestion

The hackathon version proves the thesis.

---

# 22. Demo sequence

## 0:00–0:08

Open immediately:

```text
FEATURE TEST
✓ PASSED

LENS
✕ SHIP BLOCKED
```

Say:

> “I asked Claude to change one thing. It changed two.”

---

## 0:08–0:25

> “AI coding agents verify whether the feature they added works. LENS verifies that everything they weren't asked to change still behaves like the trusted version.”

Show LENS dashboard.

---

## 0:25–0:45

Show known-good baseline.

```text
Member removal

active members:  4
billable seats:  4
```

Explain:

> “Kane records semantic browser state, not screenshots or selectors.”

---

## 0:45–1:05

Claude Code:

> “Add annual billing with a 10% discount.”

Watch it change the application.

---

## 1:05–1:25

Annual feature:

```text
$100
-$10
$90
```

Kane:

```text
✓ Annual billing passed
```

Pause.

> “The requested feature works.”

---

## 1:25–1:50

Then show LENS:

```text
UNEXPECTED CHANGE

member-removal

billable_seats

baseline   4
candidate  5
```

Say:

> “But LENS asked Kane to replay the neighboring behavior too.”

This is the money shot.

---

## 1:50–2:10

Show Claude attempting to finish.

Stop hook blocks it.

```text
Completion blocked by LENS.

Expected: 4
Observed: 5
```

Claude receives the failure.

---

## 2:10–2:30

Claude fixes billing logic.

Kane reruns.

```text
Annual billing       ✓
Member removal       ✓
Protected semantics  ✓
```

---

## 2:30–2:48

Dashboard:

# VERIFIED

```text
Requested changes        1
Protected flows          3
Unexpected deltas        0

SAFE TO SHIP
```

---

## 2:48–2:58

Close:

> **“AI shouldn't be trusted because the feature it wrote works. LENS uses Kane to prove it changed what you asked for — and nothing else.”**

End.

---

# 23. README opening

Use this structure:

```text
# LENS

AI changes one thing. LENS proves nothing else moved.

LENS is a semantic regression gate for AI-written software.

Coding agents are increasingly capable of implementing the feature you ask
for. The dangerous regressions are the behaviors you never asked them to
touch.

LENS records a known-good application's semantic browser state with Kane CLI.
When Claude Code changes the application, LENS maps the diff to potentially
affected business flows, replays those flows in real Chrome, and compares
what Kane actually observes against the trusted baseline.

An unexpected behavioral delta blocks Claude from finishing. The Kane failure
and evidence are fed back to the agent, the agent repairs the regression,
and Kane runs again.

The browser — not the coding agent — decides when the change is safe to ship.
```

Then immediately show the real failure.

Do not begin with installation instructions.

---

# 24. Submission positioning

### Product name

**LENS**

### Category

Semantic behavioral verification for AI-generated code.

### Tagline

**AI changes one thing. LENS proves nothing else moved.**

### Secondary line

**Kane provides the browser truth. LENS protects everything you didn't mean to change.**

### Coding agent

**Claude Code**

### Kane's role

Kane executes replayable business workflows in a real browser and returns semantic observations through structured `run_end` output. LENS uses those observations to compare the AI-modified application with trusted baseline behavior, block unexpected changes, and feed evidence back into Claude until the protected behaviors are restored.

---

# 25. Definition of done

The project is finished when all of this can happen on camera with no manual repair:

```text
1. Trusted baseline exists.

2. User asks Claude for annual billing.

3. Claude edits Seatline.

4. Annual billing works.

5. Claude attempts to finish.

6. LENS automatically runs.

7. Kane executes a real browser.

8. LENS detects an unrelated semantic regression.

9. Claude receives the actual Kane-observed difference.

10. Claude repairs the code.

11. Kane reruns.

12. LENS reports zero unexpected deltas.

13. Claude is allowed to finish.
```

If those thirteen steps work reliably, **stop adding features and record the demo**.

---

# 26. Instruction to Claude Code

Use this as the build instruction:

> Build this PRD exactly as specified. Optimize for a reliable end-to-end hackathon demo, not architectural completeness. Work through P0 sequentially and do not begin P1 until the complete loop works: baseline → Claude change → Kane verification → unexpected semantic delta → Claude Stop hook blocks completion → repair → Kane rerun → verified. Use real Kane CLI execution and real browser observations; do not mock Kane results. Keep Seatline deterministic and small. Every business state used in verification must be visible in the browser. After each milestone, run the application and verify it before continuing. Preserve the first meaningful real regression Kane/LENS catches during development as demo evidence. If a planned implementation proves unreliable, simplify it rather than replacing the core closed-loop behavior.
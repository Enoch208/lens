# Seatline UI + data contract (FROZEN)

Every string in this file is load-bearing. Kane `_test.md` files assert these exact strings
in a real browser. Changing a label here breaks a recorded test and costs ~40 Kane credits to
re-author. **Do not rename, abbreviate, or "improve" any label below.**

Owner of this file: the LENS engine agent. If a label genuinely must change, ask first.

---

## 1. Routes

| Route          | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `/`            | Overview — workspace + billing summary                          |
| `/members`     | Member table + invite form + remove/role actions                 |
| `/billing`     | Plan, seat math, cadence toggle, discount breakdown              |
| `/lens`        | LENS verification dashboard (reads `.lens/*.json`)               |
| `/demo/reset`  | Deterministic reseed. GET-only, side-effecting, no confirmation. |

Every data route exports `export const dynamic = "force-dynamic";` — Kane must never see a
cached page.

There is **no auto-refresh anywhere**. No `setInterval` polling faster than 15s on any route.

---

## 2. Seed state (`/demo/reset` restores exactly this)

```
Workspace          Acme Studio
Plan               Pro
Price per seat     $20.00
Billing cadence    Monthly
```

| Name             | Email               | Role   | Status |
| ---------------- | ------------------- | ------ | ------ |
| Maya Chen        | maya@acme.studio    | Admin  | active |
| Daniel Okafor    | daniel@acme.studio  | Member | active |
| Sarah Lindqvist  | sarah@acme.studio   | Member | active |
| Victor Reyes     | victor@acme.studio  | Member | active |
| Jon Alvarez      | jon@acme.studio     | Member | active |

Derived at seed: active members 5, billable seats 5, subtotal `$100.00`, discount `$0.00`,
total `$100.00`.

Removal is a **soft delete**: `status` becomes `"removed"` and the record stays in the store.
This is deliberate — it is what makes "all members" vs "active members" a real, plausible
foot-gun for a pricing refactor.

---

## 3. Money

- Stored as **integer cents**, everywhere, always. Never floats.
- Rendered by exactly one formatter: `formatMoney(cents)` in `lib/money.ts`.
- Format is unabbreviated with 2 decimals and comma thousands: `$100.00`, `$1,080.00`.
- No `$1.2k`, no `100`, no `$100`. Kane asserts the exact string.

---

## 4. Exact rendered labels and values

Each row below is `LABEL` → `VALUE at seed`. Render the label as visible DOM text, and the
value as visible DOM text in the same card. Add `data-observable="<key>"` to the element that
holds the **value** so a human can grep it; Kane reads the visible text, not the attribute.

### `/` — Overview

| Label             | Seed value | `data-observable`  |
| ----------------- | ---------- | ------------------ |
| `Active members`  | `5`        | `active_members`   |
| `Billable seats`  | `5`        | `billable_seats`   |
| `Plan`            | `Pro`      | `plan`             |
| `Billing cadence` | `Monthly`  | `billing_cadence`  |
| `Monthly subtotal`| `$100.00`  | `monthly_subtotal` |
| `Discount`        | `$0.00`    | `discount`         |
| `Monthly total`   | `$100.00`  | `monthly_total`    |

Page `<h1>`: `Overview`. Subtitle: `Acme Studio · Pro plan`.

### `/members`

Page `<h1>`: `Members`.

Stat strip (same label/value pattern as Overview):

| Label            | Seed value | `data-observable` |
| ---------------- | ---------- | ----------------- |
| `Active members` | `5`        | `active_members`  |
| `Billable seats` | `5`        | `billable_seats`  |
| `Monthly total`  | `$100.00`  | `monthly_total`   |

Table with a visible header row: `Name` · `Email` · `Role` · `Status` · `Actions`.
Only `status === "active"` members appear in this table.

Each row renders:
- name as plain text (e.g. `Maya Chen`)
- email as plain text
- a native `<select>` with `aria-label="Role for {fullName}"`, options exactly `Admin` and `Member`
- status pill with text `Active`
- a `<button>` with text exactly `Remove` and `aria-label="Remove {fullName}"`

**No confirmation dialog on Remove. Ever.** One click removes.

Below the table, a muted section, always rendered:
- heading `Removed members`
- when empty: `No removed members.`
- when non-empty: one line per removed member — `{fullName} · removed`

Invite card, always visible on the page (**not a modal, not a dialog, no disclosure toggle**):
- heading `Invite a teammate`
- `<label>` `Full name` bound to an input
- `<label>` `Email address` bound to an input
- submit `<button>` with text exactly `Send invite`
- after a successful invite the new member appears in the table as `Member` / `Active`

### `/billing`

Page `<h1>`: `Billing`.

| Label             | Seed value | `data-observable`  |
| ----------------- | ---------- | ------------------ |
| `Plan`            | `Pro`      | `plan`             |
| `Billable seats`  | `5`        | `billable_seats`   |
| `Price per seat`  | `$20.00`   | `price_per_seat`   |
| `Subtotal`        | `$100.00`  | `monthly_subtotal` |
| `Annual discount` | `$0.00`    | `discount`         |
| `Total`           | `$100.00`  | `monthly_total`    |

Cadence toggle — two `<button>`s, always enabled, never `aria-disabled`:
- `Monthly`
- `Annual — Save 10%`  (em dash, U+2014)

The active one carries `aria-pressed="true"`.

`Billing cadence` renders as `Monthly` or `Annual` — those two strings only.

> Annual pricing itself is **not** implemented at baseline. The discount is `$0.00` and
> clicking `Annual — Save 10%` only switches the cadence label. Adding real annual pricing is
> the change the coding agent is asked to make on camera. Do not implement it ahead of time.

### `/demo/reset`

Renders, as visible text:

```
Workspace reset
Acme Studio · 5 active members · $100.00 per month
```

Plus a link `Back to overview` → `/`.

---

## 5. Data + module boundaries

```
lib/money.ts      formatMoney(cents), parseMoney — pure, no imports
lib/seatline.ts   pure domain math: billableSeats(), subtotalCents(), discountCents(), totalCents()
lib/store.ts      JSON file store at data/seatline.json — read(), write(), seed()
lib/reader.ts     one function: getWorkspaceView() -> the single object every page renders from
```

**Every page renders from `getWorkspaceView()`.** No page computes money or counts itself.
This is why the numbers cannot disagree between `/`, `/members`, and `/billing` — and it is
why a single bad edit in `lib/seatline.ts` moves every page at once, which is exactly the
blast radius LENS is built to catch.

`getWorkspaceView()` returns:

```ts
type WorkspaceView = {
  workspace: string;          // "Acme Studio"
  plan: string;               // "Pro"
  pricePerSeatCents: number;  // 2000
  billingCadence: "monthly" | "annual";
  cadenceLabel: string;       // "Monthly" | "Annual"
  activeMembers: Member[];
  removedMembers: Member[];
  activeMemberCount: number;
  billableSeats: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};

type Member = {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Member";
  status: "active" | "removed";
};
```

Mutations are Server Actions in `lib/actions.ts`: `removeMember(id)`, `inviteMember(name, email)`,
`changeRole(id, role)`, `setCadence(cadence)`. Each calls `revalidatePath("/")`,
`revalidatePath("/members")`, `revalidatePath("/billing")`.

---

## 6. LENS artifact shapes (for the `/lens` dashboard)

All read from disk in a Server Component with `dynamic = "force-dynamic"`. If a file is
missing, render an empty state — never throw.

`.lens/baseline.json`

```json
{
  "commit": "abc1234",
  "createdAt": "2026-08-21T18:00:00.000Z",
  "flows": {
    "member-removal": {
      "test": ".testmuai/tests/remove-member_test.md",
      "status": "passed",
      "state": { "active_members": "4", "billable_seats": "4", "monthly_total": "$80.00" },
      "runDir": "/Users/.../runs/0",
      "shareUrl": "https://...",
      "durationS": 41.2
    }
  }
}
```

`.lens/last-verify.json`

```json
{
  "startedAt": "2026-08-21T18:30:00.000Z",
  "finishedAt": "2026-08-21T18:34:00.000Z",
  "verdict": "blocked",
  "changeRequest": "Add annual billing with a 10% discount",
  "agent": "Claude Code",
  "attempt": 1,
  "maxAttempts": 3,
  "changedFiles": ["lib/seatline.ts", "app/billing/page.tsx"],
  "affectedFlows": ["billing", "member-removal", "member-invite", "role-change"],
  "unmappedFiles": [],
  "flows": [
    {
      "flow": "member-removal",
      "status": "passed",
      "shareUrl": "https://...",
      "runDir": "/Users/.../runs/0",
      "deltas": [
        { "key": "active_members", "baseline": "4", "candidate": "4", "verdict": "SAME" },
        { "key": "billable_seats", "baseline": "4", "candidate": "5", "verdict": "UNEXPECTED_CHANGE" }
      ]
    }
  ],
  "unexpectedCount": 1,
  "timeline": [
    { "at": "2026-08-21T18:30:00.000Z", "label": "Diff mapped to 4 flows", "kind": "impact" }
  ]
}
```

`timeline[].kind` is one of: `change` · `impact` · `verify` · `fail` · `repair` · `proof`.

`.lens/flow-map.json`

```json
{ "lib/seatline.ts": ["billing", "member-removal", "member-invite", "role-change"] }
```

---

## 7. Rules that keep a browser agent sane

1. Nav labels are real DOM text at all times. No icon-only rail, no labels behind a
   `localStorage` flag, no collapsed-by-default sidebar.
2. Layout must be correct at **1920x1080**. `document.body.scrollWidth` must equal `1920` —
   no horizontal overflow.
3. `scroll-behavior` stays `auto`. Do not reintroduce smooth scrolling.
4. Never use `aria-disabled` on a button a test needs to click — `locator.click()` silently
   no-ops on it. Use a real `disabled` attribute or, better, keep it clickable and render an
   error message the test can assert.
5. No toasts that auto-dismiss under 15s, and no animation that delays text appearing by more
   than ~400ms.
6. Server Components by default. `"use client"` only on leaf nodes that genuinely need state.

# Demo runbook

The thirteen steps that have to work on camera, in order, with nothing repaired by hand.

## Before recording

```bash
kane-cli whoami                 # must be authenticated
npm run dev                     # Seatline on :3000, leave it running
npm run lens -- status          # baseline present, working tree clean
```

Reset once, and then **do not touch the app again** — no `/demo/reset` in a browser tab, no
`npm run reset-demo`, no edits to `lib/**` or `app/members/**` while Kane is running. See
`CONTRACT.md` §9.

## The loop

1. **Trusted baseline exists.** `.lens/baseline.json` holds what a real Chrome observed on the
   known-good build: four flows, every protected observable recorded.
2. **Ask the coding agent for the feature.**

   > Add annual billing to Seatline. Annual customers should receive a 10% discount, show the
   > savings clearly in the billing breakdown, and keep monthly billing unchanged.

3. **The agent edits Seatline.** Mostly `lib/seatline.ts` and `app/billing/page.tsx`.
4. **Annual billing works.** `/billing` shows the discount and the reduced total.
5. **The agent tries to end its turn.**
6. **The Stop hook fires** — `.claude/settings.json` runs `lens hook`.
7. **`git diff` maps to flows.** `lib/seatline.ts` is shared math, so its blast radius is every
   flow, not just billing.
8. **Kane replays those flows in a real browser** from the committed recordings.
9. **LENS compares the observations to the baseline** and finds an observable that moved which
   the change request never authorized.
10. **The agent is blocked** — exit 2, with the flow, the observable, the known-good value, what
    the browser just saw, and the Kane run that proves it.
11. **The agent repairs the application code** — not the tests.
12. **Kane re-runs.** Zero unexpected deltas.
13. **The agent is allowed to finish.** `/lens` shows SAFE TO SHIP.

## Watching it happen

- `.lens/state/hook.log` — what the hook decided and why, line by line.
- `.lens/last-verify.json` — the report the dashboard renders.
- `.lens/runs/verify-<flow>.ndjson` — the raw Kane stream for each replay.
- `http://localhost:3000/lens` — the whole story in one screen.

## If something goes wrong

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hook allows instantly, no browser | Nothing behavior-relevant changed | Check `npm run lens -- status` |
| `LENS could not verify` | Dev server down, or Kane auth expired | Start the app; `kane-cli whoami` |
| A flow records the wrong number | Something touched the app mid-run | `rm -rf .testmuai/tests/output-<stem>` and re-author |
| Hook blocks forever | Attempt cap not clearing | `rm .lens/state/attempts-*.json` |

Never edit a `_test.md` to make a failing app pass. That is the one move that destroys the
evidence the whole project rests on.

---
mode: testing
max_steps: 30
tags: [lens, seatline]
---

# Member removal

Removing a member takes their seat off the bill. This test asserts the visible removal, then
records the workspace's billing state as separate observations — so LENS can notice the billing
side of this flow moving even on a run where the removal itself still looks perfectly fine.

## Reset the workspace
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the members page
Go to {{app_url}}/members and assert the heading "Members" is visible.

## Remove Maya Chen
Click the "Remove" button in the row for "Maya Chen".

## Confirm Maya is no longer an active member
Assert that "Maya Chen" is not visible in the members table.

## Record the active member count
Store the number shown under the "Active members" label as "active_members".

## Record the billable seat count
Store the number shown under the "Billable seats" label as "billable_seats".

## Record the monthly total
Store the amount shown under the "Monthly total" label as "monthly_total".

---
test: ../remove-member_test.md
status: passed
started: 2026-08-21T16:26:53.290Z
duration_s: 285
session_id: 4b573321-e251-412a-b538-8e2c68407f84
---

# Member removal — Result

## Reset the workspace ✓ passed (22.5s)
md5: b4dc70548fe294e5625abe794a7b4ddc
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the members page ✓ passed (24.3s)
md5: 98c1a16fda3d2b38c8a9a8997f92ef0c
Go to {{app_url}}/members and assert the heading "Members" is visible.

## Remove Maya Chen ✓ passed (19.2s)
md5: 45b583209433eacaaa3ec862a6edd209
Click the "Remove" button in the row for "Maya Chen".

## Confirm Maya is no longer an active member ✓ passed (29.3s)
md5: 0ed821b5409a60d93d153608201c0a57
Assert that "Maya Chen" is not visible in the members table.

## Record the active member count ✓ passed (41.8s)
md5: 02de2d229e97193f550e3817f580e138
Store the number shown under the "Active members" label as "active_members".

## Record the billable seat count ✓ passed (41.3s)
md5: 83ccf4b73825325013fc7f09d9866e23
Store the number shown under the "Billable seats" label as "billable_seats".

## Record the monthly total ✓ passed (103.5s)
md5: e18a46f0ca9e72c78c86590d66eb6e29
Store the amount shown under the "Monthly total" label as "monthly_total".

---
test: ../remove-member_test.md
status: passed
started: 2026-08-21T16:21:37.313Z
duration_s: 318
session_id: c8e8f222-90f2-46c6-8dfe-2711f6a1f61a
---

# Member removal — Result

## Reset the workspace ✓ passed (23s)
md5: b4dc70548fe294e5625abe794a7b4ddc
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the members page ✓ passed (25s)
md5: 98c1a16fda3d2b38c8a9a8997f92ef0c
Go to {{app_url}}/members and assert the heading "Members" is visible.

## Remove Maya Chen ✓ passed (14.9s)
md5: 45b583209433eacaaa3ec862a6edd209
Click the "Remove" button in the row for "Maya Chen".

## Confirm Maya is no longer an active member ✓ passed (33s)
md5: 0ed821b5409a60d93d153608201c0a57
Assert that "Maya Chen" is not visible in the members table.

## Record the active member count ✓ passed (116.5s)
md5: 02de2d229e97193f550e3817f580e138
Store the number shown under the "Active members" label as "active_members".

## Record the billable seat count ✓ passed (34.9s)
md5: 83ccf4b73825325013fc7f09d9866e23
Store the number shown under the "Billable seats" label as "billable_seats".

## Record the monthly total ✓ passed (67.6s)
md5: e18a46f0ca9e72c78c86590d66eb6e29
Store the amount shown under the "Monthly total" label as "monthly_total".

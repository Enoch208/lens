---
test: ../invite-member_test.md
status: passed
started: 2026-08-21T16:32:10.090Z
duration_s: 282
session_id: 6746c587-1417-4e8c-a512-07784bad40e0
---

# Member invite — Result

## Reset the workspace ✓ passed (24.1s)
md5: b4dc70548fe294e5625abe794a7b4ddc
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the members page ✓ passed (21.3s)
md5: bcd94341490899bf26d4196b6c6774d8
Go to {{app_url}}/members and assert the heading "Invite a teammate" is visible.

## Enter the new teammate's name ✓ passed (15.8s)
md5: c4bf5dad64e1065a57f0431e86917d5c
Type "Alex Morgan" into the "Full name" field.

## Enter the new teammate's email ✓ passed (12.8s)
md5: 3f899e32aed5fdfe562675996220c263
Type "alex@acme.studio" into the "Email address" field.

## Send the invite ✓ passed (14.8s)
md5: 82ad9be4fdcbedea2876a2f121a2c40a
Click the "Send invite" button.

## Confirm Alex is now an active member ✓ passed (23.6s)
md5: e1ff9748adf35751abeb57938b6cd7d4
Assert that "Alex Morgan" is visible in the members table.

## Record the active member count ✓ passed (46.3s)
md5: 02de2d229e97193f550e3817f580e138
Store the number shown under the "Active members" label as "active_members".

## Record the billable seat count ✓ passed (72.4s)
md5: 83ccf4b73825325013fc7f09d9866e23
Store the number shown under the "Billable seats" label as "billable_seats".

## Record the monthly total ✓ passed (47.7s)
md5: e18a46f0ca9e72c78c86590d66eb6e29
Store the amount shown under the "Monthly total" label as "monthly_total".

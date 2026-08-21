---
test: ../role-change_test.md
status: passed
started: 2026-08-21T16:37:20.721Z
duration_s: 246
session_id: e5e07e00-38e6-4699-81c2-131c1407d73d
---

# Role change — Result

## Reset the workspace ✓ passed (19.8s)
md5: b4dc70548fe294e5625abe794a7b4ddc
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the members page ✓ passed (24.3s)
md5: 98c1a16fda3d2b38c8a9a8997f92ef0c
Go to {{app_url}}/members and assert the heading "Members" is visible.

## Promote Sarah Lindqvist to Admin ✓ passed (24.2s)
md5: 33e74cbff8eda07deb444ad4deddd922
Select "Admin" in the role dropdown in the row for "Sarah Lindqvist".

## Confirm Sarah is now an Admin ✓ passed (22.8s)
md5: 255e73bdddd1961e0b744b620f2d0ab3
Assert that the role dropdown in the row for "Sarah Lindqvist" shows "Admin".

## Record Sarah's role ✓ passed (29.3s)
md5: 775b8407368f5f51fdca1968ee3a425b
Store the role shown in the row for "Sarah Lindqvist" as "sarah_role".

## Record the billable seat count ✓ passed (38.5s)
md5: 83ccf4b73825325013fc7f09d9866e23
Store the number shown under the "Billable seats" label as "billable_seats".

## Record the monthly total ✓ passed (84.7s)
md5: e18a46f0ca9e72c78c86590d66eb6e29
Store the amount shown under the "Monthly total" label as "monthly_total".

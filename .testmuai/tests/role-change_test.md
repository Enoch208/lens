---
mode: testing
max_steps: 30
tags: [lens, seatline]
---

# Role change

Promoting a member changes what they can do, and nothing about what the workspace is charged.
The seat count and total are recorded here precisely so that "nothing" can be proven rather than
assumed.

## Reset the workspace
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the members page
Go to {{app_url}}/members and assert the heading "Members" is visible.

## Promote Sarah Lindqvist to Admin
Select "Admin" in the role dropdown in the row for "Sarah Lindqvist".

## Confirm Sarah is now an Admin
Assert that the role dropdown in the row for "Sarah Lindqvist" shows "Admin".

## Record Sarah's role
Store the role shown in the row for "Sarah Lindqvist" as "sarah_role".

## Record the billable seat count
Store the number shown under the "Billable seats" label as "billable_seats".

## Record the monthly total
Store the amount shown under the "Monthly total" label as "monthly_total".

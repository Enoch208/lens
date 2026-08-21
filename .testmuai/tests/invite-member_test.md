---
mode: testing
max_steps: 30
tags: [lens, seatline]
---

# Member invite

Inviting a teammate adds a billable seat. The invite is asserted; the money it moves is recorded
separately so LENS compares it against the trusted build rather than against a hardcoded number.

## Reset the workspace
Go to {{app_url}}/demo/reset and assert the text "Workspace reset" is visible.

## Open the members page
Go to {{app_url}}/members and assert the heading "Invite a teammate" is visible.

## Enter the new teammate's name
Type "Alex Morgan" into the "Full name" field.

## Enter the new teammate's email
Type "alex@acme.studio" into the "Email address" field.

## Send the invite
Click the "Send invite" button.

## Confirm Alex is now an active member
Assert that "Alex Morgan" is visible in the members table.

## Record the active member count
Store the number shown under the "Active members" label as "active_members".

## Record the billable seat count
Store the number shown under the "Billable seats" label as "billable_seats".

## Record the monthly total
Store the amount shown under the "Monthly total" label as "monthly_total".
